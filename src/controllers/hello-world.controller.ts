import {GET, Path, PathParam} from 'typescript-rest';
import {AutoWired, Inject, Singleton} from 'typescript-ioc';
import {HelloWorldApi} from '../services';
import {LoggerApi} from '../logger';

@AutoWired
@Singleton
@Path('/hello')
export class HelloWorldController {

  @Inject
  service: HelloWorldApi;
  @Inject
  _baseLogger: LoggerApi;

  get logger() {
    return this._baseLogger.child('HelloWorldController');
  }

  @GET
  async sayHelloToUnknownUser(): Promise<string> {
    this.logger.info('Saying hello to someone');
    return this.service.greeting();
  }

  @Path(':name')
  @GET
  async sayHello(@PathParam('name') name: string): Promise<string> {
    this.logger.info(`Saying hello to ${name}`);
    return this.service.greeting(name);
  }
}
