import { Injectable, Logger } from '@nestjs/common';

/**
 * Параметры поиска товаров.
 */
export interface SearchParams {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  sort?: 'popular' | 'priceup' | 'pricedown' | 'rate' | 'newly';
}

/**
 * Один товар в результатах поиска.
 */
export interface ProductResult {
  name: string;
  description: string;
  price: number | null;
  rating: number | null;
  feedbacks: number;
  photo: string;
  url: string;
}

const SEARCH_URL = 'https://search.wb.ru/exactmatch/ru/common/v5/search';

const HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: '*/*',
  Origin: 'https://www.wildberries.ru',
  Referer: 'https://www.wildberries.ru/',
};

@Injectable()
export class WildberriesService {
  private readonly logger = new Logger(WildberriesService.name);

  /**
   * Ищет товары на Wildberries через публичный поисковый API.
   * Токен не требуется.
   */
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

    let data: any;
    try {
      const resp = await fetch(url, { headers: HEADERS });
      if (!resp.ok) {
        this.logger.warn(`WB ответил статусом ${resp.status}`);
        throw new Error(`Wildberries вернул статус ${resp.status}`);
      }
      data = await resp.json();
    } catch (err) {
      this.logger.error(`Ошибка запроса к WB: ${err}`);
      throw new Error(
        'Не удалось получить данные от Wildberries. ' +
          'Возможно, изменился API или сработала защита.',
      );
    }

    const products: any[] = data?.data?.products ?? [];
    const results: ProductResult[] = [];

    for (const p of products) {
      const price = this.extractPrice(p);

      // Клиентский фильтр — на случай, если задана только одна граница.
      if (price != null) {
        if (minPrice != null && price < minPrice) continue;
        if (maxPrice != null && price > maxPrice) continue;
      }

      const brand = (p.brand ?? '').trim();
      const subject = (p.entity ?? '').trim();
      const description = [brand, subject].filter(Boolean).join(', ') || '—';

      results.push({
        name: (p.name ?? '').trim(),
        description,
        price: price != null ? Math.round(price * 100) / 100 : null,
        rating: p.reviewRating ?? p.rating ?? null,
        feedbacks: p.feedbacks ?? 0,
        photo: this.buildImageUrl(p.id),
        url: `https://www.wildberries.ru/catalog/${p.id}/detail.aspx`,
      });

      if (results.length >= limit) break;
    }

    return results;
  }

  /**
   * Достаёт цену из карточки. WB перекладывает её между несколькими
   * полями в зависимости от версии ответа — пробуем все.
   */
  private extractPrice(p: any): number | null {
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
   * Собирает ссылку на главное фото товара по его id.
   * Картинки лежат на basket-XX.wbbasket.ru, номер корзины
   * вычисляется из id по диапазонам vol.
   */
  private buildImageUrl(productId: number): string {
    const vol = Math.floor(productId / 100000);
    const part = Math.floor(productId / 1000);

    let basket: string;
    if (vol <= 143) basket = '01';
    else if (vol <= 287) basket = '02';
    else if (vol <= 431) basket = '03';
    else if (vol <= 719) basket = '04';
    else if (vol <= 1007) basket = '05';
    else if (vol <= 1061) basket = '06';
    else if (vol <= 1115) basket = '07';
    else if (vol <= 1169) basket = '08';
    else if (vol <= 1313) basket = '09';
    else if (vol <= 1601) basket = '10';
    else if (vol <= 1655) basket = '11';
    else if (vol <= 1919) basket = '12';
    else if (vol <= 2045) basket = '13';
    else if (vol <= 2189) basket = '14';
    else if (vol <= 2405) basket = '15';
    else if (vol <= 2621) basket = '16';
    else if (vol <= 2837) basket = '17';
    else if (vol <= 3053) basket = '18';
    else if (vol <= 3269) basket = '19';
    else if (vol <= 3485) basket = '20';
    else if (vol <= 3701) basket = '21';
    else if (vol <= 3917) basket = '22';
    else if (vol <= 4133) basket = '23';
    else if (vol <= 4349) basket = '24';
    else if (vol <= 4565) basket = '25';
    else basket = '26';

    return (
      `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/` +
      `${productId}/images/big/1.webp`
    );
  }
}
