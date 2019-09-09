# Thread Pool

[![npm version](https://badge.fury.io/js/thread-pool-node.svg)](https://badge.fury.io/js/thread-pool-node)
[![Build Status](https://travis-ci.org/idan-at/thread-pool-node.svg?branch=master)](https://travis-ci.org/idan-at/thread-pool-node)

A Thread pool for nodejs worker-threads, which is based on [generic-pool](https://www.npmjs.com/package/generic-pool).

It relies on the generic-pool infrastructure to handle the resources.
For info on how to configure the pool to meet your needs, follow the [generic-pool README](https://github.com/coopernurse/node-pool#readme)

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
