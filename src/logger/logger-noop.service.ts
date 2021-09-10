import {LoggerApi} from './logger.api';

// tslint:disable
export class NoopLoggerService extends LoggerApi {

  log(message: string, context?: object): void {}
  info(message: string, context?: object): void {}
  debug(message: string, context?: object): void {}
  fatal(message: string, context?: object): void {}
  warn(message: string, context?: object): void {}
  error(message: string, context?: object): void {}
  trace(message: string, context?: object): void {}

  child(childName: string): LoggerApi {
    return this;
  }

  apply(app: { use: (app: any) => void }): void {
  }
}
