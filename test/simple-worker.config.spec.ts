import {SimpleWorkerConfig} from '../src/config/simple-worker.config';

describe('simple-worker.config', () => {
  test('canary verifies test infrastructure', () => {
      expect(true).toEqual(true);
  });

  describe('given SimpleWorkerConfig', () => {
    test('default runInterval should be 60,000 microseconds', () => {
      expect(new SimpleWorkerConfig().runInterval).toEqual(60000);
    });
  });
});
