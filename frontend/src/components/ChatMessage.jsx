import React, { useState } from 'react';
import {
  Copy, Check, Volume2, VolumeX, MapPin,
  ArrowRight, Clock, Navigation, Radio
} from 'lucide-react';
import { motion } from 'framer-motion';
import ScheduleTimeline from './ScheduleTimeline';

export default function ChatMessage({ message, onActionSelect }) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.sender === 'user';
  const timeString = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const handleCopy = () => {
    let contentToCopy = message.text || '';
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = (message.text || '').replace(/\*\*/g, '').replace(/[•\n]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.lang = 'en-IN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[var(--rail-charcoal)] font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full py-3 px-4 sm:px-6 flex justify-end"
      >
        <div className="flex items-end gap-3 max-w-[85%] sm:max-w-[75%]">
          <div className="flex flex-col items-end gap-1">
            <div className="bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] text-[var(--rail-charcoal)] px-4 py-3 rounded-2xl rounded-br-sm shadow-sm font-medium text-sm">
              {message.text}
            </div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="text-[10px] text-gray-400 font-medium">{timeString}</span>
              <Check className="w-3 h-3 text-[var(--rail-success)]" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 mb-4 border border-[var(--rail-border)]">
             <img src="https://ui-avatars.com/api/?name=User&background=F2F0EC&color=7A1F2B&bold=true" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Bot Message
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full py-4 px-4 sm:px-6 flex justify-start"
    >
      <div className="flex items-start gap-3 sm:gap-4 max-w-full lg:max-w-[90%]">
        {/* Bot Avatar */}
        <div className="shrink-0 mt-1 w-9 h-9 rounded-xl bg-[var(--rail-maroon)] flex items-center justify-center shadow-md">
           <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 14H22V26H4V14Z" fill="white" />
              <path d="M22 18H28C29.1046 18 30 18.8954 30 20V26H22V18Z" fill="white" />
              <path d="M6 10H16V14H6V10Z" fill="white" />
              <rect x="7" y="17" width="4" height="4" rx="1" fill="#7A1F2B" />
              <rect x="14" y="17" width="4" height="4" rx="1" fill="#7A1F2B" />
              <circle cx="27" cy="22" r="1.5" fill="#FFF9F0" />
              <circle cx="9" cy="26" r="3" fill="#242424" stroke="white" strokeWidth="1.5" />
              <circle cx="18" cy="26" r="3" fill="#242424" stroke="white" strokeWidth="1.5" />
              <circle cx="26" cy="26" r="2.5" fill="#242424" stroke="white" strokeWidth="1.5" />
           </svg>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          {/* Main Bot Text */}
          {message.text && (
            <div className="flex flex-col items-start gap-1">
               <div className="bg-[var(--rail-bg-card)] border border-[var(--rail-border)] text-[var(--rail-charcoal)] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm font-medium text-[15px] leading-relaxed inline-block max-w-2xl whitespace-pre-line">
                 {renderText(message.text)}
               </div>
               <div className="flex items-center gap-2 px-1 text-gray-400 text-xs">
                 <span className="text-[10px]">{timeString}</span>
                 <button
                   onClick={handleCopy}
                   className="p-1 hover:text-[var(--rail-charcoal)] transition-colors rounded cursor-pointer"
                   title="Copy response"
                   aria-label="Copy response"
                 >
                   {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                 </button>
                 <button
                   onClick={handleSpeak}
                   className="p-1 hover:text-[var(--rail-charcoal)] transition-colors rounded cursor-pointer"
                   title={isSpeaking ? "Stop speaking" : "Read aloud"}
                   aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                 >
                   {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-[var(--rail-maroon)] animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                 </button>
               </div>
            </div>
          )}

          {/* TRAINS */}
          {message.trains && message.trains.length > 0 && (
            <div className="flex overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x hide-scrollbar gap-4">
              {message.trains.map((train, idx) => (
                <div key={idx} className="shrink-0 w-[280px] bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] p-4 shadow-sm snap-start flex flex-col justify-between group hover:border-[var(--rail-maroon)] transition-colors">
                  <div>
                     <div className="bg-[var(--rail-maroon)] text-white text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-3">
                        {train.number}
                     </div>
                     <h4 className="font-extrabold text-[15px] text-[var(--rail-charcoal)] mb-3 leading-tight truncate" title={train.name}>{train.name}</h4>
                     
                     <div className="flex items-center justify-between mb-4 relative">
                        <div className="flex flex-col items-center">
                           <div className="w-2 h-2 rounded-full bg-[var(--rail-success)] z-10"></div>
                           <div className="text-xs text-gray-500 font-medium mt-1 text-center w-[80px] truncate" title={train.from || 'Source'}>{train.from || 'Source'}</div>
                        </div>
                        <div className="absolute top-[3px] left-3 right-3 h-[1px] border-t border-dashed border-gray-300"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--rail-success)]"></div>
                        <div className="flex flex-col items-center">
                           <div className="w-2 h-2 rounded-full bg-[var(--rail-maroon)] z-10"></div>
                           <div className="text-xs text-gray-500 font-medium mt-1 text-center w-[80px] truncate" title={train.to || 'Dest'}>{train.to || 'Dest'}</div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-1.5 text-xs">
                           <Clock className="w-3.5 h-3.5 text-gray-400" />
                           <div>
                              <div className="font-bold text-[var(--rail-charcoal)]">{train.departure || 'N/A'}</div>
                              <div className="text-[10px] text-gray-400">Departure</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                           <Clock className="w-3.5 h-3.5 text-gray-400" />
                           <div>
                              <div className="font-bold text-[var(--rail-charcoal)]">{train.arrival || 'N/A'}</div>
                              <div className="text-[10px] text-gray-400">Arrival</div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-1.5 text-xs">
                           <Clock className="w-3.5 h-3.5 text-gray-400" />
                           <div>
                              <div className="font-bold text-[var(--rail-charcoal)]">{train.duration || 'N/A'}</div>
                              <div className="text-[10px] text-gray-400">Duration</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                           <Navigation className="w-3.5 h-3.5 text-gray-400" />
                           <div>
                              <div className="font-bold text-[var(--rail-charcoal)]">{train.distance ? `${train.distance} km` : 'N/A'}</div>
                              <div className="text-[10px] text-gray-400">Distance</div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--rail-border)]">
                     <div className="text-[10px] font-bold text-gray-500">Classes: <span className="text-[var(--rail-charcoal)]">{train.classes || '1A, 2A, 3A, SL'}</span></div>
                     <button
                        type="button"
                        onClick={() => onActionSelect && onActionSelect(`Tell me about train ${train.number}`)}
                        className="text-[11px] font-bold text-[var(--rail-maroon)] flex items-center gap-1 hover:underline cursor-pointer"
                     >
                        View Details <ArrowRight className="w-3 h-3" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATION INFO */}
          {message.station && (
            <div className="mt-3 bg-[var(--rail-bg-card)] p-5 rounded-2xl border border-[var(--rail-border)] shadow-sm max-w-sm space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#E8F5E9] dark:bg-[#1C3328] rounded-xl">
                     <MapPin className="w-6 h-6 text-[#2E7D5B]" />
                  </div>
                  <div>
                     <h4 className="font-bold text-[17px] text-[var(--rail-charcoal)]">{message.station.name}</h4>
                     <p className="text-sm font-medium text-gray-500">Code: <span className="text-[#2E7D5B] font-bold">{message.station.code}</span></p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3 text-sm">
                 <div>
                    <span className="text-xs text-gray-400 block mb-0.5">State</span>
                    <span className="font-medium text-[var(--rail-charcoal)]">{message.station.state || 'Not available'}</span>
                 </div>
                 <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Zone</span>
                    <span className="font-medium text-[var(--rail-charcoal)]">{message.station.zone || 'Not available'}</span>
                 </div>
               </div>
               <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Address</span>
                  <span className="font-medium text-[var(--rail-charcoal)] text-sm">{message.station.address || 'Not available'}</span>
               </div>
            </div>
          )}
          
          {/* SCHEDULE TIMELINE */}
          {message.schedule && <ScheduleTimeline schedule={message.schedule} />}

          {/* ROUTE SEARCH */}
          {message.route && (
             <div className="mt-3 bg-[var(--rail-bg-card)] p-5 rounded-2xl border border-[var(--rail-border)] shadow-sm max-w-sm text-center">
                <div className="font-bold text-[var(--rail-charcoal)] mb-2">{message.route.origin || 'Source'}</div>
                <div className="flex flex-col items-center gap-1 my-2 text-gray-400">
                   <div className="w-1 h-1 rounded-full bg-[var(--rail-maroon)]"></div>
                   <div className="w-1 h-1 rounded-full bg-[var(--rail-maroon)]"></div>
                   <div className="w-1 h-1 rounded-full bg-[var(--rail-maroon)]"></div>
                   <div className="text-xs font-bold text-[var(--rail-maroon)]">Route</div>
                   <div className="w-1 h-1 rounded-full bg-[var(--rail-maroon)]"></div>
                   <div className="w-1 h-1 rounded-full bg-[var(--rail-maroon)]"></div>
                   <div className="w-1 h-1 rounded-full bg-[var(--rail-maroon)]"></div>
                </div>
                <div className="font-bold text-[var(--rail-charcoal)] mt-2">{message.route.destination || 'Destination'}</div>
             </div>
          )}
          
          {/* PNR DETAILS */}
          {message.pnrDetails && (
             <div className="mt-3 bg-[var(--rail-bg-card)] p-5 rounded-2xl border border-[var(--rail-border)] shadow-sm max-w-sm">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--rail-border)] pb-3">
                   <div>
                      <span className="text-[10px] text-gray-400 font-bold tracking-wider">PNR STATUS</span>
                      <h4 className="font-black text-xl text-[var(--rail-charcoal)]">{message.pnrDetails.pnr}</h4>
                   </div>
                   <span className="px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 font-bold text-xs rounded-full border border-green-500/20">
                      {message.pnrDetails.charting || 'Chart Not Prepared'}
                   </span>
                </div>
                <div className="space-y-2 mb-4 text-sm font-medium">
                   <div className="flex justify-between"><span className="text-gray-500">Train:</span> <span className="text-[var(--rail-charcoal)]">{message.pnrDetails.train || 'N/A'}</span></div>
                   <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="text-[var(--rail-charcoal)]">{message.pnrDetails.date || 'N/A'}</span></div>
                   <div className="flex justify-between"><span className="text-gray-500">Boarding:</span> <span className="text-[var(--rail-charcoal)]">{message.pnrDetails.boarding || 'N/A'}</span></div>
                </div>
                <div className="space-y-2 pt-3 border-t border-[var(--rail-border)]">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Passenger Status</span>
                   {message.pnrDetails.passengers?.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-[var(--rail-bg-secondary)] p-2 rounded-lg border border-[var(--rail-border)]">
                         <span className="font-medium text-gray-600 dark:text-gray-300">Passenger {p.number || idx+1}</span>
                         <span className="font-bold text-[var(--rail-charcoal)]">{p.current || p.status || 'Confirmed'}</span>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* LIVE STATUS CARD */}
          {message.liveStatus && (
            <div className="mt-3 bg-[var(--rail-bg-card)] p-5 rounded-2xl border border-[var(--rail-border)] shadow-sm max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 tracking-wider uppercase block">Live Running Status</span>
                  <h4 className="font-bold text-[15px] text-[var(--rail-charcoal)] leading-tight">
                    {message.liveStatus.trainName || `Train ${message.liveStatus.trainNumber}`}
                  </h4>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Train Number', message.liveStatus.trainNumber],
                  ['Current Station', message.liveStatus.currentStation],
                  ['Next Station', message.liveStatus.nextStation],
                  ['Platform', message.liveStatus.platform],
                  ['Delay', message.liveStatus.delay != null && message.liveStatus.delay !== '0' ? `${message.liveStatus.delay} min` : 'On Time'],
                  ['Status', message.liveStatus.status],
                  ['Last Updated', message.liveStatus.lastUpdated],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-[var(--rail-border)] pb-2 last:border-0">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="font-bold text-[var(--rail-charcoal)] text-right">
                      {value && value !== 'Not available' ? value : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
