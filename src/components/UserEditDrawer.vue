<script setup lang="ts">
import { reactive, watch } from "vue";
import UiInput from "../ui/Input.vue";
import UiButton from "../ui/Button.vue";
import type { UserProfile, UpdateUserDto } from "../services/users";

const props = defineProps<{ modelValue: boolean; user: UserProfile | null }>();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "save", dto: UpdateUserDto): void;
}>();

const state = reactive({
  email: "",
  firstName: "",
  lastName: "",
  middleName: "",
  password: "",
});

watch(
  () => props.user,
  (u) => {
    state.email = u?.email || "";
    state.firstName = u?.firstName || "";
    state.lastName = u?.lastName || "";
    state.middleName = u?.middleName || "";
    state.password = "";
  },
  { immediate: true }
);

function close() {
  emit("update:modelValue", false);
}
function onSave() {
  const dto: UpdateUserDto = {
    email: state.email,
    firstName: state.firstName,
    lastName: state.lastName,
    middleName: state.middleName,
    password: state.password || undefined,
  };
  emit("save", dto);
}
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
    location="right"
    width="420"
    temporary
  >
    <div class="drawer">
      <div class="drawer__header">
        <h3 class="drawer__title">Редактирование пользователя</h3>
        <v-btn variant="text" @click="close">Закрыть</v-btn>
      </div>
      <div class="drawer__content">
        <UiInput v-model="state.email" label="Email" type="email" />
        <UiInput v-model="state.firstName" label="Имя" />
        <UiInput v-model="state.lastName" label="Фамилия" />
        <UiInput v-model="state.middleName" label="Отчество" />
        <UiInput
          v-model="state.password"
          label="Новый пароль (необязательно)"
          type="password"
        />
      </div>
      <div class="drawer__footer">
        <UiButton theme="primary" @click="onSave">Сохранить</UiButton>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.drawer {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}
.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}
.drawer__content {
  display: grid;
  gap: 12px;
  padding: 0 16px 16px;
}
.drawer__footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}
</style>
