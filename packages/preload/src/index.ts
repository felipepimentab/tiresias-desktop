import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

/**
 * Bluetooth API for renderer process
 */
const bluetooth = {
  /**
   * Start scanning for BLE devices
   */
  startScan: () => ipcRenderer.invoke('bluetooth:startScan'),
  
  /**
   * Stop scanning for BLE devices
   */
  stopScan: () => ipcRenderer.invoke('bluetooth:stopScan'),
  
  /**
   * Get all discovered devices
   */
  getDevices: () => ipcRenderer.invoke('bluetooth:getDevices'),
  
  /**
   * Connect to a BLE device
   * @param deviceId - The ID of the device to connect to
   */
  connect: (deviceId: string) => ipcRenderer.invoke('bluetooth:connect', deviceId),
  
  /**
   * Disconnect from a BLE device
   * @param deviceId - The ID of the device to disconnect from
   */
  disconnect: (deviceId: string) => ipcRenderer.invoke('bluetooth:disconnect', deviceId),
  
  /**
   * Listen for Bluetooth events
   * @param event - The event to listen for
   * @param callback - The callback to execute when the event is triggered
   */
  on: (event: string, callback: (...args: unknown[]) => void) => {
    const validEvents = ['stateChange', 'deviceDiscovered', 'deviceUpdated'];
    
    if (!validEvents.includes(event)) {
      console.error(`Invalid Bluetooth event: ${event}. Valid events are: ${validEvents.join(', ')}`);
      return () => {}; // Return empty function as unsubscribe
    }
    
    const channel = `bluetooth:${event}`;
    
    // Create event listener
    const listener = (_: unknown, ...args: unknown[]) => callback(...args);
    
    // Add event listener
    ipcRenderer.on(channel, listener);
    
    // Return function to remove event listener
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },
};

export {sha256sum, versions, send, bluetooth};
