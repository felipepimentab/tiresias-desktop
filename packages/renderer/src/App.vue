<script lang="ts" setup>
import NavBar from './components/NavBar.vue';
import SideBar from './components/SideBar.vue';
import PageFooter from './components/PageFooter.vue';
</script>

<template>
  <div class="app h-screen">
    <NavBar />
    <div class="flex">
      <SideBar />
      <div class="p-4 w-full text-gray-900 dark:text-white dark:bg-gray-900">
        <router-view />
      </div>
    </div>
    <PageFooter />
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
}
</style>