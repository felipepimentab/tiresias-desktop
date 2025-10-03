<script setup lang="ts">
import { useBluetoothDevices } from '../composables/useBluetoothDevices';
import ScanControls from '../components/bluetooth/ScanControls.vue';
import BluetoothStatus from '../components/bluetooth/BluetoothStatus.vue';
import ScanError from '../components/bluetooth/ScanError.vue';
import DeviceList from '../components/bluetooth/DeviceList.vue';
import MaterialSymbol from '../components/MaterialSymbol.vue';

// Use the Bluetooth devices composable
const {
  isScanning,
  devices,
  scanError,
  connectionStatus,
  bluetoothState,
  startScan,
  stopScan,
  connectToDevice,
  disconnectFromDevice
} = useBluetoothDevices();
</script>

<template>
  <main class="p-4">
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-4">Dispositivos Bluetooth</h1>
      <p class="mb-4">Conecte-se a aparelhos auditivos e outros dispositivos Bluetooth.</p>
      
      <!-- Scan controls -->
      <ScanControls 
        :is-scanning="isScanning" 
        :bluetooth-state="bluetoothState"
        @start-scan="startScan"
        @stop-scan="stopScan"
      />
      
      <!-- Error message -->
      <ScanError :error="scanError" />

    </div>
    
    <!-- Devices list -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 class="text-lg font-medium">Dispositivos disponíveis</h2>
      </div>
      
      <div class="p-4">
        <DeviceList 
          :devices="devices" 
          :connection-status="connectionStatus"
          @connect="connectToDevice"
          @disconnect="disconnectFromDevice"
        />
      </div>
    </div>
  </main>
</template>