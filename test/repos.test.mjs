import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { showable, groupByYear, languageCounts, safeUrl } from '../assets/repos.js';

const snapshot = JSON.parse(readFileSync(new URL('../assets/repos.json', import.meta.url)));

test('drops forks, archived, profile and this repo', () => {
  const names = showable([
    ...snapshot,
    { name: 'x', fork: true, archived: false, created_at: '2025-01-01T00:00:00Z' },
    { name: 'y', fork: false, archived: true, created_at: '2025-01-01T00:00:00Z' },
  ]).map((r) => r.name);
  for (const n of ['Contraill', 'Programming-Adventure', 'x', 'y']) assert.ok(!names.includes(n), n);
  assert.ok(names.includes('Helios'));
});

test('groups by creation year, keeps empty years, sorts by date', () => {
  const groups = groupByYear(showable(snapshot), 2024, 2026);
  assert.deepEqual(groups.map((g) => g.year), [2024, 2025, 2026]);
  assert.equal(groups[0].repos.length, 0);
  const d = groups[1].repos.map((r) => r.created_at);
  assert.deepEqual(d, [...d].sort());
  assert.equal(groups.flatMap((g) => g.repos).length, showable(snapshot).length);
});

test('language counts are sorted and skip nulls', () => {
  const c = languageCounts([{ language: 'C' }, { language: null }, { language: 'Go' }, { language: 'Go' }]);
  assert.deepEqual(c, [['Go', 2], ['C', 1]]);
});

test('safeUrl only allows http(s)', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null);
  assert.equal(safeUrl(''), null);
  assert.equal(safeUrl('https://heliios.vercel.app'), 'https://heliios.vercel.app');
});
