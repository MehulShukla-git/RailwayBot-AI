import React from 'react';
import { motion } from 'framer-motion';

export default function RouteVisual({ stops }) {
  if (!stops || stops.length < 2) return null;

  return (
    <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" strokeWidth="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <span className="text-xs font-bold text-[#4a4a4a] tracking-wider uppercase">Route Map</span>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gray-300 rounded-full" />

        <motion.div
          className="absolute left-[9px] z-10"
          initial={{ top: '0%' }}
          animate={{ top: '90%' }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-[14px] h-[14px] bg-[#7A1F2B] rounded-full shadow-sm flex items-center justify-center">
            <div className="w-[6px] h-[6px] bg-white rounded-full" />
          </div>
        </motion.div>

        <div className="space-y-0">
          {stops.map((stop, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === stops.length - 1;
            const station = stop.station || stop.station_name || `Stop ${idx + 1}`;
            const arr = stop.arr || stop.arrival || '';
            const dep = stop.dep || stop.departure || '';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.3 }}
                className="flex items-start gap-3 py-2"
              >
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-[12px] h-[12px] rounded-full border-2 relative z-[2] ${
                      isFirst || isLast
                        ? 'bg-[#7A1F2B] border-[#7A1F2B] shadow-sm'
                        : 'bg-white border-gray-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${isFirst || isLast ? 'text-[#242424]' : 'text-[#4a4a4a]'}`}>
                    {station}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#6b7280] mt-0.5 font-medium">
                    {arr && <span>Arr: <span className="text-[#C7862B]">{arr}</span></span>}
                    {dep && <span>Dep: <span className="text-[#2E7D5B]">{dep}</span></span>}
                    {stop.halt && stop.halt !== '--' && (
                      <span>Halt: {stop.halt}</span>
                    )}
                    {stop.dist && (
                      <span>{stop.dist}</span>
                    )}
                  </div>
                </div>

                {stop.day && (
                  <span className="text-[9px] font-bold text-[#6b7280] bg-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">
                    Day {stop.day}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
