import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PomodoroProvider, usePomodoro, FocusTaskInfo } from './context/PomodoroContext';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { AgendaView } from './components/agenda/AgendaView';
import { ShoppingView } from './components/shopping/ShoppingView';
import { PomodoroView } from './components/focus/PomodoroView';
import { NeuraChatModal } from './components/neura/NeuraChatModal';
import { AuthModal } from './components/auth/AuthModal';
import { Brain, Sparkles, User as UserIcon } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const { setSelectedTask } = usePomodoro();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isNeuraChatOpen, setIsNeuraChatOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleStartPomodoroForTask = (task: FocusTaskInfo) => {
    setSelectedTask(task);
    setActiveTab('pomodoro');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9FE] text-[#29243B] pb-16 md:pb-8">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNeuraChat={() => setIsNeuraChatOpen(true)}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-6">
        {/* If user not logged in, show friendly welcome invitation bar */}
        {!user && !loading && (
          <div className="max-w-5xl mx-auto mb-6 p-4 rounded-3xl bg-gradient-to-r from-[#F0EAFE] to-[#FAF9FE] border-2 border-[#BCA6F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7955D9] text-white flex items-center justify-center font-bold shrink-0">
                <Brain className="w-5 h-5 text-[#A5F0D0]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#29243B]">
                  Experimente o Neuro App com dados persistentes
                </h4>
                <p className="text-xs text-[#777187]">
                  Faça login com seu perfil ou cadastre-se para sincronizar suas tarefas diárias e de estudos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-tactile-purple text-xs px-4 py-2"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Entrar / Cadastrar</span>
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            openNeuraChat={() => setIsNeuraChatOpen(true)}
            openAuthModal={() => setIsAuthModalOpen(true)}
            onStartPomodoroForTask={handleStartPomodoroForTask}
          />
        )}

        {activeTab === 'daily' && (
          <TasksView
            chave="tarefas_diarias"
            title="Rotina Diária"
            subtitle="Gerencie tarefas do dia a dia, afazeres domésticos e hábitos consistentes."
            icon="daily"
            onStartPomodoroForTask={handleStartPomodoroForTask}
            openNeuraChat={() => setIsNeuraChatOpen(true)}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'education' && (
          <TasksView
            chave="tarefas_educacionais"
            title="Atividades Educacionais"
            subtitle="Organize matérias, planos de estudo, exercícios e preparação para provas."
            icon="education"
            onStartPomodoroForTask={handleStartPomodoroForTask}
            openNeuraChat={() => setIsNeuraChatOpen(true)}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'agenda' && <AgendaView />}

        {activeTab === 'shopping' && <ShoppingView />}

        {activeTab === 'pomodoro' && <PomodoroView />}
      </main>

      {/* Floating NEURA action button on mobile/desktop corner */}
      <button
        onClick={() => setIsNeuraChatOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30 btn-tactile-cyan shadow-xl p-3.5 rounded-full flex items-center gap-2 group"
        title="Conversar com a NEURA"
      >
        <Sparkles className="w-5 h-5 text-[#1A3E45] animate-pulse" />
        <span className="hidden sm:inline font-black text-xs text-[#1A3E45]">
          Ajuda NEURA
        </span>
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Modals */}
      <NeuraChatModal
        isOpen={isNeuraChatOpen}
        onClose={() => setIsNeuraChatOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PomodoroProvider>
        <MainApp />
      </PomodoroProvider>
    </AuthProvider>
  );
}

