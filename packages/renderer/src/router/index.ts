import { createMemoryHistory, createRouter } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DevicesView from "../views/DevicesView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes = [
  {
    path: '/',
    component: HomeView,
  },
  {
    path: '/settings',
    component: SettingsView,
  },
  {
    path: '/devices',
    component: DevicesView,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});