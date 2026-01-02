<script setup lang="ts">
import { ref, computed } from "vue";
import type { Project } from "../models";
import { projectsService } from "../services/projects";
import { useAuth } from "../composables";
// Removed local invite button; single invite button lives on details page

const props = defineProps<{ project: Project }>();
const emit = defineEmits<{ (e: "updated", p: Project): void }>();

const { user } = useAuth();

const joiningToken = ref("");
const joining = ref(false);
const error = ref("");
const message = ref("");

const isAuthor = computed(() => user.value?.id === props.project.author.id);
const isMember = computed(() => {
  const uid = user.value?.id;
  if (!uid) return false;
  return !!props.project.members?.some((m) => m.id === uid) || isAuthor.value;
});
const memberCount = computed(
  () => (props.project.members?.length || 0) + 1, // +1 для автора
);
async function joinByToken() {
  if (!joiningToken.value.trim()) {
    error.value = "Введите токен приглашения";
    return;
  }

  joining.value = true;
  error.value = "";
  message.value = "";

  try {
    const updated = await projectsService.joinProject(joiningToken.value);
    message.value = "Вы присоединились к проекту!";
    joiningToken.value = "";
    emit("updated", updated);
  } catch (e: any) {
    error.value =
      e?.response?.data?.message || "Не удалось присоединиться к проекту";
  } finally {
    joining.value = false;
  }
}
</script>

<template>
  <section class="project-invite">
    <div class="project-invite__header">
      <h3 class="project-invite__title">Участники проекта</h3>
      <span class="project-invite__count">{{ memberCount }}</span>
    </div>

    <div class="project-invite__members">
      <div class="project-invite__member">
        <span class="project-invite__member-name">{{
          project.author?.firstName ||
          project.author?.email ||
          "Неизвестный автор"
        }}</span>
        <span class="project-invite__member-role">Автор</span>
      </div>
      <div
        v-for="member in project.members || []"
        :key="member.id"
        class="project-invite__member"
      >
        <span class="project-invite__member-name">{{
          member?.firstName || member?.email || "Участник"
        }}</span>
      </div>
    </div>

    <template v-if="!isMember">
      <div class="project-invite__join">
        <p class="project-invite__join-label">
          Если у вас есть приглашение, введите токен:
        </p>
        <div class="project-invite__join-form">
          <input
            v-model="joiningToken"
            type="text"
            placeholder="Введите токен приглашения"
            class="project-invite__join-input"
            :disabled="joining"
          />
          <button
            @click="joinByToken"
            class="project-invite__join-btn"
            :disabled="joining"
          >
            {{ joining ? "Присоединяюсь..." : "Присоединиться" }}
          </button>
        </div>
      </div>
    </template>

    <div v-if="message" class="project-invite__message">{{ message }}</div>
    <div v-if="error" class="project-invite__error">{{ error }}</div>
  </section>
</template>

<style scoped>
.project-invite {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
  background: #fff;
}
.project-invite__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.project-invite__title {
  margin: 0;
  font-size: 16px;
}
.project-invite__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.project-invite__members {
  display: grid;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.project-invite__member {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 14px;
}
.project-invite__member-name {
  font-weight: 500;
}
.project-invite__member-role {
  font-size: 12px;
  color: var(--muted);
}
.project-invite__actions {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.project-invite__form {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface-2);
  border-radius: var(--radius);
}
.project-invite__generate-btn {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: opacity 0.2s;
}
.project-invite__generate-btn:hover {
  opacity: 0.9;
}
.project-invite__token-block {
  display: grid;
  gap: var(--space-2);
}
.project-invite__token-label {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.project-invite__token-copy {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}
.project-invite__token-text {
  flex: 1;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
.project-invite__copy-btn {
  padding: 6px 10px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.project-invite__join {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface-2);
  border-radius: var(--radius);
}
.project-invite__join-label {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.project-invite__join-form {
  display: flex;
  gap: var(--space-2);
}
.project-invite__join-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
}
.project-invite__join-btn {
  padding: 8px 14px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}
.project-invite__join-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.project-invite__message {
  margin-top: var(--space-2);
  padding: 10px 12px;
  background: #ecfdf5;
  border: 1px solid #34d399;
  border-radius: 4px;
  color: #16a34a;
  font-size: 13px;
}
.project-invite__error {
  margin-top: var(--space-2);
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #f87171;
  border-radius: 4px;
  color: #dc2626;
  font-size: 13px;
}
</style>
