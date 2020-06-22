import {Span, Tags} from 'opentracing';

export function traceError(span: Span, error: Error, reThrow?: boolean, message?: string, context?: any) {
  span.setTag(Tags.ERROR, true);
  span.log(errorEvent(message, context, error));

  if (reThrow) {
    throw error;
  }
}

export function traceStart<T = any>(span: Span, context?: T) {
  span.log(startEvent('Start', context));
}

export function traceResponse<T extends {response: any}>(span: Span, context: T) {
  span.log(responseEvent('Response', context));
}

export function errorEvent(message: string, context?: any, error?: Error): object {
  return buildMessage('error', message, context, error);
}

export function startEvent(message: string, context?: any): object {
  return buildMessage('start', message, context);
}

export function responseEvent(message: string, context?: any): object {
  return buildMessage('response', message, context);
}

export function debugEvent(message: string, context?: any): object {
  return buildMessage('debug', message, context);
}

export function infoEvent(message: string, context?: any): object {
  return buildMessage('info', message, context);
}

export function traceEvent(message: string, context?: any): object {
  return buildMessage('trace', message, context);
}

export function warnEvent(message: string, context?: any, error?: Error): object {
  return buildMessage('warn', message, context, error);
}

export function fatalEvent(message: string, context?: any, error?: Error): object {
  return buildMessage('fatal', message, context, error);
}

function buildMessage(event: string, message: string, context?: any, error?: Error) {
  if (error) {
    return Object.assign({event, 'error.object': error, message: message || error.message, stack: error.stack}, context || {});
  } else {
    return Object.assign({event, message}, context || {});
  }
}

