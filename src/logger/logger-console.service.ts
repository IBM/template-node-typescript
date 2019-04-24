import {Singleton} from 'typescript-ioc';

import {LoggerApi} from './logger.api';

// tslint:disable
@Singleton
export class ConsoleLoggerService extends LoggerApi {
  private static _children: {[name: string]: LoggerApi} = {};

  readonly prefix: string = '';
  constructor(prefix: string = '') {
    super();
    this.prefix = prefix;
  }

  debug(message: any, ...args: any): void {
    console.log(message, args);
  }

  info(message: any, ...args: any): void {
    console.log(message, args);
  }

  warn(message: any, ...args: any): void {
    console.log(message, args);
  }

  error(message: any, ...args: any): void {
    console.error(message, args);
  }

  log(message: any, ...args: any): void {
    console.log(message, args);
  }

  trace(message: any, ...args: any): void {
    console.log(message, args);
  }

  fatal(message: any, ...args: any): void {
    console.error(message, args);
  }

  child(childName: string): LoggerApi {
    if (!childName) {
      return this;
    }

    const newPrefix = this.prefix ? `${this.prefix}:${childName}` : childName;
    if (ConsoleLoggerService._children[newPrefix]) {
      return ConsoleLoggerService._children[newPrefix];
    }

    return ConsoleLoggerService._children[newPrefix] = new ConsoleLoggerService(newPrefix);
  }
}
