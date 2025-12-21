# Установка и запуск

## Требования

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (или yarn, pnpm)

Проверь версию:
```bash
node --version
npm --version
```

## Установка зависимостей

```bash
npm install
```

## Конфигурация окружения

Создай файл `.env` в корне проекта (или отредактируй существующий):

```env
# API сервера (по умолчанию localhost:3000)
VITE_API_BASE_URL=http://localhost:3000/

# Для продакшена:
# VITE_API_BASE_URL=https://pd-projects-backend-production.up.railway.app/
```

## Запуск в режиме разработки

```bash
npm run dev
```

Откроется на http://localhost:5173 (или другом порту, если 5173 занят).

Приложение будет перезагружаться при изменении файлов (HMR).

## Сборка для продакшена

```bash
npm run build
```

Скомпилированное приложение будет в папке `dist/`.

## Локальный preview собранного приложения

```bash
npm run preview
```

Покажет, как выглядит приложение в продакшене (с минификацией, оптимизацией и т.п.).

## Запуск с локальным бэкендом

1. **Запусти бэкенд**:
   ```bash
   cd ../pd-projects-backend
   npm install
   npm run start:dev
   ```
   Бэкенд запустится на http://localhost:3000

2. **Убедись, что в `.env` фронта установлено**:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/
   ```

3. **Запусти фронт**:
   ```bash
   npm run dev
   ```

4. **Заполни БД тестовыми данными** (в папке бэкенда):
   ```bash
   npm run seed
   ```

5. **Открой приложение**:
   - http://localhost:5173 (фронт)
   - Вход: `student@example.com` / `password123`

## Доступные команды

```bash
npm run dev       # Запуск dev сервера
npm run build     # Сборка для продакшена
npm run preview   # Preview собранного приложения
npm run lint      # Проверка кода (если настроено)
npm run format    # Форматирование кода (если настроено)
```

## Отладка в браузере

1. Открой DevTools (F12)
2. Вкладка **Console** — основные логи
3. Вкладка **Network** — HTTP запросы
4. Вкладка **Application** → **Local Storage** — сохранённый токен и настройки

### Полезные логи

В консоли ищи префиксы:
- `[ProjectsStore]` — загрузка проектов
- `[AuthStore]` — авторизация

Если 500 ошибка, логи помогут найти причину.

## Проблемы и решения

### Порт 5173 уже занят

Vite выберет следующий свободный порт автоматически. Или указа порт явно:

```bash
npm run dev -- --port 3001
```

### 500 ошибка при загрузке проектов

- Убедись, что бэкенд запущен на `localhost:3000`
- Проверь логи бэкенда: `npm run start:dev` в папке бэкенда
- Убедись, что БД заполнена: `npm run seed`

### Не загружается страница

- Очисти кэш браузера (Ctrl+Shift+Delete или Cmd+Shift+Delete)
- Выполни hard refresh (Ctrl+F5 или Cmd+Shift+R)

### Старый токен не удаляется

```javascript
// В консоли браузера:
localStorage.removeItem('token');
location.reload();
```

## Развёртывание

### На Vercel

1. Fork репозитория
2. Подключи к Vercel
3. Установи переменные окружения в Vercel Settings:
   - `VITE_API_BASE_URL=https://your-backend-url.com/`
4. Deploy

### На другой хостинг

1. `npm run build` — создаёт папку `dist/`
2. Залей `dist/` на хостинг (Netlify, GitHub Pages, etc.)
3. Убедись, что `VITE_API_BASE_URL` указывает на правильный бэкенд

## Дополнительные ресурсы

- [Vue 3 документация](https://vuejs.org/)
- [Vite документация](https://vitejs.dev/)
- [TypeScript документация](https://www.typescriptlang.org/)
- [Pinia документация](https://pinia.vuejs.org/)
