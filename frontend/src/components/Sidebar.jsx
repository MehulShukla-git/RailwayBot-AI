import React, { useState } from 'react';
import {
  Plus, MessageSquare, Trash2, Settings, X, Search,
  MapPin, Clock, Info, Train, Home, Calendar, Ticket, HelpCircle, Star, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({
  isOpen, onClose, sessions, currentSessionId,
  onSelectSession, onNewChat, onDeleteSession,
  onClearAll, onOpenSettings, onQuickActionTrigger
}) {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Train, label: 'Train Search', active: false },
    { icon: MapPin, label: 'Stations', active: false },
    { icon: Calendar, label: 'Schedules', active: false },
    { icon: Ticket, label: 'PNR Status', active: false },
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
            <span className="font-bold text-lg text-[var(--rail-text-primary)]">RailBot AI</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 pt-6">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[var(--rail-maroon)] hover:bg-[var(--rail-maroon-deep)] text-white font-bold text-base shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Enquiry</span>
          </button>
        </div>

        <div className="px-3 space-y-1">
          <div className="text-xs font-bold text-gray-400 px-3 uppercase tracking-wider mb-3">Main</div>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.label === 'Train Search') onQuickActionTrigger('Show trains from Mumbai to Delhi');
                  if (item.label === 'Stations') onQuickActionTrigger('Tell me about Nagpur');
                  if (item.label === 'Schedules') onQuickActionTrigger('Show schedule of train 12951');
                  if (item.label === 'PNR Status') onQuickActionTrigger('Check PNR 4820194852');
                  if (item.label === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  item.active
                    ? 'bg-[#7A1F2B]/10 text-[#7A1F2B]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-[#7A1F2B]' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-3 mt-6">
          <div className="text-xs font-bold text-gray-400 px-3 uppercase tracking-wider mb-3">History</div>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group relative flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 1024) onClose();
                }}
              >
                <div className="flex items-start gap-3 truncate pr-6">
                  <Clock className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                  <div className="flex flex-col items-start truncate">
                    <span className="truncate text-[#242424] font-medium">{session.title || 'New Railway Enquiry'}</span>
                    <span className="text-xs text-gray-400">Today</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-1 mt-4">
          <button
            onClick={() => {
              onQuickActionTrigger('Show trains from Mumbai to Delhi');
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Star className="w-5 h-5 text-gray-400" />
            <span>Saved Searches</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => {
              onQuickActionTrigger('Help me with railway enquiry');
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <span>Help & Support</span>
          </button>
        </div>

        <div className="p-5 pt-2">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 p-4 text-white shadow-lg">
            <img src="/images/hero_train.jpg" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" alt="" />
            <div className="relative z-10 flex flex-col items-start">
              <h4 className="font-bold text-sm mb-1">Plan Your Journey</h4>
              <p className="text-xs text-gray-200 mb-3 opacity-90 leading-tight">Book tickets, check status and explore routes.</p>
              <button onClick={() => onQuickActionTrigger('Show trains from Mumbai to Delhi')} className="px-4 py-2 bg-[var(--rail-maroon)] hover:bg-[var(--rail-maroon-deep)] rounded-lg text-xs font-bold shadow-md transition-colors">
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
