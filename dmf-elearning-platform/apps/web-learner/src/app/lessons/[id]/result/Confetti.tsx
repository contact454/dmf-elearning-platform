'use client';

import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';

export default function ConfettiView({ active }: { active: boolean }) {
  const { width, height } = useWindowSize();

  if (!active) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.2}
    />
  );
}
