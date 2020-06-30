import * as pino from 'pino';
import * as expressPino from 'express-pino-logger';

import {LoggerApi} from './logger.api';
import {getNamespace} from 'cls-hooked';
import {TraceConstants} from '../util/opentracing/trace-constants';

// tslint:disable
class ChildLogger extends LoggerApi {
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
    const clsNamespace = getNamespace(TraceConstants.NAMESPACE);

    const traceContext = clsNamespace ? clsNamespace.get(TraceConstants.TRACE_CONTEXT) : {};

    return new ChildLogger(this.logger.child(
      Object.assign({component}, traceContext)));
  }

  apply(app: { use: (app: any) => void }): void {
    app.use(expressPino());
  }
}

export class PinoLoggerService extends ChildLogger {
  constructor() {
    super(PinoLoggerService.buildLogger());
  }

  static buildLogger() {
    return pino();
  }
}
