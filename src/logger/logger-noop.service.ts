import {LoggerApi} from './logger.api';

// tslint:disable
export class NoopLoggerService extends LoggerApi {

  debug(message: any, ...args: any): void {}

  info(message: any, ...args: any): void {}

  warn(message: any, ...args: any): void {}

  error(message: any, ...args: any): void {}

  log(message: any, ...args: any): void {}

  trace(message: any, ...args: any): void {}

  fatal(message: any, ...args: any): void {}

  child(childName: string): LoggerApi {
    return this;
  }
}
