'use strict';

type QueueKey = symbol;

const KEY: QueueKey = Symbol('purrent:queue');

const DEFAULT_WHEN: (...args: any[]) => boolean = () => true;

const NEW_PROMISE = <T>(handler: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T> => new Promise<T>(handler);
export { KEY };

export type ConcurrencyOptions<T> = {
  concurrency: number;
  global?: boolean;
  when?: (...args: any[]) => boolean;
  promise?: <T>(handler: (resolve: (value?: T | PromiseLike<T> | undefined) => void, reject: (reason?: any) => void) => void) => Promise<T>;
  key?: QueueKey;
};

export type LimiterFunction<T> = (fn: (...args: any[]) => Promise<T>) => (...args: any[]) => Promise<T>;

export const concurrency = <T>(options: ConcurrencyOptions<T>): LimiterFunction<T> => {
  if (typeof options === 'number') {
    options = {
      concurrency: options
    } as ConcurrencyOptions<T>;
  } else if (Object(options) !== options) {
    throw new TypeError('options must be an object or a number');
  }

  const {
    concurrency,
    global: useGlobalHost = false,
    when = DEFAULT_WHEN,
    promise: promiseFactory = NEW_PROMISE,
    key = KEY
  } = options;

  if (typeof concurrency !== 'number' || concurrency < 1) {
    throw new TypeError('concurrency must be a number from 1 and up');
  }

  const limiter: LimiterFunction<T> = fn => {
    function limited(this: any, ...args: any[]): Promise<any> {
      if (!when.apply(this, args)) {
        // Should not be limited
        return fn.apply(this, args) as Promise<any>;
      }

      const host: any = !!this && !useGlobalHost ? this : limiter;
      const info = host[key] || (host[key] = {
        size: 0,
        queue: []
      });

      const { queue } = info;

      const next = () => {
        info.size--;
        if (queue.length > 0) {
          queue.shift()!();
        }
      };

      return promiseFactory((resolve, reject) => {
        const run = () => {
          info.size++;
          fn.apply(this, args).then(
            value => {
              resolve(value);
              next();
            },
            err => {
              reject(err);
              next();
            }
          );
        };

        if (info.size < concurrency) {
          run();
        } else {
          queue.push(run);
        }
      });
    }

    return limited;
  };

  return limiter;
};
