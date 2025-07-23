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
      
      <!-- Bluetooth status -->
      <BluetoothStatus :bluetooth-state="bluetoothState" />
      
      <!-- Scan controls -->
      <ScanControls 
        :is-scanning="isScanning" 
        :bluetooth-state="bluetoothState"
        @start-scan="startScan"
        @stop-scan="stopScan"
      />
      
      <!-- Error message -->
      <ScanError :error="scanError" />
      
      <!-- Bluetooth state warning -->
      <div v-if="bluetoothState !== 'poweredOn'" class="p-4 mb-6 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg">
        <div class="flex items-center gap-2">
          <MaterialSymbol icon="bluetooth_disabled" />
          <span>
            Bluetooth {{ bluetoothState === 'poweredOff' ? 'está desativado' : 'não está pronto' }}. 
            Por favor, ative o Bluetooth no seu sistema para continuar.
          </span>
        </div>
      </div>
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
    
    <!-- Help section -->
    <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <h3 class="font-medium mb-2 flex items-center gap-2">
        <MaterialSymbol icon="help" />
        <span>Dicas para conexão</span>
      </h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
        <li>Certifique-se de que o dispositivo esteja próximo e com bateria suficiente</li>
        <li>Coloque o dispositivo em modo de pareamento antes de iniciar a busca</li>
        <li>Alguns dispositivos podem exigir um código de pareamento</li>
        <li>Se tiver problemas, tente reiniciar o dispositivo e o aplicativo</li>
      </ul>
    </div>
  </main>
</template>