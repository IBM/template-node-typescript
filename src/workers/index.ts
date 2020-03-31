import {Container} from 'typescript-ioc';
import {config} from './worker-manager';

export * from './worker-manager';
export * from './simple.worker';

Container.configure(...config);