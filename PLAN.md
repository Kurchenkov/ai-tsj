# План разработки HouseHub

> Сайт для многоквартирного дома: авторизация, сдача показаний счётчиков,
> голосования с весом по площади квартиры, объявления.

## Стек (зафиксирован)

- **Backend:** ASP.NET Core 8 Web API + EF Core 8
- **Frontend:** Vue 3 + Vite + TypeScript + Pinia + Vue Router + Axios
- **БД:** PostgreSQL 16
- **Auth:** ASP.NET Identity + JWT (access + refresh)
- **Доп.:** FluentValidation, Serilog, Swagger/OpenAPI, Docker Compose

---

## 1. Роли и сценарии

| Роль | Возможности |
|---|---|
| `Resident` (житель) | Авторизация, просмотр своих квартир, сдача показаний, голосование, чтение объявлений |
| `Admin` (УК/председатель) | Управление домом, квартирами, жителями; создание голосований; публикация объявлений; экспорт показаний |
| `Guest` | Только страница входа/регистрации (регистрация по приглашению или с верификацией админом) |

---

## 2. Доменная модель

- **User** (Identity): Email, PhoneNumber, FullName, Roles
- **Building**: Address, TotalArea
- **Apartment**: Number, Floor, Area (м²), BuildingId
- **ApartmentOwnership**: UserId, ApartmentId, ShareFraction (доля владения, 0..1), FromDate, ToDate
- **MeterDevice**: ApartmentId, Type (ColdWater/HotWater/Electricity/Gas/Heating), SerialNumber, Unit
- **MeterReading**: MeterDeviceId, Value, ReadingDate, SubmittedByUserId, PhotoUrl?, PreviousValue (вычисляется)
- **Poll**: Title, Description, StartsAt, EndsAt, QuorumPercent, Status (Draft/Active/Closed)
- **PollQuestion**: PollId, Text, Type (SingleChoice/Multi/YesNo)
- **PollOption**: QuestionId, Text
- **Vote**: PollQuestionId, ApartmentId, UserId, OptionId, Weight (= Apartment.Area × ShareFraction), CastAt
- **Announcement**: Title, Body (Markdown), AuthorId, PublishedAt, IsPinned, Attachments[]
- **AnnouncementAttachment**: AnnouncementId, FileUrl, FileName

**Ключевое правило голосования:** один голос = площадь квартиры (× долю владения, если совладельцы). Итоги считаются по суммарной площади «за», «против», «воздержался», сравниваются с кворумом от общей площади дома.

Вес голоса фиксируется (snapshot) при сохранении `Vote`, чтобы перерасчёт долей в будущем не менял прошлые результаты. Уникальный индекс `(PollQuestionId, ApartmentId)` исключает двойное голосование от одной квартиры.

---

## 3. Backend — структура проекта

```
backend/
  HouseHub.sln
  src/
    HouseHub.Api/              # Web API, контроллеры, middlewares, Program.cs
    HouseHub.Application/      # DTO, сервисы (бизнес-логика), валидация
    HouseHub.Domain/           # Сущности, value objects, enums
    HouseHub.Infrastructure/   # EF DbContext, миграции, репозитории, JWT, email
  tests/
    HouseHub.UnitTests/
    HouseHub.IntegrationTests/ # WebApplicationFactory + Testcontainers (Postgres)
```

### REST-эндпоинты (черновик)

**Auth**
- `POST /api/auth/register` (по инвайту)
- `POST /api/auth/login` → `{ accessToken, refreshToken }`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET  /api/me`

**Apartments**
- `GET  /api/apartments/mine`
- `GET  /api/apartments/{id}` (admin)
- `POST /api/apartments` (admin)
- `POST /api/apartments/{id}/owners` (admin — назначить жильца)

**Meters**
- `GET  /api/apartments/{id}/meters`
- `GET  /api/meters/{id}/readings?from&to`
- `POST /api/meters/{id}/readings`  (валидация: value > previous, дата в открытом периоде)
- `GET  /api/admin/readings/export?period=YYYY-MM` (CSV/XLSX)

**Polls**
- `GET  /api/polls?status=active|closed`
- `GET  /api/polls/{id}`
- `POST /api/polls` (admin)
- `POST /api/polls/{id}/publish` (admin)
- `POST /api/polls/{id}/questions/{qid}/vote`  (идемпотентно по `(apartmentId, questionId)`)
- `GET  /api/polls/{id}/results` (агрегаты по площади; во время активного голосования — только админу)

**Announcements**
- `GET  /api/announcements?page=`
- `GET  /api/announcements/{id}`
- `POST /api/announcements` (admin)
- `PUT/DELETE /api/announcements/{id}` (admin)
- `POST /api/announcements/{id}/attachments`

### Безопасность

- JWT с коротким сроком + refresh в HttpOnly cookie
- Policy-based авторизация: `Admin`, `ResidentOf(apartmentId)`
- Rate limiting на `/auth/*` и `/readings`
- CORS — только домен фронта
- Все мутации — через DTO + FluentValidation

---

## 4. Frontend — структура Vue 3

```
frontend/src/
  api/            # axios-клиенты по модулям
  stores/         # Pinia: auth, apartments, polls, announcements
  router/         # маршруты с guard'ами по ролям
  views/
    AuthLogin.vue
    Dashboard.vue
    Apartments/
      MyApartments.vue
      MeterReadings.vue       # форма сдачи + история (график Chart.js)
    Polls/
      PollsList.vue
      PollDetails.vue          # голосование с подсказкой «ваш вес: 56.3 м²»
      PollResults.vue          # прогресс-бары по площади
    Announcements/
      AnnouncementsList.vue
      AnnouncementView.vue
    Admin/
      BuildingSetup.vue
      ResidentsManage.vue
      PollEditor.vue
      AnnouncementEditor.vue   # Markdown-редактор
      ReadingsReport.vue
  components/     # переиспользуемые UI: AppLayout, Modal, FileUpload
```

- Аутентификация: интерсептор Axios подставляет `Authorization: Bearer`, при 401 — авто-refresh
- Роутер: `meta: { requiresAuth, roles: ['Admin'] }`
- UI-кит: Vuetify или PrimeVue (на выбор) — таблицы, формы, тосты «из коробки»

---

## 5. Этапы реализации

| # | Этап | Содержание | Статус |
|---|---|---|---|
| 1 | Каркас | Solution, проекты, Docker Compose (api + postgres), Vite-проект, CI-болванка | ✅ Готово |
| 2 | Auth | Identity, JWT, refresh, регистрация по инвайту, страницы Login/Register | ⏳ Следующий |
| 3 | Дом и квартиры | CRUD дома/квартир (админ), назначение жильцов, «Мои квартиры» на фронте | |
| 4 | Счётчики | Сущности, форма сдачи, валидация (>= предыдущего), история, экспорт CSV | |
| 5 | Голосования | Создание опросов, голосование с весом по площади, агрегация результатов, кворум | |
| 6 | Объявления | Markdown-публикации, вложения, закрепление, лента на дашборде | |
| 7 | Полировка | Уведомления (email при новом голосовании/объявлении), логирование, бэкап БД | |
| 8 | Тесты и деплой | Unit + integration тесты, прод docker-compose / Nginx + HTTPS | |

---

## 6. Что сделано в этапе 1 (каркас)

**Backend**
- `HouseHub.sln` со связанными проектами: `Api` → `Application` + `Infrastructure` → `Domain` + тесты
- NuGet: EF Core 8 + Npgsql, ASP.NET Identity, JWT Bearer, Swagger, Serilog, FluentValidation
- `Program.cs` с CORS, Swagger, Serilog и `/health` endpoint
- `Dockerfile` для multi-stage сборки
- Сборка чистая: 0 ошибок

**Frontend**
- Vue 3 + TypeScript + Vite, добавлены Pinia, Vue Router 4, Axios
- `api/http.ts` — axios-клиент с автоматической подстановкой Bearer-токена
- `stores/auth.ts` — Pinia store для auth-состояния
- `router/index.ts` с guard'ом на `requiresAuth`
- Заглушки views: Home (с health-check), Login, Announcements, Meters, Polls

**Инфраструктура**
- `docker-compose.yml`: postgres 16 + api с healthcheck
- `.env.example`, `.gitignore`, `global.json` (пин .NET 8 SDK)
- `.github/workflows/ci.yml` — build + test на каждый PR

---

## 7. Открытые вопросы (решить перед/во время этапа 2+)

1. **Регистрация:** только по инвайту от админа или самостоятельная с верификацией?
   - *Влияет на:* `POST /api/auth/register`, наличие сущности `Invite`, UI экрана регистрации, этап 2.

2. **Совладельцы:** делим площадь между ними (`ShareFraction`) или каждый голосует от полной площади по очереди?
   - *Влияет на:* схему `ApartmentOwnership`, формулу веса голоса, UI «ваш вес», этап 5.

3. **Тарифы ЖКХ:** считаем суммы по показаниям или только сдача чисел?
   - *Влияет на:* наличие сущностей `Tariff`, `Invoice`, экраны жильца, этап 4 (или отдельный этап).

4. **Файлы:** хранить в БД (bytea), локально (volume), или в S3-совместимом хранилище (MinIO)?
   - *Влияет на:* реализацию `IFileStorage`, docker-compose (нужен ли MinIO), этапы 4 и 6.

5. **Анонимность голосований:** видит ли админ кто как проголосовал, или только агрегаты?
   - *Влияет на:* поля `Vote.UserId`, политики доступа, UI результатов, этап 5.

6. **UI-кит:** Vuetify, PrimeVue, Naive UI или вручную?
   - *Влияет на:* `package.json`, базовые компоненты, общий стиль, этап 2.

---

## 8. Как продолжить

1. Запустить локально (проверить, что каркас работает):
   ```bash
   docker compose up -d postgres
   cd backend && dotnet run --project src/HouseHub.Api
   # в другом терминале
   cd frontend && npm install && npm run dev
   ```
   Открыть <http://localhost:5173> — на главной должен быть `API: ok (...)`.

2. Ответить на открытые вопросы (минимум 1, 2, 5, 6 нужны для этапа 2–3).

3. Начать **этап 2 (Auth):**
   - Перенести Identity-сущности в `Infrastructure/Persistence/AppDbContext.cs`
   - Расширить `User` (FullName, etc.)
   - JWT-сервис (`Infrastructure/Auth/JwtTokenService.cs`)
   - `AuthController` с `register/login/refresh/logout/me`
   - Миграция `InitialIdentity`
   - На фронте: форма `LoginView` + интерсептор для 401-refresh
