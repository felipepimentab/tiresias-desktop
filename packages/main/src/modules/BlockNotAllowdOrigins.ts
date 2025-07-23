import {AbstractSecurityRule} from './AbstractSecurityModule.js';
import * as Electron from 'electron';
import {URL} from 'node:url';

/**
 * Block navigation to origins not on the allowlist.
 *
 * Navigation exploits are quite common. If an attacker can convince the app to navigate away from its current page,
 * they can possibly force the app to open arbitrary web resources/websites on the web.
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
 */
export class BlockNotAllowedOrigins extends AbstractSecurityRule {
  /**
   * Set of allowed origins that the application can navigate to.
   * Any navigation attempt to origins not in this set will be blocked.
   */
  readonly #allowedOrigins: Set<string>;

  /**
   * Creates a new instance of the BlockNotAllowedOrigins security rule.
   * 
   * @param allowedOrigins - Set of origins (e.g., 'https://example.com') that are allowed for navigation
   */
  constructor(allowedOrigins: Set<string> = new Set) {
    super();
    this.#allowedOrigins = structuredClone(allowedOrigins)
  }

  /**
   * Applies the security rule to the given WebContents instance.
   * 
   * This method sets up an event listener for the 'will-navigate' event and prevents
   * navigation to any origin not in the allowed origins set. In development mode,
   * it also logs a warning when navigation to a disallowed origin is blocked.
   * 
   * @param contents - The Electron WebContents instance to apply the rule to
   */
  applyRule(contents: Electron.WebContents): Promise<void> | void {

    contents.on('will-navigate', (event, url) => {
      const {origin} = new URL(url);
      if (this.#allowedOrigins.has(origin)) {
        return;
      }

      // Prevent navigation
      event.preventDefault();

      if (import.meta.env.DEV) {
        console.warn(`Blocked navigating to disallowed origin: ${origin}`);
      }
    });
  }
}

/**
 * Factory function to create a new BlockNotAllowedOrigins security rule instance.
 * 
 * This function provides a convenient way to create an instance of the
 * BlockNotAllowedOrigins security rule without directly using the class constructor.
 * 
 * @param args - Constructor parameters for the BlockNotAllowedOrigins class
 * @returns A new instance of the BlockNotAllowedOrigins security rule
 */
export function allowInternalOrigins(...args: ConstructorParameters<typeof BlockNotAllowedOrigins>): BlockNotAllowedOrigins {
  return new BlockNotAllowedOrigins(...args);
}
