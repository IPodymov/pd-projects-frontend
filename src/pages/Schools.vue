<template>
  <div class="schools-container">
    <div class="schools-header">
      <h1>Управление школами</h1>
      <BaseButton variant="primary" @click="showCreateModal = true">
        + Добавить школу
      </BaseButton>
    </div>

    <div class="filters">
      <BaseInput
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по названию, номеру или городу..."
        @input="handleSearch"
      />
    </div>

    <ErrorMessage :message="error" @close="clearError" />

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
      <button class="close-btn" @click="successMessage = ''">✕</button>
    </div>

    <div v-if="isLoading" class="loading">
      <p>Загрузка школ...</p>
    </div>

    <div v-else-if="schools.length === 0" class="empty-state">
      <p>Школы не найдены</p>
    </div>

    <div v-else class="schools-grid">
      <div v-for="school in schools" :key="school.id" class="school-card">
        <div class="school-header">
          <h3>{{ school.name }}</h3>
          <button
            class="delete-btn"
            @click="confirmDelete(school)"
            title="Удалить школу"
          >
            🗑️
          </button>
        </div>
        <div class="school-info">
          <div class="info-row">
            <span class="label">Номер:</span>
            <span class="value">{{ school.number }}</span>
          </div>
          <div class="info-row">
            <span class="label">Город:</span>
            <span class="value">{{ school.city || "—" }}</span>
          </div>
          <div class="info-row">
            <span class="label">Классов:</span>
            <span class="value">{{ school.classes?.length || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания школы -->
    <div
      v-if="showCreateModal"
      class="modal-overlay"
      @click.self="showCreateModal = false"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h2>Добавить новую школу</h2>
          <button class="close-modal-btn" @click="showCreateModal = false">
            ✕
          </button>
        </div>

        <form @submit.prevent="handleCreateSchool">
          <BaseInput
            v-model="newSchool.number"
            type="text"
            label="Номер школы:"
            placeholder="001"
            required
            :disabled="isCreating"
          />

          <BaseInput
            v-model="newSchool.name"
            type="text"
            label="Название:"
            placeholder="Гимназия №1"
            required
            :disabled="isCreating"
          />

          <BaseInput
            v-model="newSchool.city"
            type="text"
            label="Город:"
            placeholder="Москва"
            :disabled="isCreating"
          />

          <div class="modal-actions">
            <BaseButton
              type="button"
              variant="secondary"
              @click="showCreateModal = false"
              :disabled="isCreating"
            >
              Отмена
            </BaseButton>
            <BaseButton type="submit" variant="primary" :loading="isCreating">
              Создать школу
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="modal-content">
        <h2>Подтверждение удаления</h2>
        <p class="warning-text">
          Вы уверены, что хотите удалить школу<br />
          <strong>{{ schoolToDelete?.name }}</strong> ({{
            schoolToDelete?.number
          }})?
        </p>
        <p class="danger-text">
          ⚠️ Это действие удалит все связанные классы и нельзя будет отменить!
        </p>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="showDeleteModal = false">
            Отмена
          </BaseButton>
          <BaseButton
            variant="danger"
            @click="handleDelete"
            :loading="isDeleting"
          >
            Удалить
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { schoolService } from "../services/api.js";
import { BaseButton, BaseInput, ErrorMessage } from "../components/ui";

const schools = ref([]);
const isLoading = ref(false);
const error = ref("");
const successMessage = ref("");
const searchQuery = ref("");

const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const schoolToDelete = ref(null);
const isDeleting = ref(false);
const isCreating = ref(false);

const newSchool = ref({
  number: "",
  name: "",
  city: "",
});

const clearError = () => {
  error.value = "";
};

const loadSchools = async () => {
  isLoading.value = true;
  error.value = "";
  try {
    const response = await schoolService.getAllSchools(searchQuery.value);
    schools.value = response;
  } catch (err) {
    error.value = err.message || "Ошибка загрузки школ";
    console.error("Error loading schools:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  loadSchools();
};

const handleCreateSchool = async () => {
  isCreating.value = true;
  error.value = "";

  try {
    await schoolService.createSchool({
      number: newSchool.value.number,
      name: newSchool.value.name,
      city: newSchool.value.city || undefined,
    });

    successMessage.value = `Школа "${newSchool.value.name}" успешно создана!`;
    showCreateModal.value = false;
    newSchool.value = { number: "", name: "", city: "" };
    loadSchools();

    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (err) {
    error.value = err.message || "Ошибка создания школы";
    console.error("Error creating school:", err);
  } finally {
    isCreating.value = false;
  }
};

const confirmDelete = (school) => {
  schoolToDelete.value = school;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!schoolToDelete.value) return;

  isDeleting.value = true;
  error.value = "";

  try {
    await schoolService.deleteSchool(schoolToDelete.value.id);
    successMessage.value = `Школа "${schoolToDelete.value.name}" успешно удалена!`;
    showDeleteModal.value = false;
    schoolToDelete.value = null;
    loadSchools();

    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (err) {
    error.value = err.message || "Ошибка удаления школы";
    console.error("Error deleting school:", err);
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => {
  loadSchools();
});
</script>

<style scoped>
.schools-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.schools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.schools-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.filters {
  margin-bottom: 24px;
  max-width: 500px;
}

.success-message {
  background: #d4edda;
  border: 2px solid #28a745;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #155724;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideDown 0.3s ease-out;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #155724;
  padding: 0 8px;
}

.loading,
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-secondary);
}

.schools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.school-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.school-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.school-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.school-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #ffebee;
}

.school-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-row .label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.info-row .value {
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  color: var(--color-text);
  font-size: 24px;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.close-modal-btn:hover {
  color: var(--color-text);
}

.warning-text {
  color: var(--color-text-secondary);
  margin: 12px 0 24px 0;
  text-align: center;
}

.danger-text {
  color: var(--color-error);
  font-weight: 500;
  margin: 12px 0;
  text-align: center;
  background: #ffebee;
  padding: 12px;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
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

@media (max-width: 768px) {
  .schools-container {
    padding: 16px;
  }

  .schools-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .schools-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 24px;
  }
}
</style>
