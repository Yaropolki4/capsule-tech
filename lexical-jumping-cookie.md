# План: капсулы (конструктор, стена, просмотр)

## Контекст

Сейчас в приложении есть добавление вещей (фото-редактор + удаление фона через gRPC-сервис) и профили с подписками (`User`, `Subscription`). Понятие "капсула" (образ, собранный из вещей) в бэкенде вообще не существует — в Prisma-схеме есть только счётчик `User.capsulesQuantity`, который никогда не обновляется. На фронте `features/capsules/ui/capsules-list.tsx` — визуальная заглушка с захардкоженным массивом `[1..100]` и одной и той же тестовой картинкой, канвас-библиотек и drag-библиотек в проекте нет вообще.

Цель этого плана — довести до реализации три оставшиеся фичи:
- **Фаза A** — модель данных и backend-модуль `capsule` (без него ничего остального не заработает).
- **Фаза B** — конструктор капсул на канвасе (DOM + CSS-трансформации, решение подтверждено пользователем).
- **Фаза C** — стена с капсулами подписок (бесконечный скролл, паттерна пагинации в проекте пока нет — вводим впервые).
- **Фаза D** — просмотр капсул в профиле (замена текущей заглушки на реальные данные).

ИИ-сайдбар на LangGraph (пункт 5 из исходного списка фич) **сознательно не включён** — пользователь попросил обсудить его отдельно, когда даст больше деталей (подбор вещей с Wildberries и т.д.). В коде для него ничего не стабим заранее.

Все паттерны ниже подтверждены чтением реального кода (`subscription.*`, `clothes.*`, `create-clothes-form`, `base-virtual-list.tsx`, `user.store.ts`, `s3.service.ts`) — новый код должен копировать эти конвенции, а не изобретать свои.

---

## Фаза A — модель данных + backend-модуль `capsule`

### Prisma-модели (`backend/prisma/schema.prisma`)

```prisma
model Capsule {
  id           String        @id @default(uuid())
  name         String?
  thumbnailUrl String        @map("thumbnail_url")
  public       Boolean       @default(true)
  createdBy    User          @relation(fields: [createdById], references: [id])
  createdById  String        @map("created_by_id")
  items        CapsuleItem[]
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  @@map("capsules")
}

model CapsuleItem {
  id        String   @id @default(uuid())
  capsule   Capsule  @relation(fields: [capsuleId], references: [id], onDelete: Cascade)
  capsuleId String   @map("capsule_id")
  clothes   Clothes  @relation(fields: [clothesId], references: [id], onDelete: Cascade)
  clothesId String   @map("clothes_id")
  x         Float
  y         Float
  rotation  Float    @default(0)
  scale     Float    @default(1)
  zIndex    Int      @map("z_index")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([capsuleId, clothesId])
  @@map("capsule_items")
}
```
Добавить обратные связи: `User.capsules Capsule[]`, `Clothes.capsuleItems CapsuleItem[]`.

**Почему у `CapsuleItem` свой `id`, а не составной PK как у `UserClothes`**: `UserClothes` — чистый join без полезной нагрузки, натурального ключа достаточно. `CapsuleItem` хранит изменяемое состояние (позиция/поворот/масштаб/z-index), ведёт себя как самостоятельная сущность — нужен стабильный React-key при перетаскивании и адресуемая строка для точечного PATCH в будущем. `@@unique([capsuleId, clothesId])` всё равно гарантирует "одна вещь — не больше одного раза на капсулу".

**Нормализация координат**: `x`, `y` ∈ `[0, 1]` — доля от условного канваса фиксированного соотношения сторон (центр вещи как якорь), `rotation` — градусы, `scale` — множитель от базового размера. Соотношение сторон канваса — `3/4`, как уже используется в `aspectRatio={3/4}` для плиток вещей/капсул — так конструктор, растеризация превью и будущий read-only рендер согласованы независимо от размера экрана. Константу вынести в `frontend/src/shared/constants/capsule.ts` (`CAPSULE_CANVAS_ASPECT_RATIO`), бэкенду это не нужно — там просто float-поля.

**`User.capsulesQuantity`**: сейчас существует, но нигде не обновляется. Обновлять транзакционно — по образцу `SubscriptionService.subscribe`, который в одной `$transaction` инкрементит `followingCount`/`followersCount`: `+1` при создании капсулы, `-1` при удалении, в той же транзакции.

### Edge case: удаление вещи, на которой стоит капсула

Проверено `clothes.repository.ts::remove()` — он удаляет только строку `UserClothes` (запись о владении), саму `Clothes` не трогает никогда. Значит сегодня `Clothes` физически никогда не удаляется, и осиротение `CapsuleItem` невозможно на практике. На будущее (если хард-delete вещей когда-нибудь появится) — ставим `onDelete: Cascade` на обе связи `CapsuleItem → Clothes` и `CapsuleItem → Capsule`: в кодовой базе нет ни одного паттерна "запретить удаление, если есть ссылки", и капсула с одной пропавшей вещью — не более сломанный UX, чем битая картинка; к тому же `thumbnailUrl` — это уже готовый PNG-снимок на момент публикации, он не пострадает в любом случае.

### Новые backend-файлы

```
backend/src/capsule/capsule.module.ts
backend/src/capsule/capsule.controller.ts
backend/src/capsule/capsule.service.ts
backend/src/capsule/capsule.repository.ts
```
По образцу `backend/src/clothes/` (слои repository → service → controller, `$transaction` в репозитории) и `backend/src/subscription/` (join-запросы, размещение guard'ов). Регистрация в `app.module.ts` рядом с `ClothesModule`/`SubscriptionModule`. `@Controller('capsule')` — единственное число, как `@Controller('user')`/`@Controller('subscription')` (подтверждено в коде).

`CapsuleRepository` (по методу на запрос, через `SECURE_PRISMA_SERVICE`):
- `createWithItems(data, items, userId)` — `$transaction`: `capsule.create` + `capsuleItem.createMany` + `user.update` (`capsulesQuantity++`).
- `findById(id)` — капсула + `items` (join `clothes`: imageUrl/brand/category) + `createdBy` (id/name/avatarUrl).
- `findManyByUserId(userId)` — плоский список без items (для профиля нужен только `thumbnailUrl`).
- `getWallFeed(currentUserId, cursor, limit)` — курсорная пагинация; фильтр `public: true` + автор находится в `followers` текущего пользователя (аналог `getFollowingWithSubscriptionStatus`, но **без** его debug-`console.log` и дублирующего запроса — это мусор, не паттерн для копирования).
- `deleteById(id)` — `$transaction`: `capsule.delete` (items каскадом) + `user.update` (`capsulesQuantity--`).
- `findClothesOwnedBy(userId, clothesIds)` — проверка владения при создании.

`CapsuleService`: `create()` — валидирует `items.length >= 1` и что каждый `clothesId` принадлежит текущему пользователю (иначе `NotFoundException`/`BadRequestException`). `remove(id, userId)` — грузит капсулу, кидает `ForbiddenException`, если `createdById !== userId` (в отличие от `UserClothes`, `Capsule.id` сам по себе не привязан к владельцу композитным ключом — проверку нужно писать явно). `getWallFeed()` — берёт `limit + 1` строк, обрезает, `nextCursor = hasExtra ? last.id : null`.

### DTO — `common/src/dto/capsules/`

Файлы (по одному DTO на файл, как везде): `shared.ts`, `create-capsule-request.dto.ts`, `create-capsule-response.dto.ts`, `get-capsule-response.dto.ts`, `get-user-capsules-request.dto.ts`, `get-user-capsules-response.dto.ts`, `get-capsules-feed-request.dto.ts`, `get-capsules-feed-response.dto.ts`, `upload-capsule-thumbnail-response.dto.ts`, `index.ts` (barrel, плюс `export * from "./capsules"` в `common/src/dto/index.ts`).

```ts
// shared.ts
export const capsuleItemInputSchema = z.object({
  clothesId: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  rotation: z.number(),
  scale: z.number().positive(),
  zIndex: z.number().int().nonnegative(),
});
export const capsuleAuthorSchema = z.object({
  id: z.string(), name: z.string(), avatarUrl: z.string().optional(),
});

// create-capsule-request.dto.ts
export const createCapsuleRequestDtoSchema = z.object({
  name: z.string().optional(),
  thumbnailUrl: z.string(),
  items: z.array(capsuleItemInputSchema).min(1, "Добавьте хотя бы одну вещь"),
});
```

`get-capsules-feed-*` — единственный DTO с конвертом (`{ items, nextCursor }`), потому что это первая в проекте пагинация; все остальные списки (`get-user-capsules-response`) остаются "голым" `z.array(...)`, как везде:
```ts
export const getCapsulesFeedRequestDtoSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export const getCapsulesFeedResponseDtoSchema = z.object({
  items: z.array(z.object({
    id: z.string(), name: z.string().optional(), thumbnailUrl: z.string(),
    createdAt: z.string(), createdBy: capsuleAuthorSchema,
  })),
  nextCursor: z.string().nullable(),
});
```

### Эндпоинты

| Метод | Путь | Запрос | Ответ | По образцу |
|---|---|---|---|---|
| POST | `/capsule/thumbnail` | multipart `file` | `{ thumbnailUrl }` | `PATCH /user/:id/avatar` (FileInterceptor + `ValidatedUploadedFile`), новый `S3Service.uploadCapsuleThumbnail` (копия `uploadClothes`, без удаления prev-файла) |
| POST | `/capsule` | `CreateCapsuleRequestDto` (JSON) | `CreateCapsuleResponseDto` | `POST /clothes`, но без файла — превью уже загружено отдельным запросом выше (в проекте нет прецедента класть JSON-массив `items` внутрь multipart `FormData`) |
| GET | `/capsule/:id` | path param | `GetCapsuleResponseDto` | `GET /clothes/:id` — но реально реализован (текущий `findOne` в clothes — заглушка) |
| DELETE | `/capsule/:id` | path param | 200 | `DELETE /clothes/:id` + явная проверка владельца |
| GET | `/capsule?userId=` | `{ userId }` (query) | `z.array(...)` | `GET /clothes?userId=` один в один |
| GET | `/capsule/wall?cursor=&limit=` | `GetCapsulesFeedRequestDto` | `GetCapsulesFeedResponseDto` | join как в `getFollowingWithSubscriptionStatus`, пагинация — новый паттерн |

Везде `@UseGuards(JwtGuard)` на классе, `req.user as AccessTokenPayload` (кастомного `@CurrentUser()` в проекте нет — не изобретаем), валидация через `new ZodValidationPipe(schema)`.

---

## Фаза B — конструктор капсул (DOM + CSS-трансформации)

**Библиотека для жестов: `@use-gesture/react`** (+ обычный `style={{ transform }}` на позиционированных `<img>`). Нужны drag/поворот/масштаб через хэндл — это непрерывные pointer-жесты на элементах, которые мы полностью контролируем сами. `@use-gesture/react` — безголовый хук без мнения о рендере, идеально ложится на ручной `transform` + zustand-стор ниже. `dnd-kit` заточен под sortable/drop-zone семантику (`useDraggable`/`useDroppable`, collision detection) — не подходит для свободного поворота/масштаба через хэндл, пришлось бы бороться с его абстракциями.

**Растеризация превью**: `html-to-image` (в проекте пока не установлен, аналог не найден) — `toBlob()` на DOM-узле канваса в момент публикации → загрузка как обычная картинка через `/capsule/thumbnail`.

### Новые файлы

```
frontend/src/shared/constants/capsule.ts                              # CAPSULE_CANVAS_ASPECT_RATIO
frontend/src/entities/capsules/model/types.ts
frontend/src/entities/capsules/api/{create-capsule,upload-capsule-thumbnail,get-capsule,get-user-capsules,delete-capsule,get-capsules-feed}.ts
frontend/src/entities/capsules/model/useUserCapsules.ts                # useQuery, key ["capsules", userId]
frontend/src/entities/capsules/model/useCapsule.ts                     # useQuery, key ["capsule", capsuleId]
frontend/src/entities/capsules/index.ts
frontend/src/features/capsule-constructor/model/canvas.store.ts        # zustand + immer (см. ниже)
frontend/src/features/capsule-constructor/ui/capsule-canvas.tsx        # презентационный рендер: items: PlacedItem[] как пропсы — переиспользуется read-only в Фазе D
frontend/src/features/capsule-constructor/ui/placed-item.tsx           # один слой, @use-gesture
frontend/src/features/capsule-constructor/ui/clothes-picker.tsx        # переиспользует useClothes(currentUser.id)
frontend/src/features/capsule-constructor/ui/layer-controls.tsx        # на передний/задний план, удалить
frontend/src/features/capsule-constructor/ui/publish-button.tsx        # растеризация → загрузка → создание
frontend/src/features/capsule-constructor/model/use-create-capsule-mutation.ts
frontend/src/features/capsule-constructor/index.ts
frontend/src/fsd-pages/capsule-constructor/{index.ts,ui/capsule-constructor-page.tsx}
frontend/src/app/capsules/new/page.tsx
```
`shared/constants/routes.ts`: добавить `newCapsule: "/capsules/new"`, `getCapsule: (id) => \`/capsules/${id}\``.

Это отдельная страница, не модалка (`useModal` не подходит — канвасу нужно место на экране); модалку можно оставить только для мелких подтверждений типа "отменить капсулу?".

### Zustand-стор (`canvas.store.ts`)

Тот же паттерн, что `entities/user-session/model/user.store.ts` (raw store + `use<X>()`-хук на селекторах), с `immer` — этот мидлвар уже используется в проекте в `shared/api/session.store.ts`, так что паттерн не новый.

```ts
type PlacedItem = { clothesId: string; x: number; y: number; rotation: number; scale: number; zIndex: number };
interface CanvasStore {
  items: Record<string, PlacedItem>; // key = clothesId
  addItem: (clothesId: string) => void;
  removeItem: (clothesId: string) => void;
  updateTransform: (clothesId: string, patch: Partial<Pick<PlacedItem, "x"|"y"|"rotation"|"scale">>) => void;
  bringToFront: (clothesId: string) => void;
  sendToBack: (clothesId: string) => void;
  reset: () => void;
}
export const canvasStore = create<CanvasStore>()(immer((set) => ({ /* ... */ })));
export function useCanvasItems() { return canvasStore((s) => s.items); }
export function useCanvasActions() { return { addItem: canvasStore((s) => s.addItem), /* ... */ }; }
```
Стор — фича-локальный (не в `entities/`), не персистентный; `reset()` вызывается при входе на страницу и после успешной публикации, чтобы не тащить состояние между разными капсулами.

### Публикация

`publish-button.tsx`: `toBlob(canvasDomRef.current)` → `uploadCapsuleThumbnail(blob)` → `createCapsule({ name, thumbnailUrl, items: Object.values(items) })` → invalidate `["capsules", currentUser.id]` и `["capsulesFeed"]` → `router.push(routes.getCapsule(id))`.

---

## Фаза C — стена (бесконечный скролл)

### Новые файлы

```
frontend/src/entities/capsules/model/useCapsulesFeed.ts
frontend/src/widgets/capsules-feed/ui/{capsules-feed.tsx,capsule-feed-tile.tsx}
frontend/src/widgets/capsules-feed/index.ts
frontend/src/fsd-pages/wall/{index.ts,ui/wall.tsx}
```
`frontend/src/app/page.tsx` — заменить текущую заглушку (кнопка Logout) на `<Wall />` (кнопку логаута перенести в профиль/настройки).

### `useInfiniteQuery` + `BaseVirtualList` (прецедента пагинации в проекте нет, дизайн новый)

```ts
export function useCapsulesFeed() {
  return useInfiniteQuery({
    queryKey: ["capsulesFeed"],
    queryFn: ({ pageParam }) => getCapsulesFeed({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
```
`BaseVirtualList` не поддерживает подгрузку сама по себе — вместо изменения общего компонента используем уже установленный `react-use`'s `useIntersection` на 1px "сторожевом" `<div>`, отрендеренном сразу после `BaseVirtualList` в том же скролл-контейнере (`parentRef`/`Scroller`): `BaseVirtualList` считает свою высоту через `getTotalSize()` и абсолютно позиционирует строки внутри, поэтому сторож естественно оказывается ниже по document flow без правок самого компонента. Когда сторож пересекает viewport и `hasNextPage && !isFetchingNextPage` → `fetchNextPage()`.

`getItemKey={(item) => item.id}`, `aspectRatio={3/4}`. `capsule-feed-tile.tsx` — просто `<Image src={thumbnailUrl}>` + автор, ссылка на `routes.getCapsule(id)` (не живой рендер композиции — ради производительности ленты при масштабе).

---

## Фаза D — капсулы в профиле

`features/capsules/ui/capsules-list.tsx` — убрать хардкод `[1..100]`, заменить по образцу `features/clothes/ui/clothes-list.tsx`: `useUserCapsules(pageUserData?.data?.id)` (обычный `useQuery`, без пагинации — у одного пользователя капсул немного, усложнять бесконечным скроллом преждевременно), `BaseVirtualList` с `aspectRatio={3/4}`, состояния загрузки/пусто (`empty-capsules.tsx`/`self-empty-capsules.tsx` по образцу пары для вещей, с CTA на `routes.newCapsule`).

Плитки — тот же `thumbnailUrl`, что и на стене (не дублируем два способа рендера одних данных), ссылка на `routes.getCapsule(id)`.

Детальная страница капсулы (новая): `app/capsules/[capsuleId]/page.tsx` → `fsd-pages/capsule-detail/` — использует `GET /capsule/:id` (полный `items` со join на `clothes`) и **переиспользует** `capsule-canvas.tsx` из Фазы B в read-only режиме (пропсами `items`, без gesture-хендлеров и без стора) — так превью-рендер конструктора и просмотра не расходятся.

Новые файлы:
```
frontend/src/features/capsules/ui/{empty-capsules.tsx,self-empty-capsules.tsx}
frontend/src/fsd-pages/capsule-detail/{index.ts,ui/capsule-detail.tsx}
frontend/src/app/capsules/[capsuleId]/page.tsx
```

---

## Порядок реализации и проверка

1. **Prisma-миграция** — добавить модели, `prisma migrate dev --name add_capsules`, проверить каскад через Prisma Studio (уже поднят на `localhost:5556` в `docker-compose.yml`): удалить `Clothes` со связанным `CapsuleItem`, убедиться что `CapsuleItem` тоже пропал.
2. **Backend** (Фаза A) — repository → service → controller. Ручной смоук через curl/Postman: создать капсулу из 2 вещей → получить по id → список по userId → wall-фид со вторым подписанным аккаунтом → удалить → сверить `capsulesQuantity` в Prisma Studio до/после. Отдельно проверить 403 при попытке удалить чужую капсулу.
3. **Frontend entity-слой** — api-обёртки и query-хуки, проверить против уже поднятого бэкенда до того, как строить UI.
4. **Фаза B** — сначала статичный (без жестов) рендер канваса + пикер вещей, визуально проверить; затем drag через `@use-gesture`, затем поворот/масштаб, затем z-order; публикация — в последнюю очередь (проверить и новый объект в S3, и новую строку в Prisma одновременно).
5. **Фаза D раньше Фазы C** по факту сборки (несмотря на нумерацию) — она нужна только уже готовому эндпоинту списка по userId и сразу даёт видимое место для капсул из шага 4; фид Фазы C легче проверять на реальных данных нескольких аккаунтов.
6. **Фаза C** — завести 2+ тестовых аккаунта, подписки, опубликовать >20 публичных капсул, проверить порядок ленты, срабатывание подгрузки при скролле и `hasNextPage → false` в конце.

---

### Ключевые файлы
- `backend/prisma/schema.prisma`
- `backend/src/capsule/capsule.repository.ts`, `capsule.service.ts`, `capsule.controller.ts`
- `common/src/dto/capsules/shared.ts`
- `frontend/src/features/capsule-constructor/model/canvas.store.ts`
- `frontend/src/features/capsule-constructor/ui/capsule-canvas.tsx` (переиспользуется в Фазе D)
- `frontend/src/entities/capsules/model/useCapsulesFeed.ts`
- `frontend/src/shared/ui/ui/base-virtual-list.tsx` (переиспользуется, не меняется)

### Вне рамок этого плана
Левый сайдбар с ИИ-помощником на LangGraph — по договорённости обсуждаем отдельно, когда будут детали (подсказки по сайту, подбор вещей с Wildberries).
