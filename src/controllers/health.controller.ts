import {AutoWired, Singleton} from 'typescript-ioc';
import {GET, Path,Accept,ContextAccept} from 'typescript-rest';

@AutoWired
@Singleton
@Path('/health')
export class HealthController {

  @GET
  async healthCheck(): Promise<{status: string;}> {
    return {
      status: 'UP'
    };
  }
}
