import {Container} from 'typescript-ioc';
import Mock = jest.Mock;

import {WorkerManager} from '../../src/workers';
import {WorkerApi} from '../../src/workers/worker.api';
import {LoggerApi, NoopLoggerService} from '../../src/logger';

describe('worker-manager', () => {
  test('canary verifies test infrastructure', () => {
    expect(true).toEqual(true);
  });

  describe('given WorkerManagerImpl', () => {
    let classUnderTest: WorkerManager;
    let mockWorkerApi: WorkerApi;

    beforeEach(() => {
      Container.bind(LoggerApi).to(NoopLoggerService);

      classUnderTest = Container.get(WorkerManager);

      mockWorkerApi = {
        start: jest.fn(),
        stop: jest.fn()
      };
    });

    describe('given registerWorker()', () => {
      test('when called with defined worker then increase worker count', () => {
        classUnderTest.registerWorker(mockWorkerApi);

        expect(classUnderTest.workerCount()).toEqual(1);
      });

      test('when worker is undefined then do not increment worker count', () => {
        classUnderTest.registerWorker(undefined);

        expect(classUnderTest.workerCount()).toEqual(0);
      });
    });

    describe('given start()', () => {
      beforeEach(() => {
        classUnderTest.registerWorker(mockWorkerApi);

        (mockWorkerApi.start as Mock).mockResolvedValue('test');
      });

      test('when called then call WorkerApi start', async () => {

        await classUnderTest.start();

        expect(mockWorkerApi.start).toHaveBeenCalled();
      });
    });

    describe('given stop()', () => {
      beforeEach(() => {
        classUnderTest.registerWorker(mockWorkerApi);

        (mockWorkerApi.stop as Mock).mockResolvedValue('test');
      });

      test('when called then call WorkerApi stop', async () => {

        await classUnderTest.stop();

        expect(mockWorkerApi.stop).toHaveBeenCalled();
      });
    });
  });
});
