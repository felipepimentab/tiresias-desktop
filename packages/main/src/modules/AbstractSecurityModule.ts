import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';

/**
 * Abstract base class for implementing security rules in the application.
 * 
 * This class provides a foundation for creating security modules that apply
 * specific security rules to WebContents instances. It automatically hooks into
 * the 'web-contents-created' event to apply security rules to all created WebContents.
 */

export abstract class AbstractSecurityRule implements AppModule {
  /**
   * Enables the security rule by registering it with the application
   * 
   * This method sets up an event listener for the 'web-contents-created' event
   * and applies the security rule to each new WebContents instance that is created.
   * 
   * @param context - The module context containing the Electron app instance
   */
  enable({app}: ModuleContext): Promise<void> | void {
    app.on('web-contents-created', (_, contents) => this.applyRule(contents))
  }

  /**
   * Abstract method that must be implemented by concrete security rule classes
   * 
   * This method applies the specific security rule to a WebContents instance.
   * Each subclass must provide its own implementation of this method to define
   * the specific security behavior.
   * 
   * @param contents - The Electron WebContents instance to apply the rule to
   */
  abstract applyRule(contents: Electron.WebContents): Promise<void> | void;
}
