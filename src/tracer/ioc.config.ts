import {ContainerConfiguration} from 'typescript-ioc';

import {TracerApi} from './tracer.api';
import jaegerTracerFactory from './jaeger-tracer.factory';

const config: ContainerConfiguration[] = [
  {
    bind: TracerApi,
    factory: jaegerTracerFactory
  }
];

export default config;