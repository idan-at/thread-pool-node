# Thread Pool

[![npm version](https://badge.fury.io/js/thread-pool-node.svg)](https://badge.fury.io/js/thread-pool-node)
[![Build Status](https://travis-ci.org/idan-at/thread-pool-node.svg?branch=master)](https://travis-ci.org/idan-at/thread-pool-node)

A Thread pool for nodejs [worker-threads](https://nodejs.org/api/worker_threads.html). It relies on the [generic-pool](https://www.npmjs.com/package/generic-pool) library to handle the resource management.

## Install
`npm install thread-pool-node`

or with yarn:

`yarn add thread-pool-node`

## Usage Example
```js
// index.js
const createPool = require('thread-pool-node')

const pool = createPool({
  workerPath: './path/to/worker.js',
  workerOptions: {
    workerData: {
      magicNumber: 42
    }
  },
  poolOptions: { // passed to generic-pool
    min: 2,
    max: 4
  }
})

const worker = await pool.acquire();
const onMessage = result => {
  // do something with the result
  console.log({ result });

  // release back to thread pool
  pool.release(worker);
  worker.removeListener("message", onMessage);
};

worker.on("message", onMessage);
worker.postMessage(args);
```

```js
// worker.js
const { parentPort, workerData } = require("worker_threads");

parentPort.on("message", message => {
  parentPort.postMessage(aCPUBoundTask(workerData.magicNumber))
});
```

## Pool Basic API
- `createPool`: Creates a new worker-threads pool according to the given [pool options](https://github.com/coopernurse/node-pool#createpool)
- `async Pool#acquire` - Returns a new ready to be used worker from the pool.
- `async Pool#release` - Releases the worker back to the pool.

For info on how to configure the pool to meet your needs, and more useful pool APIs, see [generic-pool](https://github.com/coopernurse/node-pool#readme)
