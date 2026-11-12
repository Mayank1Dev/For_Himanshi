import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HeartCollector,
  INITIAL_HEART_MESSAGES,
  getNextSurprise,
  SURPRISE_MESSAGES,
  buildWhatsAppProposalUrl,
  SecretEasterEggCounter
} from './logic';

test('HeartCollector tracks unique collected hearts up to 10', () => {
  const collector = new HeartCollector();
  assert.equal(collector.getCount(), 0);
  assert.equal(INITIAL_HEART_MESSAGES.length, 10);

  // First heart
  const res1 = collector.collect(0);
  assert.equal(res1.newlyCollected, true);
  assert.equal(res1.totalCollected, 1);
  assert.equal(res1.isComplete, false);
  assert.equal(collector.isCollected(0), true);

  // Re-collecting same heart does not duplicate
  const resRepeat = collector.collect(0);
  assert.equal(resRepeat.newlyCollected, false);
  assert.equal(resRepeat.totalCollected, 1);

  // Collect all up to 10
  for (let i = 1; i < 9; i++) {
    collector.collect(i);
  }
  assert.equal(collector.getCount(), 9);

  // Final 10th heart
  const res10 = collector.collect(9);
  assert.equal(res10.isComplete, true);
  assert.equal(collector.getCount(), 10);

  // Bounds error check
  assert.throws(() => collector.collect(15), /out of bounds/);
});

test('getNextSurprise produces different message from previous index', () => {
  const first = getNextSurprise(-1, SURPRISE_MESSAGES);
  assert.ok(first.message.length > 0);
  assert.ok(first.index >= 0 && first.index < SURPRISE_MESSAGES.length);

  for (let i = 0; i < 20; i++) {
    const next = getNextSurprise(first.index, SURPRISE_MESSAGES);
    assert.notEqual(next.index, first.index);
  }
});

test('buildWhatsAppProposalUrl formats message correctly with encodeURIComponent', () => {
  const url = buildWhatsAppProposalUrl({
    dateIdea: '☕ Cute Coffee Date',
    preferredDate: '2026-11-15',
    preferredTime: '5:00 PM',
    personalMessage: 'Looking forward to this!',
    phoneNumber: '+1-555-0199'
  });

  assert.ok(url.startsWith('https://wa.me/15550199?text='));
  const decoded = decodeURIComponent(url);
  assert.ok(decoded.includes('Himanshi'));
  assert.ok(decoded.includes('Cute Coffee Date'));
  assert.ok(decoded.includes('2026-11-15'));
  assert.ok(decoded.includes('5:00 PM'));
  assert.ok(decoded.includes('Looking forward to this!'));
});

test('buildWhatsAppProposalUrl handles blank phone number gracefully', () => {
  const url = buildWhatsAppProposalUrl({
    dateIdea: '✨ A Surprise Plan',
    preferredDate: 'This Weekend',
    preferredTime: 'Evening'
  });
  assert.ok(url.startsWith('https://api.whatsapp.com/send?text='));
  const decoded = decodeURIComponent(url);
  assert.ok(decoded.includes('A Surprise Plan'));
});

test('SecretEasterEggCounter triggers only on 7th click', () => {
  const egg = new SecretEasterEggCounter();
  const startTime = 10000;

  for (let i = 1; i <= 6; i++) {
    const res = egg.click(startTime + i * 200);
    assert.equal(res.count, i);
    assert.equal(res.triggered, false);
  }

  // 7th click
  const finalRes = egg.click(startTime + 7 * 200);
  assert.equal(finalRes.triggered, true);

  // Next click resets to 1
  const afterRes = egg.click(startTime + 8 * 200);
  assert.equal(afterRes.count, 1);
  assert.equal(afterRes.triggered, false);
});
