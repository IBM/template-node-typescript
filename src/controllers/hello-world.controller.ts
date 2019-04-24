import {GET, Path, PathParam} from 'typescript-rest';
import {Inject} from 'typescript-ioc';
import {HelloWorldApi} from '../services';
import {ConsoleLoggerService, LoggerApi} from '../logger';

@Path('/hello')
export class HelloWorldController {

  logger: LoggerApi;

  constructor(
    @Inject
    private service: HelloWorldApi,
    @Inject
    logger: LoggerApi = new ConsoleLoggerService(),
  ) {
    this.logger = logger.child('HelloWorldController');
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
