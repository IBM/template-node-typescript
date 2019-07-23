import {WorkerApi} from './worker.api';

export abstract class WorkerManager {
  abstract registerWorker(worker: WorkerApi): WorkerApi;
  abstract start(): Promise<any>;
  abstract stop(): Promise<any>;
}

class WorkerManagerImpl implements WorkerManager {
  private workers: WorkerApi[] = [];

  registerWorker(worker: WorkerApi) {
    this.workers.push(worker);

    return worker;
  }

  async start(): Promise<any> {
    console.log('starting workers')
    const promises: Promise<any>[] = this.workers.map(worker => worker.start());

    return Promise.all(promises).then(result => 'done');
  }

  async stop(): Promise<any> {
    const promises: Promise<any>[] = this.workers.map(worker => worker.stop());

    return Promise.all(promises).then(result => 'done');

  }
}

export const workerManager: WorkerManager = new WorkerManagerImpl();
