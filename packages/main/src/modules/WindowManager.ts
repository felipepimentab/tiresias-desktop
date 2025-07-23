import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow} from 'electron';
import type {AppInitConfig} from '../AppInitConfig.js';

/**
 * Module responsible for managing application windows.
 * 
 * This module handles window creation, restoration, and lifecycle management.
 * It ensures proper window behavior when the application is activated or receives
 * a second instance request.
 */

class WindowManager implements AppModule {
  /** Path to the preload script for the window */
  readonly #preload: {path: string};
  
  /** Path or URL to the renderer content */
  readonly #renderer: {path: string} | URL;
  
  /** Flag to determine if DevTools should be opened automatically */
  readonly #openDevTools: boolean;

  /**
   * Creates a new WindowManager instance
   * 
   * @param options - Configuration options
   * @param options.initConfig - Application initialization configuration
   * @param options.openDevTools - Whether to automatically open DevTools when creating windows (default: false)
   */
  constructor({initConfig, openDevTools = false}: {initConfig: AppInitConfig, openDevTools?: boolean}) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
  }

  /**
   * Enables the window management functionality
   * 
   * This method sets up event listeners for application lifecycle events and creates
   * the initial application window. It handles:
   * - Creating the initial window when the app is ready
   * - Restoring the window when a second instance of the app is launched
   * - Restoring the window when the app is activated (macOS behavior)
   * 
   * @param context - The module context containing the Electron app instance
   */
  async enable({app}: ModuleContext): Promise<void> {
    // Wait for the app to be ready before creating windows
    await app.whenReady();
    
    // Create the initial window
    await this.restoreOrCreateWindow(true);
    
    // Handle second instance (when user tries to launch another instance of the app)
    app.on('second-instance', () => this.restoreOrCreateWindow(true));
    
    // Handle activation (macOS dock click when app is running)
    app.on('activate', () => this.restoreOrCreateWindow(true));
  }

  /**
   * Creates a new application window with the configured settings
   * 
   * This method creates a new BrowserWindow instance with appropriate security settings
   * and loads the renderer content (either from a URL or a local file).
   * 
   * @returns A promise that resolves to the created BrowserWindow instance
   */
  async createWindow(): Promise<BrowserWindow> {
    // Create a new browser window with appropriate settings
    const browserWindow = new BrowserWindow({
      // Don't show the window until it's ready to prevent flickering
      show: false, 
      
      // Window size constraints and defaults
      minWidth: 1000,
      minHeight: 800,
      width: 1920,
      height: 1080,
      center: true,
      
      // Security-focused web preferences
      webPreferences: {
        // Disable Node.js integration in renderer process for security
        nodeIntegration: false,
        
        // Enable context isolation for security
        contextIsolation: true,
        
        // Sandbox is disabled because the preload script requires Node.js API access
        // TODO: Consider enabling sandbox and adapting preload script if possible
        sandbox: false, 
        
        // Disable webview tag for security reasons
        // See: https://www.electronjs.org/docs/latest/api/webview-tag#warning
        webviewTag: false, 
        
        // Path to the preload script that provides the renderer with necessary APIs
        preload: this.#preload.path,
      },
    });

    // Load content into the window based on renderer configuration
    if (this.#renderer instanceof URL) {
      // Load from remote URL
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      // Load from local file
      await browserWindow.loadFile(this.#renderer.path);
    }

    return browserWindow;
  }

  /**
   * Restores an existing window or creates a new one if none exists
   * 
   * This method checks if there's an existing window that can be restored.
   * If not, it creates a new window. It also handles window visibility,
   * restoration from minimized state, and DevTools opening based on configuration.
   * 
   * @param show - Whether to show the window after restoring/creating (default: false)
   * @returns A promise that resolves to the restored or created BrowserWindow instance
   */
  async restoreOrCreateWindow(show = false): Promise<BrowserWindow> {
    // Try to find an existing window that isn't destroyed
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    // If no existing window is found, create a new one
    if (window === undefined) {
      window = await this.createWindow();
    }

    // If show flag is false, just return the window without showing it
    if (!show) {
      return window;
    }

    // Restore the window if it's minimized
    if (window.isMinimized()) {
      window.restore();
    }

    // Make the window visible
    window?.show();

    // Open DevTools if configured to do so
    if (this.#openDevTools) {
      window?.webContents.openDevTools();
    }

    // Bring the window to the front
    window.focus();

    return window;
  }

}

/**
 * Factory function to create a new WindowManager module instance
 * 
 * This function provides a convenient way to create and configure a WindowManager
 * instance without directly using the class constructor.
 * 
 * @param args - Constructor parameters for the WindowManager class
 * @returns A new instance of the WindowManager module
 */
export function createWindowManagerModule(...args: ConstructorParameters<typeof WindowManager>): WindowManager {
  return new WindowManager(...args);
}
