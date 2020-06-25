import {Plugin, SuperAgentRequest} from 'superagent';
import {FORMAT_HTTP_HEADERS, globalTracer, Span, Tags, Tracer} from 'opentracing';

import {isSpan} from './guards';
import {getNamespace, Namespace} from 'cls-hooked';
import {TraceConstants} from './trace-constants';

/*
 This component provides a plugin to inject the opentracing headers into a superagent request

 Usage:
   superagent.get(url).use(opentracingPlugin(span));
 */
export function opentracingPlugin({tracer = globalTracer(), span}: {tracer?: Tracer, span?: Span} = {}): Plugin {

  const clsNamespace: Namespace = getNamespace(TraceConstants.NAMESPACE);
  const childOf: Span = span || clsNamespace ? clsNamespace.get(TraceConstants.SPAN) : undefined;

  const requestSpan: Span = tracer.startSpan(
    'http_request',
    isSpan(childOf) ? {childOf} : {});

  return (req: SuperAgentRequest) => {
    requestSpan.setTag(Tags.HTTP_URL, req.url);
    requestSpan.setTag(Tags.HTTP_METHOD, req.method);

    const headers = {};
    tracer.inject(requestSpan, FORMAT_HTTP_HEADERS, headers);

    req.set(headers);

    req.on('error', (error) => {
      requestSpan.setTag(Tags.ERROR, true);
      requestSpan.setTag(Tags.HTTP_STATUS_CODE, error.status);
      requestSpan.log({
        event: 'error',
        message: error.message,
        err: error,
      });
    });
    req.on('response', (res: Response) => {
      requestSpan.setTag(Tags.HTTP_STATUS_CODE, res.status);
    });
    req.on('end', () => {
      requestSpan.finish();
    });
  };
}
