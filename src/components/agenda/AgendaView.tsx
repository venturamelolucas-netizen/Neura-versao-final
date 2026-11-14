import React, { useState, useEffect } from 'react';
import { AgendaEvent } from '../../types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
  AlertCircle
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form states
  const [titulo, setTitulo] = useState<string>('');
  const [dataStr, setDataStr] = useState<string>('');
  const [horaStr, setHoraStr] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<AgendaEvent | null>(null);

  const fetchAgenda = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getAgenda();
      setEvents(data);
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || 'Falha ao sincronizar seus compromissos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  const validateDateTime = (date: string, time: string): string | null => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const dateMatch = date.match(dateRegex);
    if (!dateMatch) {
      return 'Formato de data inválido. Use DD/MM/AAAA (ex: 12/11/2026).';
    }
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    if (month < 1 || month > 12) return 'Mês inválido (deve ser entre 01 e 12).';
    if (day < 1 || day > 31) return 'Dia inválido (deve ser entre 01 e 31).';
    if (year < 2020 || year > 2100) return 'Ano fora do intervalo esperado (2020 a 2100).';

    const timeRegex = /^(\d{2}):(\d{2})$/;
    const timeMatch = time.match(timeRegex);
    if (!timeMatch) {
      return 'Formato de hora inválido. Use HH:MM no padrão 24 horas (ex: 14:30).';
    }
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    if (hour < 0 || hour > 23) return 'Hora inválida (deve ser entre 00 e 23).';
    if (minute < 0 || minute > 59) return 'Minuto inválido (deve ser entre 00 e 59).';

    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationMsg = validateDateTime(dataStr.trim(), horaStr.trim());
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    setSubmitting(true);

    try {
      const updated = await api.createAgendaEvent(titulo.trim(), dataStr.trim(), horaStr.trim());
      setEvents(updated);
      setTitulo('');
      setDataStr('');
      setHoraStr('');
      setIsCreating(false);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar compromisso.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (idx: number) => {
    setActionError(null);
    try {
      const updated = await api.toggleAgendaEvent(idx);
      setEvents(updated);
    } catch (err: any) {
      setActionError(`Erro: ${err.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setActionError(null);
    try {
      const updated = await api.deleteAgendaEvent(eventToDelete.id);
      setEvents(updated);
      setEventToDelete(null);
    } catch (err: any) {
      setActionError(`Erro ao excluir: ${err.message}`);
    }
  };

  // Helper to format today's date
  const setToday = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setDataStr(`${dd}/${mm}/${yyyy}`);
  };

  // Stats
  const total = events.length;
  const completed = events.filter((e) => e.feito).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0EAFE] border-2 border-[#BCA6F4] flex items-center justify-center text-[#7955D9] shadow-xs shrink-0">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#29243B] tracking-tight">Planner & Agenda</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF9FE] border border-[#DCD5EC] text-[#777187]">
                  {completed}/{total} concluídos
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#777187] font-medium mt-0.5">
                Organize compromissos, prazos e entregas com clareza cronológica.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCreating(true);
              setToday();
            }}
            className="btn-tactile-purple text-xs md:text-sm px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-extrabold px-2 py-1"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Load error banner with retry */}
      {loadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="text-xs font-bold">{loadError}</div>
          <button
            onClick={fetchAgenda}
            className="btn-tactile-secondary text-xs px-4 py-2 text-rose-800 border-rose-300 self-start sm:self-auto"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* Inline Create Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl border-3 border-[#7955D9] p-6 shadow-lg space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#29243B] uppercase tracking-wide">
              Cadastrar Compromisso
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-[#777187] hover:text-[#29243B] text-xs font-bold"
            >
              Cancelar
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-[#29243B] uppercase mb-1">
                Nome do Compromisso
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Consulta médica, Aula ao vivo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#29243B] uppercase">
                  Data (DD/MM/AAAA)
                </label>
                <button
                  type="button"
                  onClick={setToday}
                  className="text-[11px] font-bold text-[#7955D9] hover:underline"
                >
                  Hoje
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Ex: 10/11/2026"
                value={dataStr}
                onChange={(e) => setDataStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29243B] uppercase mb-1">
                Hora (HH:MM)
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 14:30"
                value={horaStr}
                onChange={(e) => setHoraStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !titulo || !dataStr || !horaStr}
              className="btn-tactile-mint text-xs md:text-sm px-6 py-2.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar Compromisso'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      {loading ? (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-12 text-center text-[#777187] font-semibold text-sm">
          Carregando sua agenda...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EAFE] text-[#7955D9] flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#29243B]">
            Nenhum compromisso cadastrado.
          </h3>
          <p className="text-xs text-[#777187] max-w-sm mx-auto">
            Mantenha sua rotina previsível registrando suas reuniões, aulas e prazos.
          </p>
          <button
            onClick={() => {
              setIsCreating(true);
              setToday();
            }}
            className="btn-tactile-purple text-xs px-4 py-2 mt-2"
          >
            Cadastrar Primeiro Evento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`bg-white rounded-3xl border-2 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all shadow-xs ${
                ev.feito ? 'border-[#A5F0D0] bg-[#FAFDFB]' : 'border-[#DCD5EC] hover:border-[#BCA6F4]'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(ev.id)}
                  className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors shrink-0 ${
                    ev.feito
                      ? 'bg-[#35C99B] border-[#1E8262] text-white shadow-xs'
                      : 'bg-white border-[#DCD5EC] hover:border-[#7955D9] text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 fill-current" />
                </button>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm sm:text-base font-bold truncate ${
                      ev.feito ? 'line-through text-[#777187]' : 'text-[#29243B]'
                    }`}
                  >
                    {ev.titulo}
                  </h4>

                  {/* Clean unboxed metadata discipline */}
                  <div className="flex items-center gap-2 text-xs text-[#777187] mt-1 font-semibold">
                    <span className="tabular-nums text-[#7955D9]">{ev.data}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.hora}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.feito ? 'Concluído' : 'Agendado'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEventToDelete(ev)}
                className="p-2 rounded-xl hover:bg-rose-50 text-[#777187] hover:text-rose-600 transition-colors shrink-0"
                title="Excluir compromisso"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29243B]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl border-3 border-[#DCD5EC] p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-black text-[#29243B]">
              Excluir Compromisso?
            </h3>
            <p className="text-xs text-[#777187] font-medium leading-relaxed">
              Deseja realmente remover o compromisso{' '}
              <strong className="text-[#29243B]">"{eventToDelete.titulo}"</strong> agendado para{' '}
              {eventToDelete.data} às {eventToDelete.hora}?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="btn-tactile-secondary text-xs px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn-tactile-danger text-xs px-4 py-2"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
