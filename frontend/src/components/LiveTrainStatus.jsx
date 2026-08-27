import React from 'react';

export default function LiveTrainStatus({ onActionSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--rail-border)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[var(--rail-charcoal)] text-[15px]">Live Train Status</h3>
        <span className="px-2.5 py-1 bg-[#2E7D5B]/10 text-[#2E7D5B] text-[10px] font-bold rounded-full uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-lg text-[var(--rail-charcoal)]">12951</span>
        </div>
        <p className="text-sm font-medium text-[var(--rail-charcoal)] leading-tight">
          Mumbai Central<br />New Delhi Rajdhani Express
        </p>
      </div>

      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Location</p>
          <p className="font-bold text-sm text-[var(--rail-charcoal)]">Mathura Junction (MTJ)</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Delay</p>
          <p className="font-bold text-sm text-[var(--rail-maroon)]">15 mins</p>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 w-[75%] h-1 bg-[var(--rail-success)] rounded-full -translate-y-1/2"></div>
        
        <div className="relative flex justify-between">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--rail-success)] border-2 border-white shadow-sm mt-[-3px]"></div>
          
          <div className="absolute left-[75%] -translate-x-1/2 -top-3">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--rail-charcoal)] fill-white">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M4 14h16" />
                <path d="M6 10V8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2" />
                <circle cx="8" cy="20" r="1.5" />
                <circle cx="16" cy="20" r="1.5" />
             </svg>
          </div>
          
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white shadow-sm mt-[-3px]"></div>
        </div>
        
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-gray-500 font-medium">Mumbai Central</span>
          <span className="text-[10px] text-gray-500 font-medium">New Delhi</span>
        </div>
      </div>

      <button
        onClick={() => onActionSelect && onActionSelect('Live status of train 12951')}
        className="w-full py-2.5 border-2 border-[var(--rail-maroon)]/20 text-[var(--rail-maroon)] font-bold rounded-xl text-sm hover:bg-[var(--rail-maroon)]/5 hover:border-[var(--rail-maroon)] transition-all cursor-pointer"
      >
        View Full Status
      </button>
    </div>
  );
}
