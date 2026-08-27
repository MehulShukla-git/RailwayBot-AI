import React from 'react';
import { Menu, Search, Sun, User, ChevronDown } from 'lucide-react';
import RailBotLogo from './RailBotLogo';

export default function Header({ onToggleSidebar, onOpenSettings, isBackendConnected, onNavClick }) {
  const navItems = ['Home', 'Trains', 'Stations', 'Schedules', 'About Us'];

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--rail-bg-primary)] border-b border-[var(--rail-border)] px-6 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-900 lg:hidden rounded-lg transition-colors border border-transparent"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <RailBotLogo size={42} showText={true} animate={false} />
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item, index) => (
            <button
              key={item}
              onClick={() => {
                if (item === 'Trains') onNavClick('Show trains from Mumbai to Delhi');
                if (item === 'Stations') onNavClick('Tell me about Nagpur');
                if (item === 'Schedules') onNavClick('Show schedule of train 12951');
                if (item === 'About Us') onOpenSettings();
                if (item === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                index === 0
                  ? 'bg-[var(--rail-maroon)] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right: Language, Theme, User */}
        <div className="flex items-center gap-4">
          <div
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            title="Language: English"
          >
            <span className="text-sm font-bold text-gray-700">English</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm cursor-pointer"
            aria-label="Theme & Settings Toggle"
            title="Settings"
          >
            <Sun className="w-4 h-4" />
          </button>

          <div
            onClick={onOpenSettings}
            className="flex items-center gap-2 cursor-pointer group"
            title="Open Settings"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <img src="https://ui-avatars.com/api/?name=User&background=F2F0EC&color=7A1F2B&bold=true" alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Hello, User</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
