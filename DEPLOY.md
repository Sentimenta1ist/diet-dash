# Diet Dash — Coolify Deployment Guide

Деплоим два отдельных сервиса (backend + frontend) в Coolify.
PostgreSQL используем тот, что уже запущен в Coolify.

## Архитектура

```
Browser → diet-dash.qear.net  (frontend, nginx, порт 80)
             ↓ API calls to REACT_APP_API_URL
         api.diet-dash.qear.net  (backend, Node/Hono, порт 5000)
             ↓
         Existing Coolify PostgreSQL (новая база dietdash)
```

Frontend — статика раздаётся nginx. URL бекенда зашивается при сборке через build arg.

---

## Шаг 1 — Создать базу данных в существующем PostgreSQL

1. В Coolify → открой свой PostgreSQL сервис
2. Найди кнопку **Terminal** или **Execute Command**
3. Выполни:
   ```sql
   CREATE DATABASE dietdash;
   CREATE USER dietdash WITH PASSWORD 'придумай_пароль';
   GRANT ALL PRIVILEGES ON DATABASE dietdash TO dietdash;
   ```
4. Запиши connection string (понадобится для бекенда):
   ```
   postgresql://dietdash:придумай_пароль@postgres_host:5432/dietdash
   ```
   `postgres_host` — это имя контейнера PostgreSQL в Coolify (обычно видно в разделе Service → Container Name).
   Если бекенд будет на том же сервере в той же Docker-сети (`coolify`), используй именно container name (например `postgresql-xxxxx`).

---

## Шаг 2 — Создать GitHub репозиторий и запушить код

Если репо ещё нет:
```bash
cd /путь/к/diet-dash-new
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/твой-юзер/diet-dash-new.git
git push -u origin main
```

> **Важно:** `main_data.csv` (`backend/data/main_data.csv`) должен быть закоммичен — бекенд сидит продукты из него при первом запуске.

---

## Шаг 3 — Деплой бекенда

### В Coolify → New Resource → Application

| Поле | Значение |
|------|---------|
| Repository | `https://github.com/твой-юзер/diet-dash-new` |
| Branch | `main` |
| Base Directory | `/backend` |
| Dockerfile | `Dockerfile` |
| Port | `5000` |
| Domain | `api.diet-dash.qear.net` ← добавь этот домен |

### Environment Variables (Coolify → Service → Environment Variables)

```
DATABASE_URL=postgresql://dietdash:пароль@container_name:5432/dietdash
JWT_SECRET=сгенерируй_длинную_строку_openssl_rand_base64_48
MAILTRAP_API_TOKEN=твой_mailtrap_token
MAIL_PASSWORD=твой_mail_password
PORT=5000
DOMAIN=diet-dash.qear.net
```

Сгенерировать JWT_SECRET:
```bash
openssl rand -base64 48
```

### DNS
Добавь A-запись:
```
api.diet-dash.qear.net → IP твоего VPS
```

### Deploy
Нажми **Deploy**. В логах должно появиться:
```
[seed] Tables ready.
[seed] Test user created: test@dietdash.com
Diet Dash backend running on port 5000
```

Тест-юзер создаётся, только если задана переменная `TEST_USER_PASSWORD`. Без неё: `[seed] Test user skipped ...` — тоже OK.

Проверь что бекенд работает:
```bash
curl https://api.diet-dash.qear.net/api/health
# → {"status":"ok"}
```

---

## Шаг 4 — Деплой фронтенда

### В Coolify → New Resource → Application

| Поле | Значение |
|------|---------|
| Repository | `https://github.com/твой-юзер/diet-dash-new` |
| Branch | `main` |
| Base Directory | `/frontend` |
| Dockerfile | `Dockerfile` |
| Port | `80` |
| Domain | `diet-dash.qear.net` |

### Build Arguments (Coolify → Service → Build Variables)

```
REACT_APP_API_URL=https://api.diet-dash.qear.net/api
```

> Это значение зашивается в JS-бандл во время сборки. Если его менять — нужно пересобирать контейнер.

### Deploy
Нажми **Deploy**. Сборка займёт ~2–3 минуты (npm install + npm run build).

---

## Шаг 5 — Проверка

1. Открой `https://diet-dash.qear.net` — должна открыться landing page
2. Войди: `test@dietdash.com` / пароль из `TEST_USER_PASSWORD`
3. Должен открыться Diet plan с профилем "Default"
4. Попробуй добавить продукт и экспортировать рацион

---

## Обновление после изменений в коде

### Только бекенд изменился:
```bash
git add backend/
git commit -m "fix: ..."
git push
```
В Coolify → backend сервис → **Redeploy**

### Только фронтенд изменился:
```bash
git add frontend/
git commit -m "fix: ..."
git push
```
В Coolify → frontend сервис → **Redeploy**

---

## Troubleshooting

### Фронтенд показывает белый экран
- Открой DevTools → Console, смотри ошибки
- Проверь что `REACT_APP_API_URL` правильно указан (должен быть `https://api.diet-dash.qear.net/api` без слэша на конце)
- Сделай hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

### Бекенд не отвечает
- Coolify → backend → Logs → проверь что seed выполнился
- Проверь `DATABASE_URL` — container name PostgreSQL должен быть правильным
- Убедись что backend и PostgreSQL в одной Docker-сети (`coolify`)

### CORS ошибки
- Бекенд уже настроен с `origin: '*'`
- Убедись что запросы идут на `https://` (не `http://`)

### Тест-юзер не работает
- Посмотри логи бекенда при старте
- Можно сбросить пароль через базу:
  ```sql
  -- Получить новый хэш можно запустив: node -e "const b=require('bcryptjs'); b.hash('<новый пароль>',10).then(console.log)"
  UPDATE app_user SET password='$2a$10$...' WHERE login='test@dietdash.com';
  ```

---

## Переменные окружения — полный список

| Переменная | Обязательна | Описание |
|-----------|------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Секрет для подписи JWT токенов |
| `MAILTRAP_API_TOKEN` | ✅ | Token для отправки email через Mailtrap |
| `MAIL_PASSWORD` | ✅ | Пароль SMTP (legacy, но обязателен для старта) |
| `PORT` | — | Порт бекенда внутри контейнера (default: 5000) |
| `DOMAIN` | — | Домен для ссылок в письмах (default: diet-dash.com) |

**Build argument фронтенда:**

| Аргумент | Описание |
|---------|---------|
| `REACT_APP_API_URL` | Полный URL бекенда до `/api` включительно |
