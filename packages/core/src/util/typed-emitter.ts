/**
 * Type-safe event emitter.
 *
 * https://www.npmjs.com/package/typed-emitter
 *
 * Use it like this:
 *
 * ```typescript
 * type MyEvents = {
 *   error: (error: Error) => void;
 *   message: (from: string, content: string) => void;
 * }
 *
 * const myEmitter = new EventEmitter() as TypedEmitter<MyEvents>;
 *
 * myEmitter.emit("error", "x")  // <- Will catch this type error;
 * ```
 */
export interface TypedEventEmitter<Events> {
  /** @hidden */
  addListener<E extends keyof Events>(event: E, listener: Events[E]): this;

  /** @hidden */
  on<E extends keyof Events>(event: E, listener: Events[E]): this;

  /** @hidden */
  once<E extends keyof Events>(event: E, listener: Events[E]): this;

  /** @hidden */
  off<E extends keyof Events>(event: E, listener: Events[E]): this;

  /** @hidden */
  removeAllListeners<E extends keyof Events>(event?: E): this;

  /** @hidden */
  removeListener<E extends keyof Events>(event: E, listener: Events[E]): this;

  /** @hidden */
  emit<E extends keyof Events>(event: E, ...args: Arguments<Events[E]>): boolean;

  /** @hidden */
  eventNames(): (keyof Events | string | symbol)[];

  /** @hidden */
  listeners<E extends keyof Events>(event: E): Function[];

  /** @hidden */
  listenerCount<E extends keyof Events>(event: E): number;
}

/** @hidden */
export type Arguments<T> = [T] extends [(...args: infer U) => any] ? U : [T] extends [void] ? [] : [T];
