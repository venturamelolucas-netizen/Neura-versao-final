import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export interface FocusTaskInfo {
  id: number;
  chave: 'tarefas_diarias' | 'tarefas_educacionais';
  titulo: string;
  concluida?: boolean;
}

interface PomodoroContextType {
  mode: 'focus' | 'break';
  timeLeft: number;
  isActive: boolean;
  selectedTask: FocusTaskInfo | null;
  sessionCount: number;
  showPauseModal: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: 'focus' | 'break') => void;
  setSelectedTask: (task: FocusTaskInfo | null) => void;
  setShowPauseModal: (show: boolean) => void;
  completeCurrentTask: () => Promise<boolean>;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const FOCUS_DURATION = 25 * 60; // 25 min
export const BREAK_DURATION = 5 * 60;  // 5 min

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_DURATION);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<FocusTaskInfo | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(1);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);

  // Timestamp references to avoid setInterval drift
  const targetEndTimeRef = useRef<number | null>(null);

  // Web Audio chime helper
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {
      // Audio not allowed or unavailable
    }
  };

  // Timer loop with Date.now() precision
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      interval = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));

        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          targetEndTimeRef.current = null;
          setIsActive(false);
          playChime();

          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });

          if (mode === 'focus') {
            // Se tinha uma tarefa selecionada que ainda não estava concluída, conclui automaticamente
            if (selectedTask && !selectedTask.concluida) {
              completeCurrentTask();
            }
            setMode('break');
            setTimeLeft(BREAK_DURATION);
          } else {
            setMode('focus');
            setTimeLeft(FOCUS_DURATION);
            setSessionCount((prev) => prev + 1);
          }
        }
      }, 500);
    } else {
      targetEndTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode, selectedTask]);

  const startTimer = () => {
    targetEndTimeRef.current = Date.now() + timeLeft * 1000;
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    setShowPauseModal(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    setTimeLeft(mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
  };

  const completeCurrentTask = async (): Promise<boolean> => {
    if (!selectedTask) return false;
    try {
      // Chama a API real para concluir a tarefa caso esteja pendente
      if (!selectedTask.concluida) {
        await api.toggleTask(selectedTask.chave, selectedTask.id);
        setSelectedTask((prev) => (prev ? { ...prev, concluida: true } : null));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao concluir tarefa pelo Pomodoro:', err);
      return false;
    }
  };

  return (
    <PomodoroContext.Provider
      value={{
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
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
