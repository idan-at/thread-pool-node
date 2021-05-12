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
      destroy: (worker) => worker.terminate(),
    },
    poolOptions
  );

  return pool;
};
