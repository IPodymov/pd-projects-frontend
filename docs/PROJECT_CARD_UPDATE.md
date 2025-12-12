# Обновление: Карточка проекта и загрузка данных

## Дата: 12 декабря 2025 г.

## Изменения

### 1. Создан компонент ProjectCard.vue

**Расположение:** `src/components/ProjectCard.vue`

**Функциональность:**
- Полная карточка проекта с отображением всех данных из бекенда
- Отображение информации о школе, классе, авторе и участниках
- Поддержка GitHub ссылок
- Отображение прикрепленных файлов
- Действия: просмотр, вступление в проект, изменение статуса
- Адаптивный дизайн для всех устройств

**Props:**
```vue
{
  project: Object,      // Объект проекта с полными данными
  userRole: String,     // Роль пользователя
  canChangeStatus: Boolean,  // Может ли менять статус
  canJoin: Boolean      // Может ли вступить
}
```

**Events:**
- `@view` - Просмотр деталей проекта
- `@join` - Вступление в проект
- `@status-change` - Изменение статуса проекта

**Отображаемые данные:**
- `project.title` - Название
- `project.description` - Описание
- `project.status` - Статус (pending/approved/rejected)
- `project.school.name` - Название школы
- `project.schoolClass.name` - Класс (если есть)
- `project.owner.name` - Автор проекта
- `project.members` - Список участников (массив)
- `project.githubUrl` - Ссылка на GitHub (если есть)
- `project.files` - Прикрепленные файлы (массив)

### 2. Обновлен API сервис (src/services/api.js)

#### projectService
**Изменения:**
- Все методы теперь используют прямые пути без config.endpoints
- `getProjects()` - GET `/projects` (фильтрация на бекенде по роли)
- `getProject(id)` - GET `/projects/:id` (с relations: owner, members, files)
- `createProject(data)` - POST `/projects` (schoolId обязателен, schoolClassId опционален)
- `updateProject(id, data)` - PATCH `/projects/:id`
- `updateStatus(id, status)` - PATCH `/projects/:id/status`
- `joinProject(id)` - POST `/projects/:id/join` (только student, max 3)
- `uploadFile(id, file, type)` - POST `/projects/:id/upload`
- `deleteProject(id)` - DELETE `/projects/:id` (только admin)

**Важно:** Бекенд автоматически фильтрует проекты по роли:
- **Admin** - все проекты
- **Student** - только проекты своей школы и класса (или без класса)
- **Teacher** - все проекты своей школы
- **University Staff** - все проекты

#### schoolService
**Изменения:**
- `getAllSchools(search)` - GET `/schools?search=...` (публичный доступ)
- `getSchoolById(id)` - GET `/schools/:id` (возвращает школу с классами)
- `getSchoolClasses(schoolId, search)` - GET `/schools/:schoolId/classes?search=...`
- `getAllClasses(params)` - GET `/schools/classes/all?search=...&schoolId=...`

Все методы schoolService имеют `includeAuth: false` (публичный доступ для регистрации)

### 3. Обновлен Home.vue (src/pages/Home.vue)

**Изменения:**
- Удалены старые карточки проектов
- Интегрирован компонент ProjectCard
- Упрощена логика загрузки (фильтрация теперь на бекенде)
- Убрана ручная фильтрация по роли
- Добавлена логика вступления в проект:
  - Проверка роли (только student)
  - Проверка участия (не участник уже)
  - Проверка лимита (max 3 участника)

**Удалено:**
- `filteredProjects` computed (фильтрация на бекенде)
- `statusSelections` ref (управление в карточке)
- Модальные окна предложения проекта (перенесены в CreateProjectModal)
- Старые методы changeStatus, submitPropose

**Добавлено:**
- `canJoin(project)` - метод проверки возможности вступления
- `handleJoinProject(project)` - обработчик вступления
- `handleStatusChange(project, status)` - обработчик смены статуса

### 4. Обновлен CreateProjectModal.vue

**Изменения:**
- Добавлено поле `githubUrl` (опциональное)
- Изменен combobox классов на динамическую загрузку через `schoolService.getSchoolClasses()`
- Класс теперь выбирается из реальных классов школы (не 1-11)
- Добавлена валидация (кнопка "Создать" неактивна без обязательных полей)
- Payload теперь формируется согласно API: `{ title, description, schoolId, schoolClassId?, githubUrl? }`

**Обязательные поля:**
- title
- description
- schoolId

**Опциональные поля:**
- schoolClassId (выбирается из классов школы)
- githubUrl

## Структура данных проекта (из бекенда)

```typescript
interface Project {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  githubUrl?: string;
  
  school: {
    id: number;
    number: string;
    name: string;
    city?: string;
  };
  schoolId: number;
  
  schoolClass?: {
    id: number;
    name: string;
    schoolId: number;
  };
  schoolClassId?: number;
  
  owner: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  ownerId: number;
  
  members: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  
  files: Array<{
    id: number;
    filename: string;
    path: string;
    type: 'document' | 'presentation';
  }>;
  
  createdAt: string;
  updatedAt: string;
}
```

## Ролевые ограничения

### Student (ученик)
- ✅ Может создавать проекты (статус: pending)
- ✅ Может вступать в проекты (до 3 участников)
- ✅ Видит проекты своей школы и класса
- ❌ Не может менять статусы проектов

### Teacher (учитель)
- ✅ Может создавать проекты (статус: approved автоматически)
- ✅ Может менять статусы проектов своей школы
- ✅ Видит все проекты своей школы
- ❌ Не может вступать в проекты

### University Staff (сотрудник вуза)
- ✅ Может создавать проекты (статус: approved автоматически)
- ✅ Может менять статусы всех проектов
- ✅ Видит все проекты
- ❌ Не может вступать в проекты

### Admin (администратор)
- ✅ Может создавать проекты (статус: approved автоматически)
- ✅ Может менять статусы всех проектов
- ✅ Может удалять проекты
- ✅ Видит все проекты
- ❌ Не может вступать в проекты

## Использование

### Отображение проектов
```vue
<ProjectCard
  v-for="project in projects"
  :key="project.id"
  :project="project"
  :userRole="userRole"
  :canChangeStatus="canChangeStatus"
  :canJoin="canJoin(project)"
  @view="viewProject"
  @join="handleJoinProject"
  @status-change="handleStatusChange"
/>
```

### Создание проекта
```javascript
const payload = {
  title: "Название проекта",
  description: "Описание проекта",
  schoolId: 1,
  schoolClassId: 5,  // опционально
  githubUrl: "https://github.com/user/repo"  // опционально
};

await projectService.createProject(payload);
```

### Вступление в проект
```javascript
await projectService.joinProject(projectId);
// Проект автоматически добавит пользователя в members[]
```

### Изменение статуса
```javascript
await projectService.updateStatus(projectId, 'approved');
// Доступно только для teacher/university_staff/admin
```

## Тестирование

1. **Загрузка проектов**: Проверьте, что отображаются корректные данные из бекенда
2. **Роли**: Войдите под разными ролями и убедитесь в правильной фильтрации
3. **Вступление**: Ученик может вступить в проект (до 3 участников)
4. **Статусы**: Teacher/Staff/Admin могут менять статусы
5. **Создание**: Проверьте создание с школой и классом
6. **Файлы**: Если есть файлы, они отображаются в карточке
7. **GitHub**: Если указан githubUrl, отображается ссылка

## Известные ограничения

1. Детальный просмотр проекта временно использует alert (TODO: создать модальное окно или страницу)
2. Загрузка файлов пока не реализована в UI (только API готов)
3. Удаление проектов (admin) пока не добавлено в UI

## Следующие шаги

1. Создать страницу детального просмотра проекта
2. Добавить UI для загрузки файлов
3. Добавить кнопку удаления проекта для admin
4. Добавить фильтры и поиск по проектам
5. Добавить пагинацию
