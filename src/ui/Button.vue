<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    theme?: "primary" | "secondary";
    disabled?: boolean;
  }>(),
  {
    type: "button",
    theme: "primary",
    disabled: false,
  }
);
</script>

<template>
  <v-btn :type="props.type" :color="props.theme === 'primary' ? 'primary' : 'secondary'" :disabled="props.disabled" class="ui-button">
    <slot />
  </v-btn>
</template>

<style scoped>
.ui-button { text-transform: none; letter-spacing: 0; }
</style>
