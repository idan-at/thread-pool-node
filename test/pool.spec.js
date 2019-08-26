const chance = require("chance")();
const messages = require("./messages");
const createPool = require("..");

describe("Worker Threads Pool", () => {
  let pool;

  test("throws when given worker path does not exist", () => {
    expect(() =>
      createPool({
        workerPath: "./does-not-exist.js"
      })
    ).toThrow();
  });

  describe("run", () => {
    const multiplyFactor = chance.integer();

    beforeAll(() => {
      pool = createPool({
        workerPath: "./test/worker.js",
        workerOptions: {
          workerData: {
            multiplyFactor
          }
        },
        poolOptions: {
          min: 2,
          max: 2
        }
      });
    });
    afterAll(async () => {
      await pool.drain();
      await pool.clear();
    });

    test("runs given worker", async done => {
      const expectedResult = chance.string();
      const worker = await pool.acquire();

      worker.on("message", result => {
        expect(result).toEqual(expectedResult);
        pool.release(worker);
        done();
      });

      worker.postMessage({
        code: messages.ECHO,
        str: expectedResult
      });
    });

    test("passes worker options", async done => {
      const multiplyBy = chance.integer();
      const expectedResult = multiplyFactor * multiplyBy;
      const worker = await pool.acquire();

      worker.on("message", result => {
        expect(result).toEqual(expectedResult);
        pool.release(worker);
        done();
      });

      worker.postMessage({
        code: messages.MULTIPLY,
        multiplyBy
      });
    });

    test("passes pool options", () => {
      expect(pool.min).toBe(2);
      expect(pool.max).toBe(2);
    });

    // TODO: remove when https://github.com/coopernurse/node-pool/pull/268/ is merged.
    test("provides a way to wait until the pool is ready", async () => {
      await pool.ready();
      expect(pool.available).toBeGreaterThanOrEqual(2);
    });
  });
});
