# PURRENT

Purrent is a simple lightweight typesafe concurrency limiter for asynchroneous functions wherever you need to control the concurrency of asynchronous operations, such as in web servers, background job processing, or any other scenario where you want to limit the number of simultaneous tasks running.

## Install

```sh
$ npm install purrent
```

## Usage

```ts
import { purrent, ConcurrencyOptions, LimiterFunction } from 'purrent';

// Define options
const options: ConcurrencyOptions<void> = {
    concurrency: 3, // Example concurrency value
    when: (...args: any[]) => true // Example 'when' function
};

// Create limiter function
const limiter: LimiterFunction<void> = purrent(options);

// Define an asynchronous function to be limited
const asyncFunction = async (arg: string) => {
    console.log(`Starting execution with argument: ${arg}`);
    // Simulate asynchronous operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Completed execution with argument: ${arg}`);
};

// Apply limiter to the asynchronous function
const limitedAsyncFunction = limiter(asyncFunction);

// Call the limited asynchronous function
limitedAsyncFunction('A');
limitedAsyncFunction('B');
limitedAsyncFunction('C');
limitedAsyncFunction('D');
```

## Concurrency Options
```ts
const options = {
    concurrency: 2,
    global: true,
    when: (...args: any[]) => args.length === 1, // Limit calls with only one argument
    promise: MyCustomPromise, // Assuming MyCustomPromise is a custom Promise implementation
    key: myCustomSymbol // Assuming myCustomSymbol is a custom Symbol for identifying the queue
};
```

## License
APACHE-2.0

