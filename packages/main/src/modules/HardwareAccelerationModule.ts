import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';

/**
 * Module for controlling hardware acceleration in the application.
 * 
 * This module allows enabling or disabling hardware acceleration based on configuration.
 * Hardware acceleration uses the GPU to improve rendering performance but may cause
 * issues on some systems or with certain graphics drivers.
 * 
 * Disabling hardware acceleration can help resolve rendering issues, screen flickering,
 * or crashes related to GPU compatibility problems, at the cost of potentially reduced
 * performance and increased CPU usage.
 */

export class HardwareAccelerationModule implements AppModule {
  /** Flag indicating whether hardware acceleration should be disabled */
  readonly #shouldBeDisabled: boolean;

  /**
   * Creates a new HardwareAccelerationModule instance
   * 
   * @param options - Configuration options
   * @param options.enable - Whether hardware acceleration should be enabled (true) or disabled (false)
   */
  constructor({enable}: {enable: boolean}) {
    this.#shouldBeDisabled = !enable;
  }

  /**
   * Enables or disables hardware acceleration based on configuration
   * 
   * This method disables hardware acceleration if the module was configured to do so.
   * It must be called before the app is ready for the setting to take effect.
   * 
   * @param context - The module context containing the Electron app instance
   */
  enable({app}: ModuleContext): Promise<void> | void {
    if (this.#shouldBeDisabled) {
      app.disableHardwareAcceleration();
    }
  }
}

/**
 * Factory function to create a new HardwareAccelerationModule instance
 * 
 * This function provides a convenient way to create and configure a HardwareAccelerationModule
 * instance without directly using the class constructor.
 * 
 * @param args - Constructor parameters for the HardwareAccelerationModule class
 * @returns A new instance of the HardwareAccelerationModule
 */
export function hardwareAccelerationMode(...args: ConstructorParameters<typeof HardwareAccelerationModule>): HardwareAccelerationModule {
  return new HardwareAccelerationModule(...args);
}
