
import React from 'react';
import { Home, Camera, Salad, User } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'scan', icon: Camera, label: 'Scan' },
    { id: 'builder', icon: Salad, label: 'Builder' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 glass border-b border-slate-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-display font-bold text-xl tracking-tight text-[#1F4D54]">
            MaVita
          </span>
        </div>
        <div className="bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse"></div>
          <span className="text-[10px] font-bold text-[#1F4D54] uppercase tracking-wider">Bio-Engine Active</span>
        </div>
      </header>

      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full px-4 pt-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 max-w-2xl mx-auto rounded-t-3xl shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-[#3498DB] scale-110' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
