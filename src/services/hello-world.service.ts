import {HelloWorldApi} from './hello-world.api';
import {Inject, Singleton} from 'typescript-ioc';
import {LoggerApi} from '../logger';

@Singleton
export class HelloWorldService implements HelloWorldApi {
  logger: LoggerApi;

  constructor(
    @Inject
    logger: LoggerApi,
  ) {
    this.logger = logger.child('HelloWorldService');
  }

  async greeting(name: string = 'World'): Promise<string> {
    this.logger.info(`Generating greeting for ${name}`);
    return `Hello, ${name}!`;
  }
}
