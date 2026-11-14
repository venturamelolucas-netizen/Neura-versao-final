import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NeuraAvatar } from '../neura/NeuraAvatar';
import {
  Brain,
  Calendar,
  CheckSquare,
  BookOpen,
  ShoppingCart,
  Timer,
  LogOut,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'daily' | 'education' | 'agenda' | 'shopping' | 'pomodoro';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openNeuraChat: () => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openNeuraChat,
  openAuthModal
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#DCD5EC] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-hidden group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955D9] to-[#51358F] border-b-2 border-[#51358F] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 text-[#A5F0D0]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-[#29243B] block leading-none">
              Neuro App
            </span>
            <span className="text-[11px] font-semibold text-[#7955D9] tracking-wider uppercase">
              Foco & Sinapses
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single-line, clean) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#F0EAFE] text-[#7955D9] border-2 border-[#BCA6F4]'
                : 'text-[#777187] hover:text-[#29243B] hover:bg-slate-50'
            }`}
          >
            <Brain className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-[#F0EAFE] text-[#7955D9] border-2 border-[#BCA6F4]'
                : 'text-[#777187] hover:text-[#29243B] hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Rotina Diária
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'education'
                ? 'bg-[#F0EAFE] text-[#7955D9] border-2 border-[#BCA6F4]'
                : 'text-[#777187] hover:text-[#29243B] hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Estudos
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'agenda'
                ? 'bg-[#F0EAFE] text-[#7955D9] border-2 border-[#BCA6F4]'
                : 'text-[#777187] hover:text-[#29243B] hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Planner
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'shopping'
                ? 'bg-[#F0EAFE] text-[#7955D9] border-2 border-[#BCA6F4]'
                : 'text-[#777187] hover:text-[#29243B] hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Compras
          </button>

          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'pomodoro'
                ? 'bg-[#F0EAFE] text-[#7955D9] border-2 border-[#BCA6F4]'
                : 'text-[#777187] hover:text-[#29243B] hover:bg-slate-50'
            }`}
          >
            <Timer className="w-4 h-4" />
            Pomodoro
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openNeuraChat}
            className="btn-tactile-cyan text-xs md:text-sm px-3 md:px-4 py-2"
            title="Abrir assistente inteligente NEURA"
          >
            <Sparkles className="w-4 h-4 animate-spin text-[#1A3E45]" style={{ animationDuration: '4s' }} />
            <span>NEURA IA</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l-2 border-[#DCD5EC]">
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-bold text-[#29243B] capitalize">
                  {user.nome}
                </span>
                <span className="block text-[11px] text-[#777187] font-medium">
                  Modo {user.preferencias?.estilo_instrucao === 'detalhado' ? 'Explicativo' : 'Direto'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sair da conta"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-[#777187] hover:text-rose-600 flex items-center justify-center transition-colors border border-[#DCD5EC]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="btn-tactile-purple text-xs md:text-sm px-3 md:px-4 py-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
