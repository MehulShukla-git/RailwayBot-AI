import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Train, MapPin } from 'lucide-react';

/**
 * ScheduleTimeline
 *
 * Props:
 *   schedule — structured object from backend:
 *   {
 *     trainNumber: "12951",
 *     trainName:   "Mumbai Central-New Delhi Rajdhani Express",
 *     totalStops:  202,
 *     journeyDays: 2,
 *     days: [
 *       { day: 1, stations: [ { station_name, station_code, arrival, departure }, ... ] },
 *       { day: 2, stations: [ ... ] },
 *     ]
 *   }
 */
export default function ScheduleTimeline({ schedule }) {
  const [expanded, setExpanded] = useState(false);
  const [activeDayFilter, setActiveDayFilter] = useState(null); // null = all days

  // Guard: schedule must exist, have a days array, and that array must not be empty
  if (
    !schedule ||
    !Array.isArray(schedule.days) ||
    schedule.days.length === 0
  ) {
    return null;
  }

  const { trainNumber, trainName, totalStops, journeyDays, days } = schedule;

  // Determine which days to render
  const visibleDays = activeDayFilter
    ? days.filter((d) => d.day === activeDayFilter)
    : days;

  /**
   * Within each day, limit stations shown when collapsed.
   * Show first 5 of Day 1; show nothing else. On expand show all.
   */
  const getVisibleStations = (dayObj) => {
    if (expanded) return dayObj.stations;
    if (dayObj.day === 1) return dayObj.stations.slice(0, 5);
    return [];
  };

  const formatTime = (raw) => {
    if (!raw || raw === 'None' || raw === 'null' || raw === 'undefined') return null;
    // raw may be "16:40:00" — strip seconds
    return raw.slice(0, 5);
  };

  const isSource = (arrival) => !arrival || arrival === 'None' || arrival === 'null';
  const isDestination = (departure) => !departure || departure === 'None' || departure === 'null';

  return (
    <div className="mt-3 bg-white rounded-2xl border border-[var(--rail-border)] shadow-sm overflow-hidden max-w-lg">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--rail-maroon)]/10 flex items-center justify-center shrink-0">
              <Train className="w-5 h-5 text-[var(--rail-maroon)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[var(--rail-maroon)] bg-[var(--rail-maroon)]/10 px-2 py-0.5 rounded">
                  {trainNumber}
                </span>
              </div>
              <h4 className="font-extrabold text-[15px] text-[var(--rail-charcoal)] leading-tight mt-1">
                {trainName}
              </h4>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">
              <span className="font-bold text-[var(--rail-charcoal)]">{totalStops}</span> Stops
            </span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">
              <span className="font-bold text-[var(--rail-charcoal)]">{journeyDays}</span> Day{journeyDays > 1 ? 's' : ''} Journey
            </span>
          </div>
        </div>
      </div>

      {/* ── Day filter tabs ─────────────────────────────────── */}
      {days.length > 1 && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-gray-100">
          <button
            onClick={() => setActiveDayFilter(null)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
              activeDayFilter === null
                ? 'bg-[var(--rail-maroon)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Days
          </button>
          {days.map((d) => (
            <button
              key={d.day}
              onClick={() => setActiveDayFilter(d.day)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                activeDayFilter === d.day
                  ? 'bg-[var(--rail-maroon)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Day {d.day}
            </button>
          ))}
        </div>
      )}

      {/* ── Timeline ────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-6 max-h-[600px] overflow-y-auto">
        {visibleDays.map((dayObj) => {
          const stationsToShow = getVisibleStations(dayObj);
          const hiddenCount = dayObj.stations.length - stationsToShow.length;

          return (
            <div key={dayObj.day}>
              {/* Day heading */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                <span className="text-[11px] font-extrabold text-[var(--rail-maroon)] tracking-widest uppercase px-3 py-1 bg-[var(--rail-maroon)]/8 rounded-full border border-[var(--rail-maroon)]/20">
                  Day {dayObj.day}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
              </div>

              {/* Station list */}
              {stationsToShow.length > 0 ? (
                <div className="relative">
                  {/* Vertical rail line */}
                  <div className="absolute left-[9px] top-3 bottom-3 w-px bg-gradient-to-b from-[var(--rail-maroon)]/40 via-gray-200 to-[var(--rail-maroon)]/40" />

                  <div className="space-y-0">
                    {stationsToShow.map((stop, idx) => {
                      const arrival = formatTime(stop.arrival);
                      const departure = formatTime(stop.departure);
                      const isFirst = isSource(stop.arrival);
                      const isLast = isDestination(stop.departure);

                      return (
                        <div key={idx} className="relative flex gap-4 pb-5 last:pb-0">
                          {/* Station dot */}
                          <div className="relative z-10 shrink-0 mt-1">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isFirst
                                  ? 'bg-[var(--rail-success)] border-[var(--rail-success)]'
                                  : isLast
                                  ? 'bg-[var(--rail-maroon)] border-[var(--rail-maroon)]'
                                  : 'bg-white border-[var(--rail-maroon)]/50'
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isFirst
                                    ? 'bg-white'
                                    : isLast
                                    ? 'bg-white'
                                    : 'bg-[var(--rail-maroon)]/50'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Station info */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-[13px] text-[var(--rail-charcoal)] leading-tight truncate">
                                  {stop.station_name}
                                </p>
                                {stop.station_code && (
                                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                                    {stop.station_code}
                                  </span>
                                )}
                              </div>
                              {/* Source/Destination badge */}
                              {isFirst && (
                                <span className="shrink-0 text-[9px] font-extrabold text-[var(--rail-success)] bg-green-50 border border-green-200 px-1.5 py-0.5 rounded tracking-wider">
                                  SOURCE
                                </span>
                              )}
                              {isLast && (
                                <span className="shrink-0 text-[9px] font-extrabold text-[var(--rail-maroon)] bg-red-50 border border-[var(--rail-maroon)]/20 px-1.5 py-0.5 rounded tracking-wider">
                                  DEST
                                </span>
                              )}
                            </div>

                            {/* Times */}
                            <div className="flex items-center gap-4 mt-1.5">
                              {arrival ? (
                                <div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                                    Arrival
                                  </span>
                                  <span className="text-[12px] font-bold text-[var(--rail-charcoal)]">
                                    {arrival}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider block">
                                    Arrival
                                  </span>
                                  <span className="text-[11px] font-medium text-gray-300">—</span>
                                </div>
                              )}

                              {arrival && departure && (
                                <div className="w-px h-6 bg-gray-200" />
                              )}

                              {departure ? (
                                <div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                                    Departure
                                  </span>
                                  <span className="text-[12px] font-bold text-[var(--rail-charcoal)]">
                                    {departure}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider block">
                                    Departure
                                  </span>
                                  <span className="text-[11px] font-medium text-gray-300">—</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* collapsed day placeholder */
                !expanded && (
                  <div className="ml-7 text-[12px] text-gray-400 font-medium">
                    {dayObj.stations.length} stations — expand to view
                  </div>
                )
              )}

              {/* Per-day hidden count (only shown in collapsed state for Day 1) */}
              {!expanded && hiddenCount > 0 && dayObj.day === 1 && (
                <div className="ml-7 mt-2 text-[11px] text-gray-400 font-medium">
                  +{hiddenCount} more stations on Day {dayObj.day}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Controls ────────────────────────────────────────── */}
      <div className="px-5 pb-4 pt-2 border-t border-gray-100">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-[var(--rail-maroon)]/8 text-[13px] font-bold text-[var(--rail-charcoal)] hover:text-[var(--rail-maroon)] border border-gray-200 hover:border-[var(--rail-maroon)]/20 transition-all"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Collapse Schedule
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Full Schedule ({totalStops} stops)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
