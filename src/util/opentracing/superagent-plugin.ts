import {Plugin, SuperAgentRequest} from 'superagent';
import {FORMAT_HTTP_HEADERS, globalTracer, Span, Tags, Tracer} from 'opentracing';

export function isSpan(context: any): context is Span {
  return !!context && !!context.tracer && !!context.setTag;
}

export function opentracingPlugin(childOf?: Span): Plugin {

  const span: Span = globalTracer().startSpan(
    'http_request',
    isSpan(childOf) ? {childOf} : {});

  return (req: SuperAgentRequest) => {
    span.setTag(Tags.HTTP_URL, req.url);
    span.setTag(Tags.HTTP_METHOD, req.method);

    const headers = {};
    const tracer: Tracer = span.tracer();
    tracer.inject(span, FORMAT_HTTP_HEADERS, headers);

    req.set(headers);

    req.on('error', (error) => {
      span.setTag(Tags.ERROR, true);
      span.setTag(Tags.HTTP_STATUS_CODE, error.status);
      span.log({
        event: 'error',
        message: error.message,
        err: error,
      });
    });
    req.on('response', (res: Response) => {
      span.setTag(Tags.HTTP_STATUS_CODE, res.status);
    });
  };
}
