<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useProjects } from "../composables";
import type { ProjectLink } from "../models";
import { Input as UiInput, Button as UiButton, FormField } from "../ui/components";

const { createProject } = useProjects();
const router = useRouter();

const title = ref("");
const description = ref("");
const links = ref<ProjectLink[]>([{ url: "" }]);
const saving = ref(false);
const error = ref("");

function addLink() {
  links.value.push({ url: "" });
}

function removeLink(idx: number) {
  links.value.splice(idx, 1);
}

async function submit(e: Event) {
  e.preventDefault();
  if (!title.value.trim()) {
    error.value = "Пожалуйста, введите название проекта";
    return;
  }
  if (!description.value.trim()) {
    error.value = "Пожалуйста, введите описание проекта";
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const created = await createProject({
      title: title.value,
      description: description.value,
      links: links.value.filter((l) => l.url.trim()),
    });
    router.push({ name: "project-details", params: { id: created.id } });
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Не удалось предложить проект";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <main class="page container page_proposal">
    <section class="proposal">
      <h1 class="proposal__title">Предложить проект</h1>
      <form class="proposal__form" @submit="submit">
        <FormField label="Название проекта">
          <UiInput
            v-model="title"
            placeholder="Введите название"
            :disabled="saving"
          />
        </FormField>

        <FormField label="Описание">
          <v-textarea
            v-model="description"
            outlined
            rows="6"
            placeholder="Подробное описание проекта"
            :disabled="saving"
          />
        </FormField>

        <div class="proposal__links">
          <label class="proposal__links-label">Полезные ссылки</label>
          <div class="proposal__links-list">
            <div
              v-for="(_, idx) in links"
              :key="idx"
              class="proposal__link-row"
            >
              <UiInput
                v-model="links[idx]!.url"
                placeholder="https://..."
                :disabled="saving"
              />
              <v-btn
                v-if="links.length > 1"
                icon
                size="small"
                variant="text"
                @click="removeLink(idx)"
                :disabled="saving"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-plus"
            @click="addLink"
            :disabled="saving"
          >
            Добавить ссылку
          </v-btn>
        </div>

        <span v-if="error" class="proposal__error">{{ error }}</span>

        <div class="proposal__actions">
          <UiButton type="submit" theme="primary" :disabled="saving">
            Предложить проект
          </UiButton>
          <UiButton type="button" @click="router.back()">Отмена</UiButton>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-6);
}
.proposal__title {
  margin: 0 0 var(--space-4);
  font-size: 28px;
}
.proposal__form {
  width: 100%;
  max-width: 720px;
  display: grid;
  gap: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-6);
  background: #fff;
}
.proposal__links {
  display: grid;
  gap: var(--space-2);
}
.proposal__links-label {
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
}
.proposal__links-list {
  display: grid;
  gap: var(--space-2);
}
.proposal__link-row {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
}
.proposal__link-row > :first-child {
  flex: 1;
}
.proposal__error {
  color: var(--color-danger);
  font-size: 13px;
}
.proposal__actions {
  display: flex;
  gap: var(--space-3);
}

@media (min-width: 768px) {
  .proposal__form {
    max-width: 720px;
  }
}
</style>
