import {AppModule} from '../AppModule.js';
import {BrowserWindow, ipcMain} from 'electron';
import type {ModuleContext} from '../ModuleContext.js';
import noble, { type Peripheral, type Service } from '@abandonware/noble';

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * Interface representing a Bluetooth device with its properties and state
 */
interface BluetoothDevice {
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
 * Response format for IPC handler operations
 */
interface BluetoothResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Success message (only present when success is true) */
  message?: string;
  /** Error message (only present when success is false) */
  error?: string;
}

// -----------------------------------------------------------------------------
// Module Implementation
// -----------------------------------------------------------------------------

/**
 * Bluetooth Low Energy (BLE) module for Electron
 * 
 * This module provides functionality to scan, connect, and interact with BLE devices
 * using the Noble library. It handles device discovery, connection management,
 * and communication between the main and renderer processes via IPC.
 * 
 * Features:
 * - BLE device scanning and discovery
 * - Device connection management
 * - Service discovery
 * - IPC communication with renderer process
 * - Bluetooth adapter state monitoring
 */
export class BluetoothModule implements AppModule {
  /** Reference to the main application window for sending events */
  private mainWindow: BrowserWindow | null = null;
  
  /** Map of discovered devices by their ID */
  private devices: Map<string, BluetoothDevice> = new Map();
  
  /** Flag indicating if device scanning is currently active */
  private isScanning: boolean = false;

  /**
   * Initializes the Bluetooth module when the application starts
   * 
   * @param context - The module context containing the Electron app instance
   */
  async enable({app}: ModuleContext): Promise<void> {
    // Wait for app to be ready before setting up handlers
    await app.whenReady();
    
    // Initialize noble
    this.initializeNoble();
    
    // Set up IPC handlers for Bluetooth operations
    this.setupIpcHandlers();
  }

  /**
   * Sets the main window reference for UI updates
   * 
   * @param window - The main BrowserWindow instance
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }
  
  // -----------------------------------------------------------------------------
  // Noble Initialization and Event Handling
  // -----------------------------------------------------------------------------
  
  /**
   * Initializes the Noble BLE library and sets up event handlers
   * for state changes and device discovery
   */
  private initializeNoble(): void {
    // Handle Bluetooth adapter state change events
    noble.on('stateChange', (state: string) => {
      console.log(`Bluetooth adapter state: ${state}`);
      
      // Notify renderer process of state change
      if (this.mainWindow) {
        this.mainWindow.webContents.send('bluetooth:stateChange', state);
      }
      
      // Manage scanning based on adapter state
      if (state === 'poweredOn' && this.isScanning) {
        // Resume scanning if adapter becomes powered on and we were scanning
        this.startScanning();
      } else if (state !== 'poweredOn') {
        // Stop scanning if adapter is not powered on
        this.stopScanning();
      }
    });
    
    // Handle device discovery events
    noble.on('discover', (peripheral: Peripheral) => {
      // Create device object from peripheral data
      const device: BluetoothDevice = {
        id: peripheral.id,
        name: peripheral.advertisement.localName || 'Unknown Device',
        address: peripheral.address,
        rssi: peripheral.rssi,
        state: 'disconnected',
        services: peripheral.advertisement.serviceUuids || []
      };
      
      // Store device in our map
      this.devices.set(peripheral.id, device);
      
      // Notify renderer of new device discovery
      if (this.mainWindow) {
        this.mainWindow.webContents.send('bluetooth:deviceDiscovered', device);
      }
    });
  }
  
  /**
   * Starts scanning for BLE devices
   * Only works if the Bluetooth adapter is powered on
   */
  private startScanning(): void {
    if (noble.state === 'poweredOn') {
      // Start scanning for all devices (empty array means no service UUID filtering)
      // Second parameter 'true' enables duplicate detection
      noble.startScanning([], true);
      this.isScanning = true;
    }
  }
  
  /**
   * Stops scanning for BLE devices
   */
  private stopScanning(): void {
    noble.stopScanning();
    this.isScanning = false;
  }

  // -----------------------------------------------------------------------------
  // IPC Handlers Setup
  // -----------------------------------------------------------------------------
  
  /**
   * Sets up IPC handlers for Bluetooth operations requested by the renderer process
   * 
   * Handlers include:
   * - bluetooth:startScan - Start scanning for devices
   * - bluetooth:stopScan - Stop scanning for devices
   * - bluetooth:getDevices - Get list of discovered devices
   * - bluetooth:connect - Connect to a specific device
   * - bluetooth:disconnect - Disconnect from a device
   */
  private setupIpcHandlers(): void {
    // Handler for starting BLE device scanning
    ipcMain.handle('bluetooth:startScan', async (): Promise<BluetoothResponse> => {
      try {
        // Check if Bluetooth adapter is ready
        if (noble.state !== 'poweredOn') {
          return { 
            success: false, 
            error: `Bluetooth adapter not ready (state: ${noble.state}). Please ensure Bluetooth is enabled on your system.` 
          };
        }
        
        // Clear existing devices before starting new scan
        this.devices.clear();
        
        // Start scanning
        this.startScanning();
        
        return { success: true, message: 'Scanning started' };
      } catch (error) {
        console.error('Error starting BLE scan:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Handler for stopping BLE device scanning
    ipcMain.handle('bluetooth:stopScan', async (): Promise<BluetoothResponse> => {
      try {
        this.stopScanning();
        return { success: true, message: 'Scanning stopped' };
      } catch (error) {
        console.error('Error stopping BLE scan:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Handler for getting discovered devices
    ipcMain.handle('bluetooth:getDevices', (): BluetoothDevice[] => {
      return Array.from(this.devices.values());
    });

    // Handler for connecting to a BLE device
    ipcMain.handle('bluetooth:connect', async (_, deviceId: string): Promise<BluetoothResponse> => {
      try {
        const peripheral = noble.peripherals[deviceId];
        
        // Check if device exists
        if (!peripheral) {
          return { success: false, error: `Device ${deviceId} not found` };
        }
        
        // Update device state to connecting
        const device = this.devices.get(deviceId);
        if (device) {
          device.state = 'connecting';
          
          // Notify renderer of state change
          if (this.mainWindow) {
            this.mainWindow.webContents.send('bluetooth:deviceUpdated', device);
          }
        }
        
        // Connect to the peripheral
        await new Promise<void>((resolve, reject) => {
          peripheral.connect((error: Error | null) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
        
        // Discover services
        await new Promise<void>((resolve, reject) => {
          peripheral.discoverServices([], (error: Error | null, services: Service[]) => {
            if (error) {
              reject(error);
            } else {
              // Update device with discovered services
              if (device) {
                device.state = 'connected';
                device.services = services.map((s: Service) => s.uuid);
                
                // Notify renderer of state change
                if (this.mainWindow) {
                  this.mainWindow.webContents.send('bluetooth:deviceUpdated', device);
                }
              }
              resolve();
            }
          });
        });
        
        return { success: true, message: `Connected to device ${deviceId}` };
      } catch (error) {
        console.error(`Error connecting to device ${deviceId}:`, error);
        
        // Update device state on error
        const device = this.devices.get(deviceId);
        if (device) {
          device.state = 'disconnected';
          
          // Notify renderer of state change
          if (this.mainWindow) {
            this.mainWindow.webContents.send('bluetooth:deviceUpdated', device);
          }
        }
        
        return { success: false, error: (error as Error).message };
      }
    });

    // Handler for disconnecting from a BLE device
    ipcMain.handle('bluetooth:disconnect', async (_, deviceId: string): Promise<BluetoothResponse> => {
      try {
        const peripheral = noble.peripherals[deviceId];
        
        // Check if device exists
        if (!peripheral) {
          return { success: false, error: `Device ${deviceId} not found` };
        }
        
        // Update device state to disconnecting
        const device = this.devices.get(deviceId);
        if (device) {
          device.state = 'disconnecting';
          
          // Notify renderer of state change
          if (this.mainWindow) {
            this.mainWindow.webContents.send('bluetooth:deviceUpdated', device);
          }
        }
        
        // Disconnect from the peripheral
        await new Promise<void>((resolve, reject) => {
          peripheral.disconnect((error: Error | null) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
        
        // Update device state to disconnected
        if (device) {
          device.state = 'disconnected';
          
          // Notify renderer of state change
          if (this.mainWindow) {
            this.mainWindow.webContents.send('bluetooth:deviceUpdated', device);
          }
        }
        
        return { success: true, message: `Disconnected from device ${deviceId}` };
      } catch (error) {
        console.error(`Error disconnecting from device ${deviceId}:`, error);
        return { success: false, error: (error as Error).message };
      }
    });
  }
}

/**
 * Factory function to create a new BluetoothModule instance
 * 
 * @returns A new instance of the BluetoothModule
 */
export function bluetoothModule(): BluetoothModule {
  return new BluetoothModule();
}