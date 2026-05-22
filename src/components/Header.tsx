import { Tv, Settings, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  activeTab: 'viewer' | 'admin';
  setActiveTab: (tab: 'viewer' | 'admin') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Radio className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-zinc-200 to-indigo-400 bg-clip-text text-transparent">
              HIEU DEP TRai
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-indigo-900/40 border border-indigo-700/30 text-[10px] text-indigo-300 font-bold uppercase tracking-widest rounded-full">
              Portal
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 bg-zinc-900/95 border border-zinc-800 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('viewer')}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              activeTab === 'viewer' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'viewer' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-600 rounded-lg"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Tv className="w-4 h-4" />
              Xem Kênh
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              activeTab === 'admin' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'admin' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-600 rounded-lg"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Quản Trị
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
