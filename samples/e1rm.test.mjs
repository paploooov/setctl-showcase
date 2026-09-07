import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epley, brzycki } from './e1rm.ts';

test('one repetition returns the entered weight', () => {
  assert.deepEqual(epley(100, 1), {value:100, confidence:'normal'});
  assert.deepEqual(brzycki(100, 1), {value:100, confidence:'normal'});
});
test('ten repetitions estimates strength and higher reps lower confidence', () => {
  assert.equal(epley(75, 10).value, 100);
  assert.equal(brzycki(75, 10).value, 100);
  assert.equal(epley(75, 13).confidence, 'low');
});
test('invalid repetitions and negative weights are rejected', () => {
  assert.equal(epley(-1, 8), null);
  assert.equal(epley(80, 0), null);
  assert.equal(epley(80, 2.5), null);
  assert.equal(brzycki(80, 37), null);
});
