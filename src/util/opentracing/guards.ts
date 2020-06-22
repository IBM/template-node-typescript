import {Span} from 'opentracing';

export function isSpan(context: any): context is Span {
  return !!context && !!context.tracer && !!context.setTag;
}
