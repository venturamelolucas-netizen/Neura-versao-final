import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { api } from '../../services/api';
import { NeuraAvatar } from './NeuraAvatar';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Send,
  HelpCircle,
  Clock
} from 'lucide-react';

interface NeuraBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  taskCategory: 'tarefas_diarias' | 'tarefas_educacionais';
  onStepsSaved: (updatedTasks: Task[]) => void;
}

export const NeuraBreakdownModal: React.FC<NeuraBreakdownModalProps> = ({
  isOpen,
  onClose,
  task,
  taskCategory,
  onStepsSaved
}) => {
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [currentLines, setCurrentLines] = useState<string[]>([]);
  const [suggestedSteps, setSuggestedSteps] = useState<string[]>([]);
  const [hasSteps, setHasSteps] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(1);
  const [userReply, setUserReply] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Initialize breakdown interaction when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setHistory([]);
      setCurrentLines([]);
      setSuggestedSteps([]);
      setHasSteps(false);
      setAttempts(1);
      setUserReply('');
      startBreakdown(task.titulo);
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const startBreakdown = async (taskTitle: string) => {
    setLoading(true);
    try {
      const res = await api.breakdownTask(taskTitle, [], undefined, 1);
      setCurrentLines(res.linhas);
      setHasSteps(res.gerou_passos);
      setAttempts(res.tentativas);
      setSuggestedSteps(res.passos_sugeridos);
      setHistory(res.historico_atualizado);
    } catch (err: any) {
      setCurrentLines([
        `⚠️ Não foi possível conectar à NEURA: ${err.message}`,
        'Você ainda pode tentar responder ou gerar passos novamente.'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!userReply.trim() || loading) return;
    const reply = userReply.trim();
    setUserReply('');
    setLoading(true);

    try {
      const res = await api.breakdownTask(task.titulo, history, reply, attempts, false);
      setCurrentLines(res.linhas);
      setHasSteps(res.gerou_passos);
      setAttempts(res.tentativas);
      setSuggestedSteps(res.passos_sugeridos);
      setHistory(res.historico_atualizado);
    } catch (err: any) {
      setCurrentLines([
        `⚠️ Erro ao enviar resposta: ${err.message}`
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImmediate = async () => {
    if (loading) return;
    const reply = userReply.trim();
    setUserReply('');
    setLoading(true);

    try {
      const res = await api.breakdownTask(
        task.titulo,
        history,
        reply || undefined,
        attempts,
        true
      );
      setCurrentLines(res.linhas);
      setHasSteps(res.gerou_passos);
      setAttempts(res.tentativas);
      setSuggestedSteps(res.passos_sugeridos);
      setHistory(res.historico_atualizado);
    } catch (err: any) {
      setCurrentLines([
        `⚠️ Erro ao gerar passos: ${err.message}`
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSteps = async () => {
    if (!task || suggestedSteps.length === 0 || saving) return;
    setSaving(true);
    try {
      const updated = await api.injectSteps(taskCategory, task.id, suggestedSteps);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
      onStepsSaved(updated);
      onClose();
    } catch (err: any) {
      alert(`Erro ao salvar passos: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#29243B]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-3xl border-3 border-[#DCD5EC] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7955D9] to-[#51358F] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#51358F]">
          <div className="flex items-center gap-3">
            <NeuraAvatar size="md" isThinking={loading} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">Dividir Tarefa com a NEURA</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#A5F0D0] text-[#1E8262]">
                  Passo a Passo
                </span>
              </div>
              <p className="text-xs text-[#BCA6F4] font-medium truncate max-w-xs sm:max-w-md">
                Meta selecionada: <strong className="text-white">"{task.titulo}"</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FAF9FE] synapse-bg">
          {/* Interaction status indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-[#777187] px-1">
            <span>Interação #{attempts} com NEURA</span>
            {hasSteps && (
              <span className="text-[#35C99B] flex items-center gap-1 font-extrabold">
                <CheckCircle2 className="w-4 h-4" /> Plano Concluído!
              </span>
            )}
          </div>

          {/* AI Response Bubble */}
          <div className="bg-white border-2 border-[#DCD5EC] rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#7955D9] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#35D4E5]" />
              Resposta da NEURA:
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                <NeuraAvatar size="lg" isThinking={true} />
                <p className="text-xs font-bold text-[#7955D9] animate-pulse">
                  Desmembrando sua tarefa em passos rápidos de 5 a 25 min...
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-[#29243B] font-medium">
                {currentLines.map((line, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Preview of Generated Steps (if ready) */}
          {hasSteps && suggestedSteps.length > 0 && (
            <div className="bg-[#F0EAFE] border-2 border-[#BCA6F4] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#51358F] uppercase tracking-wider flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#7955D9]" />
                  Microtarefas Sugeridas ({suggestedSteps.length}):
                </h4>
                <span className="text-[11px] font-bold text-[#7955D9] bg-white px-2 py-0.5 rounded-full border border-[#BCA6F4]">
                  Prontas para Salvar
                </span>
              </div>

              <div className="space-y-2">
                {suggestedSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-[#DCD5EC] text-xs font-bold text-[#29243B]"
                  >
                    <div className="w-5 h-5 rounded-lg bg-[#FAF9FE] border-2 border-[#7955D9] flex items-center justify-center text-[10px] text-[#7955D9] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="leading-tight">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Clarification Input (if NEURA asked a question and haven't finalized) */}
          {!hasSteps && !loading && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-[#29243B] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#7955D9]" />
                Sua resposta para a NEURA (ou refine seu foco):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ex: Quero focar em resolver 5 exercícios básicos..."
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-xs font-semibold text-[#29243B]"
                />
                <button
                  onClick={handleReply}
                  disabled={!userReply.trim()}
                  className="btn-tactile-purple px-4 py-3 text-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t-2 border-[#DCD5EC] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-tactile-secondary text-xs px-4 py-2.5"
          >
            Cancelar
          </button>

          {hasSteps ? (
            <button
              onClick={handleAcceptSteps}
              disabled={saving || suggestedSteps.length === 0}
              className="btn-tactile-mint text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Aceitar e Salvar Microtarefas'}</span>
            </button>
          ) : (
            <button
              onClick={handleGenerateImmediate}
              disabled={loading}
              className="btn-tactile-cyan text-xs px-4 py-2.5 flex items-center gap-1.5"
            >
              <span>Gerar Passos Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};