import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  HelpCircle,
  Sparkles,
  Compass,
  PartyPopper,
  Settings,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { usePlayerStore } from '../../engine/usePlayerStore';
import { Tooltip } from '../common/Tooltip';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setActiveView,
    setIsTourOpen,
    setIsHelpModalOpen,
    confettiEnabled,
    toggleConfetti,
  } = useAppStore();
  const { mode, toggleMode } = usePlayerStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
          aria-label="DSA Explorer Home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-700 via-brand-500 to-accent-cyan p-0.5 shadow-glow group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Compass className="w-4 h-4 text-brand-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            DSA Explorer
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Labelled Beginner / Advanced Toggle */}
        <Tooltip
          content={
            mode === 'beginner'
              ? 'Beginner Mode: Expanded explanations & conversational step narration'
              : 'Advanced Mode: Compact metrics & algorithmic focus'
          }
        >
          <button
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              mode === 'beginner'
                ? 'bg-brand-500/10 text-brand-300 border-brand-500/30 hover:bg-brand-500/20'
                : 'bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20'
            }`}
            aria-label={`Toggle mode, currently ${mode} mode`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="capitalize">{mode}</span>
          </button>
        </Tooltip>

        {/* Tour Button */}
        <Tooltip content="Launch interactive guided tour">
          <button
            onClick={() => setIsTourOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            aria-label="Take a tour"
          >
            <Compass className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Tour</span>
          </button>
        </Tooltip>

        {/* Help Button */}
        <Tooltip content="Shortcuts & Guide">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-center w-7 h-7 font-bold text-xs"
            aria-label="Help and shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Settings Menu Dropdown */}
        <div className="relative" ref={settingsRef}>
          <Tooltip content="Settings (Theme & Confetti)">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-center w-7 h-7 ${
                isSettingsOpen ? 'bg-slate-800 text-white border-slate-700' : ''
              }`}
              aria-label="Settings"
              aria-expanded={isSettingsOpen}
            >
              <Settings className="w-4 h-4" />
            </button>
          </Tooltip>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-2 z-50 space-y-1 text-xs">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Settings
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <span>Theme</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400 capitalize">
                  {theme}
                </span>
              </button>

              {/* Confetti Toggle */}
              <button
                onClick={toggleConfetti}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label={`Toggle confetti, currently ${confettiEnabled ? 'on' : 'off'}`}
              >
                <span className="flex items-center gap-2">
                  <PartyPopper className={`w-3.5 h-3.5 ${confettiEnabled ? 'text-accent-cyan' : 'text-slate-500'}`} />
                  <span>Confetti</span>
                </span>
                <span className={`text-[11px] font-medium ${confettiEnabled ? 'text-accent-cyan' : 'text-slate-500'}`}>
                  {confettiEnabled ? 'On' : 'Off'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
