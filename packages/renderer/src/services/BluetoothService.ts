/**
 * Bluetooth Service Module
 * 
 * This module provides a comprehensive interface for interacting with Bluetooth devices
 * using the exposed preload API and native Bluetooth capabilities. It handles device discovery,
 * connection management, state tracking, and event dispatching.
 *
 * The service acts as a bridge between the renderer process and the main process Bluetooth
 * functionality, providing a reactive and type-safe interface for Vue components.
 */

// -----------------------------------------------------------------------------
// Safe access to the exposed Bluetooth API from preload
// -----------------------------------------------------------------------------

/**
 * Access the exposed bluetooth API from preload script
 * The API is exposed via contextBridge with base64 encoded key for security
 * If the API is unavailable, fallback implementations prevent runtime errors
 */
const bluetooth = (window as any)[btoa('bluetooth')] || {
  // Provide fallback implementations to prevent runtime errors if API is unavailable
  on: () => () => {}, // Return a no-op function as unsubscribe handler
  startScan: () => Promise.resolve(),
  stopScan: () => Promise.resolve(),
  getDevices: () => Promise.resolve([]),
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve()
};

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * Interface representing a Bluetooth device with its properties and state
 */
export interface BluetoothDevice {
  /** Unique identifier for the device */
  id: string;
  /** Human-readable name of the device (may be empty for some devices) */
  name: string;
  /** MAC address or other platform-specific address format */
  address: string;
  /** Signal strength in dBm (more negative = weaker signal) */
  rssi: number;
  /** Current connection state of the device */
  state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
  /** Available services provided by the device (UUIDs) */
  services: string[];
}

/**
 * Type for event listener functions
 */
type EventListener = (data: unknown) => void;

// -----------------------------------------------------------------------------
// Bluetooth Service Implementation
// -----------------------------------------------------------------------------

/**
 * Service for managing Bluetooth operations including device discovery,
 * connection management, and state tracking.
 * 
 * Features:
 * - Device scanning and discovery
 * - Connection management
 * - State tracking and synchronization
 * - Event-based communication
 */
export class BluetoothService {
  /** Map of discovered devices by their ID */
  private devices: Map<string, BluetoothDevice> = new Map();
  
  /** Flag indicating if device scanning is currently active */
  private isScanning = false;
  
  /** Current state of the Bluetooth adapter */
  private bluetoothState: string = 'unknown';
  
  /** Map of event listeners by event name */
  private eventListeners: Map<string, EventListener[]> = new Map();

  /**
   * Creates a new BluetoothService instance and sets up event listeners
   * for Bluetooth state changes and device events.
   */
  constructor() {
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for Bluetooth events from the main process
   * @private
   */
  private setupEventListeners(): void {
    // Listen for Bluetooth adapter state changes
    bluetooth.on('stateChange', (state: string) => {
      this.bluetoothState = state;
      this.notifyListeners('stateChange', state);
    });
    
    // Listen for new device discoveries
    bluetooth.on('deviceDiscovered', (device: BluetoothDevice) => {
      this.devices.set(device.id, device);
      this.notifyListeners('deviceDiscovered', device);
    });
    
    // Listen for updates to existing devices
    bluetooth.on('deviceUpdated', (device: BluetoothDevice) => {
      this.devices.set(device.id, device);
      this.notifyListeners('deviceUpdated', device);
      this.notifyListeners('deviceStateChanged', device);
    });
  }
  
  // -----------------------------------------------------------------------------
  // Event Management Methods
  // -----------------------------------------------------------------------------
  
  /**
   * Registers an event listener for a specific Bluetooth event
   * 
   * Available events:
   * - 'stateChange': Fired when Bluetooth adapter state changes
   * - 'deviceDiscovered': Fired when a new device is found
   * - 'deviceUpdated': Fired when a device's properties are updated
   * - 'deviceStateChanged': Fired when a device's connection state changes
   * 
   * @param event - The event name to listen for
   * @param listener - Callback function to execute when the event occurs
   */
  on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  /**
   * Removes a previously registered event listener
   * 
   * @param event - The event name to remove the listener from
   * @param listener - The listener function to remove
   */
  off(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Notifies all registered listeners of an event
   * 
   * @param event - The event name that occurred
   * @param data - Data associated with the event
   * @private
   */
  private notifyListeners(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
  
  // -----------------------------------------------------------------------------
  // Device Scanning Methods
  // -----------------------------------------------------------------------------
  
  /**
   * Starts scanning for nearby Bluetooth devices
   * Clears existing device list before starting a new scan
   * 
   * @throws Will throw an error if scanning fails to start
   */
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
   * Stops the current device scanning process
   * 
   * @throws Will throw an error if scanning fails to stop
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
  
  // -----------------------------------------------------------------------------
  // Device Connection Methods
  // -----------------------------------------------------------------------------
  
  /**
   * Initiates a connection to the specified Bluetooth device
   * Updates the device state and notifies listeners of state changes
   * 
   * @param device - The device to connect to
   * @throws Will throw an error if connection fails
   */
  async connectToDevice(device: BluetoothDevice): Promise<void> {
    try {
      // Update device state to connecting
      const existingDevice = this.devices.get(device.id);
      if (existingDevice) {
        existingDevice.state = 'connecting';
        this.devices.set(device.id, existingDevice);
        this.notifyListeners('deviceStateChanged', existingDevice);
      }
      
      // Call the main process to connect
      await bluetooth.connect(device.id);
      
      // Update device state to connected
      if (existingDevice) {
        existingDevice.state = 'connected';
        this.devices.set(device.id, existingDevice);
        this.notifyListeners('deviceStateChanged', existingDevice);
      }
    } catch (error) {
      console.error(`Error connecting to device ${device.id}:`, error);
      
      // Reset device state on error
      const existingDevice = this.devices.get(device.id);
      if (existingDevice) {
        existingDevice.state = 'disconnected';
        this.devices.set(device.id, existingDevice);
        this.notifyListeners('deviceStateChanged', existingDevice);
      }
      
      throw error;
    }
  }
  
  /**
   * Disconnects from a connected Bluetooth device
   * Updates the device state and notifies listeners of state changes
   * 
   * @param device - The device to disconnect from
   * @throws Will throw an error if disconnection fails
   */
  async disconnectFromDevice(device: BluetoothDevice): Promise<void> {
    try {
      // Update device state to disconnecting
      const existingDevice = this.devices.get(device.id);
      if (existingDevice) {
        existingDevice.state = 'disconnecting';
        this.devices.set(device.id, existingDevice);
        this.notifyListeners('deviceStateChanged', existingDevice);
      }
      
      // Call the main process to disconnect
      await bluetooth.disconnect(device.id);
      
      // Update device state to disconnected
      if (existingDevice) {
        existingDevice.state = 'disconnected';
        this.devices.set(device.id, existingDevice);
        this.notifyListeners('deviceStateChanged', existingDevice);
      }
    } catch (error) {
      console.error(`Error disconnecting from device ${device.id}:`, error);
      throw error;
    }
  }
  
  // -----------------------------------------------------------------------------
  // Device Information Methods
  // -----------------------------------------------------------------------------
  
  /**
   * Retrieves the current list of discovered Bluetooth devices
   * Merges devices from the main process with locally tracked devices
   * to ensure state consistency
   * 
   * @returns Array of discovered Bluetooth devices
   */
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
   * Checks if device scanning is currently active
   * 
   * @returns True if currently scanning for devices, false otherwise
   */
  getIsScanning(): boolean {
    return this.isScanning;
  }
  
  /**
   * Gets the current state of the Bluetooth adapter
   * 
   * Possible states include:
   * - 'unknown': Initial state or state could not be determined
   * - 'poweredOff': Bluetooth adapter is powered off
   * - 'poweredOn': Bluetooth adapter is powered on and ready
   * - 'unauthorized': App is not authorized to use Bluetooth
   * - 'unsupported': Device does not support Bluetooth
   * - 'resetting': Bluetooth adapter is resetting
   * 
   * @returns The current Bluetooth adapter state
   */
  getBluetoothState(): string {
    return this.bluetoothState;
  }
  
  /**
   * Checks if a specific device is currently connected
   * 
   * @param deviceId - The ID of the device to check
   * @returns True if the device is connected, false otherwise
   */
  isDeviceConnected(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    return device?.state === 'connected';
  }
  
  /**
   * Cleans up resources used by this service
   * Should be called when the service is no longer needed
   * (typically in component unmount lifecycle hooks)
   */
  cleanup(): void {
    // Clear all event listeners
    this.eventListeners.clear();
  }
}

// Create and export a singleton instance for use throughout the application
export const bluetoothService = new BluetoothService();