import React from 'react';
import {
  Plus, Trash2, Settings, X,
  MapPin, Clock, Train, Home, Calendar, Ticket, HelpCircle, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  onOpenSettings,
  onExecuteQuery,
  activeNav = 'Home',
  onOpenSavedSearches
}) {
  const navItems = [
    { label: 'Home', icon: Home, query: null },
    { label: 'Trains', icon: Train, query: 'Show trains from Mumbai to Delhi' },
    { label: 'Stations', icon: MapPin, query: 'Tell me about Nagpur' },
    { label: 'Schedules', icon: Calendar, query: 'Show schedule of train 12951' },
    { label: 'PNR Status', icon: Ticket, query: 'Check PNR 4820194852' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-[var(--rail-bg-primary)] border-r border-[var(--rail-border)] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex justify-between items-center lg:hidden">
          <div className="flex items-center gap-2">
            <Train className="w-6 h-6 text-[var(--rail-maroon)]" />
            <span className="font-bold text-lg text-[var(--rail-charcoal)]">RailBot AI</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-[var(--rail-charcoal)] cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* New Enquiry Button */}
        <div className="p-5 pt-6">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[var(--rail-maroon)] hover:bg-[var(--rail-maroon-deep)] text-white font-bold text-base shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>New Enquiry</span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="px-3 space-y-1">
          <div className="text-xs font-bold text-gray-400 px-3 uppercase tracking-wider mb-2">Main</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onExecuteQuery(item.label, item.query);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--rail-maroon)]/10 text-[var(--rail-maroon)] font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-[var(--rail-bg-secondary)] hover:text-[var(--rail-charcoal)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--rail-maroon)]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 mt-5">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent History</span>
            {sessions.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[10px] text-gray-400 hover:text-red-500 font-semibold cursor-pointer"
                title="Clear all conversations"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {sessions.map((session) => {
              const isSelected = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] text-[var(--rail-charcoal)] font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-[var(--rail-bg-secondary)]'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  <div className="flex items-start gap-2.5 truncate pr-5">
                    <Clock className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                    <div className="flex flex-col items-start truncate">
                      <span className="truncate">{session.title || 'Railway Enquiry'}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {session.messages?.length || 0} messages
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all cursor-pointer"
                    title="Delete enquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Utilities */}
        <div className="p-3 space-y-1 border-t border-[var(--rail-border)]">
          <button
            onClick={() => {
              onOpenSavedSearches();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer"
          >
            <Star className="w-4 h-4 text-[var(--rail-warning)]" />
            <span>Saved Searches</span>
          </button>
          
          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>API Settings</span>
          </button>
          
          <button
            onClick={() => {
              onExecuteQuery('Help', 'Help me with railway enquiry');
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>Help & Commands</span>
          </button>
        </div>

        {/* Explore Promo Card */}
        <div className="p-4 pt-1">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 p-4 text-white shadow-md">
            <img src="/images/hero_train.jpg" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" alt="" />
            <div className="relative z-10 flex flex-col items-start">
              <h4 className="font-bold text-xs mb-1">Plan Your Journey</h4>
              <p className="text-[11px] text-gray-200 mb-2.5 opacity-90 leading-tight">Find trains, schedules & check live status.</p>
              <button
                onClick={() => {
                  onExecuteQuery('Trains', 'Show trains from Mumbai to Delhi');
                  if (window.innerWidth < 1024) onClose();
                }}
                className="px-3 py-1.5 bg-[var(--rail-maroon)] hover:bg-[var(--rail-maroon-deep)] rounded-lg text-[11px] font-bold shadow-md transition-colors cursor-pointer"
              >
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
