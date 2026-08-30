import React from 'react';
import { Search, Train, Sparkles } from 'lucide-react';

export default function WelcomeHero({ onStartEnquiry, onExploreTrains, isCollapsed }) {
  if (isCollapsed) {
    return (
      <div className="bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] p-3 px-4 mb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--rail-maroon)]/10 text-[var(--rail-maroon)] flex items-center justify-center font-black text-xs">
            🚆
          </div>
          <div>
            <h3 className="font-bold text-xs text-[var(--rail-charcoal)] leading-none">RailBot AI Assistant</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Ask any train, station, route, or schedule question below.</p>
          </div>
        </div>
        <button
          onClick={() => onExploreTrains && onExploreTrains('Show trains from Mumbai to Delhi')}
          className="text-xs font-bold text-[var(--rail-maroon)] hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore Trains</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-[#FFF9F0] dark:bg-[#2B2326] rounded-[32px] overflow-hidden shadow-sm border border-[var(--rail-border)] mb-8 flex flex-col md:flex-row h-auto md:h-[380px]">
      
      {/* Content - Left Side */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10 w-full md:w-1/2">
        <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--rail-charcoal)] leading-tight mb-4 tracking-tight">
          Your Smarter<br />
          <span className="text-[var(--rail-maroon)]">Railway Assistant</span>
        </h2>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md font-medium leading-relaxed">
          Find trains, stations, routes and schedules in seconds.
        </p>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onStartEnquiry) onStartEnquiry();
            }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--rail-maroon)] text-white font-bold rounded-xl shadow-md hover:bg-[var(--rail-maroon-deep)] transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>Start Enquiry</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onExploreTrains) onExploreTrains('Show trains from Mumbai to Delhi');
            }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#382F33] text-[var(--rail-maroon)] font-bold rounded-xl shadow-sm border border-[var(--rail-maroon)]/20 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
          >
            <Train className="w-5 h-5" />
            <span>Explore Trains</span>
          </button>
        </div>
      </div>

      {/* Image - Right Side */}
      <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden hidden md:block">
        {/* Soft blend mask */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FFF9F0] dark:from-[#2B2326] to-transparent z-10"></div>
        <img
          src="/images/hero_train.jpg"
          alt="Modern Indian Train"
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      {/* Mobile Image (stacked) */}
      <div className="w-full h-64 relative overflow-hidden block md:hidden">
         <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#FFF9F0] dark:from-[#2B2326] to-transparent z-10"></div>
         <img
          src="/images/hero_train.jpg"
          alt="Modern Indian Train"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
