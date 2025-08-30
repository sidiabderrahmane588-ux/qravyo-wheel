import { useRef, useState } from 'react';
import { SEGMENTS } from '../shared/segments.js';

const sliceDeg = 360 / SEGMENTS.length;
const FULL_TURNS = 6; // 6 tours complets
const POINTER_OFFSET_DEG = 0; // 0 = flèche en haut

export default function Wheel() {
  const [label, setLabel] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef(null);
  const currentRotationRef = useRef(0);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setLabel(null);

    try {
      const resp = await fetch('/api/spin', { method: 'POST' });
      const { targetIndex, label } = await resp.json();

      const finalDeg = computeFinalRotation(
        currentRotationRef.current,
        targetIndex,
        SEGMENTS.length,
        POINTER_OFFSET_DEG
      );

      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 3s cubic-bezier(.17,.67,.32,1.34)';
        wheelRef.current.style.transform = `rotate(${finalDeg}deg)`;
      }

      setTimeout(() => {
        currentRotationRef.current = finalDeg;
        setLabel(label);
        setSpinning(false);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors du spin:', error);
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <h1 className="text-4xl font-extrabold mb-2">🎰 Roue de la Fortune</h1>
      <p className="opacity-80 mb-8">Laissez un avis et tentez votre chance !</p>

      <div className="relative w-80 h-80 mb-6">
        {/* Flèche */}
        <div className="pointer" />

        {/* Roue */}
        <div
          ref={wheelRef}
          className="wheel w-80 h-80 rounded-full border-4 border-white shadow-2xl mx-auto"
          style={{
            background: 'conic-gradient(from 0deg, #ef4444 0deg 45deg, #10b981 45deg 90deg, #ef4444 90deg 135deg, #3b82f6 135deg 180deg, #ef4444 180deg 225deg, #f59e0b 225deg 270deg, #ef4444 270deg 315deg, #8b5cf6 315deg 360deg)'
          }}
        >
          {/* Segments text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {SEGMENTS.map((segment, index) => (
                <div
                  key={index}
                  className="absolute text-white font-bold text-sm"
                  style={{
                    transform: `rotate(${index * sliceDeg + sliceDeg / 2}deg)`,
                    transformOrigin: 'center',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-20px',
                    marginTop: '-10px',
                    width: '40px',
                    textAlign: 'center'
                  }}
                >
                  {segment}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-xl disabled:opacity-50 transition-all duration-300"
      >
        {spinning ? 'En cours…' : '🎯 Tourner la roue'}
      </button>

      {label && (
        <p className="mt-6 text-xl font-bold">
          {label === 'Perdu'
            ? 'Dommage, réessaye la prochaine fois !'
            : `Bravo, tu as gagné : ${label} 🎉`}
        </p>
      )}
    </div>
  );
}

function computeFinalRotation(
  currentDeg,
  targetIndex,
  segmentsCount,
  pointerOffsetDeg
) {
  const slice = 360 / segmentsCount;
  const targetCenter = targetIndex * slice + slice / 2;

  // L'aiguille est en haut (0°). On veut que le centre du segment arrive sous l'aiguille.
  // Donc on arrête la roue à (360 - targetCenter + pointerOffset).
  const stopAt = 360 - targetCenter + pointerOffsetDeg;

  const fullTurns = FULL_TURNS * 360;
  const normalized = ((currentDeg % 360) + 360) % 360;
  const delta = ((fullTurns + stopAt - normalized) % 360 + 360) % 360;

  return currentDeg + delta;
} 