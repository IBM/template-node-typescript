import {HelloWorldApi} from './hello-world.api';
import {Inject, Provides} from 'typescript-ioc';
import {ConsoleLoggerService, LoggerApi} from '../logger';

@Provides(HelloWorldApi)
export class HelloWorldService implements HelloWorldApi {
  logger: LoggerApi;

  constructor(
    @Inject
    logger: LoggerApi = new ConsoleLoggerService(),
  ) {
    this.logger = logger.child('HelloWorldService');
  }

  greeting(name: string = 'World'): string {
    this.logger.info(`Generating greeting for ${name}`);
    return `Hello, ${name}!`;
  }
}
