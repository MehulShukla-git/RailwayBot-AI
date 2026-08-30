import React, { useState, useEffect, useRef, Component } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import QuickActions from './components/QuickActions';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import SavedSearchesModal from './components/SavedSearchesModal';
import WelcomeHero from './components/WelcomeHero';
import FloatingElements from './components/FloatingElements';
import LiveTrainStatus from './components/LiveTrainStatus';
import DidYouKnow from './components/DidYouKnow';
import { sendChatMessage, checkBackendHealth, getActiveBackendUrl } from './services/api';
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

const DEFAULT_SAVED_SEARCHES = [
  'Show trains from Mumbai to Delhi',
  'Show schedule of train 12951',
  'Tell me about Nagpur'
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);
  
  // Real Backend Health State
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('Checking backend status...');
  const [backendUrl, setBackendUrl] = useState(getActiveBackendUrl());

  // Theme & Language
  const [theme, setTheme] = useState(() => localStorage.getItem('railbot_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('railbot_language') || 'en');
  
  // Navigation & Searches
  const [activeNav, setActiveNav] = useState('Home');
  const [savedSearches, setSavedSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('railbot_saved_searches');
      return saved ? JSON.parse(saved) : DEFAULT_SAVED_SEARCHES;
    } catch {
      return DEFAULT_SAVED_SEARCHES;
    }
  });

  // Dynamic Live Status
  const [latestLiveStatus, setLatestLiveStatus] = useState(null);

  // Chat sessions & interaction
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('railbot_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const initialSession = {
      id: Date.now().toString(),
      title: 'New Railway Enquiry',
      createdAt: new Date().toISOString(),
      messages: []
    };
    return [initialSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('railbot_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isTyping, setIsTyping] = useState(false);
  const [loadingText, setLoadingText] = useState('Searching railway information...');
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Sync theme with DOM document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('railbot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('railbot_language', newLang);
  };

  // Health check on mount and periodic interval
  useEffect(() => {
    let isMounted = true;
    const performCheck = async () => {
      const res = await checkBackendHealth(backendUrl);
      if (isMounted) {
        setIsBackendConnected(res.isHealthy);
        setConnectionMessage(res.isHealthy ? `Connected to ${res.message}` : res.message);
      }
    };

    performCheck();
    const interval = setInterval(performCheck, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [backendUrl]);

  // Set initial currentSessionId and latest live status on mount
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
    // Check for any existing liveStatus in previous messages
    for (const s of sessions) {
      const liveMsg = [...(s.messages || [])].reverse().find((m) => m.liveStatus);
      if (liveMsg?.liveStatus) {
        setLatestLiveStatus(liveMsg.liveStatus);
        break;
      }
    }
  }, []);

  // Save sessions to localStorage whenever modified
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('railbot_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save saved searches
  useEffect(() => {
    localStorage.setItem('railbot_saved_searches', JSON.stringify(savedSearches));
  }, [savedSearches]);

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
    setActiveNav('Home');
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  /**
   * Unified Message Submission Pipeline
   * Handles user query submission, loading state, backend API invocation, structured response storage.
   */
  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
      const newSession = {
        id: Date.now().toString(),
        title: cleanText.length > 28 ? cleanText.substring(0, 28) + '...' : cleanText,
        createdAt: new Date().toISOString(),
        messages: []
      };
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      targetSessionId = newSession.id;
    }

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toISOString()
    };

    // Update current session with user message
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === targetSessionId) {
          const isFirstUserMessage = session.messages.filter((m) => m.sender === 'user').length === 0;
          return {
            ...session,
            title: isFirstUserMessage ? (cleanText.length > 28 ? cleanText.substring(0, 28) + '...' : cleanText) : session.title,
            messages: [...session.messages, userMsg]
          };
        }
        return session;
      })
    );

    // Set appropriate dynamic loading text
    let newLoadingText = 'Searching railway database...';
    const textLower = cleanText.toLowerCase();
    if (textLower.includes('train')) newLoadingText = 'Finding trains...';
    if (textLower.includes('station')) newLoadingText = 'Finding station information...';
    if (textLower.includes('schedule')) newLoadingText = 'Fetching train schedule...';
    if (textLower.includes('pnr')) newLoadingText = 'Checking PNR status...';
    if (textLower.includes('live')) newLoadingText = 'Checking live train position...';
    if (textLower.includes('route')) newLoadingText = 'Mapping train route...';
    
    setLoadingText(newLoadingText);
    setIsTyping(true);

    try {
      const activeUrl = localStorage.getItem('railbot_backend_url') || backendUrl;
      const response = await sendChatMessage(cleanText, activeUrl);

      if (response.success) {
        setIsBackendConnected(true);
      } else if (response.errorType === 'network_error') {
        setIsBackendConnected(false);
      }

      // Preserve all structured backend responses, including liveStatus
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.text,
        trains: response.trains || null,
        station: response.station || null,
        schedule: response.schedule || null,
        pnrDetails: response.pnrDetails || null,
        route: response.route || null,
        liveStatus: response.liveStatus || null,
        timestamp: new Date().toISOString()
      };

      if (response.liveStatus) {
        setLatestLiveStatus(response.liveStatus);
      }

      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === targetSessionId) {
            return {
              ...session,
              messages: [...session.messages, botMsg]
            };
          }
          return session;
        })
      );
    } catch (e) {
      console.error('[RailBot AI] Send message exception:', e);
      setIsBackendConnected(false);
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: '⚠️ An unexpected error occurred while communicating with the RailBot backend. Please verify your connection.',
        timestamp: new Date().toISOString()
      };
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === targetSessionId) {
            return {
              ...session,
              messages: [...session.messages, botMsg]
            };
          }
          return session;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Functional Actions Execution:
   * Directly executes the query immediately through the handleSendMessage pipeline.
   */
  const handleFunctionalAction = (queryText) => {
    if (typeof queryText === 'string' && queryText.trim()) {
      handleSendMessage(queryText.trim());
    }
  };

  /**
   * Navigation handler
   */
  const handleNavClick = (navLabel, query) => {
    setActiveNav(navLabel);
    if (navLabel === 'Home') {
      const chatContainer = document.getElementById('chat-scroll-container');
      chatContainer?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (query) {
      handleSendMessage(query);
    }
  };

  const handleStartEnquiryFocus = () => {
    chatInputRef.current?.focus();
  };

  // Saved Searches Management
  const handleSaveSearch = (query) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    if (!savedSearches.includes(clean)) {
      setSavedSearches((prev) => [clean, ...prev]);
    }
  };

  const handleDeleteSavedSearch = (queryToDelete) => {
    setSavedSearches((prev) => prev.filter((q) => q !== queryToDelete));
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

  const handleBackendUrlChange = (newUrl) => {
    setBackendUrl(newUrl);
    runHealthCheck(newUrl);
  };

  const hasMessages = currentSession && currentSession.messages.length > 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--rail-bg-primary)] text-[var(--rail-charcoal)] antialiased font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSavedSearches={() => setSavedSearchesOpen(true)}
        isBackendConnected={isBackendConnected}
        connectionMessage={connectionMessage}
        onNavClick={handleNavClick}
        activeNav={activeNav}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onChangeLanguage={handleLanguageChange}
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
          onExecuteQuery={handleNavClick}
          activeNav={activeNav}
          onOpenSavedSearches={() => setSavedSearchesOpen(true)}
        />

        {/* Main Central Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-[var(--rail-border)]">
          <div
            id="chat-scroll-container"
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth relative"
          >
            <FloatingElements />

            {/* Welcome Hero - Expands when new, gracefully collapses when conversation has messages */}
            <WelcomeHero
              onStartEnquiry={handleStartEnquiryFocus}
              onExploreTrains={handleFunctionalAction}
              isCollapsed={hasMessages}
            />

            {/* Chat Messages */}
            <div className="pb-4">
              {currentSession &&
                currentSession.messages.map((msg) => (
                  <MessageErrorBoundary key={msg.id}>
                    <ChatMessage
                      message={msg}
                      onActionSelect={handleFunctionalAction}
                    />
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
                       <Train className="w-9 h-9 text-[var(--rail-maroon)] animate-train-loading" />
                       <span className="text-[var(--rail-charcoal)] font-medium text-xs tracking-wide">{loadingText}</span>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="px-4 sm:px-6 lg:px-8 pb-4">
            <ChatInput
              ref={chatInputRef}
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              onClearChat={handleClearCurrentChat}
            />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:flex flex-col w-[360px] flex-shrink-0 h-full overflow-y-auto bg-[var(--rail-bg-primary)] p-6 space-y-5 border-l border-[var(--rail-border)]">
          <QuickActions onActionSelect={handleFunctionalAction} />
          <LiveTrainStatus
            liveData={latestLiveStatus}
            onActionSelect={handleFunctionalAction}
          />
          <DidYouKnow />
        </aside>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onClearAllHistory={handleClearAllHistory}
        onBackendUrlChange={handleBackendUrlChange}
      />

      {/* About Us Modal */}
      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      {/* Saved Searches Modal */}
      <SavedSearchesModal
        isOpen={savedSearchesOpen}
        onClose={() => setSavedSearchesOpen(false)}
        savedSearches={savedSearches}
        onExecuteSearch={handleFunctionalAction}
        onSaveSearch={handleSaveSearch}
        onDeleteSearch={handleDeleteSavedSearch}
      />
    </div>
  );
}
