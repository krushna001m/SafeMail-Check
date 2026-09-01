import React, { useEffect, useState } from 'react';
import { ThreeShield3D } from './ThreeShield3D';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    'Initializing Security Engine...',
    'Loading threat intelligence feeds...',
    'Synchronizing DNS & WHOIS telemetry...',
    'Arming heuristic neural analyzers...',
    'SOC Command Center ready.'
  ];

  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 50);

    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev < statuses.length - 1 ? prev + 1 : prev));
    }, 320);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 1400);

    return () => {
      clearTimeout(progressTimer);
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div
      id="site-loader"
      className="fixed inset-0 z-[9999] bg-[#090B10] flex flex-col items-center justify-center p-4 transition-opacity duration-500"
    >
      <div className="w-48 h-48 sm:w-60 sm:h-60 mb-4 sm:mb-6 relative">
        <ThreeShield3D isScanning={true} className="w-full h-full" />
      </div>

      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center text-center px-4">
        <h2 className="font-headline text-lg sm:text-2xl text-[#e2e2e9] font-semibold mb-2 sm:mb-3">
          Initializing Security Engine...
        </h2>

        <div className="w-full h-1.5 bg-[#1e1f25] rounded-full overflow-hidden mb-3 border border-[#202B3C]">
          <div
            className="h-full bg-[#00e5ff] transition-all duration-[1200ms] ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="font-mono-data text-xs text-[#8A94A6] h-5 transition-all duration-200">
          {statuses[statusIndex]}
        </div>

        <button
          onClick={onComplete}
          className="mt-6 text-[11px] font-mono-data text-[#8A94A6] hover:text-[#00daf3] transition-colors underline underline-offset-4"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
};
