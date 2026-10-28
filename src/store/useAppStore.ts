import { create } from 'zustand';
import type { AlgorithmCategory } from '../types/algorithm';
import { usePlayerStore } from '../engine/usePlayerStore';

export type AppView = AlgorithmCategory | 'landing' | 'cheatsheet';

export interface AppStore {
  theme: 'dark' | 'light';
  activeView: AppView;
  isTourOpen: boolean;
  isHelpModalOpen: boolean;
  isQuizModalOpen: boolean;
  confettiEnabled: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setActiveView: (view: AppView) => void;
  setIsTourOpen: (open: boolean) => void;
  setIsHelpModalOpen: (open: boolean) => void;
  setIsQuizModalOpen: (open: boolean) => void;
  toggleConfetti: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  theme: 'dark',
  activeView: 'landing', // Default to Landing Page overview
  isTourOpen: false,
  isHelpModalOpen: false,
  isQuizModalOpen: false,
  confettiEnabled: true,

  setTheme: (theme) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(nextTheme);
      return { theme: nextTheme };
    });
  },

  setActiveView: (view) => {
    usePlayerStore.getState().clear();
    set({ activeView: view });
  },
  setIsTourOpen: (open) => set({ isTourOpen: open }),
  setIsHelpModalOpen: (open) => set({ isHelpModalOpen: open }),
  setIsQuizModalOpen: (open) => set({ isQuizModalOpen: open }),
  toggleConfetti: () => set((state) => ({ confettiEnabled: !state.confettiEnabled })),
}));
