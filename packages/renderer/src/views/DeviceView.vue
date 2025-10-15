<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useBluetoothDevices } from '../composables/useBluetoothDevices';
import MaterialSymbol from '../components/MaterialSymbol.vue';
import type { BluetoothDevice } from '../services/BluetoothService';

// Use the Bluetooth devices composable
const {
  devices,
  connectionStatus,
  bluetoothState,
  connectToDevice,
  disconnectFromDevice,
  updateDevicesList
} = useBluetoothDevices();

// Selected device for detailed view
const selectedDeviceId = ref<string | null>(null);

// Computed properties
const connectedDevices = computed(() => {
  return devices.value.filter(device => device.state === 'connected');
});

const selectedDevice = computed(() => {
  if (!selectedDeviceId.value) return null;
  return devices.value.find(device => device.id === selectedDeviceId.value) || null;
});

const currentDevice = computed(() => {
  // If a device is selected, show it
  if (selectedDevice.value) return selectedDevice.value;
  
  // Otherwise, show the first connected device
  return connectedDevices.value[0] || null;
});

// Helper functions
function getDeviceStatusClass(device: BluetoothDevice) {
  const status = connectionStatus.value[device.id] || device.state;
  
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
  const status = connectionStatus.value[device.id] || device.state;
  
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
  const status = connectionStatus.value[device.id] || device.state;
  
  if (status === 'connected') {
    return 'Conectado';
  } else if (status === 'connecting') {
    return 'Conectando...';
  } else if (status === 'disconnecting') {
    return 'Desconectando...';
  } else if (status === 'failed') {
    return 'Falha na conexão';
  }
  
  return 'Desconectado';
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

function getSignalStrengthText(rssi?: number) {
  if (rssi === undefined) return 'Desconhecido';
  
  if (rssi >= -50) return 'Excelente';
  if (rssi >= -65) return 'Bom';
  if (rssi >= -75) return 'Regular';
  if (rssi >= -85) return 'Fraco';
  return 'Muito fraco';
}

function getSignalStrengthClass(rssi?: number) {
  if (rssi === undefined) return 'text-gray-500 dark:text-gray-400';
  
  if (rssi >= -50) return 'text-green-500 dark:text-green-400';
  if (rssi >= -65) return 'text-blue-500 dark:text-blue-400';
  if (rssi >= -75) return 'text-yellow-500 dark:text-yellow-400';
  if (rssi >= -85) return 'text-orange-500 dark:text-orange-400';
  return 'text-red-500 dark:text-red-400';
}

function formatServiceUuid(uuid: string) {
  // Format UUID for better readability
  if (uuid.length === 4) {
    return `0x${uuid.toUpperCase()}`;
  }
  return uuid.toLowerCase();
}

function getServiceName(uuid: string) {
  // Common Bluetooth service UUIDs
  const services: { [key: string]: string } = {
    '1800': 'Generic Access',
    '1801': 'Generic Attribute',
    '1802': 'Immediate Alert',
    '1803': 'Link Loss',
    '1804': 'Tx Power',
    '1805': 'Current Time',
    '1806': 'Reference Time Update',
    '1807': 'Next DST Change',
    '1808': 'Glucose',
    '1809': 'Health Thermometer',
    '180a': 'Device Information',
    '180d': 'Heart Rate',
    '180e': 'Phone Alert Status',
    '180f': 'Battery Service',
    '1810': 'Blood Pressure',
    '1811': 'Alert Notification',
    '1812': 'Human Interface Device',
    '1813': 'Scan Parameters',
    '1814': 'Running Speed and Cadence',
    '1815': 'Automation IO',
    '1816': 'Cycling Speed and Cadence',
    '1818': 'Cycling Power',
    '1819': 'Location and Navigation',
    '181a': 'Environmental Sensing',
    '181b': 'Body Composition',
    '181c': 'User Data',
    '181d': 'Weight Scale',
    '181e': 'Bond Management',
    '181f': 'Continuous Glucose Monitoring',
    '1820': 'Internet Protocol Support',
    '1821': 'Indoor Positioning',
    '1822': 'Pulse Oximeter',
    '1823': 'HTTP Proxy',
    '1824': 'Transport Discovery',
    '1825': 'Object Transfer',
    '1826': 'Fitness Machine',
    '1827': 'Mesh Provisioning',
    '1828': 'Mesh Proxy',
    '1829': 'Reconnection Configuration',
    '183a': 'Insulin Delivery',
    '183b': 'Binary Sensor',
    '183c': 'Emergency Configuration',
    '183d': 'Authorization Control',
    '183e': 'Physical Activity Monitor',
    '1843': 'Audio Input Control',
    '1844': 'Volume Control',
    '1845': 'Volume Offset Control',
    '1846': 'Coordinated Set Identification',
    '1847': 'Device Time',
    '1848': 'Media Control',
    '1849': 'Generic Media Control',
    '184a': 'Constant Tone Extension',
    '184b': 'Telephone Bearer',
    '184c': 'Generic Telephone Bearer',
    '184d': 'Microphone Control',
    '184e': 'Audio Stream Control',
    '184f': 'Broadcast Isochronous Streams',
    '1850': 'Published Audio Capabilities',
    '1851': 'Basic Audio Announcement',
    '1852': 'Broadcast Audio Announcement',
    '1853': 'Common Audio',
    '1854': 'Hearing Access',
    '1855': 'Telephony and Media Audio',
    '1856': 'Public Broadcast Announcement',
    '1857': 'Electronic Shelf Label'
  };
  
  const shortUuid = uuid.toLowerCase().replace(/-/g, '').substring(0, 4);
  return services[shortUuid] || 'Serviço personalizado';
}

function selectDevice(deviceId: string) {
  selectedDeviceId.value = deviceId;
}

// Auto-select first connected device on mount
onMounted(() => {
  update();
});

function update() {
  updateDevicesList();
  if (connectedDevices.value.length > 0 && !selectedDeviceId.value) {
    selectedDeviceId.value = connectedDevices.value[0].id;
  }
}
</script>

<template>
  <main class="p-4 max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4 flex items-center gap-3">
        <MaterialSymbol icon="devices" class="text-4xl" />
        Informações do Dispositivo
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Visualize informações detalhadas sobre o dispositivo Bluetooth conectado.
      </p>
    </div>

    <!-- Device Selection -->
    <div v-if="connectedDevices.length > 1" class="mb-6">
      <h2 class="text-lg font-semibold mb-3">Dispositivos Conectados</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="device in connectedDevices"
          :key="device.id"
          @click="selectDevice(device.id)"
          :class="[
            'px-4 py-2 rounded-lg border transition-colors',
            selectedDeviceId === device.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <div class="flex items-center gap-2">
            <MaterialSymbol icon="bluetooth_connected" class="text-sm" />
            <span>{{ device.name || 'Dispositivo desconhecido' }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- No Connected Device -->
    <div v-if="!currentDevice" class="text-center py-12">
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
        <MaterialSymbol icon="bluetooth_disabled" class="text-6xl text-gray-400 mb-4" />
        <h2 class="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Nenhum dispositivo conectado
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          Conecte-se a um dispositivo Bluetooth para visualizar suas informações detalhadas.
        </p>
        <router-link
          to="/connection"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MaterialSymbol icon="bluetooth_searching" />
          Buscar dispositivos
        </router-link>
      </div>
    </div>

    <!-- Device Information -->
    <div v-else class="space-y-6">
      <!-- Device Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <MaterialSymbol 
                :icon="getDeviceStatusIcon(currentDevice)" 
                :class="getDeviceStatusClass(currentDevice)"
                class="text-3xl"
              />
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ currentDevice.name || 'Dispositivo desconhecido' }}</h2>
              <p :class="getDeviceStatusClass(currentDevice)" class="text-lg font-medium">
                {{ getDeviceStatusText(currentDevice) }}
              </p>
            </div>
          </div>
          
          <!-- Connection Controls -->
          <div class="flex gap-2">
            <button 
              v-if="currentDevice.state !== 'connected'" 
              @click="connectToDevice(currentDevice.id)" 
              :disabled="['connecting', 'disconnecting'].includes(connectionStatus[currentDevice.id] || '')"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MaterialSymbol icon="link" />
              Conectar
            </button>
            
            <button 
              v-if="currentDevice.state === 'connected'" 
              @click="disconnectFromDevice(currentDevice.id)" 
              :disabled="['connecting', 'disconnecting'].includes(connectionStatus[currentDevice.id] || '')"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MaterialSymbol icon="link_off" />
              Desconectar
            </button>
          </div>
        </div>
      </div>

      <!-- Device Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Basic Information -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <MaterialSymbol icon="info" class="text-blue-500" />
            Informações Básicas
          </h3>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">ID do Dispositivo</label>
              <p class="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">{{ currentDevice.id }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
              <p class="text-lg">{{ currentDevice.name || 'Não informado' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Endereço</label>
              <p class="font-mono">{{ currentDevice.address || 'Não disponível' }}</p>
            </div>
          </div>
        </div>

        <!-- Signal Information -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <MaterialSymbol icon="signal_cellular_alt" class="text-green-500" />
            Qualidade do Sinal
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Intensidade (RSSI)</label>
                <p class="text-2xl font-bold">{{ currentDevice.rssi !== undefined ? `${currentDevice.rssi} dBm` : 'N/A' }}</p>
              </div>
              <MaterialSymbol 
                :icon="getSignalStrengthIcon(currentDevice.rssi)" 
                :class="getSignalStrengthClass(currentDevice.rssi)"
                class="text-4xl"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Qualidade</label>
              <p :class="getSignalStrengthClass(currentDevice.rssi)" class="text-lg font-semibold">
                {{ getSignalStrengthText(currentDevice.rssi) }}
              </p>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                :class="getSignalStrengthClass(currentDevice.rssi).replace('text-', 'bg-')"
                class="h-2 rounded-full transition-all duration-300"
                :style="{ 
                  width: currentDevice.rssi !== undefined 
                    ? `${Math.max(0, Math.min(100, (currentDevice.rssi + 100) * 1.43))}%` 
                    : '0%' 
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <MaterialSymbol icon="settings_ethernet" class="text-purple-500" />
            Status da Conexão
          </h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <MaterialSymbol 
                :icon="getDeviceStatusIcon(currentDevice)" 
                :class="getDeviceStatusClass(currentDevice)"
                class="text-2xl"
              />
              <div>
                <p :class="getDeviceStatusClass(currentDevice)" class="text-lg font-semibold">
                  {{ getDeviceStatusText(currentDevice) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Estado: {{ currentDevice.state }}
                </p>
              </div>
            </div>
            <div v-if="connectionStatus[currentDevice.id]" class="text-sm">
              <label class="text-gray-500 dark:text-gray-400">Status interno:</label>
              <p class="capitalize">{{ connectionStatus[currentDevice.id] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Information -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <MaterialSymbol icon="developer_board" class="text-orange-500" />
          Serviços Bluetooth
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ currentDevice.services?.length || 0 }} serviços)
          </span>
        </h3>
        
        <div v-if="!currentDevice.services || currentDevice.services.length === 0" class="text-center py-8">
          <MaterialSymbol icon="info" class="text-4xl text-gray-400 mb-2" />
          <p class="text-gray-500 dark:text-gray-400">Nenhum serviço descoberto</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">
            Os serviços podem aparecer após a conexão ser estabelecida
          </p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="service in currentDevice.services" 
            :key="service"
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div class="flex items-start gap-3">
              <MaterialSymbol icon="extension" class="text-orange-500 text-xl mt-1" />
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-sm mb-1">{{ getServiceName(service) }}</h4>
                <p class="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                  {{ formatServiceUuid(service) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Details -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <MaterialSymbol icon="memory" class="text-gray-500 text-xl" />
          Detalhes Técnicos
        </h3>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <pre class="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{
            JSON.stringify({
              id: currentDevice.id,
              name: currentDevice.name,
              address: currentDevice.address,
              rssi: currentDevice.rssi,
              state: currentDevice.state,
              services: currentDevice.services,
              connectionStatus: connectionStatus[currentDevice.id]
            }, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </main>
</template>