<script setup lang="ts">
import MaterialSymbol from '../MaterialSymbol.vue';

defineProps<{
  error: string | null;
}>();
</script>

<template>
  <div v-if="error" class="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6 flex items-center gap-2">
    <MaterialSymbol icon="error" class="text-red-500 dark:text-red-400" />
    <span>{{ error }}</span>
  </div>
</template>