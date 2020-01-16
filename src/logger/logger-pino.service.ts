import {Provides, Singleton} from 'typescript-ioc';
import * as pino from 'pino';
import * as expressPino from 'express-pino-logger';

import {LoggerApi} from './logger.api';

// tslint:disable
class ChildLogger extends LoggerApi {
  private static _children: {[name: string]: LoggerApi} = {};

  constructor(private logger: pino.Logger) {
    super();
  }

  error(message: any, ...args: any): void {
    this.logger.error(message, ...args);
  }

  log(message: any, ...args: any): void {
    this.info(message, ...args);
  }

  debug(message: any, ...args: any): void {
    this.logger.debug(message, ...args);
  }

  info(message: any, ...args: any): void {
    this.logger.info(message, ...args);
  }

  warn(message: any, ...args: any): void {
    this.logger.warn(message, ...args);
  }

  fatal(message: any, ...args: any): void {
    this.logger.fatal(message, ...args);
  }

  trace(message: any, ...args: any): void {
    this.logger.trace(message, ...args);
  }

  child(component: string): LoggerApi {
    if (ChildLogger._children[component]) {
      return ChildLogger._children[component];
    }

    return ChildLogger._children[component] = new ChildLogger(this.logger.child({component}));
  }

  apply(app: { use: (app: any) => void }): void {
    app.use(expressPino());
  }
}

@Provides(LoggerApi)
@Singleton
export class PinoLoggerService extends ChildLogger {
  constructor() {
    super(PinoLoggerService.buildLogger());
  }

  static buildLogger() {
    return pino();
  }
}
