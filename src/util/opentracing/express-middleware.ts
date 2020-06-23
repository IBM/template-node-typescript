import {FORMAT_HTTP_HEADERS, FORMAT_TEXT_MAP, globalTracer, Span, Tracer} from 'opentracing';
import {createNamespace} from 'cls-hooked';
import * as url from "url";

import {TraceConstants} from '../trace-constants';

const clsNamespace = createNamespace(TraceConstants.TRACE_NAMESPACE);

export const buildTraceContext = (context: any) => {
  if (!context) {
    return {};
  }

  if (context['uber-trace-id']) {
    const uberTraceId: string = context['uber-trace-id'];

    const regex = new RegExp('([^:]*):([^:]*):.*');
    const traceId = uberTraceId.replace(regex, '$1');
    const spanId = uberTraceId.replace(regex, '$2');

    return {traceId, spanId};
  }

  return context;
}

export function opentracingMiddleware(options: {tracer?: Tracer} = {}) {
  const tracer = options.tracer || globalTracer();

  return (req, res, next) => {
    clsNamespace.bindEmitter(req);
    clsNamespace.bindEmitter(res);

    const wireCtx = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const pathname = url.parse(req.url).pathname;
    const span: Span = tracer.startSpan(pathname, {childOf: wireCtx});
    span.logEvent("request_received", {});

    const headers = {};
    tracer.inject(span, FORMAT_HTTP_HEADERS, headers);

    // include some useful tags on the trace
    span.setTag("http.method", req.method);
    span.setTag("span.kind", "server");
    span.setTag("http.url", req.url);

    // include trace ID in headers so that we can debug slow requests we see in
    // the browser by looking up the trace ID found in response headers
    const responseHeaders = {};
    tracer.inject(span, FORMAT_TEXT_MAP, responseHeaders);
    Object.keys(responseHeaders).forEach(key => res.setHeader(key, responseHeaders[key]));

    // add the span to the request object for handlers to use
    Object.assign(req, {span});

    // finalize the span when the response is completed
    const finishSpan = () => {
      span.logEvent("request_finished", {});
      // Route matching often happens after the middleware is run. Try changing the operation name
      // to the route matcher.
      const opName = (req.route && req.route.path) || pathname;
      span.setOperationName(opName);
      span.setTag("http.status_code", res.statusCode);
      if (res.statusCode >= 500) {
        span.setTag("error", true);
        span.setTag("sampling.priority", 1);
      }
      span.finish();
    };
    // res.on('close', finishSpan);
    res.on('finish', finishSpan);

    clsNamespace.run(() => {
      clsNamespace.set(
        TraceConstants.TRACE_CONTEXT,
        buildTraceContext(responseHeaders)
      );

      next();
    });
  };
}
