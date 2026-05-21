# HouseHub — личный кабинет жильцов МКД

Сайт для многоквартирного дома: авторизация, сдача показаний счётчиков, голосования
с весом по площади квартиры, объявления.

## Стек

- **Backend:** ASP.NET Core 8 Web API + EF Core 8 + ASP.NET Identity + JWT
- **Frontend:** Vue 3 + Vite + TypeScript + Pinia + Vue Router + Axios
- **БД:** PostgreSQL 16
- **Контейнеризация:** Docker Compose

## Структура

```
.
├── backend/
│   ├── HouseHub.sln
│   ├── src/
│   │   ├── HouseHub.Api/             # Web API, контроллеры, Program.cs
│   │   ├── HouseHub.Application/     # DTO, сервисы, валидация
│   │   ├── HouseHub.Domain/          # Сущности, value objects
│   │   └── HouseHub.Infrastructure/  # EF DbContext, миграции, репозитории
│   └── tests/
│       ├── HouseHub.UnitTests/
│       └── HouseHub.IntegrationTests/
├── frontend/                          # Vue 3 + Vite
├── docker-compose.yml
└── README.md
```

## Локальный запуск

### Вариант 1: Docker Compose (полный стек)

```bash
cp .env.example .env
docker compose up --build
```

API: <http://localhost:5080>, Swagger: <http://localhost:5080/swagger>, healthcheck: <http://localhost:5080/health>.

### Вариант 2: Раздельно для разработки

**Только PostgreSQL в Docker:**

```bash
docker compose up -d postgres
```

**Backend:**

```bash
cd backend
dotnet run --project src/HouseHub.Api
```

API на <http://localhost:5080> (HTTP) или <https://localhost:7080> (HTTPS).

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Открыть <http://localhost:5173>.

## Этапы реализации

- [x] **Этап 1 — Каркас:** solution, проекты, Docker Compose, Vite, CI болванка.
- [ ] **Этап 2 — Auth:** Identity, JWT, refresh, регистрация по инвайту.
- [ ] **Этап 3 — Дом и квартиры:** CRUD дома/квартир, назначение жильцов.
- [ ] **Этап 4 — Счётчики:** сущности, форма сдачи, история, экспорт CSV.
- [ ] **Этап 5 — Голосования:** опросы, голосование с весом по площади, кворум.
- [ ] **Этап 6 — Объявления:** Markdown-публикации, вложения, лента.
- [ ] **Этап 7 — Полировка:** email-уведомления, бэкапы.
- [ ] **Этап 8 — Тесты и деплой:** интеграционные тесты, прод-конфиг.
"# ai-tsj" 
