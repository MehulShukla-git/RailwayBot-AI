import React from 'react';
import { X, Bot, ShieldCheck, Database, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RailBotLogo from './RailBotLogo';
import junctionImage from '../assets/images/railway_platform.jpg';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#242424]/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="relative h-32 bg-gray-900 flex-shrink-0">
            <img
              src={junctionImage}
              alt="Indian Railways"
              className="w-full h-full object-cover opacity-45 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--rail-bg-card)] via-transparent to-black/40" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full bg-black/30 hover:bg-black/50 transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-6 flex items-center gap-3">
              <RailBotLogo size={36} showText={false} />
              <div>
                <h3 className="font-extrabold text-xl text-[var(--rail-charcoal)] leading-none">RailBot AI</h3>
                <span className="text-xs font-semibold text-[var(--rail-maroon)]">v3.0 Production Edition</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-4 text-sm">
            <p className="text-[var(--rail-charcoal)] leading-relaxed font-medium">
              RailBot AI is an intelligent railway assistant designed for Indian Railways enquiries. Built with advanced NLP intent recognition and high-speed data indexing, it resolves train searches, station lookups, route mapping, and schedules instantaneously.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] flex items-start gap-3">
                <Zap className="w-5 h-5 text-[var(--rail-warning)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[var(--rail-charcoal)]">Instant Pipeline</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Sub-second entity extraction and schedule synthesis.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] flex items-start gap-3">
                <Database className="w-5 h-5 text-[var(--rail-success)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[var(--rail-charcoal)]">Pan-India Coverage</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Over 13,000+ trains & 7,300+ stations supported.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] flex items-start gap-3">
                <Bot className="w-5 h-5 text-[var(--rail-maroon)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[var(--rail-charcoal)]">NLP Intent Engine</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Hybrid machine learning model with fuzzy station matching.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#5A67D8] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[var(--rail-charcoal)]">Privacy First</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Chat history & saved searches stored locally on device.</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
              <strong>Disclaimer:</strong> RailBot AI is an independent academic assistant project and is not affiliated with IRCTC or the Ministry of Railways. Please confirm critical travel details on official portals.
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-[var(--rail-border)] flex items-center justify-between bg-[var(--rail-bg-secondary)]">
            <span className="text-xs text-gray-500">© 2026 RailBot AI. All rights reserved.</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--rail-maroon)] hover:bg-[var(--rail-maroon-deep)] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
