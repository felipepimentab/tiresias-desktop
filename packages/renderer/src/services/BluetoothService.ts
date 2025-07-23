/**
 * Bluetooth Service
 * 
 * Provides an interface for interacting with Bluetooth devices
 * using the exposed preload API and native Bluetooth capabilities
 */

// Access the exposed bluetooth API from preload
// Use a safe access pattern to ensure the API is available
const bluetooth = (window as any)[btoa('bluetooth')] || {
  on: () => () => {}, // Return a no-op function as unsubscribe
  startScan: () => Promise.resolve(),
  stopScan: () => Promise.resolve(),
  getDevices: () => Promise.resolve([]),
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve()
};

// Define device interface
export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  rssi: number;
  state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
  services: string[];
}

/**
 * Service for managing Bluetooth operations
 */
export class BluetoothService {
  private devices: Map<string, BluetoothDevice> = new Map();
  private isScanning = false;
  private bluetoothState: string = 'unknown';
  private eventListeners: Map<string, ((data: unknown) => void)[]> = new Map();
  // Remove an event listener
  off(event: string, listener: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  // Event handler setup
  constructor() {
    // Set up event listeners for Bluetooth events
    bluetooth.on('stateChange', (state: string) => {
      this.bluetoothState = state;
    });
    
    bluetooth.on('deviceDiscovered', (device: BluetoothDevice) => {
      this.devices.set(device.id, device);
      this.notifyListeners('deviceDiscovered', device);
    });
    
    bluetooth.on('deviceUpdated', (device: BluetoothDevice) => {
      this.devices.set(device.id, device);
      this.notifyListeners('deviceUpdated', device);
    });
  }
  
  // Notify all listeners of an event
  private notifyListeners(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
  
  // Add an event listener
  on(event: string, listener: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }
  
  // Start scanning for devices
  async startScan(): Promise<void> {
    // Clear existing devices when starting a new scan
    this.devices.clear();
    this.isScanning = true;
    
    try {
      await bluetooth.startScan();
    } catch (error) {
      console.error('Error starting scan:', error);
      this.isScanning = false;
      throw error;
    }
  }
  
  /**
   * Stop scanning for Bluetooth devices
   */
  async stopScan(): Promise<void> {
    try {
      await bluetooth.stopScan();
      this.isScanning = false;
    } catch (error) {
      console.error('Error stopping scan:', error);
      throw error;
    }
  }
  
  // Connect to a device
  async connectToDevice(device: BluetoothDevice): Promise<void> {
    try {
      // Update device state to connecting
      const existingDevice = this.devices.get(device.id);
      if (existingDevice) {
        existingDevice.state = 'connecting';
        this.devices.set(device.id, existingDevice);
      }
      
      // Call the main process to connect
      await bluetooth.connect(device.id);
      
      // Update device state to connected
      if (existingDevice) {
        existingDevice.state = 'connected';
        this.devices.set(device.id, existingDevice);
      }
    } catch (error) {
      console.error(`Error connecting to device ${device.id}:`, error);
      
      // Reset device state on error
      const existingDevice = this.devices.get(device.id);
      if (existingDevice) {
        existingDevice.state = 'disconnected';
        this.devices.set(device.id, existingDevice);
      }
      
      throw error;
    }
  }
  
  // Disconnect from a device
  async disconnectFromDevice(device: BluetoothDevice): Promise<void> {
    try {
      // Update device state to disconnecting
      const existingDevice = this.devices.get(device.id);
      if (existingDevice) {
        existingDevice.state = 'disconnecting';
        this.devices.set(device.id, existingDevice);
      }
      
      // Call the main process to disconnect
      await bluetooth.disconnect(device.id);
      
      // Update device state to disconnected
      if (existingDevice) {
        existingDevice.state = 'disconnected';
        this.devices.set(device.id, existingDevice);
      }
    } catch (error) {
      console.error(`Error disconnecting from device ${device.id}:`, error);
      throw error;
    }
  }
  
  // Get all discovered devices
  async getDevices(): Promise<BluetoothDevice[]> {
    try {
      // Fetch devices from main process
      const mainProcessDevices = await bluetooth.getDevices();
      
      // Update local device map with any new devices
      if (mainProcessDevices && Array.isArray(mainProcessDevices)) {
        mainProcessDevices.forEach((device: BluetoothDevice) => {
          // Preserve connection state if we already have this device
          const existingDevice = this.devices.get(device.id);
          if (existingDevice) {
            device.state = existingDevice.state;
          }
          this.devices.set(device.id, device);
        });
      }
      
      return Array.from(this.devices.values());
    } catch (error) {
      console.error('Error getting devices:', error);
      return Array.from(this.devices.values());
    }
  }
  
  /**
   * Check if currently scanning
   */
  getIsScanning(): boolean {
    return this.isScanning;
  }
  
  /**
   * Get the current Bluetooth adapter state
   */
  getBluetoothState(): string {
    return this.bluetoothState;
  }
  
  /**
   * Check if a device is connected
   */
  isDeviceConnected(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    return device?.state === 'connected';
  }
  
  /**
   * Clean up event listeners
   */
  cleanup(): void {
    // Clear all event listeners
    this.eventListeners.clear();
  }
}

// Create and export a singleton instance
export const bluetoothService = new BluetoothService();