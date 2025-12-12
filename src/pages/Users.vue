<template>
  <div class="users-container">
    <div class="users-header">
      <h1>Управление пользователями</h1>
      <div class="header-actions">
        <BaseButton
          v-if="canCreateUsers"
          variant="secondary"
          @click="showInviteModal = true"
        >
          🔗 Создать приглашение
        </BaseButton>
        <BaseButton
          v-if="canCreateUsers"
          variant="primary"
          @click="showCreateModal = true"
        >
          + Добавить пользователя
        </BaseButton>
      </div>
    </div>

    <div class="filters">
      <BaseInput
        v-model="searchEmail"
        type="text"
        placeholder="Поиск по email..."
        @input="handleSearch"
      />
      <div class="info-notice">
        <strong>Примечание:</strong> По соображениям безопасности, backend не возвращает хэши паролей через API. 
        Для просмотра паролей необходим прямой доступ к БД через pgAdmin или psql.
      </div>
    </div>

    <ErrorMessage :message="error" @close="clearError" />

    <div v-if="isLoading" class="loading">
      <p>Загрузка пользователей...</p>
    </div>

    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      <p>Пользователи не найдены</p>
    </div>

    <div v-else class="users-table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Школа</th>
            <th>Класс</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', `role-${user.role}`]">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>{{ user.school?.name || '—' }}</td>
            <td>{{ user.schoolClass?.name || '—' }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="user.role !== 'admin'"
                  class="btn-change-role"
                  @click="openRoleModal(user)"
                  title="Изменить роль"
                >
                  🔄
                </button>
                <button
                  v-if="user.id !== currentUser?.id"
                  class="btn-delete"
                  @click="confirmDelete(user)"
                  title="Удалить пользователя"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно для создания пользователя -->
    <CreateUserModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleUserCreated"
    />

    <!-- Модальное окно для создания приглашения -->
    <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Создать приглашение для учителя</h2>
          <button class="close-modal-btn" @click="showInviteModal = false">✕</button>
        </div>

        <p class="info-text">
          Выберите школу, для которой создается приглашение учителя. 
          Ссылка будет действительна 7 дней.
        </p>

        <BaseCombobox
          v-model="inviteSchoolId"
          label="Школа"
          placeholder="Выберите школу..."
          :fetchOptions="fetchSchools"
          valueKey="id"
          displayKey="name"
          required
          :disabled="isCreatingInvite"
        />

        <div v-if="generatedInviteLink" class="invite-link-container">
          <h3>✓ Приглашение создано!</h3>
          <div class="invite-link-box">
            <input 
              ref="inviteLinkInput"
              type="text" 
              :value="generatedInviteLink" 
              readonly 
              class="invite-link-input"
            />
            <button @click="copyInviteLink" class="copy-btn">
              {{ linkCopied ? '✓ Скопировано' : '📋 Копировать' }}
            </button>
          </div>
          <p class="expires-text">Ссылка действительна до: {{ inviteExpiresAt }}</p>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeInviteModal">
            Закрыть
          </BaseButton>
          <BaseButton 
            v-if="!generatedInviteLink"
            variant="primary" 
            @click="handleCreateInvite" 
            :loading="isCreatingInvite"
            :disabled="!inviteSchoolId"
          >
            Создать приглашение
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Модальное окно для изменения роли -->
    <div v-if="showRoleModal" class="modal-overlay" @click.self="showRoleModal = false">
      <div class="modal-content">
        <h2>Изменить роль пользователя</h2>
        <p class="user-info">{{ selectedUser?.name }} ({{ selectedUser?.email }})</p>

        <div class="form-group">
          <label>Новая роль:</label>
          <select v-model="newRole" class="role-select">
            <option value="student">Школьник</option>
            <option value="teacher">Учитель</option>
            <option value="university_staff">Сотрудник ВУЗа</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="showRoleModal = false">
            Отмена
          </BaseButton>
          <BaseButton variant="primary" @click="handleRoleChange" :loading="isChangingRole">
            Изменить роль
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content">
        <h2>Подтверждение удаления</h2>
        <p class="user-info">
          Вы уверены, что хотите удалить пользователя<br />
          <strong>{{ userToDelete?.name }}</strong> ({{ userToDelete?.email }})?
        </p>
        <p class="warning-text">Это действие нельзя отменить!</p>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="showDeleteModal = false">
            Отмена
          </BaseButton>
          <BaseButton variant="danger" @click="handleDelete" :loading="isDeleting">
            Удалить
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../store/store.js';
import { userService, authService, schoolService } from '../services/api.js';
import { BaseButton, BaseInput, ErrorMessage, BaseCombobox } from '../components/ui';
import CreateUserModal from '../components/CreateUserModal.vue';

const { user: currentUser } = useAuth();

const users = ref([]);
const isLoading = ref(false);
const error = ref('');
const searchEmail = ref('');

const showCreateModal = ref(false);
const showRoleModal = ref(false);
const showDeleteModal = ref(false);
const showInviteModal = ref(false);
const selectedUser = ref(null);
const userToDelete = ref(null);
const newRole = ref('');
const isChangingRole = ref(false);
const isDeleting = ref(false);

// Для создания приглашения
const inviteSchoolId = ref('');
const isCreatingInvite = ref(false);
const generatedInviteLink = ref('');
const inviteExpiresAt = ref('');
const linkCopied = ref(false);
const inviteLinkInput = ref(null);

// Может ли пользователь создавать других пользователей
const canCreateUsers = computed(() => {
  return currentUser.value?.role === 'admin';
});

// Фильтрация пользователей по email
const filteredUsers = computed(() => {
  if (!searchEmail.value.trim()) {
    return users.value;
  }
  const search = searchEmail.value.toLowerCase();
  return users.value.filter(user => 
    user.email.toLowerCase().includes(search) ||
    user.name.toLowerCase().includes(search)
  );
});

const clearError = () => {
  error.value = '';
};

const getRoleLabel = (role) => {
  const labels = {
    student: 'Школьник',
    teacher: 'Учитель',
    university_staff: 'Сотрудник ВУЗа',
    admin: 'Администратор',
  };
  return labels[role] || role;
};

const loadUsers = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await userService.getAllUsers();
    users.value = response;
  } catch (err) {
    error.value = err.message || 'Ошибка загрузки пользователей';
    console.error('Error loading users:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  // Фильтрация происходит через computed
};

const handleUserCreated = () => {
  showCreateModal.value = false;
  loadUsers();
};

const openRoleModal = (user) => {
  selectedUser.value = user;
  newRole.value = user.role;
  showRoleModal.value = true;
};

const handleRoleChange = async () => {
  if (!selectedUser.value || newRole.value === selectedUser.value.role) {
    showRoleModal.value = false;
    return;
  }

  isChangingRole.value = true;
  error.value = '';

  try {
    await userService.updateUserRole(selectedUser.value.id, newRole.value);
    showRoleModal.value = false;
    loadUsers();
  } catch (err) {
    error.value = err.message || 'Ошибка изменения роли';
    console.error('Error changing role:', err);
  } finally {
    isChangingRole.value = false;
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!userToDelete.value) return;

  isDeleting.value = true;
  error.value = '';

  try {
    await userService.deleteUser(userToDelete.value.id);
    showDeleteModal.value = false;
    userToDelete.value = null;
    loadUsers();
  } catch (err) {
    error.value = err.message || 'Ошибка удаления пользователя';
    console.error('Error deleting user:', err);
  } finally {
    isDeleting.value = false;
  }
};

// Методы для работы с приглашениями
const fetchSchools = async () => {
  try {
    const schools = await schoolService.getAllSchools();
    return schools;
  } catch (error) {
    console.error('Ошибка загрузки школ:', error);
    throw error;
  }
};

const handleCreateInvite = async () => {
  if (!inviteSchoolId.value) return;

  isCreatingInvite.value = true;
  error.value = '';
  linkCopied.value = false;

  try {
    // Находим выбранную школу
    const schools = await schoolService.getAllSchools();
    const selectedSchool = schools.find(s => s.id === inviteSchoolId.value);
    
    if (!selectedSchool) {
      throw new Error('Школа не найдена');
    }

    // Создаем приглашение
    const response = await authService.createInvitation(selectedSchool.number);
    
    generatedInviteLink.value = response.invitationLink;
    
    // Форматируем дату истечения
    if (response.invitation?.expiresAt) {
      const expiresDate = new Date(response.invitation.expiresAt);
      inviteExpiresAt.value = expiresDate.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (err) {
    error.value = err.message || 'Ошибка создания приглашения';
    console.error('Error creating invitation:', err);
  } finally {
    isCreatingInvite.value = false;
  }
};

const copyInviteLink = async () => {
  if (!generatedInviteLink.value) return;

  try {
    await navigator.clipboard.writeText(generatedInviteLink.value);
    linkCopied.value = true;
    
    // Сбрасываем статус через 3 секунды
    setTimeout(() => {
      linkCopied.value = false;
    }, 3000);
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    // Fallback для старых браузеров
    if (inviteLinkInput.value) {
      inviteLinkInput.value.select();
      document.execCommand('copy');
      linkCopied.value = true;
      setTimeout(() => {
        linkCopied.value = false;
      }, 3000);
    }
  }
};

const closeInviteModal = () => {
  showInviteModal.value = false;
  inviteSchoolId.value = '';
  generatedInviteLink.value = '';
  inviteExpiresAt.value = '';
  linkCopied.value = false;
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.users-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.filters {
  margin-bottom: 24px;
  max-width: 400px;
}

.info-notice {
  margin-top: 12px;
  padding: 12px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  font-size: 13px;
  color: #856404;
  max-width: 100%;
}

.info-notice strong {
  font-weight: 600;
}

.loading,
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-secondary);
}

.users-table-wrapper {
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: var(--color-light-gray);
}

.users-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
  border-bottom: 2px solid var(--color-border);
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 14px;
}

.users-table tbody tr:hover {
  background: var(--color-light-gray);
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-student {
  background: #e3f2fd;
  color: #1976d2;
}

.role-teacher {
  background: #f3e5f5;
  color: #7b1fa2;
}

.role-university_staff {
  background: #fff3e0;
  color: #f57c00;
}

.role-admin {
  background: #ffebee;
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-buttons button:hover {
  background: var(--color-light-gray);
}

.btn-delete:hover {
  background: #ffebee;
}

.btn-change-role:hover {
  background: #e3f2fd;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--color-background);
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin: 0 0 20px 0;
  color: var(--color-text);
  font-size: 24px;
}

.user-info {
  color: var(--color-text-secondary);
  margin: 12px 0 24px 0;
}

.warning-text {
  color: var(--color-error);
  font-weight: 500;
  margin: 12px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
}

.role-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.3s;
}

.role-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 187, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .users-container {
    padding: 16px;
  }

  .users-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .users-table {
    font-size: 12px;
  }

  .users-table th,
  .users-table td {
    padding: 12px 8px;
  }

  .modal-content {
    padding: 24px;
  }
}

/* Стили для модального окна приглашения */
.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.invite-link-container {
  background: #e7f5e7;
  border: 1px solid #4caf50;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.invite-link-box {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.invite-link-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #4caf50;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  background: white;
  color: #333;
}

.invite-link-input:focus {
  outline: none;
  border-color: #388e3c;
}

.copy-btn {
  padding: 10px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #388e3c;
}

.copy-btn:active {
  transform: scale(0.98);
}

.expires-text {
  margin: 0;
  color: #555;
  font-size: 14px;
  font-style: italic;
}

.info-text {
  margin: 16px 0 0 0;
  padding: 12px;
  background: #e8f4fd;
  border-left: 3px solid #2196f3;
  border-radius: 4px;
  color: #1565c0;
  font-size: 14px;
  line-height: 1.5;
}
</style>
