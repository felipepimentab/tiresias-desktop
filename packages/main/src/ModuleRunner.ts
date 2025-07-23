import {AppModule} from './AppModule.js';
import {ModuleContext} from './ModuleContext.js';
import {app} from 'electron';

/**
 * Manages the initialization and execution of application modules.
 * Implements PromiseLike to allow awaiting all module initializations.
 */
class ModuleRunner implements PromiseLike<void> {
  /**
   * Promise that resolves when all modules have been initialized.
   */
  #promise: Promise<void>;

  /**
   * Creates a new ModuleRunner instance with an initial resolved promise.
   */
  constructor() {
    this.#promise = Promise.resolve();
  }

  /**
   * Implementation of the PromiseLike interface.
   * Allows awaiting the completion of all module initializations.
   * 
   * @param onfulfilled - Callback executed when all modules are initialized successfully
   * @param onrejected - Callback executed when any module initialization fails
   * @returns A promise that resolves when all modules are initialized
   */
  then<TResult1 = void, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): PromiseLike<TResult1 | TResult2> {
        return this.#promise.then(onfulfilled, onrejected);
    }

  /**
   * Initializes a module by calling its enable method with the module context.
   * Chains module initialization promises to ensure sequential execution.
   * 
   * @param module - The module to initialize
   * @returns This ModuleRunner instance for method chaining
   */
  init(module: AppModule) {
    const p = module.enable(this.#createModuleContext());

    if (p instanceof Promise) {
      this.#promise = this.#promise.then(() => p);
    }

    return this;
  }

  /**
   * Creates a module context with application references.
   * 
   * @returns A ModuleContext instance with the Electron app reference
   */
  #createModuleContext(): ModuleContext {
    return {
      app,
    };
  }
}

/**
 * Factory function to create a new ModuleRunner instance.
 * 
 * @returns A new ModuleRunner instance
 */
export function createModuleRunner() {
  return new ModuleRunner();
}
