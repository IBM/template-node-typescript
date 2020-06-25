import {ObjectFactory} from 'typescript-ioc';
import {initGlobalTracer, Tracer} from 'opentracing';

let tracer: Tracer;
function initTracer(): Tracer {

  const tracer: Tracer = new Tracer();

  initGlobalTracer(tracer);

  return tracer;
}

const noopTracerFactory: ObjectFactory = () => {
  if (!tracer) {
    tracer = initTracer();
  }

  return tracer;
}

export default noopTracerFactory;
