import type {ModuleContext} from './ModuleContext.js';

/**
 * Interface for application modules that can be initialized and enabled.
 * Each module represents a specific functionality of the application.
 */
export interface AppModule {
  /**
   * Enables the module with the provided context.
   * This method is called during application initialization.
   * 
   * @param context - The module context containing application references
   * @returns A Promise that resolves when the module is enabled, or void if synchronous
   */
  enable(context: ModuleContext): Promise<void>|void;
}
