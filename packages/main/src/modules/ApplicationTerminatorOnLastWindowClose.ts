import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';

/**
 * Module that terminates the application when all windows are closed.
 * 
 * This module listens for the 'window-all-closed' event and quits the application
 * when it occurs. This behavior is useful for ensuring the application fully terminates
 * when the user closes all windows, which is the expected behavior on Windows and Linux.
 * (On macOS, applications typically continue running even when all windows are closed.)
 */

class ApplicationTerminatorOnLastWindowClose implements AppModule {
  /**
   * Enables the application termination behavior when all windows are closed
   * 
   * This method sets up an event listener for the 'window-all-closed' event
   * and quits the application when it occurs.
   * 
   * @param context - The module context containing the Electron app instance
   */
  enable({app}: ModuleContext): Promise<void> | void {
    app.on('window-all-closed', () => app.quit());
  }
}


/**
 * Factory function to create a new ApplicationTerminatorOnLastWindowClose module instance
 * 
 * This function provides a convenient way to create an instance of the
 * ApplicationTerminatorOnLastWindowClose module without directly using the class constructor.
 * 
 * @param args - Constructor parameters for the ApplicationTerminatorOnLastWindowClose class
 * @returns A new instance of the ApplicationTerminatorOnLastWindowClose module
 */
export function terminateAppOnLastWindowClose(...args: ConstructorParameters<typeof ApplicationTerminatorOnLastWindowClose>): ApplicationTerminatorOnLastWindowClose {
  return new ApplicationTerminatorOnLastWindowClose(...args);
}
