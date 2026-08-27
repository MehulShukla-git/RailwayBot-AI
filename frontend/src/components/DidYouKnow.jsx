import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function DidYouKnow() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--rail-border)] shadow-sm overflow-hidden group cursor-pointer">
      <div className="p-4 pb-0 flex items-center justify-between">
        <h3 className="font-bold text-[var(--rail-charcoal)] text-sm">Did You Know?</h3>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--rail-charcoal)] transition-colors" />
      </div>
      
      <div className="p-4 relative">
        <p className="text-xs text-gray-500 font-medium mb-1 relative z-10">Indian Railways operates</p>
        <p className="text-xl font-black text-[var(--rail-maroon)] mb-1 relative z-10">13,000+ Trains</p>
        <p className="text-xs text-gray-500 font-medium leading-snug w-3/5 relative z-10">
          connecting more than<br />7,300 stations across India.
        </p>
        
        <img 
          src="/images/heritage_station.jpg" 
          alt="Heritage Station" 
          className="absolute right-[-20px] bottom-0 w-[140px] h-[100px] object-cover rounded-tl-[40px] shadow-sm mix-blend-multiply opacity-90"
        />
      </div>
      
      <div className="px-4 pb-4 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--rail-maroon)]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
}
