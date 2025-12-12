<template>
  <div class="profile-container">
    <h1>Профиль</h1>

    <div class="profile-card" v-if="user">
      <BaseInput v-model="form.name" label="Имя" required />
      <BaseInput v-model="form.email" type="email" label="Email" required />

      <div class="row">
        <span class="label">Роль:</span><span>{{ roleLabel }}</span>
      </div>

      <BaseCombobox
        v-model="form.schoolId"
        label="Школа"
        placeholder="Выберите школу"
        :fetchOptions="fetchSchools"
        valueKey="id"
        displayKey="name"
        :disabled="isSchoolLocked"
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
    </div>

    <div class="actions">
      <BaseButton variant="primary" @click="save" :disabled="saving">Сохранить</BaseButton>
      <BaseButton variant="danger" @click="handleLogout">Выйти</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/store.js';
import { BaseButton, BaseInput, BaseCombobox } from '../components/ui';
import { userService, schoolService } from '../services/api.js';

const router = useRouter();
const { user, logout } = useAuth();

const form = ref({ name: '', email: '', schoolId: '', classNumber: '' });
const saving = ref(false);

const roleLabel = computed(() => {
  const role = user.value?.role;
  switch (role) {
    case 'student': return 'Ученик';
    case 'teacher': return 'Учитель';
    case 'admin': return 'Администратор';
    case 'university_staff': return 'Сотрудник вуза';
    default: return 'Гость';
  }
});

const isSchoolLocked = computed(() => {
  const role = user.value?.role;
  return role === 'student' || role === 'teacher';
});

const classOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1)
}));

const fetchSchools = async () => {
  const schools = await schoolService.getAllSchools();
  return schools;
};

onMounted(() => {
  if (user.value) {
    form.value.name = user.value.name || '';
    form.value.email = user.value.email || '';
    form.value.schoolId = user.value.schoolId || user.value.school?.id || '';
    form.value.classNumber = user.value.classNumber || '';
  }
});

const save = async () => {
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      classNumber: form.value.classNumber,
    };
    if (!isSchoolLocked.value) {
      payload.schoolId = form.value.schoolId;
    }
    await userService.updateProfile(user.value.id, payload);
    router.push('/');
  } catch (e) {
    console.error('Profile update failed', e);
  } finally {
    saving.value = false;
  }
};

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<style scoped>
.profile-container {
  max-width: 720px;
  margin: 24px auto;
  padding: 0 16px;
}
.profile-card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--color-background);
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
}
</style>
