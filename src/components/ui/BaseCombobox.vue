<template>
  <div class="base-combobox" v-click-outside="closeDropdown">
    <label v-if="label" :for="comboboxId" class="combobox-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="combobox-wrapper">
      <div
        :class="[
          'combobox-input',
          { 'is-open': isOpen, 'has-error': error, 'is-disabled': disabled },
        ]"
        @click="toggleDropdown"
      >
        <span v-if="selectedOption" class="selected-value">
          {{ selectedOption[displayKey] }}
        </span>
        <span v-else class="placeholder">
          {{ placeholder }}
        </span>
        <span class="arrow" :class="{ 'is-open': isOpen }">▼</span>
      </div>

      <transition name="dropdown">
        <div v-if="isOpen" class="combobox-dropdown">
          <!-- Поиск -->
          <div class="search-wrapper" v-if="searchable">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Поиск..."
              @click.stop
            />
          </div>

          <!-- Загрузка -->
          <div v-if="loading" class="dropdown-loading">
            <span class="spinner"></span>
            <span>Загрузка...</span>
          </div>

          <!-- Ошибка загрузки -->
          <div v-else-if="loadError" class="dropdown-error">
            <span>{{ loadError }}</span>
            <button @click.stop="reload" class="reload-btn">Повторить</button>
          </div>

          <!-- Опции -->
          <div v-else-if="filteredOptions.length > 0" class="options-list">
            <div
              v-for="option in filteredOptions"
              :key="option[valueKey]"
              :class="['option-item', { 'is-selected': isSelected(option) }]"
              @click="selectOption(option)"
            >
              <slot name="option" :option="option">
                {{ option[displayKey] }}
              </slot>
            </div>
          </div>

          <!-- Пустой результат -->
          <div v-else class="dropdown-empty">
            {{ emptyText }}
          </div>
        </div>
      </transition>
    </div>

    <span v-if="error" class="error-text">{{ error }}</span>
    <span v-else-if="hint" class="hint-text">{{ hint }}</span>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null,
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Выберите...",
  },
  options: {
    type: Array,
    default: () => [],
  },
  // Функция для загрузки данных из API
  fetchOptions: {
    type: Function,
    default: null,
  },
  valueKey: {
    type: String,
    default: "id",
  },
  displayKey: {
    type: String,
    default: "name",
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  hint: {
    type: String,
    default: "",
  },
  emptyText: {
    type: String,
    default: "Нет данных",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const searchQuery = ref("");
const loading = ref(false);
const loadError = ref("");
const internalOptions = ref([...props.options]);

const comboboxId = computed(() => {
  return `combobox-${Math.random().toString(36).substring(2, 9)}`;
});

const selectedOption = computed(() => {
  if (!props.modelValue) return null;

  return internalOptions.value.find((option) => {
    if (typeof props.modelValue === "object") {
      return option[props.valueKey] === props.modelValue[props.valueKey];
    }
    return option[props.valueKey] === props.modelValue;
  });
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return internalOptions.value;

  const query = searchQuery.value.toLowerCase();
  return internalOptions.value.filter((option) => {
    return option[props.displayKey].toLowerCase().includes(query);
  });
});

const isSelected = (option) => {
  if (!props.modelValue) return false;

  if (typeof props.modelValue === "object") {
    return option[props.valueKey] === props.modelValue[props.valueKey];
  }
  return option[props.valueKey] === props.modelValue;
};

const toggleDropdown = () => {
  if (props.disabled) return;

  isOpen.value = !isOpen.value;

  // Загружаем данные при открытии, если есть функция загрузки
  if (
    isOpen.value &&
    props.fetchOptions &&
    internalOptions.value.length === 0
  ) {
    loadOptions();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const selectOption = (option) => {
  emit("update:modelValue", option[props.valueKey]);
  emit("change", option);
  closeDropdown();
};

const loadOptions = async () => {
  if (!props.fetchOptions) return;

  loading.value = true;
  loadError.value = "";

  try {
    const data = await props.fetchOptions();
    internalOptions.value = data;
  } catch (error) {
    loadError.value = error.message || "Ошибка загрузки данных";
    console.error("Combobox load error:", error);
  } finally {
    loading.value = false;
  }
};

const reload = () => {
  loadOptions();
};

// Загружаем данные при монтировании, если передана функция
onMounted(() => {
  if (props.fetchOptions && internalOptions.value.length === 0) {
    loadOptions();
  }
});

// Обновляем внутренний список при изменении options prop
watch(
  () => props.options,
  (newOptions) => {
    if (newOptions.length > 0) {
      internalOptions.value = [...newOptions];
    }
  },
  { immediate: true }
);

// Директива для закрытия при клике вне компонента
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.base-combobox {
  margin-bottom: 20px;
  width: 100%;
  position: relative;
}

.combobox-label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
}

.required {
  color: var(--color-error);
  margin-left: 2px;
}

.combobox-wrapper {
  position: relative;
}

.combobox-input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--color-background);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  position: relative;
}

.combobox-input:hover:not(.is-disabled) {
  border-color: var(--color-primary);
}

.combobox-input.is-open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 187, 0.1);
}

.combobox-input.has-error {
  border-color: var(--color-error);
}

.combobox-input.is-disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
  opacity: 0.6;
}

.selected-value {
  color: var(--color-text);
}

.placeholder {
  color: #999;
}

.arrow {
  position: absolute;
  right: 15px;
  transition: transform 0.3s ease;
  color: var(--color-text);
  font-size: 12px;
}

.arrow.is-open {
  transform: rotate(180deg);
}

.combobox-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-wrapper {
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.options-list {
  overflow-y: auto;
  max-height: 240px;
}

.option-item {
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--color-text);
}

.option-item:hover {
  background-color: var(--color-light-gray);
}

.option-item.is-selected {
  background-color: rgba(0, 91, 187, 0.1);
  color: var(--color-primary);
  font-weight: 600;
}

.dropdown-loading,
.dropdown-error,
.dropdown-empty {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.dropdown-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dropdown-error {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reload-btn {
  padding: 6px 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.reload-btn:hover {
  background-color: var(--color-primary-dark);
}

.error-text {
  display: block;
  color: var(--color-error);
  font-size: 12px;
  margin-top: 6px;
}

.hint-text {
  display: block;
  color: #999;
  font-size: 12px;
  margin-top: 6px;
}

@media (max-width: 768px) {
  .combobox-dropdown {
    max-height: 60vh;
  }
  .options-list {
    max-height: calc(60vh - 48px);
  }
  .option-item {
    padding: 14px 16px;
    font-size: 16px;
  }
  .search-input {
    padding: 10px 14px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .combobox-input {
    padding: 12px 36px 12px 14px;
  }
}

/* Анимация dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
