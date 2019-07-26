import {AutoWired, Singleton} from 'typescript-ioc';
import {GET, Path} from 'typescript-rest';

@AutoWired
@Singleton
@Path('/health')
export class Health {

  @GET
  async healthCheck(): Promise<string> {
    return 'OK';
  }
}
