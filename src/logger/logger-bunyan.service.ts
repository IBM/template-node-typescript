import {AutoWired, Provided, Provider, Provides, Singleton} from 'typescript-ioc';
import * as BunyanLogger from 'bunyan';
import * as PrettyStream from 'bunyan-prettystream';

import {LoggerApi} from './logger.api';

const pkg = require('../../package.json');

// tslint:disable
class ChildLogger extends LoggerApi {
  private static _children: {[name: string]: LoggerApi} = {};

  constructor(private logger: BunyanLogger) {
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
}

@Provides(LoggerApi)
@Singleton
export class BunyanLoggerService extends ChildLogger {
  constructor() {
    super(BunyanLoggerService.buildBunyanLogger());
  }

  static buildBunyanLogger() {
    const prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);

    return BunyanLogger.createLogger({
      name: `${pkg.name}@${pkg.version}`,
      streams: [
        {
          level:
            (process.env.LOG_LEVEL as BunyanLogger.LogLevelString) || 'info',
          stream: prettyStdOut,
          type: 'raw',
        },
      ],
    });
  }
}
