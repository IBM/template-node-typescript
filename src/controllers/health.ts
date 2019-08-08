import {AutoWired, Singleton} from 'typescript-ioc';
import {GET, Path,Accept,ContextAccept} from 'typescript-rest';

@AutoWired
@Singleton
@Path('/health')
export class Health {

  @GET
  async healthCheck(): Promise<string> {
    return "{status: 'UP'}";
  }
}
