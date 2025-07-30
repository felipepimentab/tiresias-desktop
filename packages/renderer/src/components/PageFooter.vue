<script lang="ts" setup>
import { versions } from '@app/preload';

const copy = {
  text: 'Projeto Tiresias',
  link: 'https://tiresias-docs.vercel.app',
}

// Get app version from environment variables or process versions
const appVersion = import.meta.env.VITE_APP_VERSION || versions?.app || '0.1.0-alpha'
</script>

<template>
  <footer class="bg-white border-t border-gray-200 shadow sm:flex sm:items-center sm:justify-between px-4 py-3 dark:bg-gray-800 dark:border-gray-700 antialiased">
    <p class="mb-4 text-sm text-center text-gray-500 dark:text-gray-400 sm:mb-0">
        &copy; 2025 - <a :href="copy.link" class="hover:underline" target="_blank">{{ copy.text }}</a>
    </p>
    <div class="flex justify-center items-center space-x-1">
      <span class="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">v{{ appVersion }}</span>
    </div>
  </footer>
</template>