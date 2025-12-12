<template>
  <transition name="fade">
    <div v-if="message" class="error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ message }}</span>
      <button v-if="closable" @click="close" class="close-btn">
        &times;
      </button>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
.error-message {
  background-color: #fadbd8;
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: shake 0.5s ease;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-error);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: opacity 0.3s ease;
}

.close-btn:hover {
  opacity: 0.7;
}

/* Анимация появления */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}
</style>
