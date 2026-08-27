import React from 'react';

/**
 * TrainScene3D — Clean CSS Loading Animation
 */
export default function TrainScene3D({ compact = false }) {
  if (compact) {
    return (
      <div className="relative w-full h-12 overflow-hidden opacity-40">
        <div className="absolute bottom-2 left-0 right-0 h-[1px] bg-gray-300" />
        <div className="absolute bottom-2 left-0 right-0 flex gap-2 animate-track-scroll">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-2 h-[2px] bg-gray-400 flex-shrink-0" />
          ))}
        </div>
        <div className="absolute bottom-[9px] animate-train-loading">
          <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
            <rect x="0" y="2" width="28" height="10" rx="2" fill="#7A1F2B" opacity="0.8" />
            <rect x="24" y="4" width="14" height="6" rx="2" fill="#7A1F2B" opacity="0.6" />
            <circle cx="8" cy="13" r="2" fill="#242424" />
            <circle cx="20" cy="13" r="2" fill="#242424" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-32">
       <div className="animate-train-loading">
          <svg width="60" height="24" viewBox="0 0 40 16" fill="none">
            <rect x="0" y="2" width="28" height="10" rx="2" fill="#7A1F2B" opacity="0.8" />
            <rect x="24" y="4" width="14" height="6" rx="2" fill="#7A1F2B" opacity="0.6" />
            <circle cx="8" cy="13" r="2" fill="#242424" />
            <circle cx="20" cy="13" r="2" fill="#242424" />
          </svg>
        </div>
    </div>
  );
}
