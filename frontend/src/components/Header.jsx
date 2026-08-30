import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, ChevronDown, Check, Globe } from 'lucide-react';
import RailBotLogo from './RailBotLogo';

export default function Header({
  onToggleSidebar,
  onOpenSettings,
  onOpenAbout,
  isBackendConnected,
  connectionMessage,
  onNavClick,
  activeNav = 'Home',
  theme = 'light',
  onToggleTheme,
  language = 'en',
  onChangeLanguage,
  onOpenSavedSearches
}) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langRef = useRef(null);
  const userRef = useRef(null);

  const navItems = [
    { label: 'Home', query: null },
    { label: 'Trains', query: 'Show trains from Mumbai to Delhi' },
    { label: 'Stations', query: 'Tell me about Nagpur' },
    { label: 'Schedules', query: 'Show schedule of train 12951' },
    { label: 'About Us', action: 'about' }
  ];

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--rail-bg-primary)] border-b border-[var(--rail-border)] px-4 sm:px-6 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left: Menu + Logo + Backend Status Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-[var(--rail-charcoal)] lg:hidden rounded-lg transition-colors border border-transparent hover:bg-[var(--rail-bg-secondary)] cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <RailBotLogo size={40} showText={true} animate={false} />
            
            {/* Real Connection Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                isBackendConnected
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
              }`}
              title={connectionMessage || (isBackendConnected ? 'Backend API is connected and responding' : 'Backend API is offline / unreachable')}
            >
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isBackendConnected ? 'Live API' : 'API Offline'}</span>
            </div>
          </div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action === 'about') {
                    onOpenAbout();
                  } else {
                    onNavClick(item.label, item.query);
                  }
                }}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--rail-maroon)] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-[var(--rail-bg-secondary)] hover:text-[var(--rail-charcoal)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Language, Theme, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--rail-border)] bg-[var(--rail-bg-card)] text-[var(--rail-charcoal)] hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer text-xs font-bold shadow-sm"
              title="Select Language"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">{currentLangObj.label}</span>
              <span className="sm:hidden">{currentLangObj.code.toUpperCase()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-[var(--rail-bg-card)] border border-[var(--rail-border)] rounded-xl shadow-xl py-1 z-50 text-xs font-semibold">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onChangeLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-[var(--rail-charcoal)] hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer"
                  >
                    <span>{lang.label} ({lang.native})</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-[var(--rail-maroon)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-[var(--rail-border)] text-[var(--rail-charcoal)] bg-[var(--rail-bg-card)] hover:bg-[var(--rail-bg-secondary)] transition-all shadow-sm cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2 rounded-xl border border-[var(--rail-border)] bg-[var(--rail-bg-card)] hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer"
              title="User Menu"
              aria-label="User Menu"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 overflow-hidden border border-[var(--rail-border)] shrink-0">
                <img src="https://ui-avatars.com/api/?name=Passenger&background=F2F0EC&color=7A1F2B&bold=true" alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs font-semibold text-[var(--rail-charcoal)]">Passenger</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[var(--rail-bg-card)] border border-[var(--rail-border)] rounded-xl shadow-xl py-1.5 z-50 text-xs font-semibold">
                <div className="px-3 py-2 border-b border-[var(--rail-border)] text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  Passenger Options
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSavedSearches();
                  }}
                  className="w-full text-left px-3 py-2 text-[var(--rail-charcoal)] hover:bg-[var(--rail-bg-secondary)] flex items-center gap-2 cursor-pointer"
                >
                  <span>⭐ Saved Searches</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAbout();
                  }}
                  className="w-full text-left px-3 py-2 text-[var(--rail-charcoal)] hover:bg-[var(--rail-bg-secondary)] flex items-center gap-2 cursor-pointer"
                >
                  <span>ℹ️ About RailBot AI</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 text-[var(--rail-charcoal)] hover:bg-[var(--rail-bg-secondary)] flex items-center gap-2 border-t border-[var(--rail-border)] cursor-pointer"
                >
                  <span>⚙️ API Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
