import React, { useState } from 'react';
import { X, Server, Check, RefreshCw, Trash2, ShieldAlert, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import RailBotLogo from './RailBotLogo';
import junctionImage from '../assets/images/railway_platform.jpg';

export default function SettingsModal({ isOpen, onClose, onClearAllHistory }) {
  const defaultUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
  const [backendUrl, setBackendUrl] = useState(
    localStorage.getItem('railbot_backend_url') || defaultUrl
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axios.get(`${backendUrl.replace(/\/$/, '')}`, { timeout: 3000 });
      setTestResult({ success: true, message: `Connected successfully (${res.status} OK)` });
    } catch (err) {
      setTestResult({
        success: false,
        message: `Offline / Unreachable (${err.message}).`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('railbot_backend_url', backendUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
      window.location.reload();
    }, 1000);
  };

  const handleResetDefault = () => {
    localStorage.removeItem('railbot_backend_url');
    setBackendUrl(defaultUrl);
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
          className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-[#7A1F2B]" />
              <h3 className="font-bold text-base text-[#242424]">Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6b7280] hover:text-[#242424] rounded-lg hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Backend Config */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-wider">
              Backend API Endpoint
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-[#242424] font-mono focus:border-[#7A1F2B] focus:bg-white focus:outline-none transition-colors"
              />
              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-[#6b7280] hover:text-[#242424] transition-colors underline underline-offset-2 font-medium"
                >
                  Reset to default
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-1 text-[#C7862B] hover:text-[#9e6921] font-bold transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs flex items-start gap-2 border font-medium ${
                testResult.success
                  ? 'bg-[#2E7D5B]/10 border-[#2E7D5B]/20 text-[#2E7D5B]'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Clear History */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-wider">
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
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Chat History</span>
            </button>
          </div>

          {/* About */}
          <div className="pt-3 border-t border-gray-200">
            <div className="relative h-24 rounded-lg overflow-hidden mb-3 border border-gray-200">
              <img src={junctionImage} alt="Railway Junction" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <RailBotLogo size={24} showText={false} />
                <div>
                  <div className="text-sm font-bold text-white">RailBot AI v3.0</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#6b7280] leading-relaxed font-medium">
              Built with FastAPI, React, and Framer Motion. Processes natural language queries to provide train, station, schedule, and route information.
            </p>
          </div>

          {/* Save Footer */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[#6b7280] hover:text-[#242424] hover:bg-gray-100 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#7A1F2B] hover:bg-[#5C1720] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
