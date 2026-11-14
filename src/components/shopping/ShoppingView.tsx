import React, { useState, useEffect } from 'react';
import { ShoppingList, ShoppingItem } from '../../types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Plus,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ListPlus
} from 'lucide-react';

export const ShoppingView: React.FC = () => {
  const [list, setList] = useState<ShoppingList>({ itens: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [singleItemName, setSingleItemName] = useState<string>('');
  const [isBulkCreating, setIsBulkCreating] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchShoppingList = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getShoppingList();
      setList(data);
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || 'Falha ao carregar lista de compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const handleToggleItem = async (idx: number) => {
    setActionError(null);
    try {
      const updated = await api.toggleShoppingItem(idx);
      setList(updated);

      const allBought =
        updated.itens.length > 0 && updated.itens.every((item) => item.comprado);
      if (allBought) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      setActionError(`Erro ao atualizar item: ${err.message}`);
    }
  };

  const handleAddSingleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleItemName.trim()) return;
    setActionError(null);

    try {
      const updated = await api.addShoppingItem(singleItemName.trim());
      setList(updated);
      setSingleItemName('');
    } catch (err: any) {
      setActionError(`Erro: ${err.message}`);
    }
  };

  const handleStartBulkCreate = () => {
    const hasUnbought = list.itens.some((i) => !i.comprado);
    if (list.itens.length > 0 && hasUnbought) {
      setConfirmDialog({
        title: 'Substituir Lista Atual?',
        message: 'Você ainda tem itens pendentes na sua lista de compras. Criar uma nova lista apagará a lista existente.',
        confirmText: 'Sim, criar nova',
        onConfirm: () => {
          setConfirmDialog(null);
          setIsBulkCreating(true);
        }
      });
    } else {
      setIsBulkCreating(true);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = bulkText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (items.length === 0) return;
    setActionError(null);

    try {
      const updated = await api.createShoppingList(items);
      setList(updated);
      setBulkText('');
      setIsBulkCreating(false);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setActionError(`Erro ao criar lista: ${err.message}`);
    }
  };

  const handleReuseList = () => {
    setConfirmDialog({
      title: 'Reaproveitar Lista?',
      message: 'Deseja desmarcar todos os itens comprados para utilizá-los na sua próxima ida ao mercado?',
      confirmText: 'Reaproveitar',
      onConfirm: async () => {
        setConfirmDialog(null);
        setActionError(null);
        try {
          const updated = await api.reuseShoppingList();
          setList(updated);
        } catch (err: any) {
          setActionError(`Erro: ${err.message}`);
        }
      }
    });
  };

  const handleDeleteList = () => {
    setConfirmDialog({
      title: 'Excluir Lista de Compras?',
      message: 'Tem certeza que deseja apagar permanentemente todos os itens da lista de compras?',
      confirmText: 'Excluir Lista',
      onConfirm: async () => {
        setConfirmDialog(null);
        setActionError(null);
        try {
          const updated = await api.deleteShoppingList();
          setList(updated);
        } catch (err: any) {
          setActionError(`Erro: ${err.message}`);
        }
      }
    });
  };

  const totalItems = list.itens.length;
  const boughtItems = list.itens.filter((i) => i.comprado).length;
  const progressPercent = totalItems > 0 ? Math.round((boughtItems / totalItems) * 100) : 0;
  const allCompleted = totalItems > 0 && boughtItems === totalItems;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0EAFE] border-2 border-[#BCA6F4] flex items-center justify-center text-[#7955D9] shadow-xs shrink-0">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#29243B] tracking-tight">Lista de Compras</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF9FE] border border-[#DCD5EC] text-[#777187]">
                  {boughtItems}/{totalItems} comprados
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#777187] font-medium mt-0.5">
                Organização prática do mercado e mantimentos sem esquecer nada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartBulkCreate}
              className="btn-tactile-purple text-xs md:text-sm px-4 py-2.5"
            >
              <ListPlus className="w-4 h-4" />
              <span>Nova Lista</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalItems > 0 && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#29243B]">
              <span>Itens no Carrinho</span>
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
            onClick={fetchShoppingList}
            className="btn-tactile-secondary text-xs px-4 py-2 text-rose-800 border-rose-300 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* All Items Completed Celebration Banner */}
      {allCompleted && (
        <div className="bg-gradient-to-r from-[#A5F0D0]/40 to-[#FAF9FE] border-2 border-[#35C99B] rounded-3xl p-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-[#35C99B] text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-[#1E8262]">
            🎉 Todos os itens foram comprados!
          </h3>
          <p className="text-xs text-[#29243B] font-medium max-w-md mx-auto">
            Excelente trabalho! Você concluiu toda a sua lista. O que deseja fazer agora?
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={handleReuseList}
              className="btn-tactile-mint text-xs px-4 py-2.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reaproveitar Lista</span>
            </button>
            <button
              onClick={handleDeleteList}
              className="btn-tactile-danger text-xs px-4 py-2.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Lista</span>
            </button>
          </div>
        </div>
      )}

      {/* Bulk Create Modal / Form */}
      {isBulkCreating && (
        <form
          onSubmit={handleBulkCreate}
          className="bg-white rounded-3xl border-3 border-[#7955D9] p-6 shadow-lg space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#29243B] uppercase tracking-wide">
              Criar Nova Lista de Compras
            </h3>
            <button
              type="button"
              onClick={() => setIsBulkCreating(false)}
              className="text-[#777187] hover:text-[#29243B] text-xs font-bold"
            >
              Cancelar
            </button>
          </div>
          <p className="text-xs text-[#777187]">
            Digite um item por linha para montar sua lista rapidamente:
          </p>
          <textarea
            rows={5}
            placeholder={"Leite\nOvos\nCafé\nFrutas\nDetergente"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full p-4 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B]"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={!bulkText.trim()}
              className="btn-tactile-mint text-xs md:text-sm px-5 py-2.5 disabled:opacity-50"
            >
              Salvar Lista
            </button>
          </div>
        </form>
      )}

      {/* Add Single Item Quick Bar */}
      <form onSubmit={handleAddSingleItem} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Adicionar item rápido (Ex: Pão de queijo)..."
          value={singleItemName}
          onChange={(e) => setSingleItemName(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#DCD5EC] focus:border-[#7955D9] focus:outline-hidden text-sm font-semibold text-[#29243B] bg-white shadow-xs"
        />
        <button
          type="submit"
          disabled={!singleItemName.trim()}
          className="btn-tactile-purple text-xs md:text-sm px-5 py-3 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </form>

      {/* Shopping Items List */}
      {loading ? (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-12 text-center text-[#777187] font-semibold text-sm">
          Carregando lista de compras...
        </div>
      ) : list.itens.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-[#DCD5EC] p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EAFE] text-[#7955D9] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#29243B]">
            Sua lista de compras está vazia.
          </h3>
          <p className="text-xs text-[#777187] max-w-sm mx-auto">
            Adicione itens individuais acima ou crie uma lista completa com um clique.
          </p>
          <button
            onClick={handleStartBulkCreate}
            className="btn-tactile-purple text-xs px-4 py-2 mt-2"
          >
            Criar Lista Completa
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {list.itens.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleItem(item.id)}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 cursor-pointer select-none transition-all shadow-xs ${
                item.comprado
                  ? 'bg-[#FAFDFB] border-[#A5F0D0]'
                  : 'bg-white border-[#DCD5EC] hover:border-[#BCA6F4]'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors shrink-0 ${
                    item.comprado
                      ? 'bg-[#35C99B] border-[#1E8262] text-white shadow-xs'
                      : 'bg-white border-[#DCD5EC] text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 fill-current" />
                </div>
                <span
                  className={`text-sm sm:text-base font-bold truncate ${
                    item.comprado ? 'line-through text-[#777187]' : 'text-[#29243B]'
                  }`}
                >
                  {item.nome}
                </span>
              </div>

              <span className="text-xs font-semibold text-[#777187] shrink-0">
                {item.comprado ? 'Comprado' : 'No carrinho'}
              </span>
            </div>
          ))}

          {/* Bottom actions for active list */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleReuseList}
              className="btn-tactile-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Desmarcar Todos</span>
            </button>

            <button
              onClick={handleDeleteList}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Lista</span>
            </button>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29243B]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl border-3 border-[#DCD5EC] p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-black text-[#29243B]">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-[#777187] font-medium leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="btn-tactile-secondary text-xs px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="btn-tactile-danger text-xs px-4 py-2"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
