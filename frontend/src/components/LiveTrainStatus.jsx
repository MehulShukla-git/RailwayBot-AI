import React from 'react';
import { Radio, RefreshCw, Clock } from 'lucide-react';

export default function LiveTrainStatus({ liveData, onActionSelect }) {
  const isTracking = Boolean(liveData && (liveData.trainNumber || liveData.trainName));

  if (!isTracking) {
    return (
      <div className="bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[var(--rail-charcoal)] text-[15px]">Live Train Status</h3>
          <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
            Standby
          </span>
        </div>

        <div className="py-3 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[var(--rail-maroon)]/10 text-[var(--rail-maroon)] flex items-center justify-center mx-auto">
            <Radio className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 leading-relaxed">
            No active train is currently being tracked. Query a train to monitor running status and delays here.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onActionSelect && onActionSelect('Live status of train 12951')}
          className="w-full mt-2 py-2.5 border-2 border-[var(--rail-maroon)]/20 text-[var(--rail-maroon)] font-bold rounded-xl text-xs hover:bg-[var(--rail-maroon)]/5 hover:border-[var(--rail-maroon)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Track Rajdhani (12951)</span>
        </button>
      </div>
    );
  }

  const trainNumber = liveData.trainNumber || '12951';
  const trainName = liveData.trainName || 'Express';
  const currentStation = liveData.currentStation || 'In Transit';
  const nextStation = liveData.nextStation || null;
  const delay = liveData.delay;
  const status = liveData.status || 'Running on time';
  const lastUpdated = liveData.lastUpdated || null;

  return (
    <div className="bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[var(--rail-charcoal)] text-[15px]">Live Train Status</h3>
        <span className="px-2.5 py-0.5 bg-[#2E7D5B]/10 text-[#2E7D5B] text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-extrabold text-base text-[var(--rail-maroon)]">{trainNumber}</span>
        </div>
        <p className="text-xs font-bold text-[var(--rail-charcoal)] leading-snug truncate" title={trainName}>
          {trainName}
        </p>
      </div>

      <div className="space-y-2 mb-4 text-xs">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Current Location</p>
            <p className="font-bold text-[var(--rail-charcoal)]">{currentStation}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Delay</p>
            <p className={`font-bold ${delay && delay !== '0' && delay !== 0 ? 'text-[var(--rail-maroon)]' : 'text-[#2E7D5B]'}`}>
              {delay != null && delay !== '0' && delay !== 0 ? `${delay} min delay` : 'On Time'}
            </p>
          </div>
        </div>

        {nextStation && (
          <div className="pt-1">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Next Station</p>
            <p className="font-medium text-[var(--rail-charcoal)]">{nextStation}</p>
          </div>
        )}

        {status && (
          <div className="p-2 rounded-lg bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] text-[11px] font-medium text-[var(--rail-charcoal)] flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{status}</span>
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-gray-400 shrink-0">{lastUpdated}</span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onActionSelect && onActionSelect(`Live status of train ${trainNumber}`)}
        className="w-full py-2.5 border-2 border-[var(--rail-maroon)]/20 text-[var(--rail-maroon)] font-bold rounded-xl text-xs hover:bg-[var(--rail-maroon)]/5 hover:border-[var(--rail-maroon)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Refresh Full Status</span>
      </button>
    </div>
  );
}
