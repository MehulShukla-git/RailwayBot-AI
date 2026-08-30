import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Mic, MicOff, Paperclip, X, Image as ImageIcon } from 'lucide-react';

const ChatInput = forwardRef(function ChatInput(
  { onSendMessage, disabled },
  ref
) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [attachedFile, setAttachedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Expose focus to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    setInputText: (text) => {
      setInput(text);
      textareaRef.current?.focus();
    }
  }));

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      // If input is empty, provide a prompt hint
      if (!input.trim()) {
        setInput(`Extracted enquiry from ticket: ${file.name.replace(/\.[^/.]+$/, '')}`);
      }
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || disabled) return;
    
    let submission = input.trim();
    if (attachedFile && !submission) {
      submission = `Analyze ticket ${attachedFile.name}`;
    }
    
    onSendMessage(submission);
    setInput('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      {/* File Attachment Pill */}
      {attachedFile && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--rail-bg-card)] border border-[var(--rail-border)] text-xs text-[var(--rail-charcoal)] shadow-sm">
          <ImageIcon className="w-3.5 h-3.5 text-[var(--rail-maroon)]" />
          <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative bg-[var(--rail-bg-card)] border border-[var(--rail-border)] rounded-[32px] shadow-sm p-2 transition-all duration-300 focus-within:border-[var(--rail-maroon)] focus-within:shadow-[0_4px_20px_rgba(122,31,43,0.08)] flex items-end gap-2"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="ticket-file-input"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-400 hover:text-[var(--rail-maroon)] transition-colors shrink-0 cursor-pointer"
          aria-label="Attach ticket or itinerary"
          title="Attach ticket image or document"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening... Speak your query' : 'Ask about trains, stations, routes or schedules (Press Enter to send)...'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[var(--rail-charcoal)] placeholder-gray-400 text-[15px] font-medium resize-none focus:outline-none py-3 px-1 max-h-32 min-h-[44px] leading-relaxed"
          aria-label="Chat message input"
        />

        {/* Voice button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-3 rounded-full transition-all shrink-0 cursor-pointer ${
            isListening
              ? 'bg-[var(--rail-maroon)]/10 text-[var(--rail-maroon)] animate-pulse'
              : 'text-gray-400 hover:text-[var(--rail-charcoal)] hover:bg-[var(--rail-bg-secondary)]'
          }`}
          aria-label={isListening ? 'Stop Listening' : 'Voice Input'}
          title={isListening ? 'Stop Voice Input' : 'Voice Input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!input.trim() && !attachedFile) || disabled}
          className={`p-3 rounded-full font-medium transition-all duration-200 shrink-0 flex items-center justify-center cursor-pointer ${
            (input.trim() || attachedFile) && !disabled
              ? 'bg-[var(--rail-maroon)] text-white shadow-md hover:bg-[var(--rail-maroon-deep)] hover:-translate-y-0.5'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Send Message"
          title="Send Enquiry"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
      
      <div className="mt-3 text-center text-[11px] font-medium text-gray-400">
        RailBot AI is an independent assistant. Please verify critical journey details with official IRCTC sources.
      </div>
    </div>
  );
});

export default ChatInput;
