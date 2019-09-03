
import {Observable} from 'rxjs';

// tslint:disable:no-any
export abstract class WorkerApi {
  abstract start(): Observable<any>;
  abstract stop(): Observable<any>;
}
