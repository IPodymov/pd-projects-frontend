<template>
  <div class="modal" @keydown.esc.prevent="emit('close')">
    <div class="modal-content" role="dialog" aria-modal="true">
      <h3>Добавить проект</h3>

      <BaseInput v-model="form.title" label="Название проекта" required />
      <BaseInput v-model="form.description" label="Описание" required />

      <BaseCombobox
        v-model="form.schoolId"
        label="Номер школы"
        placeholder="Выберите школу..."
        :fetchOptions="fetchSchools"
        valueKey="id"
        displayKey="name"
      />

      <BaseCombobox
        v-model="form.classNumber"
        label="Класс"
        :options="classOptions"
        valueKey="value"
        displayKey="label"
        :searchable="false"
        placeholder="Выберите класс"
      />

      <div class="modal-actions">
        <BaseButton variant="primary" @click="submit">Создать</BaseButton>
        <BaseButton variant="secondary" @click="emit('close')">Отмена</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseInput, BaseButton, BaseCombobox } from './ui';
import { schoolService } from '../services/api.js';

const emit = defineEmits(['submit','close']);

const form = ref({
  title: '',
  description: '',
  schoolId: '',
  classNumber: ''
});

const classOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1)
}));

const fetchSchools = async () => {
  const schools = await schoolService.getAllSchools();
  return schools;
};

const submit = () => {
  if (!form.value.title || !form.value.description) return;
  const payload = { ...form.value };
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
