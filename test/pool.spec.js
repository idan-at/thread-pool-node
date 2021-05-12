const chance = require("chance")();
const messages = require("./messages");
const createPool = require("..");

describe("Worker Threads Pool", () => {
  let pool;

  test("throws when given worker path does not exist", () => {
    expect(() =>
      createPool({
        workerPath: "./does-not-exist.js",
      })
    ).toThrow(/Worker path .+ does not exist/);
  });

  describe("run", () => {
    const multiplyFactor = chance.integer();

    beforeAll(() => {
      pool = createPool({
        workerPath: "./test/worker.js",
        workerOptions: {
          workerData: {
            multiplyFactor,
          },
        },
        poolOptions: {
          min: 2,
          max: 2,
        },
      });
    });
    afterAll(async () => {
      await pool.drain();
      await pool.clear();
    });

    // eslint-disable-next-line jest/no-done-callback
    test("runs given worker", async (done) => {
      const expectedResult = chance.string();
      const worker = await pool.acquire();

      worker.on("message", (result) => {
        expect(result).toEqual(expectedResult);
        pool.release(worker);
        done();
      });

      worker.postMessage({
        code: messages.ECHO,
        str: expectedResult,
      });
    });

    // eslint-disable-next-line jest/no-done-callback
    test("passes worker options", async (done) => {
      const multiplyBy = chance.integer();
      const expectedResult = multiplyFactor * multiplyBy;
      const worker = await pool.acquire();

      worker.on("message", (result) => {
        expect(result).toEqual(expectedResult);
        pool.release(worker);
        done();
      });

      worker.postMessage({
        code: messages.MULTIPLY,
        multiplyBy,
      });
    });

    test("passes pool options", () => {
      expect(pool.min).toBe(2);
      expect(pool.max).toBe(2);
    });
  });
});
