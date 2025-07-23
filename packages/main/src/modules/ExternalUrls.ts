import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {shell} from 'electron';
import {URL} from 'node:url';

/**
 * Module for handling external URL navigation requests.
 * 
 * This module intercepts attempts to open external URLs from within the application
 * and controls which external origins are allowed to be opened in the system's default browser.
 * URLs from origins not in the allowed list will be blocked for security reasons.
 * 
 * This is an important security measure to prevent malicious websites from being opened
 * through the application, which could potentially lead to phishing attacks or other security issues.
 */

export class ExternalUrls implements AppModule {
  /** Set of allowed external URL origins that can be opened in the system browser */
  readonly #externalUrls: Set<string>;

  /**
   * Creates a new ExternalUrls instance
   * 
   * @param externalUrls - Set of allowed external URL origins (e.g., 'https://example.com')
   */
  constructor(externalUrls: Set<string>) {
    this.#externalUrls = externalUrls;
  }

  /**
   * Enables the external URL handling functionality
   * 
   * This method sets up event listeners to intercept attempts to open new windows
   * or navigate to external URLs. It allows opening URLs from approved origins in
   * the system's default browser while blocking URLs from unapproved origins.
   * 
   * @param context - The module context containing the Electron app instance
   */
  enable({app}: ModuleContext): Promise<void> | void {
    app.on('web-contents-created', (_, contents) => {
      // Set up a handler for window.open() and other new window creation attempts
      contents.setWindowOpenHandler(({url}) => {
        // Extract the origin from the URL
        const {origin} = new URL(url);

        // Check if the origin is in our allowed list
        if (this.#externalUrls.has(origin)) {
          // Open allowed URLs in the system's default browser
          shell.openExternal(url).catch(console.error);
        } else if (import.meta.env.DEV) {
          // Log blocked URLs in development mode
          console.warn(`Blocked the opening of a disallowed external origin: ${origin}`);
        }

        // Always prevent creating a new Electron window, regardless of whether
        // the URL was opened externally or blocked
        return {action: 'deny'};
      });
    });
  }
}


/**
 * Factory function to create a new ExternalUrls module instance
 * 
 * This function provides a convenient way to create and configure an ExternalUrls
 * instance without directly using the class constructor.
 * 
 * @param args - Constructor parameters for the ExternalUrls class
 * @returns A new instance of the ExternalUrls module
 */
export function allowExternalUrls(...args: ConstructorParameters<typeof ExternalUrls>): ExternalUrls {
  return new ExternalUrls(...args);
}
