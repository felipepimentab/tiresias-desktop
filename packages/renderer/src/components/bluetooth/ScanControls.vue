<script setup lang="ts">
import MaterialSymbol from '../MaterialSymbol.vue';

defineProps<{
  isScanning: boolean;
  bluetoothState: string;
}>();

defineEmits<{
  (e: 'start-scan'): void;
  (e: 'stop-scan'): void;
}>();
</script>

<template>
  <div class="flex items-center gap-4 mb-6">
    <button 
      v-if="!isScanning" 
      @click="$emit('start-scan')" 
      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <MaterialSymbol icon="bluetooth_searching" />
      Buscar dispositivos
    </button>
    
    <button 
      v-else 
      @click="$emit('stop-scan')" 
      class="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      <MaterialSymbol icon="stop_circle" />
      Parar busca
    </button>
    
    <div v-if="isScanning" class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
      <div class="animate-spin">
        <MaterialSymbol icon="progress_activity" />
      </div>
      <span>Buscando dispositivos próximos...</span>
    </div>
  </div>
</template>