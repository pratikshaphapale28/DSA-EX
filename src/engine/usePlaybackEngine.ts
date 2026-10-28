import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from './usePlayerStore';
import { useAppStore } from '../store/useAppStore';

export function playbackEffect(
  isPlaying: boolean,
  speed: number,
  currentStepIndex: number,
  advancePlayback: () => void
): () => void {
  if (!isPlaying) return () => {};

  const { steps } = usePlayerStore.getState();
  if (steps.length === 0 || currentStepIndex >= steps.length - 1) {
    usePlayerStore.setState({ isPlaying: false });

    // Trigger celebration confetti once on completion if enabled
    const confettiEnabled = useAppStore.getState().confettiEnabled;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (
      typeof document !== 'undefined' &&
      typeof window !== 'undefined' &&
      confettiEnabled &&
      !prefersReducedMotion &&
      steps.length > 1
    ) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#437cff', '#06b6d4', '#10b981'],
      });
    }
    return () => {};
  }

  // Delay = 1200ms / speed (0.25x: 4800ms, 0.5x: 2400ms, 1x: 1200ms, 2x: 600ms, 4x: 300ms)
  const delay = Math.round(1200 / speed);

  const timer = setTimeout(() => {
    advancePlayback();
  }, delay);

  return () => {
    clearTimeout(timer);
  };
}

export function usePlaybackEngine() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const speed = usePlayerStore((s) => s.speed);
  const currentStepIndex = usePlayerStore((s) => s.currentStepIndex);
  const advancePlayback = usePlayerStore((s) => s.advancePlayback);

  useEffect(() => {
    return playbackEffect(isPlaying, speed, currentStepIndex, advancePlayback);
  }, [isPlaying, speed, currentStepIndex, advancePlayback]);
}
