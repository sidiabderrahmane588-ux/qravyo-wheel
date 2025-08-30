import { SEGMENTS } from '../../shared/segments.js';

let spinCount = 0;

export default function handler(req, res) {
  spinCount++;

  const isWin = spinCount % 50 === 0;

  const indices = SEGMENTS
    .map((s, i) => ({ s, i }))
    .filter(x => isWin ? x.s !== 'Perdu' : x.s === 'Perdu')
    .map(x => x.i);

  const targetIndex = indices[Math.floor(Math.random() * indices.length)];
  const label = SEGMENTS[targetIndex];

  res.status(200).json({
    targetIndex,
    label,
    spinCount,
    isWin
  });
} 