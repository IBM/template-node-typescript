import {Container, Inject, Singleton} from 'typescript-ioc';
import Timeout = NodeJS.Timeout;

import {WorkerApi} from './worker.api';
import {workerManager} from './worker-manager';
import {LoggerApi} from '../logger';
import {SimpleWorkerConfig} from '../config/simple-worker.config';
import {Observable, of, Subject} from 'rxjs';

export class SimpleWorker implements WorkerApi {
  @Inject
  private config: SimpleWorkerConfig;
  @Inject
  private _logger: LoggerApi;

  private subject: Subject<any>;
  private stopped = false;
  private interval: Timeout;

  get logger(): LoggerApi {
    return this._logger.child('SimpleWorker');
  }

  stop(): Observable<any> {
    this.stopped = true;
    this.logger.info('*** Stopping simple worker');

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.subject) {
      this.subject.complete();
    }

    return this.subject || of();
  }

  start(): Observable<any> {
    if (this.subject) {
      return this.subject;
    }

    this.subject = new Subject<any>();

    this.subject.next(this.writeLog());

    this.interval = setInterval(() => {
      this.subject.next(this.writeLog());
    }, this.config.runInterval);

    return this.subject;
  }

  writeLog(): string {
    const message = '**** Simple worker running';
    this.logger.info(message);
    return message;
  }
}

export const worker: WorkerApi = workerManager.registerWorker(Container.get(SimpleWorker));
