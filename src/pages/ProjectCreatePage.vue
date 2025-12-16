<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { projectsService } from '../services/projects';
import { useAuthStore } from '../stores/auth';
import UiInput from '../ui/Input.vue';
import UiButton from '../ui/Button.vue';
import FormField from '../ui/FormField.vue';

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  title: '',
  description: '',
  links: [{ url: '', description: '' }],
});
const error = reactive({ message: '' });
const loading = reactive({ submit: false });

const canAccess = computed(() => auth.isAdmin || auth.isStaff);

function addLink() {
  form.links.push({ url: '', description: '' });
}
function removeLink(idx: number) {
  if (form.links.length === 1) return;
  form.links.splice(idx, 1);
}

async function submit(e: Event) {
  e.preventDefault();
  if (!canAccess.value) return;
  loading.submit = true; error.message = '';
  try {
    const created = await projectsService.create({
      title: form.title,
      description: form.description,
      links: form.links.filter(l => l.url.trim()),
    });
    router.push({ name: 'project-details', params: { id: created.id } });
  } catch (e: any) {
    error.message = e?.response?.data?.message || 'Не удалось создать проект';
  } finally {
    loading.submit = false;
  }
}
</script>

<template>
  <main class="page container page_project-create">
    <section v-if="!canAccess" class="notice">Доступно только для администраторов и сотрудников вуза.</section>
    <section v-else class="form-wrap">
      <h1 class="form-wrap__title">Новый проект</h1>
      <form class="project-form" @submit="submit">
        <FormField label="Название">
          <UiInput v-model="form.title" placeholder="Название проекта" />
        </FormField>
        <FormField label="Описание">
          <textarea v-model="form.description" class="project-form__textarea" rows="5" placeholder="Кратко опишите проект" />
        </FormField>
        <div class="project-form__links">
          <div class="project-form__links-header">
            <h3>Ссылки</h3>
            <UiButton type="button" theme="secondary" @click="addLink">Добавить ссылку</UiButton>
          </div>
          <div class="project-form__link" v-for="(link, idx) in form.links" :key="idx">
            <FormField label="URL">
              <UiInput v-model="link.url" placeholder="https://..." />
            </FormField>
            <FormField label="Описание">
              <UiInput v-model="link.description" placeholder="Frontend / Backend" />
            </FormField>
            <UiButton type="button" theme="secondary" @click="removeLink(idx)" :disabled="form.links.length === 1">Удалить</UiButton>
          </div>
        </div>
        <span v-if="error.message" class="project-form__error">{{ error.message }}</span>
        <UiButton type="submit" theme="primary" :disabled="loading.submit">Создать</UiButton>
      </form>
    </section>
  </main>
</template>

<style scoped>
.page { padding-top: var(--space-6); padding-bottom: var(--space-6); }
.notice { border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-4); background: #fff; }
.form-wrap { border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-4); background: #fff; display: grid; gap: var(--space-3); }
.form-wrap__title { margin: 0; }
.project-form { display: grid; gap: var(--space-3); }
.project-form__textarea { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-3); font: inherit; resize: vertical; }
.project-form__links { display: grid; gap: var(--space-3); }
.project-form__links-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.project-form__link { display: grid; gap: var(--space-2); border: 1px dashed var(--border); border-radius: var(--radius); padding: var(--space-3); background: #f9fafb; }
.project-form__error { color: #dc2626; font-size: 12px; }
</style>
