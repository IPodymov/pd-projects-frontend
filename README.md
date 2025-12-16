# PD Projects Frontend

Фронтенд для системы управления проектами. Реализованы:

- Аутентификация: вход и регистрация (`/auth/login`, `/auth/registration`).
- Главная: список всех проектов (`GET /projects`).
- Модерация: для ролей ADMIN/UNIVERSITY_STAFF — одобрение/отклонение проекта (PATCH `/projects/:id` со `status`).
- Профиль пользователя: просмотр и редактирование имени/фамилии/отчества (`GET /users/profile`, `PATCH /users/:id`).
- Архитектура: разделение на `pages`, `components`, `ui`; сервисы API; Pinia-хранилище; vue-router.

## Технологии

- Vue 3, TypeScript, Vite
- Pinia (стейт), vue-router (роутинг), axios (API)

## Структура

- `src/pages`: `HomePage.vue`, `LoginPage.vue`, `RegisterPage.vue`, `ProfilePage.vue`
- `src/components`: `NavBar.vue`, `ProjectList.vue`, `ProjectCard.vue`
- `src/ui`: `Button.vue`, `Input.vue`, `FormField.vue`
- `src/services`: `api.ts`, `auth.ts`, `projects.ts`, `users.ts`
- `src/stores`: `auth.ts`, `projects.ts`
- `src/router`: `index.ts`

Стиль имен классов — БЭМ (`block__element`, `block_mod`). Логика и слои разделены по SOLID/DRY.

## Подготовка

1) Укажите адрес backend в `.env`:

```
VITE_API_BASE_URL=http://localhost:3000
```

2) Установка зависимостей и запуск:

```bash
npm install
npm run dev
```

Сборка продакшн:

```bash
npm run build
npm run preview
```

## Роли и доступ

- Кнопки модерации проектов видны только для пользователей с ролями `ADMIN` или `UNIVERSITY_STAFF` и только для проектов со статусом `PENDING`.
- Токен JWT сохраняется в `localStorage` и автоматически подставляется в `Authorization: Bearer <token>`.

## Бэкенд

Документация API: см. репозиторий backend и папку `docs`.
