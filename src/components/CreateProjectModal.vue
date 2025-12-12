<template>
  <div class="modal" @keydown.esc.prevent="emit('close')">
    <div class="modal-content" role="dialog" aria-modal="true">
      <h3>Добавить проект</h3>

      <BaseInput v-model="form.title" label="Название проекта" required />
      <BaseInput v-model="form.description" label="Описание" required />
      <BaseInput v-model="form.githubUrl" label="GitHub URL (опционально)" type="url" />

      <BaseCombobox
        v-model="form.schoolId"
        label="Школа"
        placeholder="Выберите школу..."
        :fetchOptions="fetchSchools"
        valueKey="id"
        displayKey="name"
        required
      />

      <BaseCombobox
        v-if="form.schoolId"
        v-model="form.schoolClassId"
        label="Класс (опционально)"
        placeholder="Выберите класс..."
        :fetchOptions="() => fetchClasses(form.schoolId)"
        valueKey="id"
        displayKey="name"
      />

      <div class="modal-actions">
        <BaseButton 
          variant="primary" 
          @click="submit"
          :disabled="!isValid"
        >
          Создать
        </BaseButton>
        <BaseButton variant="secondary" @click="emit('close')">Отмена</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { BaseInput, BaseButton, BaseCombobox } from './ui';
import { schoolService } from '../services/api.js';

const emit = defineEmits(['submit','close']);

const form = ref({
  title: '',
  description: '',
  githubUrl: '',
  schoolId: '',
  schoolClassId: ''
});

const isValid = computed(() => {
  return form.value.title.trim() && 
         form.value.description.trim() && 
         form.value.schoolId;
});

const fetchSchools = async () => {
  return await schoolService.getAllSchools();
};

const fetchClasses = async (schoolId) => {
  if (!schoolId) return [];
  return await schoolService.getSchoolClasses(schoolId);
};

const submit = () => {
  if (!isValid.value) return;
  
  const payload = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    schoolId: form.value.schoolId
  };
  
  if (form.value.githubUrl) {
    payload.githubUrl = form.value.githubUrl.trim();
  }
  
  if (form.value.schoolClassId) {
    payload.schoolClassId = form.value.schoolClassId;
  }
  
  emit('submit', payload);
};
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  width: 520px;
  max-width: 90vw;
  background: var(--color-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
</style>
