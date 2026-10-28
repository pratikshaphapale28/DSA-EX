import React from 'react';
import {
  ArrowUpDown,
  Search,
  Layers,
  GitFork,
  Network,
  Hash,
  TableProperties,
  Home,
  ChevronRight,
} from 'lucide-react';
import { useAppStore, type AppView } from '../../store/useAppStore';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'landing',
    label: 'Overview',
    icon: <Home className="w-4 h-4" />,
  },
  {
    id: 'sorting',
    label: 'Sorting',
    icon: <ArrowUpDown className="w-4 h-4" />,
  },
  {
    id: 'searching',
    label: 'Searching',
    icon: <Search className="w-4 h-4" />,
  },
  {
    id: 'stack-queue',
    label: 'Stack & Queue',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'trees',
    label: 'Trees',
    icon: <GitFork className="w-4 h-4" />,
  },
  {
    id: 'graphs',
    label: 'Graphs',
    icon: <Network className="w-4 h-4" />,
  },
  {
    id: 'hashing',
    label: 'Hashing',
    icon: <Hash className="w-4 h-4" />,
  },
  {
    id: 'cheatsheet',
    label: 'Cheat Sheet',
    icon: <TableProperties className="w-4 h-4" />,
  },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useAppStore();

  return (
    <aside
      className="w-56 border-r border-slate-800 bg-slate-950/60 p-3 flex flex-col justify-between shrink-0 hidden md:flex"
      aria-label="Sidebar Navigation"
    >
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Learning Modules
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive
                      ? 'text-brand-400 translate-x-0.5'
                      : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
