<template>
  <button 
    :type="type"
    :disabled="disabled || loading"
    :class="['base-button', variant, { 'is-loading': loading }]"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'accent', 'danger', 'ghost'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.base-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 120px;
  position: relative;
}

/* Primary */
.base-button.primary {
  background-color: var(--color-primary);
  color: white;
}

.base-button.primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 91, 187, 0.3);
}

/* Secondary */
.base-button.secondary {
  background-color: var(--color-secondary);
  color: var(--color-text);
}

.base-button.secondary:hover:not(:disabled) {
  background-color: #d0d8e0;
  transform: translateY(-2px);
}

/* Accent */
.base-button.accent {
  background-color: var(--color-accent);
  color: white;
}

.base-button.accent:hover:not(:disabled) {
  background-color: var(--color-accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 111, 0, 0.3);
}

/* Danger */
.base-button.danger {
  background-color: var(--color-error);
  color: white;
}

.base-button.danger:hover:not(:disabled) {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* Ghost */
.base-button.ghost {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.base-button.ghost:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}

/* Disabled state */
.base-button:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

/* Loading state */
.base-button.is-loading {
  cursor: wait;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
