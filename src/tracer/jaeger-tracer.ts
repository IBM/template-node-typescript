import {Container, ObjectFactory} from 'typescript-ioc';
import {initTracerFromEnv, JaegerTracer, TracingConfig, TracingOptions} from 'jaeger-client'
import {globalTracer, initGlobalTracer, Tracer} from 'opentracing';

import {LoggerApi} from '../logger';

const packageConfig = require('../../package.json');

function initTracer(): Tracer {
  const tags = {};
  tags[`${packageConfig.name}.version`] = packageConfig.version;

  const logger: LoggerApi = Container.get(LoggerApi);

  const config: TracingConfig = {
    serviceName: packageConfig.name,
    reporter: {
      logSpans: true
    }
  };
  const options: TracingOptions = {
    tags,
    logger,
  };

  const tracer: JaegerTracer = initTracerFromEnv(config, options);

  initGlobalTracer(tracer);

  return tracer;
}
initTracer();

const jaegerTracerFactory: ObjectFactory = () => {
  return globalTracer();
}

export default jaegerTracerFactory;
