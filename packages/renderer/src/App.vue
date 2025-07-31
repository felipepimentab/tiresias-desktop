<script lang="ts" setup>
import NavBar from './components/NavBar.vue';
import SideBar from './components/SideBar.vue';
import PageFooter from './components/PageFooter.vue';
</script>

<template>
  <div class="app h-screen overflow-hidden">
    <NavBar />
    <div class="flex overflow-hidden h-full">
      <SideBar />
      <div class="p-4 w-full text-gray-900 dark:text-white dark:bg-gray-900 overflow-y-auto">
        <router-view />
      </div>
    </div>
    <PageFooter />
  </div>
</template>

<style>
.app {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
}

* {
  cursor: default;
  user-select: none;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5); /* gray-400 with opacity */
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
}

/* Hide scrollbar when not in use, but maintain functionality */
::-webkit-scrollbar-thumb:vertical:active,
::-webkit-scrollbar-thumb:horizontal:active {
  background: rgba(75, 85, 99, 0.8); /* gray-600 with opacity */
}

/* For Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>