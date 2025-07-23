/**
 * Configuration for initializing the Electron application.
 * Defines the paths for preload scripts and renderer entry points.
 */
export type AppInitConfig = {
  /**
   * Configuration for the preload script.
   */
  preload: {
    /**
     * Path to the preload script file.
     */
    path: string;
  };

  /**
   * Configuration for the renderer process.
   * Can be either a file path or a URL object.
   */
  renderer:
    | {
        /**
         * Path to the renderer entry point file.
         */
        path: string;
      }
    | URL;
};
