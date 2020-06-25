import {Container, ObjectFactory} from 'typescript-ioc';
import {initTracerFromEnv, JaegerTracer, TracingConfig, TracingOptions, ZipkinB3TextMapCodec} from 'jaeger-client'
import {FORMAT_HTTP_HEADERS, initGlobalTracer, Tracer} from 'opentracing';

import {LoggerApi} from '../logger';

const packageConfig = require('../../package.json');

let tracer: JaegerTracer;
function initTracer(): JaegerTracer {
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

  tracer = initTracerFromEnv(config, options);

  const codec = new ZipkinB3TextMapCodec({ urlEncoding: true });

  tracer.registerInjector(FORMAT_HTTP_HEADERS, codec);
  tracer.registerExtractor(FORMAT_HTTP_HEADERS, codec);

  initGlobalTracer(tracer);

  return tracer;
}

const jaegerTracerFactory: ObjectFactory = () => {
  if (!tracer) {
    tracer = initTracer();
  }

  return tracer;
}

export default jaegerTracerFactory;
