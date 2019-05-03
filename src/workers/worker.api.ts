
// tslint:disable:no-any
export abstract class WorkerApi {
  abstract async execute(): Promise<any>;
}
