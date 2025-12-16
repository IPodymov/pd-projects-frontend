<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
  }>(),
  { type: "text" }
);
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();
</script>

<template>
  <v-text-field
    class="ui-input"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    :type="props.type as any"
    :label="props.label"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :model-value="props.modelValue"
    @update:model-value="(v:any) => emit('update:modelValue', v as string)"
  />
</template>

<style scoped>
.ui-input {
  width: 100%;
}
</style>
