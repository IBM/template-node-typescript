import {GET, Path} from 'typescript-rest';

@Path('/health')
export class HealthController {

  @GET
  async healthCheck(): Promise<{status: string;}> {
    return {
      status: 'UP'
    };
  }
}
