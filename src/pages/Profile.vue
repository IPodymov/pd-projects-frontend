<template>
  <div class="profile-container">
    <h1>Профиль</h1>

    <!-- Загрузка -->
    <div v-if="isLoading" class="loading">
      <p>Загрузка профиля...</p>
    </div>

    <!-- Сообщение об успешном обновлении -->
    <div v-if="successMessage" class="success-message">
      <h3>✓ Профиль успешно обновлен!</h3>
      <div class="user-info-display">
        <div class="info-row">
          <span class="info-label">ID:</span>
          <span class="info-value">{{ updatedUserInfo?.id }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Имя:</span>
          <span class="info-value">{{ updatedUserInfo?.name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ updatedUserInfo?.email }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Роль:</span>
          <span class="info-value">{{ getRoleLabel(updatedUserInfo?.role) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Школа:</span>
          <span class="info-value">{{ updatedUserInfo?.school?.name || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Класс:</span>
          <span class="info-value">{{ updatedUserInfo?.schoolClass?.name || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">GitHub:</span>
          <span class="info-value">{{ updatedUserInfo?.githubUsername || '—' }}</span>
        </div>
      </div>
      <button class="close-message-btn" @click="successMessage = false">Закрыть</button>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button class="close-message-btn" @click="errorMessage = ''">Закрыть</button>
    </div>

    <!-- Режим просмотра -->
    <div v-if="!isEditing && !isLoading" class="profile-card view-mode" v-show="user">
      <div class="info-row">
        <span class="info-label">Имя:</span>
        <span class="info-value">{{ user?.name }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">{{ user?.email }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Роль:</span>
        <span class="info-value">{{ roleLabel }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Школа:</span>
        <span class="info-value">{{ user?.school?.name || '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Класс:</span>
        <span class="info-value">{{ user?.schoolClass?.name || '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">GitHub:</span>
        <span class="info-value">{{ user?.githubUsername || '—' }}</span>
      </div>
    </div>

    <!-- Режим редактирования -->
    <div v-if="isEditing && !isLoading" class="profile-card edit-mode" v-show="user">
      <BaseInput v-model="form.name" label="Имя" required />
      <BaseInput v-model="form.email" type="email" label="Email" required />

      <div class="row">
        <span class="label">Роль:</span><span>{{ roleLabel }}</span>
      </div>

      <!-- Школа для admin/university_staff - может быть пуста -->
      <BaseCombobox
        v-if="user?.role === 'admin' || user?.role === 'university_staff'"
        v-model="form.schoolId"
        label="Школа"
        placeholder="Выберите школу"
        :fetchOptions="fetchSchoolsWithNull"
        valueKey="id"
        displayKey="name"
      />
      
      <!-- Школа для teacher - обязательна -->
      <BaseCombobox
        v-else-if="user?.role === 'teacher'"
        v-model="form.schoolId"
        label="Школа"
        placeholder="Выберите школу"
        :fetchOptions="fetchSchools"
        valueKey="id"
        displayKey="name"
      />
      
      <!-- Для student - школа отображается в режиме просмотра -->
      <div v-else-if="user?.role === 'student'" class="row">
        <span class="label">Школа:</span>
        <span>{{ user?.school?.name || '—' }}</span>
      </div>

      <BaseCombobox
        v-if="shouldShowClassField"
        v-model="form.schoolClassId"
        label="Класс"
        :options="classOptions"
        valueKey="value"
        displayKey="label"
        :searchable="false"
        placeholder="Выберите класс"
      />
    </div>

    <div class="actions">
      <BaseButton 
        v-if="!isEditing" 
        variant="primary" 
        @click="startEditing"
        :disabled="isLoading"
      >
        Редактировать профиль
      </BaseButton>
      <template v-else>
        <BaseButton variant="secondary" @click="cancelEditing">Отмена</BaseButton>
        <BaseButton variant="primary" @click="save" :disabled="saving">Сохранить</BaseButton>
      </template>
      <BaseButton variant="danger" @click="handleLogout">Выйти</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/store.js';
import { BaseButton, BaseInput, BaseCombobox } from '../components/ui';
import { userService, schoolService } from '../services/api.js';

const router = useRouter();
const { user, logout, setUser } = useAuth();

const form = ref({ name: '', email: '', schoolId: '', schoolClassId: '' });
const saving = ref(false);
const successMessage = ref(false);
const errorMessage = ref('');
const updatedUserInfo = ref(null);
const isEditing = ref(false);
const isLoading = ref(true);

const roleLabel = computed(() => {
  const role = user.role;
  switch (role) {
    case 'student': return 'Ученик';
    case 'teacher': return 'Учитель';
    case 'admin': return 'Администратор';
    case 'university_staff': return 'Сотрудник вуза';
    default: return 'Гость';
  }
});

const getRoleLabel = (role) => {
  switch (role) {
    case 'student': return 'Ученик';
    case 'teacher': return 'Учитель';
    case 'admin': return 'Администратор';
    case 'university_staff': return 'Сотрудник вуза';
    default: return role || 'Гость';
  }
};

const isSchoolLocked = computed(() => {
  const role = user?.role;
  return role === 'student' || role === 'teacher';
});

const canHaveNullSchool = computed(() => {
  const role = user?.role;
  return role === 'admin' || role === 'university_staff';
});

const shouldShowClassField = computed(() => {
  // Показывать класс для student или teacher, если есть школа и это не null
  const hasSchool = form.value.schoolId !== null && form.value.schoolId !== '';
  const isStudentOrTeacher = user?.role === 'student' || user?.role === 'teacher';
  return hasSchool && isStudentOrTeacher;
});

const classOptions = ref([]);

// Загружаем классы при изменении школы
const loadClassesForSchool = async (schoolId) => {
  if (!schoolId) {
    classOptions.value = [];
    return;
  }
  
  try {
    // Получаем все школы и находим нужную
    const schools = await schoolService.getAllSchools();
    const school = schools.find(s => s.id === schoolId);
    
    if (school && school.schoolClasses && Array.isArray(school.schoolClasses)) {
      classOptions.value = school.schoolClasses.map(cls => ({
        value: cls.id,
        label: cls.name
      }));
    }
  } catch (error) {
    console.error('Error loading classes:', error);
    classOptions.value = [];
  }
};

// Следим за изменением schoolId и загружаем классы
watch(
  () => form.value.schoolId,
  (newSchoolId) => {
    if (newSchoolId) {
      loadClassesForSchool(newSchoolId);
    } else {
      classOptions.value = [];
    }
  }
);

const fetchSchools = async () => {
  const schools = await schoolService.getAllSchools();
  return schools;
};

const fetchSchoolsWithNull = async () => {
  const schools = await schoolService.getAllSchools();
  // Добавляем опцию "Без школы" для admin и university_staff
  return [
    { id: null, name: '— Без школы —' },
    ...schools
  ];
};

const startEditing = async () => {
  // Убедимся что данные загружены
  if (!user || !user.id) {
    await loadUserProfile();
  }
  
  isEditing.value = true;
  // Копируем данные пользователя в форму
  if (user) {
    form.value.name = user.name || '';
    form.value.email = user.email || '';
    form.value.schoolId = user.schoolId || user.school?.id || null;
    form.value.schoolClassId = user.schoolClassId || user.schoolClass?.id || null;
    
    // Загружаем классы для выбранной школы
    if (form.value.schoolId) {
      loadClassesForSchool(form.value.schoolId);
    }
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  errorMessage.value = '';
  // Сбрасываем форму
  form.value = { name: '', email: '', schoolId: '', schoolClassId: '' };
};

const save = async () => {
  saving.value = true;
  successMessage.value = false;
  errorMessage.value = '';
  
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
    };
    
    // Обработка полей по ролям
    const role = user?.role;
    
    // Admin и university_staff могут менять всё
    if (role === 'admin' || role === 'university_staff') {
      payload.schoolId = form.value.schoolId || null;
      if (form.value.schoolClassId) {
        payload.schoolClassId = form.value.schoolClassId;
      }
    } 
    // Teacher может менять школу и класс
    else if (role === 'teacher') {
      if (form.value.schoolId) {
        payload.schoolId = form.value.schoolId;
      }
      if (form.value.schoolClassId) {
        payload.schoolClassId = form.value.schoolClassId;
      }
    }
    // Student не может менять школу и класс - они read-only

    
    // Обновляем профиль и получаем обновленные данные
    const updatedUser = await userService.updateProfile(user.id, payload);
    
    // Обновляем пользователя в store
    setUser(updatedUser);
    
    // Сохраняем информацию для отображения
    updatedUserInfo.value = updatedUser;
    
    // Выходим из режима редактирования
    isEditing.value = false;
    
    // Показываем сообщение об успехе
    successMessage.value = true;
    
    // Прокручиваем к началу страницы, чтобы увидеть сообщение
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (e) {
    console.error('Profile update failed', e);
    errorMessage.value = e.message || 'Ошибка обновления профиля';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    saving.value = false;
  }
};

const handleLogout = () => {
  logout();
  router.push('/login');
};

// Загружаем актуальные данные пользователя при монтировании
const loadUserProfile = async () => {
  isLoading.value = true;
  try {
    // Получаем свежие данные профиля с бекенда
    // getProfile() получает текущего пользователя из токена в Authorization header
    const updatedUser = await userService.getProfile();
    
    if (updatedUser && updatedUser.id) {
      // Обновляем пользователя в store
      setUser(updatedUser);
      console.log('User profile loaded:', updatedUser);
    } else {
      console.warn('Profile data is empty:', updatedUser);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    // Не показываем ошибку, если данные уже в локальном хранилище
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadUserProfile();
});
</script>

<style scoped>
.profile-container {
  max-width: 720px;
  margin: 24px auto;
  padding: 0 16px;
}

.loading {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-secondary);
  font-size: 16px;
}

.success-message {
  background: #d4edda;
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  animation: slideDown 0.3s ease-out;
}

.success-message h3 {
  color: #155724;
  margin: 0 0 16px 0;
  font-size: 20px;
}

.error-message {
  background: #f8d7da;
  border: 2px solid #dc3545;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  animation: slideDown 0.3s ease-out;
}

.error-message p {
  color: #721c24;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.user-info-display {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #495057;
  width: 140px;
  flex-shrink: 0;
}

.info-value {
  color: #212529;
  word-break: break-word;
}

.close-message-btn {
  background: transparent;
  border: 2px solid currentColor;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.success-message .close-message-btn {
  color: #155724;
}

.success-message .close-message-btn:hover {
  background: #155724;
  color: white;
}

.error-message .close-message-btn {
  color: #721c24;
}

.error-message .close-message-btn:hover {
  background: #721c24;
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  background: var(--color-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.view-mode .info-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.view-mode .info-row:last-child {
  border-bottom: none;
}

.view-mode .info-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  width: 140px;
  flex-shrink: 0;
}

.view-mode .info-value {
  color: var(--color-text);
  word-break: break-word;
}

.row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.label {
  width: 140px;
  color: #777;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
