import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ onSendMessage, disabled, externalInputPrompt, onClearChat }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync external prompt
  useEffect(() => {
    if (externalInputPrompt) {
      setInput(externalInputPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [externalInputPrompt]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      alert('Voice Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white border border-[var(--rail-border)] rounded-[32px] shadow-sm p-2 transition-all duration-300 focus-within:border-[var(--rail-maroon)] focus-within:shadow-[0_4px_20px_rgba(122,31,43,0.08)] flex items-end gap-2"
      >
        <button
          type="button"
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening...' : 'Ask about trains, stations, routes or schedules...'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[var(--rail-charcoal)] placeholder-gray-400 text-[15px] font-medium resize-none focus:outline-none py-3 px-1 max-h-32 min-h-[44px] leading-relaxed"
          aria-label="Chat message input"
        />

        {/* Voice button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-3 rounded-full transition-all shrink-0 ${
            isListening
              ? 'bg-[var(--rail-maroon)]/10 text-[var(--rail-maroon)] animate-pulse'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
          aria-label={isListening ? 'Stop Listening' : 'Voice Input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={`p-3 rounded-full font-medium transition-all duration-200 shrink-0 flex items-center justify-center ${
            input.trim() && !disabled
              ? 'bg-[var(--rail-maroon)] text-white shadow-md hover:bg-[var(--rail-maroon-deep)] hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Send Message"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
      
      <div className="mt-3 text-center text-[11px] font-medium text-gray-400">
        RailBot AI is an independent assistant and not affiliated with Indian Railways. Please verify critical information on the official IRCTC or Indian Railways website.
      </div>
    </div>
  );
}
