/**
 * Context provided to modules during initialization.
 * Contains references to Electron application components.
 */
export type ModuleContext = {
  /**
   * Reference to the Electron application instance.
   * Provides access to application lifecycle events and functionality.
   */
  readonly app: Electron.App;
}
