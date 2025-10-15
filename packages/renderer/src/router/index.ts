import { createMemoryHistory, createRouter } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ConnectionView from "../views/ConnectionView.vue";
import SettingsView from "../views/SettingsView.vue";
import DeviceView from "../views/DeviceView.vue";

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
    path: '/connection',
    component: ConnectionView,
  },
  {
    path: '/device',
    component: DeviceView,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});