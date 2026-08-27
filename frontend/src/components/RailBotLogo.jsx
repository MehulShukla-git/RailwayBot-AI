import React from 'react';

/**
 * RailBot AI Logo — Clean, professional logo component
 * Modern locomotive silhouette + Maroon/Charcoal typography
 */
export default function RailBotLogo({ size = 40, showText = true, animate = true }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex items-center justify-center rounded-xl bg-[var(--rail-maroon)] shadow-md ${animate ? 'group' : ''}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={animate ? 'group-hover:scale-105 transition-transform duration-300' : ''}
        >
          {/* Locomotive Body */}
          <path d="M4 14H22V26H4V14Z" fill="white" />
          <path d="M22 18H28C29.1046 18 30 18.8954 30 20V26H22V18Z" fill="white" />
          <path d="M6 10H16V14H6V10Z" fill="white" />
          
          {/* Windows */}
          <rect x="7" y="17" width="4" height="4" rx="1" fill="#7A1F2B" opacity="0.9" />
          <rect x="14" y="17" width="4" height="4" rx="1" fill="#7A1F2B" opacity="0.9" />
          
          {/* Headlight */}
          <circle cx="27" cy="22" r="1.5" fill="#FFF9F0" />
          
          {/* Wheels */}
          <circle cx="9" cy="26" r="3" fill="#242424" stroke="white" strokeWidth="1.5" />
          <circle cx="18" cy="26" r="3" fill="#242424" stroke="white" strokeWidth="1.5" />
          <circle cx="26" cy="26" r="2.5" fill="#242424" stroke="white" strokeWidth="1.5" />
          
          {/* Track */}
          <line x1="2" y1="29.5" x2="30" y2="29.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col pt-0.5">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-[22px] tracking-tight text-[var(--rail-charcoal)] leading-none">
              RailBot AI
            </h1>
          </div>
          <p className="text-[13px] text-gray-500 font-medium mt-1 leading-none hidden sm:block">
            Your Smarter Railway Assistant
          </p>
        </div>
      )}
    </div>
  );
}
