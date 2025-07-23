import {AppModule} from '../AppModule.js';
import * as Electron from 'electron';

/**
 * Module that ensures only a single instance of the application can run at a time.
 * 
 * This module uses Electron's single instance lock mechanism to prevent multiple
 * instances of the application from running simultaneously. If a second instance
 * is launched, this module will terminate it immediately.
 * 
 * This is useful for applications that should only have one running instance,
 * such as those that manage specific system resources or maintain a persistent state.
 */

class SingleInstanceApp implements AppModule {
  /**
   * Enables the single instance lock mechanism
   * 
   * This method attempts to acquire a single instance lock for the application.
   * If the lock cannot be acquired (meaning another instance is already running),
   * it quits the current instance and exits the process.
   * 
   * @param context - The module context containing the Electron app instance
   */
  enable({app}: {app: Electron.App}): void {
    // Try to acquire the single instance lock
    const isSingleInstance = app.requestSingleInstanceLock();
    
    // If we couldn't get the lock, another instance is already running
    if (!isSingleInstance) {
      // Quit this instance
      app.quit();
      process.exit(0);
    }
  }
}


/**
 * Factory function to create a new SingleInstanceApp module instance
 * 
 * This function provides a convenient way to create an instance of the
 * SingleInstanceApp module without directly using the class constructor.
 * 
 * @param args - Constructor parameters for the SingleInstanceApp class
 * @returns A new instance of the SingleInstanceApp module
 */
export function disallowMultipleAppInstance(...args: ConstructorParameters<typeof SingleInstanceApp>): SingleInstanceApp {
  return new SingleInstanceApp(...args);
}
