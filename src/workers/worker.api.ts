
// tslint:disable:no-any
export abstract class WorkerApi {
  abstract async start(): Promise<any>;
  abstract async stop(): Promise<any>;
}
