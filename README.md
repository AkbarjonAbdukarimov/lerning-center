# Мини-учёт оплат учебного центра

Тестовое задание Ecomdev. **NestJS + Prisma + PostgreSQL** (API) и **React + Tailwind** (веб-интерфейс, вариант Б).
React-приложение собирается и раздаётся самим NestJS (`@nestjs/serve-static`), так что весь проект — это один контейнер `app` + контейнер `db`.

## Быстрый старт (Docker)

Нужны только Docker и Docker Compose.

```bash
git clone <repo-url> ttask
cd ttask
cp .env.example .env        # при необходимости поменяйте порты/пароли
docker compose up --build -d
```

- Интерфейс: http://localhost:3000 (удобно открывать с телефона в той же сети: `http://<IP-компьютера>:3000`)
- Swagger (документация API): http://localhost:3000/docs
- Health-check: http://localhost:3000/health

При старте контейнер сам применяет миграции (`prisma migrate deploy`) и, если `SEED=true` и таблица учеников пуста, заливает 5 демо-учеников с оплатами за текущий месяц.

Остановить: `docker compose down` (с удалением данных: `docker compose down -v`).

## Локальная разработка (без сборки образа)

Нужен Node.js 20+.

```bash
# 1. База данных
cp .env.example .env
docker compose up -d db

# 2. API (http://localhost:3000)
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy   # или `npx prisma migrate dev` при изменении схемы
npm run seed                # демо-данные (необязательно)
npm run start:dev

# 3. Фронтенд (http://localhost:5173, запросы к API проксируются Vite)
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

### Тесты

```bash
cd backend
npm test                    # unit: расчёт диапазона месяца, валидация дат, расчёт долга
npm run test:e2e            # e2e на реальной БД (нужен DATABASE_URL из backend/.env и запущенная db)
```

## Переменные окружения

| Файл | Переменная | Назначение |
|---|---|---|
| `.env` (для docker compose) | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | учётка и имя БД |
| | `APP_PORT`, `DB_PORT` | порты на хосте |
| | `SEED` | `true` — залить демо-данные при первом запуске |
| | `TZ` | часовой пояс для «текущего месяца» и даты оплаты по умолчанию |
| `backend/.env` | `DATABASE_URL` | строка подключения к Postgres |
| | `PORT` | порт API |
| | `CORS_ORIGIN` | разрешённые origin'ы (через запятую), нужно только если фронт ходит на API напрямую |
| | `CLIENT_DIR` | папка со сборкой React (по умолчанию `../client`; в Docker — `/app/client`) |
| `frontend/.env` | `VITE_API_URL` | базовый URL API; пусто = тот же origin |
| | `VITE_DEV_API_TARGET` | куда dev-сервер Vite проксирует запросы к API |

## API

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/students` | создать ученика `{name, phone, group, monthlyFee}` |
| `GET` | `/students?group=` | список (фильтр по группе необязателен) |
| `GET` | `/students/:id` | один ученик |
| `PATCH` | `/students/:id` | изменить (любые поля) |
| `DELETE` | `/students/:id` | удалить (оплаты удаляются каскадно), `204` |
| `POST` | `/payments` | добавить оплату `{studentId, amount, date?}` (`date` = `YYYY-MM-DD`, по умолчанию сегодня) |
| `GET` | `/students/:id/payments` | оплаты ученика (новые сверху) |
| `GET` | `/payments?studentId=` | то же самое через query |
| `GET` | `/debtors?month=YYYY-MM` | должники за месяц (по умолчанию текущий) |

Пример:

```bash
curl -X POST localhost:3000/students -H 'Content-Type: application/json' \
  -d '{"name":"Иван","phone":"+998901234567","group":"JS-1","monthlyFee":1000}'
curl -X POST localhost:3000/payments -H 'Content-Type: application/json' \
  -d '{"studentId":1,"amount":400,"date":"2025-01-10"}'
curl 'localhost:3000/debtors?month=2025-01'
```

Ответ `/debtors`:

```json
{
  "month": "2025-01",
  "count": 1,
  "totalDebt": 600,
  "debtors": [
    { "id": 1, "name": "Иван", "phone": "+998901234567", "group": "JS-1",
      "monthlyFee": 1000, "paid": 400, "debt": 600 }
  ]
}
```

Ошибки валидации — `400` со списком сообщений, несуществующий ученик — `404`, лишние поля в теле запроса отклоняются.

## Решения и допущения

- **Деньги** хранятся как `NUMERIC(12,2)`, а не float, поэтому копейки не теряются; в JSON отдаются числом.
- **Должник за месяц** — ученик, у которого сумма оплат с датой внутри месяца `[1-е число; 1-е следующего)` меньше `monthlyFee`. `debt = monthlyFee − paid`. Считается одним SQL-запросом (`LEFT JOIN … GROUP BY … HAVING`), без выборки всех оплат в память.
- Ученики, **добавленные после окончания месяца**, в должники за этот месяц не попадают (иначе новый ученик «должен» за всю прошлую историю).
- Переплата не переносится на следующий месяц, долг прошлых месяцев не накапливается — каждый месяц считается отдельно (как в формулировке задачи).
- Для прошлых месяцев используется **текущая** `monthlyFee` ученика (истории изменения тарифа нет — см. улучшения).
- Интерфейс — mobile-first: нижняя навигация, карточки, нижние «шторки» для форм, `inputMode="decimal"` для сумм, ссылка `tel:` на телефон должника. Кнопка «Внести оплату» на карточке должника подставляет ученика и остаток долга.
- Фронт и API живут на одном origin, поэтому в продакшене не нужен CORS; маршруты API исключены из SPA-fallback.

## Структура

```
├─ Dockerfile            # multi-stage: сборка React → сборка Nest → runtime-образ
├─ docker-compose.yml    # db (postgres:16) + app
├─ backend/
│  ├─ prisma/            # schema.prisma + миграции
│  ├─ src/students|payments|debtors/   # модули Nest (controller, service, dto)
│  ├─ src/seed.ts        # демо-данные
│  └─ test/              # e2e
└─ frontend/src/
   ├─ pages/             # DebtorsPage, StudentsPage
   └─ components/        # PaymentForm, StudentForm, Sheet, Toast
```

## Что бы я улучшил, будь у меня ещё неделя

1. **Авторизация и роли** (администратор/бухгалтер) — сейчас API открыт всем, кто знает адрес.
2. **История тарифов и начисления**: хранить изменения `monthlyFee` по датам и считать долг по тарифу, действовавшему в том месяце; учитывать накопленный долг/переплату прошлых месяцев и частичные месяцы (зачисление/отчисление в середине месяца, статус «отчислен»).
3. **Telegram-бот** (`/debt`, `/pay`) поверх того же API и напоминания должникам; экспорт должников в Excel/CSV.
4. **Пагинация, поиск и фильтры на сервере** (сейчас поиск в интерфейсе — на клиенте), удаление/корректировка ошибочных оплат с журналом изменений.
5. **CI** (lint, unit + e2e на Testcontainers, сборка образа), тесты фронтенда, структурированные логи и мониторинг.

## Что не сделано

- Telegram-бот (вариант А) — не делал, выбран вариант Б (веб-страница).
- Удаления и редактирования оплат нет — в задании требуются только добавление и список.
- Автотестов фронтенда нет; интерфейс проверялся вручную.
