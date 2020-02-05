const path = require("path");
const fs = require("fs");
const { Worker } = require("worker_threads");
const genericPool = require("generic-pool");

module.exports = ({ workerPath, workerOptions, poolOptions }) => {
  const resolvedWorkerPath = path.resolve(workerPath);

  if (!fs.existsSync(resolvedWorkerPath)) {
    throw new Error(`Worker path ${resolvedWorkerPath} does not exist.`);
  }

  const pool = genericPool.createPool(
    {
      create: () => new Worker(workerPath, workerOptions),
      destroy: worker => worker.terminate()
    },
    poolOptions
  );

  // TODO: remove when https://github.com/coopernurse/node-pool/pull/268/ is merged.
  pool.ready = function ready() {
    return new this._Promise(resolve => {
      const isReady = () => {
        if (this.available >= this.min) {
          resolve();
        } else {
          setTimeout(isReady, 100);
        }
      };

      isReady();
    });
  };

  return pool;
};
