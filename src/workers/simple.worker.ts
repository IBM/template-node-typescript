import Timeout = NodeJS.Timeout;
import {WorkerApi} from './worker.api';
import {workerManager} from './worker-manager';

class SimpleWorker implements WorkerApi {
  private promise: Promise<any>;
  private stopped = false;
  private interval: Timeout;

  async stop(): Promise<any> {
    this.stopped = true;
    console.log('*** Stopping simple worker');

    if (this.interval) {
      clearInterval(this.interval);
    }

    return Promise.resolve('stopped');
  }

  async start(): Promise<any> {
    if (this.promise) {
      return this.promise;
    }

    this.writeLog();

    return this.promise = new Promise<any>((resolve, reject) => {
      this.interval = setInterval(() => {
        if (this.stopped) {
          clearInterval(this.interval);
          resolve('stopped');
        }

        this.writeLog();
      }, 60 * 1000);
    });
  }

  writeLog() {
    console.log('**** Simple worker running');
  }
}

export const worker: WorkerApi = workerManager.registerWorker(new SimpleWorker());
