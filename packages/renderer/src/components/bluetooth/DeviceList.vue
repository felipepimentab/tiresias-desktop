<script setup lang="ts">
import { computed } from 'vue';
import MaterialSymbol from '../MaterialSymbol.vue';
import type { BluetoothDevice } from '../../services/BluetoothService';

const props = defineProps<{
  devices: BluetoothDevice[];
  connectionStatus: { [key: string]: string };
}>();

defineEmits<{
  (e: 'connect', deviceId: string): void;
  (e: 'disconnect', deviceId: string): void;
}>();

const sortedDevices = computed(() => {
  return [...props.devices].sort((a, b) => {
    // Connected devices first
    if (a.state === 'connected' && b.state !== 'connected') return -1;
    if (a.state !== 'connected' && b.state === 'connected') return 1;
    
    // Then sort by signal strength (RSSI)
    if (a.rssi !== undefined && b.rssi !== undefined) {
      return b.rssi - a.rssi; // Higher RSSI (less negative) first
    }
    
    // Finally sort by name
    return (a.name || '').localeCompare(b.name || '');
  });
});

function getDeviceStatusClass(device: BluetoothDevice) {
  const status = props.connectionStatus[device.id] || device.state;
  
  if (status === 'connected') {
    return 'text-green-500 dark:text-green-400';
  } else if (status === 'connecting' || status === 'disconnecting') {
    return 'text-yellow-500 dark:text-yellow-400';
  } else if (status === 'failed') {
    return 'text-red-500 dark:text-red-400';
  }
  
  return 'text-gray-500 dark:text-gray-400';
}

function getDeviceStatusIcon(device: BluetoothDevice) {
  const status = props.connectionStatus[device.id] || device.state;
  
  if (status === 'connected') {
    return 'bluetooth_connected';
  } else if (status === 'connecting') {
    return 'sync';
  } else if (status === 'disconnecting') {
    return 'sync_disabled';
  } else if (status === 'failed') {
    return 'error';
  }
  
  return 'bluetooth';
}

function getDeviceStatusText(device: BluetoothDevice) {
  const status = props.connectionStatus[device.id] || device.state;
  
  if (status === 'connected') {
    return 'Conectado';
  } else if (status === 'connecting') {
    return 'Conectando...';
  } else if (status === 'disconnecting') {
    return 'Desconectando...';
  } else if (status === 'failed') {
    return 'Falha na conexão';
  }
  
  return '';
}

function getSignalStrengthIcon(rssi?: number) {
  if (rssi === undefined) return 'signal_cellular_0_bar';
  
  // RSSI values typically range from -100 dBm (weak) to -30 dBm (strong)
  if (rssi >= -50) return 'signal_cellular_4_bar';
  if (rssi >= -65) return 'signal_cellular_3_bar';
  if (rssi >= -75) return 'signal_cellular_2_bar';
  if (rssi >= -85) return 'signal_cellular_1_bar';
  return 'signal_cellular_0_bar';
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="devices.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <MaterialSymbol icon="bluetooth_disabled" class="text-4xl mb-2" />
      <p>Nenhum dispositivo encontrado</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="device in sortedDevices" 
        :key="device.id"
        class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
            <MaterialSymbol 
              :icon="getDeviceStatusIcon(device)" 
              :class="getDeviceStatusClass(device)"
              class="text-xl"
            />
            <h3 class="font-medium text-lg truncate">{{ device.name || 'Dispositivo desconhecido' }}</h3>
          </div>
          <div class="text-gray-500 dark:text-gray-400">
            <MaterialSymbol :icon="getSignalStrengthIcon(device.rssi)" />
          </div>
        </div>
        
        <div class="mb-4 text-sm text-gray-600 dark:text-gray-300">
          <p>ID: {{ device.id }}</p>
          <p v-if="device.rssi !== undefined">Sinal: {{ device.rssi }} dBm</p>
          <p v-if="getDeviceStatusText(device)" :class="getDeviceStatusClass(device)">
            {{ getDeviceStatusText(device) }}
          </p>
        </div>
        
        <div class="flex justify-end gap-2">
          <button 
            v-if="device.state !== 'connected' && !['connecting', 'disconnecting'].includes(connectionStatus[device.id] || '')" 
            @click="$emit('connect', device.id)" 
            class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <MaterialSymbol icon="link" class="text-sm" />
            Conectar
          </button>
          
          <button 
            v-if="device.state === 'connected'" 
            @click="$emit('disconnect', device.id)" 
            class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <MaterialSymbol icon="link_off" class="text-sm" />
            Desconectar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>