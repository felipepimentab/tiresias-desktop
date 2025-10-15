import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bluetoothService, type BluetoothDevice } from '../services/BluetoothService'

/**
 * Connection status types for individual devices
 */
type ConnectionStatus = '' | 'connecting' | 'connected' | 'disconnecting' | 'failed'

export const useBluetoothStore = defineStore('bluetooth', () => {
  // State
  const devices = ref<BluetoothDevice[]>([])
  const isScanning = ref(false)
  const bluetoothState = ref<string>('unknown')
  const scanError = ref<string | null>(null)
  const connectionStatus = ref<{ [key: string]: ConnectionStatus }>({})
  const updateInterval = ref<number | null>(null)

  // Getters
  const connectedDevices = computed(() => 
    devices.value.filter(device => device.state === 'connected')
  )

  // Actions
  async function startScan() {
    try {
      scanError.value = null
      isScanning.value = true
      await bluetoothService.startScan()
    } catch (error) {
      scanError.value = (error as Error).message || 'Falha ao iniciar busca por dispositivos'
      isScanning.value = false
    }
  }

  async function stopScan() {
    try {
      await bluetoothService.stopScan()
      isScanning.value = false
    } catch (error) {
      console.error('Error stopping scan:', error)
    }
  }

  async function connectToDevice(deviceId: string) {
    try {
      connectionStatus.value[deviceId] = 'connecting'
      
      const device = devices.value.find(d => d.id === deviceId)
      if (!device) {
        throw new Error('Device not found')
      }
      
      await bluetoothService.connectToDevice(device)
      connectionStatus.value[deviceId] = 'connected'
      await updateDevicesList()
    } catch (error) {
      console.error(`Error connecting to device ${deviceId}:`, error)
      connectionStatus.value[deviceId] = 'failed'
      
      setTimeout(() => {
        connectionStatus.value[deviceId] = ''
      }, 3000)
    }
  }

  async function disconnectFromDevice(deviceId: string) {
    try {
      connectionStatus.value[deviceId] = 'disconnecting'
      
      const device = devices.value.find(d => d.id === deviceId)
      if (!device) {
        throw new Error('Device not found')
      }
      
      await bluetoothService.disconnectFromDevice(device)
      connectionStatus.value[deviceId] = ''
      await updateDevicesList()
    } catch (error) {
      console.error(`Error disconnecting from device ${deviceId}:`, error)
      connectionStatus.value[deviceId] = 'failed'
      
      setTimeout(() => {
        connectionStatus.value[deviceId] = ''
      }, 3000)
    }
  }

  async function updateDevicesList() {
    try {
      devices.value = await bluetoothService.getDevices()
      isScanning.value = bluetoothService.getIsScanning()
      bluetoothState.value = bluetoothService.getBluetoothState()
      
      // Update connection status based on device state
      devices.value.forEach(device => {
        if (device.state === 'connected') {
          connectionStatus.value[device.id] = 'connected'
        } else if (device.state === 'connecting') {
          connectionStatus.value[device.id] = 'connecting'
        } else if (device.state === 'disconnecting') {
          connectionStatus.value[device.id] = 'disconnecting'
        } else {
          // Only clear if not in a special state
          if (!['connecting', 'disconnecting', 'failed'].includes(connectionStatus.value[device.id] || '')) {
            connectionStatus.value[device.id] = ''
          }
        }
      })
    } catch (error) {
      console.error('Error updating devices list:', error)
    }
  }

  function startUpdatingDevices() {
    updateDevicesList()
    updateInterval.value = window.setInterval(() => {
      updateDevicesList()
    }, 1000)
  }

  function stopUpdatingDevices() {
    if (updateInterval.value !== null) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }

  function setupEventListeners() {
    bluetoothService.on('deviceStateChanged', (_device) => {
      updateDevicesList()
    })
  }

  function cleanup() {
    stopUpdatingDevices()
    stopScan()
  }

  return {
    // State
    devices,
    isScanning,
    bluetoothState,
    scanError,
    connectionStatus,
    // Getters
    connectedDevices,
    // Actions
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    updateDevicesList,
    startUpdatingDevices,
    stopUpdatingDevices,
    setupEventListeners,
    cleanup
  }
})