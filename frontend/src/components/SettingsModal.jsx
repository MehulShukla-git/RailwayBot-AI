import React, { useState, useEffect } from 'react';
import { X, Server, Check, RefreshCw, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import RailBotLogo from './RailBotLogo';
import junctionImage from '../assets/images/railway_platform.jpg';

export default function SettingsModal({ isOpen, onClose, onClearAllHistory, onBackendUrlChange }) {
  const defaultUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
  const [backendUrl, setBackendUrl] = useState(defaultUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBackendUrl(localStorage.getItem('railbot_backend_url') || defaultUrl);
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen, defaultUrl]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const targetUrl = backendUrl.trim().replace(/\/+$/, '');
    try {
      // Test /health or root
      const res = await axios.get(`${targetUrl}/health`, { timeout: 3500 });
      setTestResult({ success: true, message: `Connected successfully (${res.status} OK — ${res.data?.service || 'Healthy'})` });
    } catch (err) {
      try {
        const rootRes = await axios.get(`${targetUrl}/`, { timeout: 2000 });
        setTestResult({ success: true, message: `Connected successfully (${rootRes.status} OK)` });
      } catch {
        setTestResult({
          success: false,
          message: `Offline / Unreachable (${err.message}). Make sure FastAPI server is running.`
        });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const cleanUrl = backendUrl.trim().replace(/\/+$/, '');
    localStorage.setItem('railbot_backend_url', cleanUrl);
    if (onBackendUrlChange) {
      onBackendUrlChange(cleanUrl);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetDefault = () => {
    localStorage.removeItem('railbot_backend_url');
    setBackendUrl(defaultUrl);
    if (onBackendUrlChange) {
      onBackendUrlChange(defaultUrl);
    }
    setTestResult(null);
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
          className="w-full max-w-md bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] shadow-2xl p-6 space-y-5 flex flex-col max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--rail-border)] pb-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-[var(--rail-maroon)]" />
              <h3 className="font-bold text-base text-[var(--rail-charcoal)]">API & System Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-[var(--rail-charcoal)] rounded-lg hover:bg-[var(--rail-bg-secondary)] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Backend Config */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Backend API Endpoint URL
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--rail-bg-secondary)] border border-[var(--rail-border)] text-sm text-[var(--rail-charcoal)] font-mono focus:border-[var(--rail-maroon)] focus:outline-none transition-colors"
              />
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-gray-400 hover:text-[var(--rail-charcoal)] transition-colors underline underline-offset-2 font-medium cursor-pointer"
                >
                  Reset to default
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-1.5 text-[var(--rail-warning)] hover:text-[var(--rail-maroon)] font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border font-medium ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}>
                {testResult.success ? <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Clear History */}
          <div className="pt-3 border-t border-[var(--rail-border)] space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Data Management
            </label>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all stored chat history?')) {
                  onClearAllHistory();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Chat History</span>
            </button>
          </div>

          {/* About preview */}
          <div className="pt-3 border-t border-[var(--rail-border)]">
            <div className="relative h-20 rounded-xl overflow-hidden mb-2 border border-[var(--rail-border)]">
              <img src={junctionImage} alt="Railway Junction" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <RailBotLogo size={22} showText={false} />
                <div>
                  <div className="text-xs font-bold text-white">RailBot AI v3.0</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Seamlessly updates backend endpoint without refreshing the app.
            </p>
          </div>

          {/* Save Footer */}
          <div className="pt-3 border-t border-[var(--rail-border)] flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-[var(--rail-charcoal)] hover:bg-[var(--rail-bg-secondary)] font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[var(--rail-maroon)] hover:bg-[var(--rail-maroon-deep)] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved & Applied!' : 'Save Changes'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
