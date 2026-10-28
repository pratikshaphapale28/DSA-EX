import { create } from 'zustand';
import type { Step } from '../types/algorithm';

export interface PlayerStore {
  steps: Step<any, any>[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  mode: 'beginner' | 'advanced';
  autoScrollCode: boolean;

  // Actions
  setSteps: (steps: Step<any, any>[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  advancePlayback: () => void;
  reset: () => void;
  clear: () => void;
  setSpeed: (speed: number) => void;
  setMode: (mode: 'beginner' | 'advanced') => void;
  toggleMode: () => void;
  setAutoScrollCode: (autoScroll: boolean) => void;

  // Selectors
  getCurrentStep: () => Step<any, any> | null;
  getIsAtStart: () => boolean;
  getIsAtEnd: () => boolean;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  speed: 1,
  mode: 'beginner',
  autoScrollCode: true,

  setSteps: (steps) => {
    set({
      steps,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  clear: () => {
    set({
      steps: [],
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  play: () => {
    const { steps, currentStepIndex } = get();
    if (steps.length === 0) return;
    if (currentStepIndex >= steps.length - 1) {
      set({ currentStepIndex: 0, isPlaying: true });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => {
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  nextStep: () => {
    const { steps, currentStepIndex } = get();
    if (steps.length === 0) return;
    // Manual Next while playing: pause playback, then perform the move
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1, isPlaying: false });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      // Manual Prev while playing: pause playback, then perform the move
      set({ currentStepIndex: currentStepIndex - 1, isPlaying: false });
    } else {
      set({ isPlaying: false });
    }
  },

  goToStep: (index) => {
    const { steps } = get();
    if (steps.length === 0) return;
    const boundedIndex = Math.max(0, Math.min(index, steps.length - 1));
    // Timeline drag while playing: pause playback, then perform the move
    set({ currentStepIndex: boundedIndex, isPlaying: false });
  },

  advancePlayback: () => {
    const { steps, currentStepIndex } = get();
    if (steps.length === 0) return;
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  reset: () => {
    set({ currentStepIndex: 0, isPlaying: false });
  },

  setSpeed: (speed) => {
    set({ speed });
  },

  setMode: (mode) => {
    set({ mode });
  },

  toggleMode: () => {
    set((state) => ({
      mode: state.mode === 'beginner' ? 'advanced' : 'beginner',
    }));
  },

  setAutoScrollCode: (autoScrollCode) => {
    set({ autoScrollCode });
  },

  getCurrentStep: () => {
    const { steps, currentStepIndex } = get();
    if (steps.length === 0 || currentStepIndex < 0 || currentStepIndex >= steps.length) {
      return null;
    }
    return steps[currentStepIndex];
  },

  getIsAtStart: () => {
    return get().currentStepIndex === 0;
  },

  getIsAtEnd: () => {
    const { steps, currentStepIndex } = get();
    return steps.length === 0 || currentStepIndex >= steps.length - 1;
  },
}));
