<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import MaterialSymbol from '../components/MaterialSymbol.vue';
import { BluetoothService, type BluetoothDevice } from '../services/BluetoothService';

// Create a new instance of the Bluetooth service
const bluetoothService = new BluetoothService();

// State
const isScanning = ref(false);
const devices = ref<BluetoothDevice[]>([]);
const scanError = ref<string | null>(null);
const connectionStatus = ref<{ [key: string]: string }>({});
const bluetoothState = ref<string>('unknown');

// Start scanning for devices
async function startScan() {
  try {
    scanError.value = null;
    isScanning.value = true;
    
    await bluetoothService.startScan();
  } catch (error) {
    scanError.value = (error as Error).message || 'Falha ao iniciar busca por dispositivos';
    isScanning.value = false;
  }
}

// Stop scanning for devices
async function stopScan() {
  try {
    await bluetoothService.stopScan();
    isScanning.value = false;
  } catch (error) {
    console.error('Error stopping scan:', error);
  }
}

// Connect to a device
async function connectToDevice(deviceId: string) {
  try {
    connectionStatus.value[deviceId] = 'connecting';
    
    // Find the device in the devices list
    const device = devices.value.find(d => d.id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }
    
    await bluetoothService.connectToDevice(device);
    
    connectionStatus.value[deviceId] = 'connected';
    // Update devices list
    devices.value = await bluetoothService.getDevices();
  } catch (error) {
    console.error(`Error connecting to device ${deviceId}:`, error);
    connectionStatus.value[deviceId] = 'failed';
    setTimeout(() => {
      connectionStatus.value[deviceId] = '';
    }, 3000);
  }
}

// Disconnect from a device
async function disconnectFromDevice(deviceId: string) {
  try {
    connectionStatus.value[deviceId] = 'disconnecting';
    
    // Find the device in the devices list
    const device = devices.value.find(d => d.id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }
    
    await bluetoothService.disconnectFromDevice(device);
    
    connectionStatus.value[deviceId] = '';
    // Update devices list
    devices.value = await bluetoothService.getDevices();
  } catch (error) {
    console.error(`Error disconnecting from device ${deviceId}:`, error);
    connectionStatus.value[deviceId] = 'failed';
    setTimeout(() => {
      connectionStatus.value[deviceId] = '';
    }, 3000);
  }
}

// Update devices list periodically while scanning
const updateInterval = ref<number | null>(null);

async function updateDevicesList() {
  try {
    devices.value = await bluetoothService.getDevices();
    isScanning.value = bluetoothService.getIsScanning();
    bluetoothState.value = bluetoothService.getBluetoothState();
  } catch (error) {
    console.error('Error updating devices list:', error);
  }
}

function startUpdatingDevices() {
  // Initial update
  updateDevicesList();
  
  // Set interval for updates
  updateInterval.value = window.setInterval(() => {
    updateDevicesList();
  }, 1000);
}

function stopUpdatingDevices() {
  if (updateInterval.value !== null) {
    clearInterval(updateInterval.value);
    updateInterval.value = null;
  }
}

// Watch for changes in devices to update UI
watch(devices, (newDevices) => {
  // Update connection status based on device state
  newDevices.forEach(device => {
    if (device.state === 'connected') {
      connectionStatus.value[device.id] = 'connected';
    } else if (device.state === 'connecting') {
      connectionStatus.value[device.id] = 'connecting';
    } else if (device.state === 'disconnecting') {
      connectionStatus.value[device.id] = 'disconnecting';
    } else {
      // Only clear if not in a special state
      if (!['connecting', 'disconnecting', 'failed'].includes(connectionStatus.value[device.id])) {
        connectionStatus.value[device.id] = '';
      }
    }
  });
});

// Lifecycle hooks
onMounted(() => {
  startUpdatingDevices();
});

onUnmounted(() => {
  stopUpdatingDevices();
  stopScan();
  bluetoothService.cleanup();
});
</script>

<template>
  <main class="p-4">
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-4">Dispositivos Bluetooth</h1>
      <p class="mb-4">Conecte-se a aparelhos auditivos e outros dispositivos Bluetooth.</p>
      
      <!-- Scan controls -->
      <div class="flex items-center gap-4 mb-6">
        <button 
          v-if="!isScanning" 
          @click="startScan" 
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MaterialSymbol icon="bluetooth_searching" />
          Buscar dispositivos
        </button>
        
        <button 
          v-else 
          @click="stopScan" 
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
      
      <!-- Error message -->
      <div v-if="scanError" class="p-4 mb-6 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
        <div class="flex items-center gap-2">
          <MaterialSymbol icon="error" fill />
          <span>{{ scanError }}</span>
        </div>
      </div>
      
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
      
      <div v-if="devices.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        <div class="flex flex-col items-center gap-2">
          <MaterialSymbol icon="bluetooth_disabled" class="text-4xl mb-2" />
          <p>Nenhum dispositivo encontrado</p>
          <p class="text-sm">Inicie a busca para encontrar dispositivos próximos</p>
        </div>
      </div>
      
      <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <li 
          v-for="device in devices" 
          :key="device.id"
          class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-blue-600 dark:text-blue-400">
                <MaterialSymbol 
                  icon="hearing_aid" 
                  :fill="device.state === 'connected'"
                  class="text-2xl"
                />
              </div>
              
              <div>
                <h3 class="font-medium">{{ device.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ device.state === 'connected' ? 'Conectado' : 'Desconectado' }}
                  <span v-if="device.rssi" class="ml-2">(RSSI: {{ device.rssi }}dBm)</span>
                </p>
                <p v-if="device.address" class="text-xs text-gray-400 dark:text-gray-500">
                  {{ device.address }}
                </p>
              </div>
            </div>
            
            <div>
              <!-- Connect button -->
              <button 
                v-if="device.state !== 'connected' && connectionStatus[device.id] !== 'connecting'" 
                @click="connectToDevice(device.id)"
                class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                :disabled="bluetoothState !== 'poweredOn'"
              >
                Conectar
              </button>
              
              <!-- Connecting indicator -->
              <div 
                v-else-if="connectionStatus[device.id] === 'connecting'"
                class="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm rounded"
              >
                <div class="animate-spin">
                  <MaterialSymbol icon="progress_activity" class="text-sm" />
                </div>
                <span>Conectando...</span>
              </div>
              
              <!-- Disconnect button -->
              <button 
                v-else-if="device.state === 'connected' && connectionStatus[device.id] !== 'disconnecting'" 
                @click="disconnectFromDevice(device.id)"
                class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                Desconectar
              </button>
              
              <!-- Disconnecting indicator -->
              <div 
                v-else-if="connectionStatus[device.id] === 'disconnecting'"
                class="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm rounded"
              >
                <div class="animate-spin">
                  <MaterialSymbol icon="progress_activity" class="text-sm" />
                </div>
                <span>Desconectando...</span>
              </div>
              
              <!-- Error indicator -->
              <div 
                v-else-if="connectionStatus[device.id] === 'failed'"
                class="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm rounded"
              >
                <MaterialSymbol icon="error" class="text-sm" />
                <span>Falha</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
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