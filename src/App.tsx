import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { SearchingPage } from './pages/SearchingPage';
import { SortingPage } from './pages/SortingPage';
import { StackQueuePage } from './pages/StackQueuePage';
import { TreesPage } from './pages/TreesPage';
import { GraphsPage } from './pages/GraphsPage';
import { HashingPage } from './pages/HashingPage';
import { CheatSheetPage } from './pages/CheatSheetPage';
import { HelpModal } from './components/common/HelpModal';
import { GuidedTour } from './components/tour/GuidedTour';
import { QuizModal } from './components/common/QuizModal';
import { useAppStore } from './store/useAppStore';
import { usePlaybackEngine } from './engine/usePlaybackEngine';
import { useKeyboardShortcuts } from './engine/keyboardShortcuts';

export function App() {
  // Activate global playback timer engine & keyboard shortcuts
  usePlaybackEngine();
  useKeyboardShortcuts();

  const { activeView } = useAppStore();

  return (
    <DashboardLayout>
      {/* Dynamic View Router */}
      {(() => {
        switch (activeView) {
          case 'landing':
            return <LandingPage />;
          case 'cheatsheet':
            return <CheatSheetPage />;
          case 'searching':
            return <SearchingPage />;
          case 'stack-queue':
            return <StackQueuePage />;
          case 'trees':
            return <TreesPage />;
          case 'graphs':
            return <GraphsPage />;
          case 'hashing':
            return <HashingPage />;
          case 'sorting':
          default:
            return <SortingPage />;
        }
      })()}

      {/* Global Modals */}
      <HelpModal />
      <GuidedTour />
      <QuizModal />
    </DashboardLayout>
  );
}

export default App;
