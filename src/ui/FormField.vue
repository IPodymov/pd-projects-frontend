<script setup lang="ts">
const props = defineProps<{ label: string; error?: string }>();
</script>

<template>
  <label class="form-field">
    <span class="form-field__label">{{ props.label }}</span>
    <div class="form-field__control">
      <slot />
    </div>
    <span v-if="props.error" class="form-field__error">{{ props.error }}</span>
  </label>
</template>

<style scoped>
.form-field { display: grid; gap: var(--space-2); }
.form-field__label { font-size: 13px; color: var(--muted); font-weight: 500; }
.form-field__error { font-size: 12px; color: #dc2626; }
@media (min-width: 768px) {
  .form-field__label { font-size: 14px; }
}
</style>
