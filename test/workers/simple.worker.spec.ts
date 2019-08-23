import {Container} from 'typescript-ioc';
import {SimpleWorker} from '../../src/workers';
import {SimpleWorkerConfig} from '../../src/config/simple-worker.config';
import Mock = jest.Mock;
import {LoggerApi, NoopLoggerService} from '../../src/logger';

describe('simple.worker', () => {
  test('canary verifies test infrastructure', () => {
      expect(true).toEqual(true);
  });

  describe('given SimpleWorker', () => {
    let worker: SimpleWorker;
    let writeLogMock: Mock;
    beforeEach(() => {
      Container
        .bind(SimpleWorkerConfig)
        .provider({get: () => ({runInterval: 500})});
      Container
        .bind(LoggerApi)
        .to(NoopLoggerService);

      worker = Container.get(SimpleWorker);

      writeLogMock = worker.writeLog = jest.fn();
    });

    afterEach(() => {
      return worker.stop();
    });

    context('when started', () => {
      test('then run until stopped', async () => {
        const observable = worker.start();

        await promiseTimeout(() => {return}, 600);

        await worker.stop().toPromise();

        await observable.toPromise();
        expect(writeLogMock).toHaveBeenCalledTimes(2);
      });

      context('and when start() called again', () => {
        test('then should return same observable', async () => {
          const observable = worker.start();

          expect(worker.start()).toBe(observable);

          await worker.stop().toPromise();
        });
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
