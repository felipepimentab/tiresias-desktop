<script lang="ts" setup>
import MaterialSymbol from './MaterialSymbol.vue';

const copy = {
  text: 'Projeto Tiresias',
  link: 'https://tiresias-docs.vercel.app',
}

const links = [
  {
    name: 'Código fonte',
    link: 'https://github.com/felipepimentab/tiresias-desktop',
    icon: 'folder_code'
  },
]
</script>

<template>
  <footer class="bg-white border-t border-gray-200 shadow sm:flex sm:items-center sm:justify-between px-4 py-3 dark:bg-gray-800 dark:border-gray-700 antialiased">
    <p class="mb-4 text-sm text-center text-gray-500 dark:text-gray-400 sm:mb-0">
        &copy; 2025 - <a :href="copy.link" class="hover:underline" target="_blank">{{ copy.text }}</a>
    </p>
    <div class="flex justify-center items-center space-x-1">
      <a
        v-for="link in links"
        :href="link.link"
        class="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
      >
        <MaterialSymbol :icon="link.icon" class="text-2xl" />
        <span class="sr-only">{{ link.name }}</span>
      </a>
    </div>
  </footer>
</template>