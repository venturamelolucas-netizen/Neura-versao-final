import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NeuraAvatar } from './NeuraAvatar';
import { X, Send, Sparkles, Brain, Bot, Lightbulb } from 'lucide-react';

interface NeuraChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface Message {
  sender: 'user' | 'neura';
  text: string;
  time: string;
}

export const NeuraChatModal: React.FC<NeuraChatModalProps> = ({
  isOpen,
  onClose,
  initialPrompt
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'neura',
      text: 'Olá! Eu sou a NEURA, sua assistente inteligente de organização, rotina e foco 🧠✨\n\nVamos transformar metas difíceis em pequenos passos possíveis, reduzir a sobrecarga e colocar suas intenções em prática. O que você gostaria de organizar hoje?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const estilo = user?.preferencias?.estilo_instrucao || 'direto';
      const res = await api.sendNeuraMessage(text, estilo);

      const neuraMsg: Message = {
        sender: 'neura',
        text: res.resposta_texto || res.resposta.join('\n'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, neuraMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        sender: 'neura',
        text: `⚠️ Desculpe, tive um contratempo: ${err.message}. Por favor tente novamente.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Estudar para prova amanhã',
    'Organizar arrumação do quarto',
    'Dividir relatório em microtarefas',
    'Dica de foco para TDAH'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#29243B]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[720px] bg-white rounded-3xl border-3 border-[#DCD5EC] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7955D9] via-[#51358F] to-[#7955D9] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#51358F]">
          <div className="flex items-center gap-3">
            <NeuraAvatar size="md" isThinking={loading} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">NEURA</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#35D4E5] text-[#1A3E45]">
                  IA de Execução
                </span>
              </div>
              <p className="text-xs text-[#BCA6F4] font-medium">
                Modo {user?.preferencias?.estilo_instrucao === 'detalhado' ? 'Explicativo' : 'Direto'} · Foco em Ação
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAF9FE] synapse-bg">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'neura' && (
                <div className="shrink-0 mt-1">
                  <NeuraAvatar size="sm" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-[#7955D9] text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-[#29243B] border-2 border-[#DCD5EC] rounded-tl-xs shadow-xs'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1.5 font-bold ${
                    m.sender === 'user' ? 'text-purple-200 text-right' : 'text-[#777187]'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <NeuraAvatar size="sm" isThinking={true} />
              <div className="bg-white border-2 border-[#DCD5EC] rounded-3xl rounded-tl-xs px-4 py-3 text-xs font-bold text-[#7955D9] flex items-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin text-[#35D4E5]" />
                Processando sinapses neurais...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions pills */}
        <div className="px-4 py-2 bg-white border-t border-[#DCD5EC] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Lightbulb className="w-4 h-4 text-[#7955D9] shrink-0" />
          <span className="text-[11px] font-bold text-[#777187] shrink-0">Sugestões:</span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#F0EAFE] hover:bg-[#E3D6FC] text-[#51358F] border border-[#BCA6F4] whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-4 bg-white border-t-2 border-[#DCD5EC] flex items-center gap-3">
          <input
            type="text"
            placeholder="Pergunte à NEURA ou descreva uma meta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B] transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-tactile-purple px-4 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
