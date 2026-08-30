import React, { useState } from 'react';
import { X, Star, Trash2, ArrowRight, Plus, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedSearchesModal({
  isOpen,
  onClose,
  savedSearches,
  onExecuteSearch,
  onSaveSearch,
  onDeleteSearch
}) {
  const [newQuery, setNewQuery] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    onSaveSearch(newQuery.trim());
    setNewQuery('');
  };

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
          className="w-full max-w-md bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] shadow-2xl p-6 space-y-4 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--rail-border)] pb-3">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-[var(--rail-warning)] fill-[var(--rail-warning)]" />
              <h3 className="font-bold text-base text-[var(--rail-charcoal)]">Saved Searches</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-[var(--rail-charcoal)] rounded-lg hover:bg-[var(--rail-bg-secondary)] transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add custom search */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Add query (e.g. Trains from Pune to Goa)..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] rounded-xl text-xs text-[var(--rail-charcoal)] placeholder-gray-400 focus:outline-none focus:border-[var(--rail-maroon)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!newQuery.trim()}
              className="px-3 py-2 bg-[var(--rail-maroon)] hover:bg-[var(--rail-maroon-deep)] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Save</span>
            </button>
          </form>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {savedSearches && savedSearches.length > 0 ? (
              savedSearches.map((item, idx) => {
                const queryText = typeof item === 'string' ? item : item.query;
                const id = typeof item === 'string' ? idx : item.id || idx;
                return (
                  <div
                    key={id}
                    className="group flex items-center justify-between p-3 rounded-xl bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] hover:border-[var(--rail-maroon)]/40 transition-all cursor-pointer"
                    onClick={() => {
                      onExecuteSearch(queryText);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <Sparkles className="w-4 h-4 text-[var(--rail-warning)] shrink-0" />
                      <span className="text-xs font-semibold text-[var(--rail-charcoal)] truncate">
                        {queryText}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSearch(queryText);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                        title="Delete search"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1 text-gray-400 group-hover:text-[var(--rail-maroon)] transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                No saved searches yet. Click "Save" above to bookmark your frequent railway queries.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[var(--rail-border)] text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--rail-bg-secondary)] hover:bg-[var(--rail-border)] text-[var(--rail-charcoal)] rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
