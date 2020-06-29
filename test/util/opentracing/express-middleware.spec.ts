import {buildTraceContext} from '../../../src/util/opentracing/express-middleware';

describe('express-middelware', () => {
  test('canary verifies test infrastructure', () => {
    expect(true).toEqual(true);
  });

  describe('given buildTraceContext()', () => {
    describe('when context is undefined', () => {
      test('then return empty object', async () => {
        expect(buildTraceContext(undefined)).toEqual({});
      });
    });

    describe('when context does not contain uber-trace-id', () => {
      test('then return context', async () => {
        const context = {test: 'value'};

        expect(buildTraceContext(context)).toEqual(context);
      });
    });

    describe('when context contains uber-trace-id', () => {
      test('then return {traceId, spanId, parentSpanId, flags}', async () => {
        const traceId = 'traceid';
        const spanId = 'spanid';
        const parentSpanId = '0';
        const flags = '0';

        const context = {'uber-trace-id': `${traceId}:${spanId}:${parentSpanId}:${flags}`};

        expect(buildTraceContext(context)).toEqual({traceId, spanId, parentSpanId, flags});
      });
    });
  })
});