import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useBluetoothStore } from '../stores/bluetooth';

/**
 * Composable for managing Bluetooth devices and scanning functionality.
 * 
 * This composable provides reactive state and methods for:
 * - Scanning for Bluetooth devices
 * - Connecting to and disconnecting from devices
 * - Tracking device connection status
 * - Monitoring Bluetooth adapter state
 * 
 * Now uses Pinia store for state management instead of singleton service.
 * 
 * @returns An object containing reactive state and methods for Bluetooth device management
 */
export function useBluetoothDevices() {
  // Use the Pinia store for state management
  const bluetoothStore = useBluetoothStore();
  
  // Extract reactive refs from the store
  const {
    isScanning,
    devices,
    scanError,
    connectionStatus,
    bluetoothState,
    connectedDevices
  } = storeToRefs(bluetoothStore);

  // Setup on component mount
  onMounted(() => {
    // Setup event listeners and start periodic updates
    bluetoothStore.setupEventListeners();
    bluetoothStore.startUpdatingDevices();
  });

  // Cleanup on component unmount
  onUnmounted(() => {
    // Stop periodic updates and scanning
    bluetoothStore.stopUpdatingDevices();
    bluetoothStore.stopScan();
    // Note: We don't fully cleanup the store as it's shared across components
  });

  // Return the store's reactive state and methods
  return {
    // State (reactive refs from the store)
    isScanning,
    devices,
    scanError,
    connectionStatus,
    bluetoothState,
    
    // Computed properties
    connectedDevices,
    
    // Methods
    startScan: bluetoothStore.startScan,
    stopScan: bluetoothStore.stopScan,
    connectToDevice: bluetoothStore.connectToDevice,
    disconnectFromDevice: bluetoothStore.disconnectFromDevice,
    updateDevicesList: bluetoothStore.updateDevicesList
  };
}