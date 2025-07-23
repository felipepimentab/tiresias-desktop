import {AppModule} from '../AppModule.js';
import {BrowserWindow, ipcMain} from 'electron';
import type {ModuleContext} from '../ModuleContext.js';
import noble, { type Peripheral, type Service } from '@abandonware/noble';

// Define device interface
interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  rssi: number;
  state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
  services: string[];
}

/**
 * Bluetooth Low Energy (BLE) module for Electron
 * Provides functionality to scan, connect, and interact with BLE devices
 */
export class BluetoothModule implements AppModule {
  private mainWindow: BrowserWindow | null = null;
  private devices: Map<string, BluetoothDevice> = new Map();
  private isScanning: boolean = false;

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
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }
  
  /**
   * Initialize noble and set up event handlers
   */
  private initializeNoble(): void {
    // Handle state change events
    noble.on('stateChange', (state: string) => {
      console.log(`Bluetooth adapter state: ${state}`);
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('bluetooth:stateChange', state);
      }
      
      // If adapter is powered on and we were scanning, restart the scan
      if (state === 'poweredOn' && this.isScanning) {
        this.startScanning();
      } else if (state !== 'poweredOn') {
        this.stopScanning();
      }
    });
    
    // Handle discovery events
    noble.on('discover', (peripheral: Peripheral) => {
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
      
      // Notify renderer of new device
      if (this.mainWindow) {
        this.mainWindow.webContents.send('bluetooth:deviceDiscovered', device);
      }
    });
  }
  
  /**
   * Start scanning for BLE devices
   */
  private startScanning(): void {
    if (noble.state === 'poweredOn') {
      // Start scanning for all devices
      noble.startScanning([], true);
      this.isScanning = true;
    }
  }
  
  /**
   * Stop scanning for BLE devices
   */
  private stopScanning(): void {
    noble.stopScanning();
    this.isScanning = false;
  }

  /**
   * Set up IPC handlers for Bluetooth operations
   */
  private setupIpcHandlers(): void {
    // Handler for starting BLE device scanning
    ipcMain.handle('bluetooth:startScan', async () => {
      try {
        if (noble.state !== 'poweredOn') {
          return { 
            success: false, 
            error: `Bluetooth adapter not ready (state: ${noble.state}). Please ensure Bluetooth is enabled on your system.` 
          };
        }
        
        // Clear existing devices
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
    ipcMain.handle('bluetooth:stopScan', async () => {
      try {
        this.stopScanning();
        return { success: true, message: 'Scanning stopped' };
      } catch (error) {
        console.error('Error stopping BLE scan:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Handler for getting discovered devices
    ipcMain.handle('bluetooth:getDevices', () => {
      return Array.from(this.devices.values());
    });

    // Handler for connecting to a BLE device
    ipcMain.handle('bluetooth:connect', async (_, deviceId) => {
      try {
        const peripheral = noble.peripherals[deviceId];
        
        if (!peripheral) {
          return { success: false, error: `Device ${deviceId} not found` };
        }
        
        // Update device state
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
    ipcMain.handle('bluetooth:disconnect', async (_, deviceId) => {
      try {
        const peripheral = noble.peripherals[deviceId];
        
        if (!peripheral) {
          return { success: false, error: `Device ${deviceId} not found` };
        }
        
        // Update device state
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
        
        // Update device state
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
 */
export function bluetoothModule() {
  return new BluetoothModule();
}