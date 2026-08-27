import React from 'react';
import { Search, Train } from 'lucide-react';

export default function WelcomeHero({ onStartChat }) {
  return (
    <div className="relative bg-[#FFF9F0] rounded-[32px] overflow-hidden shadow-sm border border-[var(--rail-border)] mb-8 flex flex-col md:flex-row h-auto md:h-[400px]">
      
      {/* Content - Left Side */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10 w-full md:w-1/2">
        <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--rail-charcoal)] leading-tight mb-4 tracking-tight">
          Your Smarter<br />
          <span className="text-[var(--rail-maroon)]">Railway Assistant</span>
        </h2>
        <p className="text-base md:text-lg text-gray-600 mb-8 max-w-md font-medium leading-relaxed">
          Find trains, stations, routes and schedules in seconds.
        </p>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onStartChat}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--rail-maroon)] text-white font-bold rounded-xl shadow-md hover:bg-[var(--rail-maroon-deep)] transition-colors hover:shadow-lg hover:-translate-y-0.5 duration-200"
          >
            <Search className="w-5 h-5" />
            <span>Start Enquiry</span>
          </button>
          
          <button
            onClick={() => onStartChat('Show trains from Mumbai to Delhi')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[var(--rail-maroon)] font-bold rounded-xl shadow-sm border border-[var(--rail-maroon)]/20 hover:bg-red-50 transition-colors duration-200"
          >
            <Train className="w-5 h-5" />
            <span>Explore Trains</span>
          </button>
        </div>
      </div>

      {/* Image - Right Side */}
      <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden hidden md:block">
        {/* Soft blend mask */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FFF9F0] to-transparent z-10"></div>
        <img
          src="/images/hero_train.jpg"
          alt="Modern Indian Train"
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      {/* Mobile Image (stacked) */}
      <div className="w-full h-64 relative overflow-hidden block md:hidden">
         <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#FFF9F0] to-transparent z-10"></div>
         <img
          src="/images/hero_train.jpg"
          alt="Modern Indian Train"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
