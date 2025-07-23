/**
 * Type definitions for @abandonware/noble
 * 
 * This module provides TypeScript type definitions for the Noble Bluetooth Low Energy (BLE) library.
 * Noble is a Node.js BLE central module that allows for discovery, connection, and interaction with BLE peripherals.
 */
declare module '@abandonware/noble' {
  /**
   * Represents a discovered BLE peripheral device
   * 
   * A peripheral is a remote BLE device that can be connected to and interacted with.
   * It contains information about the device's identity, advertisement data, and methods
   * for connection and service discovery.
   */
  export interface Peripheral {
    /** Unique identifier for the peripheral */
    id: string;
    /** MAC address or other platform-specific address format */
    address: string;
    /** Address type (e.g., 'public', 'random') */
    addressType: string;
    /** Whether the peripheral is connectable */
    connectable: boolean;
    /** Advertisement data broadcast by the peripheral */
    advertisement: {
      /** Optional local name advertised by the device */
      localName?: string;
      /** Optional transmit power level in dBm */
      txPowerLevel?: number;
      /** Optional list of service UUIDs advertised by the device */
      serviceUuids?: string[];
      /** Optional manufacturer-specific data */
      manufacturerData?: Buffer;
      /** Optional service data */
      serviceData?: {
        /** Service UUID */
        uuid: string;
        /** Service-specific data */
        data: Buffer;
      }[];
    };
    /** Signal strength in dBm (more negative = weaker signal) */
    rssi: number;
    /** Services discovered on the peripheral (only available after service discovery) */
    services?: Service[];
    /** Current connection state of the peripheral */
    state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
    /**
     * Connect to the peripheral
     * @param callback - Function called when connection completes or fails
     */
    connect: (callback: (error: Error | null) => void) => void;
    /**
     * Disconnect from the peripheral
     * @param callback - Function called when disconnection completes or fails
     */
    disconnect: (callback: (error: Error | null) => void) => void;
    /**
     * Discover services offered by the peripheral
     * @param serviceUuids - Array of service UUIDs to discover (empty array for all)
     * @param callback - Function called with discovered services or error
     */
    discoverServices: (serviceUuids: string[], callback: (error: Error | null, services: Service[]) => void) => void;
  }

  /**
   * Represents a BLE service discovered on a peripheral
   * 
   * A service is a collection of characteristics and relationships to other services
   * that encapsulate the behavior of part of a device.
   */
  export interface Service {
    /** UUID of the service */
    uuid: string;
    /** Human-readable name of the service (if available) */
    name: string;
    /** Service type (e.g., 'primary', 'secondary') */
    type: string;
    /** UUIDs of other services included by this service */
    includedServiceUuids: string[];
    /** Characteristics discovered within this service */
    characteristics: Characteristic[];
    /**
     * Discover characteristics within this service
     * @param characteristicUuids - Array of characteristic UUIDs to discover (empty array for all)
     * @param callback - Function called with discovered characteristics or error
     */
    discoverCharacteristics: (characteristicUuids: string[], callback: (error: Error | null, characteristics: Characteristic[]) => void) => void;
  }

  /**
   * Represents a BLE characteristic within a service
   * 
   * A characteristic contains a single value and any number of descriptors that
   * describe the value. Characteristics support operations like read, write, notify, etc.
   */
  export interface Characteristic {
    /** UUID of the characteristic */
    uuid: string;
    /** Human-readable name of the characteristic (if available) */
    name: string;
    /** Characteristic type */
    type: string;
    /** Supported properties (e.g., 'read', 'write', 'notify') */
    properties: string[];
    /** Descriptors discovered for this characteristic */
    descriptors: Descriptor[];
    /**
     * Read the characteristic's value
     * @param callback - Function called with the read data or error
     */
    read: (callback: (error: Error | null, data: Buffer) => void) => void;
    /**
     * Write a value to the characteristic
     * @param data - Data to write
     * @param withoutResponse - Whether to write without waiting for a response
     * @param callback - Function called when write completes or fails
     */
    write: (data: Buffer, withoutResponse: boolean, callback: (error: Error | null) => void) => void;
    /**
     * Enable or disable broadcasting of the characteristic's value
     * @param broadcast - Whether to enable (true) or disable (false) broadcasting
     * @param callback - Function called when operation completes or fails
     */
    broadcast: (broadcast: boolean, callback: (error: Error | null) => void) => void;
    /**
     * Enable or disable notifications/indications for the characteristic's value
     * @param notify - Whether to enable (true) or disable (false) notifications
     * @param callback - Function called when operation completes or fails
     */
    notify: (notify: boolean, callback: (error: Error | null) => void) => void;
    /**
     * Discover descriptors for this characteristic
     * @param callback - Function called with discovered descriptors or error
     */
    discoverDescriptors: (callback: (error: Error | null, descriptors: Descriptor[]) => void) => void;
    /**
     * Register a listener for characteristic value updates (notifications/indications)
     * @param event - Event name ('data' for value updates)
     * @param listener - Function called when the characteristic value changes
     */
    on(event: string, listener: (data: Buffer, isNotification: boolean) => void): void;
    /**
     * Remove a previously registered listener
     * @param event - Event name
     * @param listener - Function to remove
     */
    removeListener(event: string, listener: Function): void;
  }

  /**
   * Represents a BLE descriptor within a characteristic
   * 
   * A descriptor provides additional information about a characteristic's value
   * or how the characteristic can be accessed.
   */
  export interface Descriptor {
    /** UUID of the descriptor */
    uuid: string;
    /** Human-readable name of the descriptor (if available) */
    name: string;
    /** Descriptor type */
    type: string;
    /**
     * Read the descriptor's value
     * @param callback - Function called with the read data or error
     */
    readValue: (callback: (error: Error | null, data: Buffer) => void) => void;
    /**
     * Write a value to the descriptor
     * @param data - Data to write
     * @param callback - Function called when write completes or fails
     */
    writeValue: (data: Buffer, callback: (error: Error | null) => void) => void;
  }

  /**
   * Main Noble BLE interface
   * 
   * Provides methods for scanning, discovering peripherals, and managing the BLE adapter state.
   */
  export interface Noble {
    /**
     * Register an event listener
     * @param event - 'stateChange' event for adapter state changes
     * @param listener - Function called when the adapter state changes
     */
    on(event: 'stateChange', listener: (state: string) => void): void;
    /**
     * Register an event listener
     * @param event - 'discover' event for peripheral discovery
     * @param listener - Function called when a peripheral is discovered
     */
    on(event: 'discover', listener: (peripheral: Peripheral) => void): void;
    /**
     * Start scanning for BLE peripherals
     * @param serviceUuids - Optional array of service UUIDs to filter by
     * @param allowDuplicates - Whether to report the same peripheral multiple times
     */
    startScanning(serviceUuids?: string[], allowDuplicates?: boolean): void;
    /** Stop scanning for BLE peripherals */
    stopScanning(): void;
    /** Map of discovered peripherals by UUID */
    peripherals: { [uuid: string]: Peripheral };
    /** Current state of the BLE adapter (e.g., 'poweredOn', 'poweredOff') */
    state: string;
  }

  /** The Noble instance */
  const noble: Noble;
  export default noble;
}