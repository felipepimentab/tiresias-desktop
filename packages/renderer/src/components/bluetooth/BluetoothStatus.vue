<script setup lang="ts">
import MaterialSymbol from '../MaterialSymbol.vue';

defineProps<{
  bluetoothState: string;
}>();

function getStateIcon(state: string) {
  switch (state) {
    case 'poweredOn':
      return 'bluetooth';
    case 'poweredOff':
      return 'bluetooth_disabled';
    case 'unauthorized':
      return 'block';
    case 'unsupported':
      return 'bluetooth_disabled';
    default:
      return 'bluetooth_searching';
  }
}

function getStateText(state: string) {
  switch (state) {
    case 'poweredOn':
      return 'Bluetooth ativado';
    case 'poweredOff':
      return 'Bluetooth desativado';
    case 'unauthorized':
      return 'Acesso ao Bluetooth não autorizado';
    case 'unsupported':
      return 'Bluetooth não suportado';
    case 'unknown':
      return 'Estado do Bluetooth desconhecido';
    default:
      return `Estado do Bluetooth: ${state}`;
  }
}

function getStateClass(state: string) {
  switch (state) {
    case 'poweredOn':
      return 'text-green-500 dark:text-green-400';
    case 'poweredOff':
      return 'text-red-500 dark:text-red-400';
    case 'unauthorized':
      return 'text-red-500 dark:text-red-400';
    case 'unsupported':
      return 'text-red-500 dark:text-red-400';
    default:
      return 'text-yellow-500 dark:text-yellow-400';
  }
}
</script>

<template>
  <div class="flex items-center gap-2 mb-4" :class="getStateClass(bluetoothState)">
    <MaterialSymbol :icon="getStateIcon(bluetoothState)" />
    <span>{{ getStateText(bluetoothState) }}</span>
  </div>
</template>