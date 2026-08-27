import React, { useState, useEffect, useRef, Component } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import QuickActions from './components/QuickActions';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import WelcomeHero from './components/WelcomeHero';
import FloatingElements from './components/FloatingElements';
import TrainScene3D from './components/TrainScene3D';
import LiveTrainStatus from './components/LiveTrainStatus';
import DidYouKnow from './components/DidYouKnow';
import { sendChatMessage } from './services/api';
import { Train } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Error boundary – prevents a single bad message from blanking the entire page
class MessageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="px-4 py-3 text-sm text-gray-400 italic">
          (This message could not be displayed.)
        </div>
      );
    }
    return this.props.children;
  }
}


export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingText, setLoadingText] = useState('Searching railway information...');
  const [externalPrompt, setExternalPrompt] = useState('');
  const messagesEndRef = useRef(null);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('railbot_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        } else {
          createNewSession();
        }
      } else {
        createNewSession();
      }
    } catch (e) {
      console.error('Failed to parse saved sessions:', e);
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage whenever modified
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('railbot_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom of message feed
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, isTyping]);

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Railway Enquiry',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const handleSendMessage = async (text) => {
    if (!currentSessionId) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };

    // Update current session with user message
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === currentSessionId) {
          const isFirstUserMessage = session.messages.filter((m) => m.sender === 'user').length === 0;
          return {
            ...session,
            title: isFirstUserMessage ? (text.length > 28 ? text.substring(0, 28) + '...' : text) : session.title,
            messages: [...session.messages, userMsg]
          };
        }
        return session;
      })
    );

    // Set appropriate loading text
    let newLoadingText = 'Searching railway information...';
    const textLower = text.toLowerCase();
    if (textLower.includes('train')) newLoadingText = 'Finding trains...';
    if (textLower.includes('station')) newLoadingText = 'Finding station information...';
    if (textLower.includes('schedule')) newLoadingText = 'Fetching schedule...';
    if (textLower.includes('pnr')) newLoadingText = 'Checking live status...';
    if (textLower.includes('live')) newLoadingText = 'Checking live status...';
    
    setLoadingText(newLoadingText);
    setIsTyping(true);

    // Call API
    const savedBackendUrl = localStorage.getItem('railbot_backend_url') || import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await sendChatMessage(text, savedBackendUrl);

      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.text,
        trains: response.trains || null,
        station: response.station || null,
        schedule: response.schedule || null,
        pnrDetails: response.pnrDetails || null,
        route: response.route || null,
        timestamp: new Date().toISOString()
      };

      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, botMsg]
            };
          }
          return session;
        })
      );
    } catch (e) {
       const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to the backend.',
        timestamp: new Date().toISOString()
      };
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, botMsg]
            };
          }
          return session;
        })
      );
    }

    setIsTyping(false);
  };

  const handleDeleteSession = (idToDelete) => {
    const updated = sessions.filter((s) => s.id !== idToDelete);
    setSessions(updated);
    if (currentSessionId === idToDelete) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        localStorage.removeItem('railbot_chat_sessions');
        createNewSession();
      }
    }
  };

  const handleClearAllHistory = () => {
    localStorage.removeItem('railbot_chat_sessions');
    setSessions([]);
    createNewSession();
  };

  const handleClearCurrentChat = () => {
    if (!currentSessionId) return;
    if (!confirm('Clear this conversation?')) return;
    handleDeleteSession(currentSessionId);
  };

  const handleQuickActionTrigger = (promptText) => {
    setExternalPrompt(promptText);
  };

  const isNewChat = currentSession && currentSession.messages.length === 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--rail-bg-primary)] text-[var(--rail-charcoal)] antialiased font-sans">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenSettings={() => setSettingsOpen(true)}
        isBackendConnected={true}
        onNavClick={handleQuickActionTrigger}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => setCurrentSessionId(id)}
          onNewChat={createNewSession}
          onDeleteSession={handleDeleteSession}
          onClearAll={handleClearAllHistory}
          onOpenSettings={() => setSettingsOpen(true)}
          onQuickActionTrigger={handleQuickActionTrigger}
        />

        {/* Main Central Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-[var(--rail-border)]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth relative">
            <FloatingElements />

            {/* Welcome Hero - Always visible at top */}
            <WelcomeHero onStartChat={(prompt) => handleQuickActionTrigger(typeof prompt === 'string' ? prompt : 'Show trains from Mumbai to Delhi')} />

            {/* Chat Messages */}
            <div className="pb-4">
              {currentSession &&
                currentSession.messages.map((msg) => (
                  <MessageErrorBoundary key={msg.id}>
                    <ChatMessage message={msg} />
                  </MessageErrorBoundary>
                ))}

              {/* Typing Indicator / Loading Animation */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="py-4 px-4 sm:px-6 mx-auto flex items-center justify-center gap-4 text-slate-400"
                  >
                     <div className="flex flex-col items-center justify-center gap-3">
                       <Train className="w-10 h-10 text-[var(--rail-maroon)] animate-train-loading" />
                       <span className="text-[var(--rail-charcoal)] font-medium text-sm">{loadingText}</span>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              externalInputPrompt={externalPrompt}
              onClearChat={handleClearCurrentChat}
            />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:flex flex-col w-[360px] flex-shrink-0 h-full overflow-y-auto bg-[var(--rail-bg-primary)] p-6 space-y-6">
          <QuickActions onActionSelect={handleQuickActionTrigger} />
          <LiveTrainStatus onActionSelect={handleQuickActionTrigger} />
          <DidYouKnow />
        </aside>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onClearAllHistory={handleClearAllHistory}
      />
    </div>
  );
}
