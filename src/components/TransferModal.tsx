import React, { useState } from 'react';
import { X, ArrowRight, Layers, Check, ShieldAlert } from 'lucide-react';
import { MoneyBox } from '../types/finance';
import { db } from '../services/database/storage';
import { formatCurrency, parseCurrencyToCents } from '../lib/finance';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxes: MoneyBox[];
  defaultFromBoxId?: string;
  onSuccessToast: (msg: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  boxes,
  defaultFromBoxId,
  onSuccessToast,
}) => {
  const [fromBoxId, setFromBoxId] = useState<string>(defaultFromBoxId || boxes[0]?.id || '');
  const [toBoxId, setToBoxId] = useState<string>(boxes[1]?.id || '');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const fromBox = boxes.find(b => b.id === fromBoxId);
  const toBox = boxes.find(b => b.id === toBoxId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountInCents = parseCurrencyToCents(rawAmount);

    if (amountInCents <= 0) {
      alert('Informe um valor maior que zero.');
      return;
    }

    if (fromBoxId === toBoxId) {
      alert('Selecione caixas de origem e destino diferentes.');
      return;
    }

    if (fromBox && amountInCents > fromBox.balanceInCents) {
      alert(`Saldo insuficiente na caixa "${fromBox.name}". Saldo disponível: ${formatCurrency(fromBox.balanceInCents)}`);
      return;
    }

    const success = db.transferBetweenBoxes(fromBoxId, toBoxId, amountInCents, notes);
    if (success) {
      onSuccessToast(`Transferência de ${formatCurrency(amountInCents)} realizada para ${toBox?.name || 'caixa'}!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mover entre Caixas</h2>
              <p className="text-xs text-slate-500">Sem alterar suas receitas ou despesas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-5 gap-2 items-center">
            {/* From Box */}
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-600 block">De (Origem)</label>
              <select
                aria-label="Caixa de Origem"
                value={fromBoxId}
                onChange={(e) => setFromBoxId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                {boxes.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({formatCurrency(b.balanceInCents)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* To Box */}
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Para (Destino)</label>
              <select
                aria-label="Caixa de Destino"
                value={toBoxId}
                onChange={(e) => setToBoxId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                {boxes.filter(b => b.id !== fromBoxId).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({formatCurrency(b.balanceInCents)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount input */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Valor a Transferir
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-bold text-slate-400">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                placeholder="0,00"
                className="w-36 text-center text-2xl font-extrabold font-mono-num text-slate-900 placeholder:text-slate-300 focus:outline-hidden bg-transparent"
                required
              />
            </div>
          </div>

          {/* Motive/Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Motivo / Observação
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Aporte mensal, Reserva de emergência..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Transferências entre caixas não afetam suas receitas ou despesas globais.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Confirmar Transferência</span>
          </button>
        </form>
      </div>
    </div>
  );
};
