import { ref, watch, onMounted, onUnmounted } from 'vue';
import { BluetoothService, type BluetoothDevice } from '../services/BluetoothService';

/**
 * Connection status types for Bluetooth devices
 */
type ConnectionStatus = '' | 'connecting' | 'connected' | 'disconnecting' | 'failed';

/**
 * Composable for managing Bluetooth devices and scanning functionality.
 * 
 * This composable provides reactive state and methods for:
 * - Scanning for Bluetooth devices
 * - Connecting to and disconnecting from devices
 * - Tracking device connection status
 * - Monitoring Bluetooth adapter state
 * 
 * @returns An object containing reactive state and methods for Bluetooth device management
 */
export function useBluetoothDevices() {
  // Initialize the Bluetooth service
  const bluetoothService = new BluetoothService();
  
  // Reactive state
  /** Indicates if device scanning is currently active */
  const isScanning = ref(false);
  /** List of discovered Bluetooth devices */
  const devices = ref<BluetoothDevice[]>([]);
  /** Error message from the last scan attempt, or null if no error */
  const scanError = ref<string | null>(null);
  /** Map of device IDs to their current connection status */
  const connectionStatus = ref<{ [key: string]: ConnectionStatus }>({});
  /** Current state of the Bluetooth adapter */
  const bluetoothState = ref<string>('unknown');
  /** Reference to the update interval timer */
  const updateInterval = ref<number | null>(null);

  /**
   * Starts scanning for nearby Bluetooth devices.
   * Clears any previous scan errors before starting.
   */
  async function startScan() {
    try {
      // Reset error state and set scanning flag
      scanError.value = null;
      isScanning.value = true;
      
      // Start the scan using the Bluetooth service
      await bluetoothService.startScan();
    } catch (error) {
      // Handle and display any errors that occur
      scanError.value = (error as Error).message || 'Falha ao iniciar busca por dispositivos';
      isScanning.value = false;
    }
  }

  /**
   * Stops the current device scanning process.
   */
  async function stopScan() {
    try {
      await bluetoothService.stopScan();
      isScanning.value = false;
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }

  /**
   * Initiates a connection to a Bluetooth device by its ID.
   * Updates the connection status during the process.
   * 
   * @param deviceId - The ID of the device to connect to
   */
  async function connectToDevice(deviceId: string) {
    try {
      // Update UI to show connecting status
      connectionStatus.value[deviceId] = 'connecting';
      
      // Find the device in the devices list
      const device = devices.value.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Attempt to connect to the device
      await bluetoothService.connectToDevice(device);
      
      // Update status on successful connection
      connectionStatus.value[deviceId] = 'connected';
      // Refresh the devices list to get updated state
      devices.value = await bluetoothService.getDevices();
    } catch (error) {
      // Handle connection failure
      console.error(`Error connecting to device ${deviceId}:`, error);
      connectionStatus.value[deviceId] = 'failed';
      
      // Clear the failed status after a delay
      setTimeout(() => {
        connectionStatus.value[deviceId] = '';
      }, 3000);
    }
  }

  /**
   * Disconnects from a connected Bluetooth device.
   * Updates the connection status during the process.
   * 
   * @param deviceId - The ID of the device to disconnect from
   */
  async function disconnectFromDevice(deviceId: string) {
    try {
      // Update UI to show disconnecting status
      connectionStatus.value[deviceId] = 'disconnecting';
      
      // Find the device in the devices list
      const device = devices.value.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Attempt to disconnect from the device
      await bluetoothService.disconnectFromDevice(device);
      
      // Clear connection status on successful disconnection
      connectionStatus.value[deviceId] = '';
      // Refresh the devices list to get updated state
      devices.value = await bluetoothService.getDevices();
    } catch (error) {
      // Handle disconnection failure
      console.error(`Error disconnecting from device ${deviceId}:`, error);
      connectionStatus.value[deviceId] = 'failed';
      
      // Clear the failed status after a delay
      setTimeout(() => {
        connectionStatus.value[deviceId] = '';
      }, 3000);
    }
  }

  /**
   * Updates the list of available devices and their states.
   * Also refreshes the scanning status and Bluetooth adapter state.
   */
  async function updateDevicesList() {
    try {
      // Get the latest devices from the Bluetooth service
      devices.value = await bluetoothService.getDevices();
      // Update scanning and Bluetooth state
      isScanning.value = bluetoothService.getIsScanning();
      bluetoothState.value = bluetoothService.getBluetoothState();
    } catch (error) {
      console.error('Error updating devices list:', error);
    }
  }

  /**
   * Starts periodic updates of the devices list.
   * Performs an initial update and then sets up an interval for regular updates.
   */
  function startUpdatingDevices() {
    // Initial update
    updateDevicesList();
    
    // Set interval for updates (every 1 second)
    updateInterval.value = window.setInterval(() => {
      updateDevicesList();
    }, 1000);
  }

  /**
   * Stops the periodic updates of the devices list.
   * Clears the interval timer if it exists.
   */
  function stopUpdatingDevices() {
    if (updateInterval.value !== null) {
      clearInterval(updateInterval.value);
      updateInterval.value = null;
    }
  }

  // Watch for changes in devices to update connection status
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
        if (!['connecting', 'disconnecting', 'failed'].includes(connectionStatus.value[device.id] || '')) {
          connectionStatus.value[device.id] = '';
        }
      }
    });
  });

  // Setup on component mount
  onMounted(() => {
    // Start periodic updates when the component is mounted
    startUpdatingDevices();
    
    // Listen for device state changes from the service
    bluetoothService.on('deviceStateChanged', (_device) => {
      // Trigger an immediate update when device state changes
      updateDevicesList();
    });
  });

  // Cleanup on component unmount
  onUnmounted(() => {
    // Stop periodic updates
    stopUpdatingDevices();
    // Stop any active scanning
    stopScan();
    // Clean up the Bluetooth service
    bluetoothService.cleanup();
  });

  // Return reactive state and methods
  return {
    // State
    isScanning,
    devices,
    scanError,
    connectionStatus,
    bluetoothState,
    
    // Methods
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    updateDevicesList
  };
}