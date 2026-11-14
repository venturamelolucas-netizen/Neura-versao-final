import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Task, AgendaEvent, ShoppingList } from '../../types';
import { api } from '../../services/api';
import { FocusTaskInfo } from '../../context/PomodoroContext';
import { ActiveTab } from '../layout/Navbar';
import {
  CheckSquare,
  BookOpen,
  Calendar,
  ShoppingCart,
  Timer,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  RotateCcw,
  User as UserIcon,
  LogIn
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  openNeuraChat: () => void;
  openAuthModal?: () => void;
  onStartPomodoroForTask: (task: FocusTaskInfo) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  openNeuraChat,
  openAuthModal,
  onStartPomodoroForTask
}) => {
  const { user } = useAuth();
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [eduTasks, setEduTasks] = useState<Task[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingList>({ itens: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const promises: [Promise<Task[]>, Promise<Task[]>, Promise<AgendaEvent[]>, Promise<ShoppingList>] = [
        user ? api.getTasks('tarefas_diarias') : Promise.resolve([]),
        user ? api.getTasks('tarefas_educacionais') : Promise.resolve([]),
        user ? api.getAgenda() : Promise.resolve([]),
        user ? api.getShoppingList() : Promise.resolve({ itens: [] })
      ];

      const [daily, edu, agenda, shopping] = await Promise.all(promises);
      setDailyTasks(daily);
      setEduTasks(edu);
      setAgendaEvents(agenda);
      setShoppingList(shopping);
    } catch (err: any) {
      setLoadError(err.message || 'Falha ao sincronizar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [user]);

  // Calculations
  const dailyDone = dailyTasks.filter((t) => t.concluida).length;
  const dailyTotal = dailyTasks.length;
  const dailyPct = dailyTotal > 0 ? Math.round((dailyDone / dailyTotal) * 100) : 0;

  const eduDone = eduTasks.filter((t) => t.concluida).length;
  const eduTotal = eduTasks.length;
  const eduPct = eduTotal > 0 ? Math.round((eduDone / eduTotal) * 100) : 0;

  const agendaUpcoming = agendaEvents.filter((e) => !e.feito).slice(0, 3);
  const pendingShopping = shoppingList.itens.filter((i) => !i.comprado).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-4 md:py-6">
      {/* Hero Synaptic Greeting Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#7955D9] via-[#51358F] to-[#7955D9] p-6 sm:p-8 text-white border-3 border-[#51358F] shadow-lg overflow-hidden">
        {/* Background glow and subtle synaptic circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#35D4E5]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-[#A5F0D0]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-[#A5F0D0] backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel Neural Ativo</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Olá, {user ? <span className="capitalize">{user.nome}</span> : 'Produtivo'}! 🧠
            </h1>
            <p className="text-xs sm:text-sm text-[#F0EAFE] font-medium leading-relaxed">
              Transforme grandes intenções em pequenas vitórias diárias. Suas sinapses estão prontas para o foco.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={openNeuraChat}
              className="btn-tactile-cyan text-xs sm:text-sm px-5 py-3 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#1A3E45]" />
              <span>Falar com NEURA</span>
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className="btn-tactile-mint text-xs sm:text-sm px-5 py-3 shadow-md"
            >
              <Timer className="w-4 h-4 text-white" />
              <span>Iniciar Pomodoro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state if API call failed */}
      {loadError && (
        <div className="bg-rose-50 rounded-3xl border-2 border-rose-200 p-4 text-xs font-semibold text-rose-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={loadOverview}
            className="btn-tactile-secondary text-xs px-3 py-1.5 shrink-0 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* Unauthenticated State Invitation */}
      {!user && (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EAFE] text-[#7955D9] flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#29243B]">
            Conecte seu perfil para sincronizar o painel
          </h3>
          <p className="text-xs text-[#777187] max-w-md mx-auto">
            Entre na sua conta para acompanhar seu progresso diário, compromissos da agenda e listas de compras.
          </p>
          <button
            onClick={() => openAuthModal && openAuthModal()}
            className="btn-tactile-purple text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Entrar com Perfil</span>
          </button>
        </div>
      )}

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Routine Summary Card */}
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs flex flex-col justify-between hover:border-[#BCA6F4] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0EAFE] text-[#7955D9] flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#29243B]">Rotina Diária</h3>
                  <span className="text-xs text-[#777187]">Tarefas e hábitos do dia</span>
                </div>
              </div>
              <span className="text-xs font-black text-[#7955D9] tabular-nums">
                {dailyDone}/{dailyTotal}
              </span>
            </div>

            <div className="space-y-1.5 my-3">
              <div className="flex justify-between text-xs font-bold text-[#29243B]">
                <span>Progresso</span>
                <span className="text-[#35C99B] tabular-nums font-black">{dailyPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#F0EAFE] overflow-hidden border border-[#DCD5EC]">
                <div
                  className="h-full rounded-full bg-[#35C99B] transition-all duration-500"
                  style={{ width: `${dailyPct}%` }}
                />
              </div>
            </div>

            {/* Quick Preview of tasks */}
            <div className="space-y-2 mt-4">
              {dailyTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTab('daily')}
                  className="p-2.5 rounded-xl bg-[#FAF9FE] border border-[#DCD5EC] text-xs font-bold text-[#29243B] flex items-center justify-between cursor-pointer hover:bg-[#F0EAFE] transition-colors"
                >
                  <span className={`truncate ${t.concluida ? 'line-through text-[#777187]' : ''}`}>
                    {t.titulo}
                  </span>
                  <span className="text-[11px] font-semibold text-[#7955D9] shrink-0">
                    {t.concluida ? '✓ Feito' : 'Pendente'}
                  </span>
                </div>
              ))}
              {user && dailyTasks.length === 0 && !loading && (
                <p className="text-xs text-[#777187] italic py-2 text-center">
                  Nenhuma tarefa na rotina diária ainda.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#DCD5EC]">
            <button
              onClick={() => setActiveTab('daily')}
              className="text-xs font-bold text-[#7955D9] hover:underline flex items-center gap-1"
            >
              <span>Gerenciar Rotina Diária</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Education & Study Summary Card */}
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs flex flex-col justify-between hover:border-[#BCA6F4] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0EAFE] text-[#7955D9] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#29243B]">Estudos & Educação</h3>
                  <span className="text-xs text-[#777187]">Matérias, provas e aprendizado</span>
                </div>
              </div>
              <span className="text-xs font-black text-[#7955D9] tabular-nums">
                {eduDone}/{eduTotal}
              </span>
            </div>

            <div className="space-y-1.5 my-3">
              <div className="flex justify-between text-xs font-bold text-[#29243B]">
                <span>Progresso</span>
                <span className="text-[#35C99B] tabular-nums font-black">{eduPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#F0EAFE] overflow-hidden border border-[#DCD5EC]">
                <div
                  className="h-full rounded-full bg-[#35D4E5] transition-all duration-500"
                  style={{ width: `${eduPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {eduTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTab('education')}
                  className="p-2.5 rounded-xl bg-[#FAF9FE] border border-[#DCD5EC] text-xs font-bold text-[#29243B] flex items-center justify-between cursor-pointer hover:bg-[#F0EAFE] transition-colors"
                >
                  <span className={`truncate ${t.concluida ? 'line-through text-[#777187]' : ''}`}>
                    {t.titulo}
                  </span>
                  <span className="text-[11px] font-semibold text-[#7955D9] shrink-0">
                    {t.concluida ? '✓ Feito' : 'Pendente'}
                  </span>
                </div>
              ))}
              {user && eduTasks.length === 0 && !loading && (
                <p className="text-xs text-[#777187] italic py-2 text-center">
                  Nenhuma atividade de estudo cadastrada.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#DCD5EC]">
            <button
              onClick={() => setActiveTab('education')}
              className="text-xs font-bold text-[#7955D9] hover:underline flex items-center gap-1"
            >
              <span>Gerenciar Estudos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Upcoming Agenda & Shopping Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Appointments */}
        <div className="md:col-span-2 bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#7955D9]" />
              <h3 className="font-extrabold text-base text-[#29243B]">Próximos Compromissos</h3>
            </div>
            <button
              onClick={() => setActiveTab('agenda')}
              className="text-xs font-bold text-[#7955D9] hover:underline"
            >
              Ver Planner Completo →
            </button>
          </div>

          {agendaUpcoming.length === 0 ? (
            <p className="text-xs text-[#777187] italic py-4 text-center">
              Nenhum compromisso pendente agendado no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {agendaUpcoming.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setActiveTab('agenda')}
                  className="p-3.5 rounded-2xl bg-[#FAF9FE] border-2 border-[#DCD5EC] hover:border-[#BCA6F4] cursor-pointer transition-all space-y-1"
                >
                  <span className="text-xs font-extrabold text-[#29243B] truncate block">
                    {ev.titulo}
                  </span>
                  <div className="text-[11px] text-[#7955D9] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ev.data} · {ev.hora}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping list quick status */}
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-5 h-5 text-[#7955D9]" />
              <h3 className="font-extrabold text-base text-[#29243B]">Compras</h3>
            </div>
            <p className="text-xs text-[#777187] leading-relaxed">
              Você tem <strong className="text-[#29243B]">{pendingShopping}</strong> itens pendentes na sua lista do mercado.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('shopping')}
            className="btn-tactile-secondary text-xs w-full py-2.5 mt-4"
          >
            Abrir Lista de Compras
          </button>
        </div>
      </div>
    </div>
  );
};
