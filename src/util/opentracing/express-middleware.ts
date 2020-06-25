import {FORMAT_HTTP_HEADERS, FORMAT_TEXT_MAP, globalTracer, Span, Tags, Tracer} from 'opentracing';
import {createNamespace} from 'cls-hooked';
import * as url from "url";

import {TraceConstants} from './trace-constants';
import {omit} from '../object';

const clsNamespace = createNamespace(TraceConstants.NAMESPACE);

export const buildTraceContext = (context: any) => {
  if (!context) {
    return {};
  }

  if (context['uber-trace-id']) {
    const uberTraceId: string = context['uber-trace-id'];

    const values = uberTraceId.split(':');
    if (values.length < 4) {
      return context;
    }

    const traceId = values[0];
    const spanId = values[1];
    const parentSpanId = values[2];
    const flags = values[3];

    return Object.assign({}, omit(context, 'uber-trace-id'), {traceId, spanId, parentSpanId, flags});
  }

  return context;
}

export function opentracingMiddleware({tracer = globalTracer()}: {tracer?: Tracer} = {}) {

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
    span.setTag(Tags.HTTP_METHOD, req.method);
    span.setTag(Tags.SPAN_KIND, "server");
    span.setTag(Tags.HTTP_URL, req.url);

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
        span.setTag(Tags.ERROR, true);
        span.setTag(Tags.SAMPLING_PRIORITY, 1);
      }
      span.finish();
    };
    // res.on('close', finishSpan);
    res.on('finish', finishSpan);

    clsNamespace.run(() => {
      clsNamespace.set(
        TraceConstants.TRACE_CONTEXT,
        buildTraceContext(responseHeaders),
      );
      clsNamespace.set(
        TraceConstants.SPAN,
        span,
      );

      next();
    });
  };
}
