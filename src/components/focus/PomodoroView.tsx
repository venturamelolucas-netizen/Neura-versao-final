import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePomodoro, FOCUS_DURATION, BREAK_DURATION } from '../../context/PomodoroContext';
import { NeuraAvatar } from '../neura/NeuraAvatar';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Coffee,
  Brain,
  CheckCircle2,
  Sprout,
  X,
  Target
} from 'lucide-react';

export const PomodoroView: React.FC = () => {
  const { user } = useAuth();
  const {
    mode,
    timeLeft,
    isActive,
    selectedTask,
    sessionCount,
    showPauseModal,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    setSelectedTask,
    setShowPauseModal,
    completeCurrentTask
  } = usePomodoro();

  const [manualTitle, setManualTitle] = useState<string>('');

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
  const progressRatio = (totalDuration - timeLeft) / totalDuration;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const currentDisplayTitle = selectedTask ? selectedTask.titulo : manualTitle;

  const handleFinishEarly = async () => {
    setShowPauseModal(false);
    if (selectedTask && !selectedTask.concluida) {
      await completeCurrentTask();
    }
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Top Card */}
      <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs text-center relative overflow-hidden">
        <div className="inline-flex p-1 bg-[#F0EAFE] rounded-2xl border-2 border-[#BCA6F4] mb-4">
          <button
            onClick={() => switchMode('focus')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              mode === 'focus'
                ? 'bg-[#7955D9] text-white shadow-xs'
                : 'text-[#777187] hover:text-[#29243B]'
            }`}
          >
            🧠 Foco (25 min)
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              mode === 'break'
                ? 'bg-[#35C99B] text-white shadow-xs'
                : 'text-[#777187] hover:text-[#29243B]'
            }`}
          >
            ☕ Pausa (5 min)
          </button>
        </div>

        {/* Task Focus Name Input / Selected Task Indicator */}
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-[11px] font-extrabold text-[#777187] uppercase tracking-wider mb-1">
            {mode === 'focus' ? 'O que você está focando agora?' : 'Momento de descanso e respiro'}
          </label>
          {selectedTask ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F0EAFE] border-2 border-[#BCA6F4] text-xs font-bold text-[#51358F]">
              <div className="flex items-center gap-2 truncate">
                <Target className="w-4 h-4 text-[#7955D9] shrink-0" />
                <span className="truncate">
                  {selectedTask.chave === 'tarefas_diarias' ? '[Rotina] ' : '[Estudos] '}
                  {selectedTask.titulo}
                </span>
                {selectedTask.concluida && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                    Concluída ✓
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-[#777187] hover:text-[#29243B] p-1 shrink-0"
                title="Desvincular tarefa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <input
              type="text"
              placeholder={mode === 'focus' ? 'Ex: Resolver 5 questões de química...' : 'Tome uma água, alongue-se...'}
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="w-full text-center px-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-bold text-[#29243B] bg-[#FAF9FE]"
            />
          )}
        </div>

        {/* Big Circular Synaptic Progress Ring */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center select-none my-2">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-[#F0EAFE]"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="128"
              cy="128"
              r="110"
              className={`transition-all duration-300 ${
                mode === 'focus' ? 'stroke-[#7955D9]' : 'stroke-[#35C99B]'
              }`}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Central content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-[#29243B] tracking-tight tabular-nums">
              {formattedTime}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full ${
                  mode === 'focus'
                    ? 'bg-[#F0EAFE] text-[#7955D9] border border-[#BCA6F4]'
                    : 'bg-[#A5F0D0] text-[#1E8262] border border-[#35C99B]'
                }`}
              >
                {mode === 'focus' ? `Sessão #${sessionCount}` : 'Pausa Relaxante'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {!isActive ? (
            <button
              onClick={startTimer}
              className={`btn-tactile-${mode === 'focus' ? 'purple' : 'mint'} text-base px-8 py-3.5`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Foco</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="btn-tactile-secondary text-base px-8 py-3.5 text-amber-700 border-amber-300"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pausar</span>
            </button>
          )}

          <button
            onClick={resetTimer}
            className="btn-tactile-secondary text-sm p-3.5"
            title="Reiniciar temporizador"
          >
            <RotateCcw className="w-4 h-4 text-[#777187]" />
          </button>
        </div>
      </div>

      {/* NEURA Motivational Banner */}
      <div className="bg-[#FAF9FE] rounded-3xl border-2 border-[#DCD5EC] p-5 flex items-center gap-4 shadow-xs">
        <NeuraAvatar size="md" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-black text-[#7955D9] uppercase tracking-wide block">
            Dica da NEURA
          </span>
          <p className="text-xs text-[#29243B] font-medium mt-0.5">
            {mode === 'focus'
              ? 'Elimine abas desnecessárias e celular durante estes 25 minutos. Uma única microtarefa por vez constrói neuroplasticidade e consistência.'
              : 'Aproveite os 5 minutos para afastar a vista da tela, respirar fundo e beber água. Seu cérebro consolida aprendizados durante as pausas.'}
          </p>
        </div>
      </div>

      {/* Modal on Pause (matching core/tarefas.py) */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29243B]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl border-3 border-[#DCD5EC] p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#29243B]">
                ⏸️ Cronômetro Pausado
              </h3>
              <button
                onClick={() => setShowPauseModal(false)}
                className="text-[#777187] hover:text-[#29243B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#777187] font-medium">
              Você pausou seu momento de foco. Qual o motivo?
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleFinishEarly}
                className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-left transition-colors flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-emerald-900 block">
                    1 - Finalizei a tarefa! ✅
                  </span>
                  <span className="text-[11px] text-emerald-700 block">
                    Marcar tarefa como concluída no sistema.
                  </span>
                </div>
              </button>

              <button
                onClick={() => setShowPauseModal(false)}
                className="w-full p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 text-left transition-colors flex items-center gap-3"
              >
                <Sprout className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-[#51358F] block">
                    2 - Vou encerrar por enquanto 🌱
                  </span>
                  <span className="text-[11px] text-[#7955D9] block">
                    Tudo bem, volte quando estiver pronto para a próxima rodada.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
