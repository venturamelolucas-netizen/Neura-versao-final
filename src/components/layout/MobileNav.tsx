import React from 'react';
import { ActiveTab } from './Navbar';
import {
  Brain,
  CheckSquare,
  BookOpen,
  Calendar,
  ShoppingCart,
  Timer
} from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#DCD5EC] px-2 py-2 flex items-center justify-around">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 rounded-xl transition-all ${
          activeTab === 'dashboard' ? 'text-[#7955D9]' : 'text-[#777187]'
        }`}
      >
        <Brain className="w-5 h-5" />
        <span>Início</span>
      </button>

      <button
        onClick={() => setActiveTab('daily')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 rounded-xl transition-all ${
          activeTab === 'daily' ? 'text-[#7955D9]' : 'text-[#777187]'
        }`}
      >
        <CheckSquare className="w-5 h-5" />
        <span>Rotina</span>
      </button>

      <button
        onClick={() => setActiveTab('education')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 rounded-xl transition-all ${
          activeTab === 'education' ? 'text-[#7955D9]' : 'text-[#777187]'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span>Estudos</span>
      </button>

      <button
        onClick={() => setActiveTab('agenda')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 rounded-xl transition-all ${
          activeTab === 'agenda' ? 'text-[#7955D9]' : 'text-[#777187]'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span>Planner</span>
      </button>

      <button
        onClick={() => setActiveTab('shopping')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 rounded-xl transition-all ${
          activeTab === 'shopping' ? 'text-[#7955D9]' : 'text-[#777187]'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Compras</span>
      </button>

      <button
        onClick={() => setActiveTab('pomodoro')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 rounded-xl transition-all ${
          activeTab === 'pomodoro' ? 'text-[#7955D9]' : 'text-[#777187]'
        }`}
      >
        <Timer className="w-5 h-5" />
        <span>Foco</span>
      </button>
    </nav>
  );
};
