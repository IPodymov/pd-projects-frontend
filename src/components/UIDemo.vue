<template>
  <div class="demo-container">
    <h1>🎨 Демонстрация UI компонентов</h1>
    <p class="description">
      Примеры использования всех переиспользуемых компонентов из папки
      <code>src/components/ui/</code>
    </p>

    <!-- BaseButton примеры -->
    <section class="demo-section">
      <h2>BaseButton</h2>
      <div class="demo-grid">
        <div>
          <h3>Варианты стилей</h3>
          <div class="button-row">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="accent">Accent</BaseButton>
            <BaseButton variant="danger">Danger</BaseButton>
            <BaseButton variant="ghost">Ghost</BaseButton>
          </div>
        </div>

        <div>
          <h3>Состояния</h3>
          <div class="button-row">
            <BaseButton :loading="true">Загрузка...</BaseButton>
            <BaseButton disabled>Disabled</BaseButton>
            <BaseButton @click="showAlert">С обработчиком</BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- BaseInput примеры -->
    <section class="demo-section">
      <h2>BaseInput</h2>
      <div class="demo-grid">
        <div>
          <h3>Типы полей</h3>
          <BaseInput
            v-model="demoInputs.text"
            label="Текстовое поле"
            placeholder="Введите текст"
          />

          <BaseInput
            v-model="demoInputs.email"
            type="email"
            label="Email"
            placeholder="your@email.com"
          />

          <BaseInput
            v-model="demoInputs.password"
            type="password"
            label="Пароль"
            placeholder="••••••••"
          />
        </div>

        <div>
          <h3>С валидацией и подсказками</h3>
          <BaseInput
            v-model="demoInputs.required"
            label="Обязательное поле"
            required
            :error="demoInputs.required ? '' : 'Поле не может быть пустым'"
          />

          <BaseInput
            v-model="demoInputs.withHint"
            label="С подсказкой"
            hint="Это поле с подсказкой"
          />

          <BaseInput
            v-model="demoInputs.disabled"
            label="Отключенное поле"
            disabled
          />
        </div>
      </div>
    </section>

    <!-- ErrorMessage примеры -->
    <section class="demo-section">
      <h2>ErrorMessage</h2>
      <div class="demo-grid">
        <div>
          <h3>С возможностью закрытия</h3>
          <ErrorMessage
            v-if="showError1"
            message="Это сообщение об ошибке можно закрыть"
            @close="showError1 = false"
          />
          <BaseButton v-else variant="secondary" @click="showError1 = true">
            Показать ошибку
          </BaseButton>
        </div>

        <div>
          <h3>Без возможности закрытия</h3>
          <ErrorMessage
            message="Критическая ошибка! Невозможно закрыть"
            :closable="false"
          />
        </div>
      </div>
    </section>

    <!-- BaseCombobox примеры -->
    <section class="demo-section">
      <h2>BaseCombobox</h2>
      <div class="demo-grid">
        <div>
          <h3>Статические данные</h3>
          <BaseCombobox
            v-model="selectedCountry"
            label="Выберите страну"
            placeholder="Выберите страну..."
            :options="countries"
            valueKey="id"
            displayKey="name"
          />
          <p v-if="selectedCountry" class="result">
            ✓ Выбрана страна с ID: <strong>{{ selectedCountry }}</strong>
          </p>
        </div>

        <div>
          <h3>С поиском</h3>
          <BaseCombobox
            v-model="selectedLanguage"
            label="Язык программирования"
            placeholder="Найдите язык..."
            :options="languages"
            valueKey="id"
            displayKey="name"
            searchable
          />
          <p v-if="selectedLanguage" class="result">
            ✓ Выбран язык с ID: <strong>{{ selectedLanguage }}</strong>
          </p>
        </div>

        <div>
          <h3>Без поиска</h3>
          <BaseCombobox
            v-model="selectedRole"
            label="Роль пользователя"
            placeholder="Выберите роль..."
            :options="roles"
            valueKey="id"
            displayKey="name"
            :searchable="false"
          />
        </div>

        <div>
          <h3>Загрузка из API (пользователи)</h3>
          <BaseCombobox
            v-model="selectedUserId"
            label="Выберите пользователя"
            placeholder="Выберите пользователя..."
            :fetchOptions="fetchUsers"
            valueKey="id"
            displayKey="name"
          >
            <template #option="{ option }">
              <div class="user-option">
                <strong>{{ option.name }}</strong>
                <br />
                <small>{{ option.email }}</small>
              </div>
            </template>
          </BaseCombobox>
          <p v-if="selectedUserId" class="result">
            ✓ Выбран пользователь с ID: <strong>{{ selectedUserId }}</strong>
          </p>
        </div>

        <div>
          <h3>Загрузка школ из API</h3>
          <BaseCombobox
            v-model="selectedSchoolId"
            label="Выберите школу"
            placeholder="Выберите школу..."
            :fetchOptions="fetchSchools"
            valueKey="id"
            displayKey="name"
            hint="Данные загружаются из API"
          />
          <p v-if="selectedSchoolId" class="result">
            ✓ Выбрана школа с ID: <strong>{{ selectedSchoolId }}</strong>
          </p>
        </div>

        <div>
          <h3>С кастомным шаблоном</h3>
          <BaseCombobox
            v-model="selectedProject"
            label="Выберите проект"
            placeholder="Выберите проект..."
            :options="projects"
            valueKey="id"
            displayKey="title"
          >
            <template #option="{ option }">
              <div class="project-option">
                <strong>{{ option.title }}</strong>
                <br />
                <small>{{ option.description }}</small>
              </div>
            </template>
          </BaseCombobox>
        </div>
      </div>
    </section>

    <!-- Полная форма -->
    <section class="demo-section">
      <h2>Полная форма с валидацией</h2>
      <div class="form-demo">
        <ErrorMessage
          v-if="formError"
          :message="formError"
          @close="formError = ''"
        />

        <BaseInput
          v-model="formData.name"
          label="Полное имя"
          placeholder="Иван Петров"
          required
          :error="formErrors.name"
        />

        <BaseInput
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          required
          :error="formErrors.email"
        />

        <BaseCombobox
          v-model="formData.role"
          label="Роль"
          placeholder="Выберите роль..."
          :options="roles"
          valueKey="id"
          displayKey="name"
          required
          :error="formErrors.role"
        />

        <BaseCombobox
          v-model="formData.country"
          label="Страна"
          placeholder="Выберите страну..."
          :options="countries"
          valueKey="id"
          displayKey="name"
        />

        <div class="button-row">
          <BaseButton
            variant="primary"
            :loading="isSubmitting"
            @click="submitForm"
          >
            Отправить форму
          </BaseButton>
          <BaseButton variant="secondary" @click="resetForm">
            Сбросить
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { BaseButton, BaseInput, BaseCombobox, ErrorMessage } from "./ui";
import { userService, schoolService } from "../services/api";

// Демонстрация BaseInput
const demoInputs = ref({
  text: "",
  email: "",
  password: "",
  required: "",
  withHint: "",
  disabled: "Это поле отключено",
});

// Демонстрация ErrorMessage
const showError1 = ref(true);

// Демонстрация BaseCombobox - статические данные
const selectedCountry = ref(null);
const selectedLanguage = ref(null);
const selectedRole = ref(null);
const selectedProject = ref(null);

const countries = [
  { id: 1, name: "Россия" },
  { id: 2, name: "США" },
  { id: 3, name: "Германия" },
  { id: 4, name: "Франция" },
  { id: 5, name: "Италия" },
];

const languages = [
  { id: "js", name: "JavaScript" },
  { id: "py", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "php", name: "PHP" },
  { id: "ruby", name: "Ruby" },
];

const roles = [
  { id: "admin", name: "Администратор" },
  { id: "teacher", name: "Учитель" },
  { id: "student", name: "Ученик" },
];

const projects = [
  { id: 1, title: "Проект Alpha", description: "Разработка веб-приложения" },
  { id: 2, title: "Проект Beta", description: "Мобильное приложение" },
  { id: 3, title: "Проект Gamma", description: "Система управления" },
];

// Демонстрация BaseCombobox - API загрузка
const selectedUserId = ref(null);
const selectedSchoolId = ref(null);

const fetchUsers = async () => {
  try {
    const response = await userService.searchUsers("");
    return response.users || [];
  } catch (error) {
    console.error("Ошибка загрузки пользователей:", error);
    return [];
  }
};

const fetchSchools = async () => {
  try {
    return await schoolService.getAllSchools();
  } catch (error) {
    console.error("Ошибка загрузки школ:", error);
    return [];
  }
};

// Демонстрация полной формы
const formData = ref({
  name: "",
  email: "",
  role: null,
  country: null,
});

const formError = ref("");
const isSubmitting = ref(false);

const formErrors = computed(() => {
  const errors = {};

  if (!formData.value.name) {
    errors.name = "Имя обязательно";
  }

  if (!formData.value.email) {
    errors.email = "Email обязателен";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.email = "Некорректный email";
  }

  if (!formData.value.role) {
    errors.role = "Выберите роль";
  }

  return errors;
});

const submitForm = async () => {
  formError.value = "";

  // Проверка валидации
  if (Object.keys(formErrors.value).length > 0) {
    formError.value = "Пожалуйста, исправьте ошибки в форме";
    return;
  }

  isSubmitting.value = true;

  // Имитация отправки
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(
      "Форма успешно отправлена!\n\n" + JSON.stringify(formData.value, null, 2)
    );
    resetForm();
  } catch (error) {
    formError.value = "Ошибка отправки формы";
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    name: "",
    email: "",
    role: null,
    country: null,
  };
  formError.value = "";
};

const showAlert = () => {
  alert("Кнопка нажата!");
};
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  color: var(--color-primary);
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 40px;
}

code {
  background-color: var(--color-light-gray);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 14px;
}

.demo-section {
  margin-bottom: 50px;
  padding: 30px;
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.demo-section h2 {
  color: var(--color-text);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-primary);
}

.demo-section h3 {
  color: var(--color-text);
  font-size: 16px;
  margin-bottom: 15px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.result {
  margin-top: 10px;
  padding: 10px;
  background-color: #e8f5e9;
  border-left: 3px solid var(--color-success);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 14px;
}

.user-option,
.project-option {
  padding: 4px 0;
}

.user-option small,
.project-option small {
  color: #999;
}

.form-demo {
  max-width: 500px;
  margin: 0 auto;
}
</style>
