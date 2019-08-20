import {WorkerApi} from './worker.api';
import {Container, Inject, Provides, Singleton} from 'typescript-ioc';
import {LoggerApi} from '../logger';

export abstract class WorkerManager {
  abstract registerWorker(worker: WorkerApi): WorkerApi;
  abstract start(): Promise<any>;
  abstract stop(): Promise<any>;
  abstract workerCount(): number;
}

@Provides(WorkerManager)
class WorkerManagerImpl implements WorkerManager {
  @Inject
  _logger: LoggerApi;

  private workers: WorkerApi[] = [];

  get logger(): LoggerApi {
    return this._logger.child('WorkerManagerImpl');
  }

  registerWorker(worker: WorkerApi) {
    if (worker) {
      this.workers.push(worker);
    }

    return worker;
  }

  workerCount(): number {
    return this.workers.length;
  }

  async start(): Promise<any> {
    this.logger.info('starting workers');
    const promises: Promise<any>[] = this.workers.map(worker => worker.start());

    return Promise.all(promises).then(result => 'done');
  }

  async stop(): Promise<any> {
    this.logger.info('stopping workers');
    const promises: Promise<any>[] = this.workers.map(worker => worker.stop());

    return Promise.all(promises).then(result => 'done');

  }
}

export const workerManager: WorkerManager = Container.get(WorkerManager);
