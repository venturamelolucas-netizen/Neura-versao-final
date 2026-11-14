import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Task } from '../../types';
import { api } from '../../services/api';
import { FocusTaskInfo } from '../../context/PomodoroContext';
import { NeuraBreakdownModal } from '../neura/NeuraBreakdownModal';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  Timer,
  CheckCircle2,
  BookOpen,
  CheckCheck,
  AlertCircle,
  RotateCcw,
  LogIn
} from 'lucide-react';

interface TasksViewProps {
  chave: 'tarefas_diarias' | 'tarefas_educacionais';
  title: string;
  subtitle: string;
  icon: 'daily' | 'education';
  onStartPomodoroForTask?: (task: FocusTaskInfo) => void;
  openNeuraChat?: () => void;
  openAuthModal?: () => void;
  onTasksChanged?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  chave,
  title,
  subtitle,
  icon,
  onStartPomodoroForTask,
  openNeuraChat,
  openAuthModal,
  onTasksChanged
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Modal for breakdown
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(chave);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar tarefas da API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [chave, user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }

    try {
      const updated = await api.createTask(chave, newTaskTitle.trim());
      setTasks(updated);
      setNewTaskTitle('');
      setIsCreating(false);
      if (onTasksChanged) onTasksChanged();
    } catch (err: any) {
      alert(`Erro ao criar tarefa: ${err.message}`);
    }
  };

  const handleToggleTask = async (idx: number) => {
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }
    try {
      const updated = await api.toggleTask(chave, idx);
      const isNowDone = updated.find((t) => t.id === idx)?.concluida;
      if (isNowDone) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
      setTasks(updated);
      if (onTasksChanged) onTasksChanged();
    } catch (err: any) {
      alert(`Erro ao alternar status da tarefa: ${err.message}`);
    }
  };

  const handleToggleStep = async (taskIdx: number, stepIdx: number) => {
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }
    try {
      const updated = await api.toggleStep(chave, taskIdx, stepIdx);
      setTasks(updated);
      if (onTasksChanged) onTasksChanged();
    } catch (err: any) {
      alert(`Erro ao alternar microtarefa: ${err.message}`);
    }
  };

  const handleDeleteTask = async (idx: number) => {
    if (!window.confirm('Tem certeza que deseja remover esta tarefa?')) return;
    try {
      const updated = await api.deleteTask(chave, idx);
      setTasks(updated);
      if (onTasksChanged) onTasksChanged();
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const toggleExpand = (idx: number) => {
    setExpandedTasks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.concluida).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.concluida;
    if (filter === 'completed') return t.concluida;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6">
      {/* Top Section / Header */}
      <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0EAFE] border-2 border-[#BCA6F4] flex items-center justify-center text-[#7955D9] shadow-xs shrink-0">
              {icon === 'daily' ? <CheckSquare className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#29243B] tracking-tight">{title}</h1>
                {user && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF9FE] border border-[#DCD5EC] text-[#777187]">
                    {completedTasks}/{totalTasks}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-[#777187] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!user && openAuthModal) {
                  openAuthModal();
                } else {
                  setIsCreating(true);
                }
              }}
              className="btn-tactile-purple text-xs md:text-sm px-4 py-2.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>

        {/* Gamified progress bar */}
        {user && totalTasks > 0 && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#29243B]">
              <span>Progresso Geral</span>
              <span className="text-[#35C99B] tabular-nums font-black">{progressPercent}%</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-[#F0EAFE] overflow-hidden border border-[#DCD5EC]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#35D4E5] to-[#35C99B] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs and Quick Info */}
      {user && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border-2 border-[#DCD5EC]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                filter === 'all'
                  ? 'bg-[#7955D9] text-white'
                  : 'text-[#777187] hover:text-[#29243B]'
              }`}
            >
              Todas ({totalTasks})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                filter === 'pending'
                  ? 'bg-[#7955D9] text-white'
                  : 'text-[#777187] hover:text-[#29243B]'
              }`}
            >
              Pendentes ({totalTasks - completedTasks})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                filter === 'completed'
                  ? 'bg-[#7955D9] text-white'
                  : 'text-[#777187] hover:text-[#29243B]'
              }`}
            >
              Concluídas ({completedTasks})
            </button>
          </div>

          {openNeuraChat && (
            <button
              onClick={openNeuraChat}
              className="text-xs font-bold text-[#7955D9] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#35D4E5]" />
              Dúvidas? Pergunte à NEURA
            </button>
          )}
        </div>
      )}

      {/* Inline Create Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white rounded-3xl border-3 border-[#7955D9] p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-[#29243B] uppercase tracking-wide">
              Adicionar Nova Tarefa
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-[#777187] hover:text-[#29243B] text-xs font-bold"
            >
              Cancelar
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              autoFocus
              placeholder="Ex: Ler capítulo 3 de anatomia, pagar fatura, limpar mesa..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 w-full px-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B]"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="btn-tactile-mint text-xs md:text-sm px-5 py-2.5 w-full sm:w-auto shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Salvar Tarefa
            </button>
          </div>
        </form>
      )}

      {/* Unauthenticated State */}
      {!user ? (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EAFE] text-[#7955D9] flex items-center justify-center mx-auto">
            <LogIn className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-[#29243B]">
            Acesso às Tarefas do Perfil
          </h3>
          <p className="text-xs text-[#777187] max-w-sm mx-auto">
            Entre na sua conta para visualizar, criar, desmembrar e concluir suas metas com sincronização em tempo real.
          </p>
          <button
            onClick={() => openAuthModal && openAuthModal()}
            className="btn-tactile-purple text-xs px-5 py-2.5 mt-2"
          >
            Fazer Login ou Cadastrar
          </button>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-12 text-center text-[#777187] font-semibold text-sm">
          Carregando suas tarefas...
        </div>
      ) : error ? (
        <div className="bg-rose-50 rounded-3xl border-2 border-rose-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h4 className="text-sm font-black text-rose-800">Falha ao carregar tarefas</h4>
          <p className="text-xs text-rose-600 font-medium max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchTasks}
            className="btn-tactile-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EAFE] text-[#7955D9] flex items-center justify-center mx-auto">
            <CheckCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#29243B]">
            {filter === 'completed'
              ? 'Nenhuma tarefa concluída ainda.'
              : filter === 'pending'
              ? 'Tudo em dia! Nenhuma tarefa pendente.'
              : 'Nenhuma tarefa cadastrada nesta categoria.'}
          </h3>
          <p className="text-xs text-[#777187] max-w-sm mx-auto">
            Comece adicionando uma meta ou utilize a NEURA para transformar seus objetivos em passos concretos.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-tactile-purple text-xs px-4 py-2 mt-2"
          >
            Criar Minha Primeira Tarefa
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const isExpanded = !!expandedTasks[t.id];
            const stepsCount = t.passos ? t.passos.length : 0;
            const completedStepsCount = t.passos ? t.passos.filter((p) => p.concluido).length : 0;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-3xl border-2 transition-all shadow-xs ${
                  t.concluida ? 'border-[#A5F0D0] bg-[#FAFDFB]' : 'border-[#DCD5EC] hover:border-[#BCA6F4]'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3">
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(t.id)}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                        t.concluida
                          ? 'bg-[#35C99B] border-[#1E8262] text-white shadow-xs'
                          : 'bg-white border-[#DCD5EC] hover:border-[#7955D9] text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 fill-current" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm sm:text-base font-bold block leading-snug break-words ${
                          t.concluida ? 'line-through text-[#777187]' : 'text-[#29243B]'
                        }`}
                      >
                        {t.titulo}
                      </span>

                      {/* Clean unboxed metadata discipline */}
                      <div className="flex items-center gap-2 text-xs text-[#777187] mt-1">
                        <span>{t.concluida ? 'Concluída' : 'Pendente'}</span>
                        {stepsCount > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#7955D9]">
                              {completedStepsCount}/{stepsCount} microtarefas
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Pomodoro shortcut with full task info */}
                    {onStartPomodoroForTask && (
                      <button
                        onClick={() =>
                          onStartPomodoroForTask({
                            id: t.id,
                            chave,
                            titulo: t.titulo,
                            concluida: t.concluida
                          })
                        }
                        title="Iniciar Foco Pomodoro nesta tarefa"
                        className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7955D9] border border-[#BCA6F4] transition-colors"
                      >
                        <Timer className="w-4 h-4" />
                      </button>
                    )}

                    {/* NEURA Breakdown trigger */}
                    <button
                      onClick={() => setBreakdownTask(t)}
                      title="Dividir com a NEURA"
                      className="p-2 rounded-xl bg-[#F0EAFE] hover:bg-[#E3D6FC] text-[#51358F] border border-[#BCA6F4] font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#35D4E5]" />
                      <span className="hidden sm:inline">Dividir</span>
                    </button>

                    {/* Steps toggle if steps exist */}
                    {stepsCount > 0 && (
                      <button
                        onClick={() => toggleExpand(t.id)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#777187] border border-[#DCD5EC] transition-colors"
                        title={isExpanded ? 'Ocultar microtarefas' : 'Exibir microtarefas'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-[#777187] hover:text-rose-600 transition-colors"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Microsteps List */}
                {stepsCount > 0 && isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-[#DCD5EC]/60 space-y-2 bg-[#FAF9FE] rounded-b-3xl">
                    <span className="text-[11px] font-extrabold uppercase text-[#777187] tracking-wider block mt-2">
                      Microtarefas divididas pela NEURA:
                    </span>
                    <div className="space-y-1.5">
                      {t.passos.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => handleToggleStep(t.id, sIdx)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            step.concluido
                              ? 'bg-white border-[#A5F0D0] text-[#777187]'
                              : 'bg-white border-[#DCD5EC] hover:border-[#BCA6F4] text-[#29243B]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              step.concluido
                                ? 'bg-[#35C99B] border-[#1E8262] text-white'
                                : 'border-[#DCD5EC]'
                            }`}
                          >
                            {step.concluido && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              step.concluido ? 'line-through text-[#777187]' : ''
                            }`}
                          >
                            {step.texto}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for NEURA Task Breakdown */}
      <NeuraBreakdownModal
        isOpen={!!breakdownTask}
        onClose={() => setBreakdownTask(null)}
        task={breakdownTask}
        taskCategory={chave}
        onStepsSaved={(updated) => {
          setTasks(updated);
          if (breakdownTask) {
            setExpandedTasks((prev) => ({ ...prev, [breakdownTask.id]: true }));
          }
          if (onTasksChanged) onTasksChanged();
        }}
      />
    </div>
  );
};
