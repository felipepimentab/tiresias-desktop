import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import installer from 'electron-devtools-installer';

/**
 * Module for installing Chrome DevTools extensions in the Electron application.
 * 
 * This module provides functionality to install various browser developer tools extensions
 * such as React DevTools, Vue DevTools, Redux DevTools, and others. These extensions
 * enhance the development experience by providing specialized debugging tools.
 * 
 * The extensions are installed when the application starts in development mode,
 * making it easier to debug and inspect the application's state and components.
 */

/**
 * Extract extension identifiers and the installation function from the installer package
 */
const {
  REDUX_DEVTOOLS,
  VUEJS_DEVTOOLS,
  EMBER_INSPECTOR,
  BACKBONE_DEBUGGER,
  REACT_DEVELOPER_TOOLS,
  JQUERY_DEBUGGER,
  MOBX_DEVTOOLS,
  default: installExtension,
} = installer;

/**
 * Dictionary of available DevTools extensions that can be installed
 * 
 * This dictionary maps extension names to their corresponding identifiers,
 * making it easier to reference them by name when creating a module instance.
 */
const extensionsDictionary = {
  REDUX_DEVTOOLS,
  VUEJS_DEVTOOLS,
  EMBER_INSPECTOR,
  BACKBONE_DEBUGGER,
  REACT_DEVELOPER_TOOLS,
  JQUERY_DEBUGGER,
  MOBX_DEVTOOLS,
} as const;

/**
 * Module for installing a specific Chrome DevTools extension
 */
export class ChromeDevToolsExtension implements AppModule {
  /** The name of the extension to install */
  readonly #extension: keyof typeof extensionsDictionary;

  /**
   * Creates a new ChromeDevToolsExtension instance
   * 
   * @param options - Configuration options
   * @param options.extension - The name of the extension to install (must be a key in extensionsDictionary)
   */
  constructor({extension}: {readonly extension: keyof typeof extensionsDictionary}) {
    this.#extension = extension;
  }

  /**
   * Enables the module by installing the specified DevTools extension
   * 
   * This method waits for the app to be ready and then installs the specified
   * Chrome DevTools extension. The extension will be available for use in the
   * application's DevTools window.
   * 
   * @param context - The module context containing the Electron app instance
   */
  async enable({app}: ModuleContext): Promise<void> {
    // Wait for the app to be ready before installing extensions
    await app.whenReady();
    
    // Install the specified extension
    await installExtension(extensionsDictionary[this.#extension]);
  }
}

/**
 * Factory function to create a new ChromeDevToolsExtension module instance
 * 
 * This function provides a convenient way to create and configure a ChromeDevToolsExtension
 * instance without directly using the class constructor.
 * 
 * @param args - Constructor parameters for the ChromeDevToolsExtension class
 * @returns A new instance of the ChromeDevToolsExtension module
 */
export function chromeDevToolsExtension(...args: ConstructorParameters<typeof ChromeDevToolsExtension>): ChromeDevToolsExtension {
  return new ChromeDevToolsExtension(...args);
}
