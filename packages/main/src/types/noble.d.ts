declare module '@abandonware/noble' {
  export interface Peripheral {
    id: string;
    address: string;
    addressType: string;
    connectable: boolean;
    advertisement: {
      localName?: string;
      txPowerLevel?: number;
      serviceUuids?: string[];
      manufacturerData?: Buffer;
      serviceData?: {
        uuid: string;
        data: Buffer;
      }[];
    };
    rssi: number;
    services?: Service[];
    state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
    connect: (callback: (error: Error | null) => void) => void;
    disconnect: (callback: (error: Error | null) => void) => void;
    discoverServices: (serviceUuids: string[], callback: (error: Error | null, services: Service[]) => void) => void;
  }

  export interface Service {
    uuid: string;
    name: string;
    type: string;
    includedServiceUuids: string[];
    characteristics: Characteristic[];
    discoverCharacteristics: (characteristicUuids: string[], callback: (error: Error | null, characteristics: Characteristic[]) => void) => void;
  }

  export interface Characteristic {
    uuid: string;
    name: string;
    type: string;
    properties: string[];
    descriptors: Descriptor[];
    read: (callback: (error: Error | null, data: Buffer) => void) => void;
    write: (data: Buffer, withoutResponse: boolean, callback: (error: Error | null) => void) => void;
    broadcast: (broadcast: boolean, callback: (error: Error | null) => void) => void;
    notify: (notify: boolean, callback: (error: Error | null) => void) => void;
    discoverDescriptors: (callback: (error: Error | null, descriptors: Descriptor[]) => void) => void;
    on(event: string, listener: (data: Buffer, isNotification: boolean) => void): void;
    removeListener(event: string, listener: Function): void;
  }

  export interface Descriptor {
    uuid: string;
    name: string;
    type: string;
    readValue: (callback: (error: Error | null, data: Buffer) => void) => void;
    writeValue: (data: Buffer, callback: (error: Error | null) => void) => void;
  }

  export interface Noble {
    on(event: 'stateChange', listener: (state: string) => void): void;
    on(event: 'discover', listener: (peripheral: Peripheral) => void): void;
    startScanning(serviceUuids?: string[], allowDuplicates?: boolean): void;
    stopScanning(): void;
    peripherals: { [uuid: string]: Peripheral };
    state: string;
  }

  const noble: Noble;
  export default noble;
}