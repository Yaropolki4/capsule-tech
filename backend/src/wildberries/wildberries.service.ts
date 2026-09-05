import { Injectable, Logger } from '@nestjs/common';

export interface SearchParams {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  sort?: 'popular' | 'priceup' | 'pricedown' | 'rate' | 'newly';
}

export interface ProductResult {
  name: string;
  description: string;
  brand: string | null;
  price: number | null;
  rating: number | null;
  feedbacks: number;
  photo: string;
  url: string;
}

/**
 * Форма сырой карточки товара из ответа поиска WB. Поля опциональны — WB
 * перекладывает цену/рейтинг между разными полями в зависимости от
 * версии ответа, и это неофициальный API, так что схема нестабильна.
 */
interface WbRawProduct {
  id: number;
  name?: string;
  brand?: string;
  entity?: string;
  reviewRating?: number;
  rating?: number;
  feedbacks?: number;
  salePriceU?: number;
  priceU?: number;
  sizes?: Array<{
    price?: {
      product?: number;
      total?: number;
    };
  }>;
}

interface WbSearchResponse {
  products?: WbRawProduct[];
}

/**
 * Карточка товара с CDN (info/ru/card.json) — оттуда берём человекочитаемое
 * название и полное текстовое описание, которых в ответе поиска больше нет
 * (`entity` там теперь всегда пустая строка).
 */
interface WbCardJson {
  imt_name?: string;
  subj_name?: string;
  description?: string;
}

const SEARCH_URL = 'https://search.wb.ru/exactmatch/ru/common/v5/search';

// Домен раздачи статики товаров сменился с basket-XX.wbbasket.ru на
// {регион}-basket-cdn-XX.geobasket.ru. Номер после cdn- при этом ни на что
// не влияет: проверено на десятке товаров с разными id — basket-cdn-01 и
// basket-cdn-40 отдают один и тот же контент (один и тот же md5), а вот
// префикс региона обязателен и должен резолвиться (случайный не резолвится
// вообще). Поэтому просто фиксируем один рабочий хост, а не пересчитываем
// номер корзины по диапазонам id, как раньше.
const CDN_HOST = 'mow-basket-cdn-01.geobasket.ru';

const HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  Origin: 'https://www.wildberries.ru',
  Referer: 'https://www.wildberries.ru/',
};

const DESCRIPTION_MAX_LENGTH = 400;

// search.wb.ru рейт-лимитит по IP. Наш AI-агент может дёрнуть
// search_wildberries несколько раз параллельно за один ход (подбирает сразу
// верх/низ/обувь), поэтому все запросы к поиску сериализуем с минимальным
// интервалом, а на 429 — повторяем с бэкоффом вместо немедленного отказа.
const MIN_REQUEST_INTERVAL_MS = 350;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 800;
const RETRY_MAX_DELAY_MS = 5000;

// Без таймаута зависший ответ WB (без него сеть просто не отвечает, не
// возвращая ни ошибку, ни статус) блокирует fetch на неопределённое время —
// а вместе с ним и весь запрос пользователя в чате, вплоть до полного
// зависания. search.wb.ru обычно отвечает за секунды, поэтому 10с уже
// достаточный запас, чтобы не резать медленные, но живые ответы.
const SEARCH_TIMEOUT_MS = 10_000;
const CARD_TIMEOUT_MS = 8_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Поиск товаров на Wildberries через публичный (неофициальный) поисковый API.
 * Токен не требуется. См. wb-mcp-nest/README.md — тот же API, тот же код,
 * встроен напрямую в основной граф вместо отдельного MCP-сервера.
 *
 * Живой браузер сейчас ходит на www.wildberries.ru/__internal/u-search/...,
 * но этот путь защищён WAF и с серверного (датацентрового) IP отдаёт 403 —
 * проверено напрямую. search.wb.ru остаётся публично доступным и отдаёт тот
 * же современный формат ответа, поэтому используем его.
 */
@Injectable()
export class WildberriesService {
  private readonly logger = new Logger(WildberriesService.name);
  private lastSearchRequestAt = 0;
  private searchRequestChain: Promise<void> = Promise.resolve();

  /**
   * Ставит запрос к search.wb.ru в очередь так, чтобы между реальными
   * отправками проходило не меньше MIN_REQUEST_INTERVAL_MS — иначе
   * параллельные вызовы инструмента (агент ищет несколько вещей за один ход)
   * бьют по WB одновременно и сразу ловят 429.
   */
  private throttleSearchRequest(): Promise<void> {
    const wait = this.searchRequestChain.then(async () => {
      const remaining =
        MIN_REQUEST_INTERVAL_MS - (Date.now() - this.lastSearchRequestAt);
      if (remaining > 0) {
        await sleep(remaining);
      }
      this.lastSearchRequestAt = Date.now();
    });

    this.searchRequestChain = wait.catch(() => undefined);

    return wait;
  }

  private async fetchSearchWithRetry(url: URL): Promise<Response> {
    let lastResp: Response | undefined;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      await this.throttleSearchRequest();

      const resp = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
      });

      if (resp.status !== 429) {
        return resp;
      }

      lastResp = resp;

      if (attempt === MAX_RETRY_ATTEMPTS) {
        break;
      }

      const retryAfterHeader = resp.headers.get('retry-after');
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : null;
      const backoffMs =
        retryAfterMs && Number.isFinite(retryAfterMs)
          ? retryAfterMs
          : Math.min(
              RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
              RETRY_MAX_DELAY_MS,
            );

      this.logger.warn(
        `WB ответил 429, повтор через ${backoffMs}ms (попытка ${attempt}/${MAX_RETRY_ATTEMPTS})`,
      );

      await sleep(backoffMs);
    }

    return lastResp!;
  }

  async search(params: SearchParams): Promise<ProductResult[]> {
    const { query, minPrice, maxPrice, sort = 'popular' } = params;
    const limit = Math.max(1, Math.min(params.limit ?? 10, 100));

    const url = new URL(SEARCH_URL);
    url.searchParams.set('query', query);
    url.searchParams.set('resultset', 'catalog');
    url.searchParams.set('dest', '-1257786'); // регион (Москва)
    url.searchParams.set('curr', 'rub');
    url.searchParams.set('lang', 'ru');
    url.searchParams.set('sort', sort);
    url.searchParams.set('spp', '30');
    url.searchParams.set('page', '1');

    // Серверный фильтр по цене (в копейках), если заданы обе границы.
    if (minPrice != null && maxPrice != null) {
      url.searchParams.set(
        'priceU',
        `${Math.round(minPrice * 100)};${Math.round(maxPrice * 100)}`,
      );
    }

    this.logger.debug(`-> GET ${url.toString()}`);

    const startedAt = Date.now();
    let data: WbSearchResponse;
    try {
      const resp = await this.fetchSearchWithRetry(url);
      const durationMs = Date.now() - startedAt;
      this.logger.debug(
        `<- ${resp.status} ${resp.statusText} (${durationMs}ms)`,
      );

      if (!resp.ok) {
        this.logger.warn(`WB ответил статусом ${resp.status}`);
        throw new Error(`Wildberries вернул статус ${resp.status}`);
      }
      data = (await resp.json()) as WbSearchResponse;
    } catch (err) {
      this.logger.error(
        `Ошибка запроса к WB (${Date.now() - startedAt}ms) url=${url.toString()}: ${err}`,
      );
      throw new Error(
        'Не удалось получить данные от Wildberries. ' +
          'Возможно, изменился API или сработала защита.',
      );
    }

    const products = data.products ?? [];
    this.logger.debug(`WB вернул ${products.length} товар(ов) в сыром ответе`);

    const candidates: WbRawProduct[] = [];

    for (const p of products) {
      const price = this.extractPrice(p);

      // Клиентский фильтр — на случай, если задана только одна граница.
      if (price != null) {
        if (minPrice != null && price < minPrice) continue;
        if (maxPrice != null && price > maxPrice) continue;
      }

      candidates.push(p);
      if (candidates.length >= limit) break;
    }

    this.logger.debug(
      `После фильтра по цене (min=${minPrice ?? '—'}, max=${maxPrice ?? '—'}) и лимита (${limit}) осталось ${candidates.length} товар(ов)`,
    );

    const results = await Promise.all(
      candidates.map((p) => this.buildResult(p)),
    );

    return results;
  }

  /**
   * Собирает итоговую карточку товара: цену/рейтинг берёт из ответа поиска,
   * а название и описание — с CDN (card.json), потому что в поиске они
   * либо отсутствуют, либо приходят пустыми.
   */
  private async buildResult(p: WbRawProduct): Promise<ProductResult> {
    const vol = Math.floor(p.id / 100000);
    const part = Math.floor(p.id / 1000);
    const price = this.extractPrice(p);
    const card = await this.fetchCard(vol, part, p.id);

    const brand = (p.brand ?? '').trim();
    const fallbackSubject = (p.entity ?? '').trim();
    const richDescription = card?.description?.trim();
    const description = richDescription
      ? this.truncate(richDescription, DESCRIPTION_MAX_LENGTH)
      : [brand, card?.subj_name ?? fallbackSubject]
          .filter(Boolean)
          .join(', ') || '—';

    return {
      name: card?.imt_name?.trim() || (p.name ?? '').trim(),
      description,
      brand: brand || null,
      price: price != null ? Math.round(price * 100) / 100 : null,
      rating: p.reviewRating ?? p.rating ?? null,
      feedbacks: p.feedbacks ?? 0,
      photo: `https://${CDN_HOST}/vol${vol}/part${part}/${p.id}/images/big/1.webp`,
      url: `https://www.wildberries.ru/catalog/${p.id}/detail.aspx`,
    };
  }

  /**
   * Достаёт цену из карточки. WB перекладывает её между несколькими
   * полями в зависимости от версии ответа — пробуем все.
   */
  private extractPrice(p: WbRawProduct): number | null {
    const sizes = p.sizes ?? [];
    if (sizes.length > 0) {
      const priceBlock = sizes[0].price ?? {};
      const raw = priceBlock.product ?? priceBlock.total;
      if (raw) return raw / 100;
    }
    if (p.salePriceU) return p.salePriceU / 100;
    if (p.priceU) return p.priceU / 100;
    return null;
  }

  /**
   * Тянет название и описание товара с CDN. Может не найтись (404) или
   * отдать неожиданную форму — в обоих случаях просто возвращаем null и
   * дальше используем то, что есть в ответе поиска, вместо падения всего
   * запроса из-за одной карточки.
   */
  private async fetchCard(
    vol: number,
    part: number,
    id: number,
  ): Promise<WbCardJson | null> {
    const url = `https://${CDN_HOST}/vol${vol}/part${part}/${id}/info/ru/card.json`;

    try {
      const resp = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(CARD_TIMEOUT_MS),
      });
      if (!resp.ok) {
        this.logger.warn(`card.json для id=${id} вернул статус ${resp.status}`);
        return null;
      }
      return (await resp.json()) as WbCardJson;
    } catch (err) {
      this.logger.warn(`Не удалось получить card.json для id=${id}: ${err}`);
      return null;
    }
  }

  private truncate(text: string, maxLength: number): string {
    return text.length > maxLength
      ? `${text.slice(0, maxLength).trimEnd()}…`
      : text;
  }
}
