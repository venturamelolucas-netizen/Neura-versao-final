import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NeuraAvatar } from '../neura/NeuraAvatar';
import { X, Lock, Mail, Phone, User as UserIcon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [senha, setSenha] = useState('');
  const [estilo, setEstilo] = useState<'direto' | 'detalhado'>('direto');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(nome, contato, senha, estilo);
      } else {
        await login(contato, senha);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegister(false);
    setContato('11999999999');
    setSenha('neuro123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29243B]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-3 border-[#DCD5EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with synaptic gradient */}
        <div className="bg-gradient-to-r from-[#7955D9] to-[#51358F] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-2">
            <NeuraAvatar size="lg" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isRegister ? 'Criar Novo Perfil' : 'Bem-vindo ao Neuro App!'}
          </h2>
          <p className="text-xs text-[#BCA6F4] font-medium mt-1">
            {isRegister
              ? 'Configure suas sinapses e preferências de produtividade'
              : 'Entre com seu e-mail ou WhatsApp cadastrado'}
          </p>
        </div>

        {/* Content form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#29243B] uppercase mb-1">
                Nome do Usuário
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#777187] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: keyla, lucas, maria"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#29243B] uppercase mb-1">
              Email ou WhatsApp
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777187] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="exemplo@email.com ou 11999999999"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29243B] uppercase mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777187] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="Mínimo 6 dígitos, com letra e número"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B] transition-colors"
              />
            </div>
            {isRegister && (
              <span className="text-[11px] text-[#777187] mt-1 block">
                Exemplo: <code className="bg-slate-100 px-1 py-0.5 rounded text-[#51358F]">neuro123</code>
              </span>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#29243B] uppercase mb-1.5">
                Preferência de Instrução da NEURA
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEstilo('direto')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    estilo === 'direto'
                      ? 'border-[#7955D9] bg-[#F0EAFE]'
                      : 'border-[#DCD5EC] bg-white hover:border-[#BCA6F4]'
                  }`}
                >
                  <span className="text-xs font-extrabold text-[#7955D9] block">1. Curto e Direto</span>
                  <span className="text-[11px] text-[#777187] mt-0.5 block leading-tight">
                    Checklists rápidos e foco na ação imediata.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEstilo('detalhado')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    estilo === 'detalhado'
                      ? 'border-[#7955D9] bg-[#F0EAFE]'
                      : 'border-[#DCD5EC] bg-white hover:border-[#BCA6F4]'
                  }`}
                >
                  <span className="text-xs font-extrabold text-[#7955D9] block">2. Detalhado</span>
                  <span className="text-[11px] text-[#777187] mt-0.5 block leading-tight">
                    Orientações passo a passo ricas e explicativas.
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-tactile-purple w-full py-3 text-base"
            >
              {loading ? 'Processando...' : isRegister ? 'Concluir Cadastro 🧠' : 'Entrar no Neuro App 🚀'}
            </button>
          </div>

          {!isRegister && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-bold text-[#7955D9] border border-[#BCA6F4] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Preencher com Perfil Demo (Keyla)
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs font-bold text-[#7955D9] hover:underline"
            >
              {isRegister
                ? 'Já tem cadastro? Entrar com perfil existente'
                : 'Não tem conta? Criar novo perfil customizado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
