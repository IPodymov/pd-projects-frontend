<template>
  <div class="project-card">
    <div class="card-header">
      <h3 class="card-title">{{ project.title }}</h3>
      <span class="status-badge" :class="`status-${project.status}`">
        {{ statusLabel(project.status) }}
      </span>
    </div>

    <p class="card-description">{{ project.description }}</p>

    <div class="card-meta">
      <div class="meta-item">
        <span class="meta-label">Школа:</span>
        <span class="meta-value">{{ schoolName }}</span>
      </div>
      <div v-if="project.schoolClass" class="meta-item">
        <span class="meta-label">Класс:</span>
        <span class="meta-value">{{ project.schoolClass.name }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Автор:</span>
        <span class="meta-value">{{ project.owner?.name || "—" }}</span>
      </div>
      <div
        v-if="project.members && project.members.length > 0"
        class="meta-item"
      >
        <span class="meta-label">Участники:</span>
        <span class="meta-value">{{ project.members.length }} чел.</span>
      </div>
    </div>

    <div v-if="project.githubUrl" class="github-link">
      <a :href="project.githubUrl" target="_blank" rel="noopener noreferrer">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
        GitHub
      </a>
    </div>

    <div class="card-footer">
      <div class="card-actions">
        <BaseButton variant="secondary" @click="$emit('view', project)">
          Подробнее
        </BaseButton>

        <BaseButton
          v-if="canJoin"
          variant="primary"
          @click="$emit('join', project)"
        >
          Вступить
        </BaseButton>
      </div>

      <BaseCombobox
        v-if="canChangeStatus"
        :modelValue="project.status"
        :options="statusOptions"
        valueKey="value"
        displayKey="label"
        :searchable="false"
        placeholder="Статус"
        @update:modelValue="(value) => $emit('status-change', project, value)"
        class="status-select"
      />
    </div>

    <div v-if="project.files && project.files.length > 0" class="card-files">
      <div class="files-header">Файлы:</div>
      <div class="files-list">
        <div v-for="file in project.files" :key="file.id" class="file-item">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ file.filename }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { BaseButton, BaseCombobox } from "./ui";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  userRole: {
    type: String,
    default: "guest",
  },
  canChangeStatus: {
    type: Boolean,
    default: false,
  },
  canJoin: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["view", "join", "status-change"]);

const statusOptions = [
  { value: "pending", label: "На рассмотрении" },
  { value: "approved", label: "Одобрен" },
  { value: "rejected", label: "Отклонён" },
];

const statusLabel = (status) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};

const schoolName = computed(() => {
  if (props.project.school) {
    return props.project.school.name;
  }
  return props.project.schoolName || "—";
});
</script>

<style scoped>
.project-card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
  flex: 1;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-pending {
  background: #fff8e1;
  color: #f57c00;
}

.status-rejected {
  background: #fdecea;
  color: #c62828;
}

.card-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.meta-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.meta-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-value {
  color: var(--color-text);
}

.github-link {
  padding-top: 4px;
}

.github-link a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.github-link a:hover {
  opacity: 0.7;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-select {
  min-width: 160px;
}

.card-files {
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.files-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.file-icon {
  font-size: 16px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .project-card {
    padding: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .status-select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-badge {
    align-self: flex-start;
  }

  .card-actions {
    width: 100%;
  }

  .card-actions button {
    flex: 1;
  }
}
</style>
