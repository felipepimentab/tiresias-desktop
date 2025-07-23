<script lang="ts" setup>
import MaterialSymbol from './MaterialSymbol.vue';

const brand = {
  icon: 'hearing_aid',
  title: 'Tiresias'
}
</script>

<template>
  <nav class="top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div
          v-if="brand"
          class="flex items-center justify-start rtl:justify-end gap-3 pl-2"
        >
            <MaterialSymbol
              :icon="brand.icon"
              class="dark:text-white text-3xl"
              :fill="true"
            />
            <h1 class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              {{ brand.title }}
            </h1>
        </div>
      </div>
    </div>
  </nav>
</template>