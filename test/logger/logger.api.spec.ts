import {LoggerApi} from '../../src/logger';
import Mock = jest.Mock;

class MockLogger extends LoggerApi {
  log = jest.fn();
  info = jest.fn();
  debug = jest.fn();
  fatal = jest.fn();
  warn = jest.fn();
  error = jest.fn();
  trace = jest.fn();
  child = jest.fn();
}

describe('logger.api', () => {
  test('canary verifies test infrastructure', () => {
      expect(true).toEqual(true);
  });

  describe('given LoggerApi.time()', () => {
    context('when called', () => {
      test('then pass time data to info', async () => {
        const start = Date.now();
        const action = 'action';
        const duration = 500;

        await promiseTimeout(() => {return}, duration);

        const logger: LoggerApi = new MockLogger();
        logger.time(action, start);

        expect((logger.info as Mock).mock.calls[0][0].action).toEqual(action);
        expect((logger.info as Mock).mock.calls[0][0].duration).toBeGreaterThanOrEqual(duration);
      });
    });
  });
});

async function promiseTimeout<T>(fn: () => T, timeout: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn());
    }, timeout);
  });
}
