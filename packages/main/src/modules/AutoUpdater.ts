/**
 * @module AutoUpdater
 * 
 * A module responsible for managing application updates using electron-updater.
 * This module handles checking for updates, notifying users about available updates,
 * and managing the update process. It supports configurable logging and custom
 * download notifications.
 */
import {AppModule} from '../AppModule.js';
import electronUpdater, {type AppUpdater, type Logger} from 'electron-updater';

type DownloadNotification = Parameters<AppUpdater['checkForUpdatesAndNotify']>[0];

/**
 * Class responsible for managing automatic updates in the application.
 * Implements the AppModule interface to integrate with the application's module system.
 */
export class AutoUpdater implements AppModule {

  /**
   * Logger instance for update-related logging.
   * Can be null if logging is not required.
   */
  readonly #logger: Logger | null;
  
  /**
   * Configuration for download notifications shown to users when updates are available.
   */
  readonly #notification: DownloadNotification;

  /**
   * Creates a new instance of the AutoUpdater module.
   * 
   * @param options - Configuration options for the auto-updater
   * @param options.logger - Optional logger instance for update-related logging
   * @param options.downloadNotification - Optional configuration for download notifications
   */
  constructor(
    {
      logger = null,
      downloadNotification = undefined,
    }:
      {
        logger?: Logger | null | undefined,
        downloadNotification?: DownloadNotification
      } = {},
  ) {
    this.#logger = logger;
    this.#notification = downloadNotification;
  }

  /**
   * Enables the auto-updater module by initiating the update check process.
   * This method is called when the module is activated in the application.
   */
  async enable(): Promise<void> {
    await this.runAutoUpdater();
  }

  /**
   * Gets the autoUpdater instance from electron-updater.
   * Uses destructuring as a workaround for ESM compatibility issues.
   * 
   * @returns The autoUpdater instance
   */
  getAutoUpdater(): AppUpdater {
    // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
    // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
    const {autoUpdater} = electronUpdater;
    return autoUpdater;
  }

  /**
   * Configures and runs the auto-updater to check for updates and notify the user.
   * Sets up logging, changelog preferences, and distribution channel if specified.
   * 
   * @returns The result of checkForUpdatesAndNotify or null if no published versions are found
   * @throws Rethrows any errors that aren't related to "No published versions"
   */
  async runAutoUpdater() {
    const updater = this.getAutoUpdater();
    try {
      updater.logger = this.#logger || null;
      updater.fullChangelog = true;

      if (import.meta.env.VITE_DISTRIBUTION_CHANNEL) {
        updater.channel = import.meta.env.VITE_DISTRIBUTION_CHANNEL;
      }

      return await updater.checkForUpdatesAndNotify(this.#notification);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('No published versions')) {
          return null;
        }
      }

      throw error;
    }
  }
}

/**
 * Factory function to create a new AutoUpdater module instance.
 * 
 * @param args - Constructor parameters for the AutoUpdater class
 * @returns A new AutoUpdater instance
 */
export function autoUpdater(...args: ConstructorParameters<typeof AutoUpdater>) {
  return new AutoUpdater(...args);
}
