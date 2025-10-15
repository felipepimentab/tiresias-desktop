<script lang="ts" setup>
import MaterialSymbol from './MaterialSymbol.vue';

const links = [
  {
    icon: 'home',
    name: 'Início',
    to: '/',
  },
  {
    icon: 'bluetooth',
    name: 'Conexão',
    to: '/connection',
  },
  {
    icon: 'devices',
    name: 'Dispositivo',
    to: '/device',
  },
  {
    icon: 'settings',
    name: 'Ajustes',
    to: '/settings',
  },
]
</script>

<template>
  <aside
    id="logo-sidebar"
    class="z-40 w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700" 
    aria-label="Sidebar"
  >
    <div class="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800">
      <ul class="space-y-2 font-medium">
        <li
          v-for="link in links"
          :key="link.to"
        >
            <router-link
              :to="link.to"
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <MaterialSymbol
                :icon="link.icon"
                :fill="$route.path === link.to"
                class="text-2xl text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              />
              <span
                :class="{'font-bold': $route.path === link.to}"
                class="ms-3"
              >
                {{ link.name }}
              </span>
            </router-link>
         </li>
      </ul>
    </div>
  </aside>
</template>