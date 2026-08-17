import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { FinancialSummary, Transaction, TikTokEntry, FinancialSettings } from '../../types/finance';
import { aiFinancialService } from '../../services/ai/aiFinancialService';

interface AiAdvisorViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  tiktokEntries: TikTokEntry[];
  settings: FinancialSettings;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  summary,
  transactions,
  tiktokEntries,
  settings,
}) => {
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string }[]>([
    {
      id: 'init_1',
      sender: 'ai',
      text: 'Olá! Sou sua Inteligência Financeira pessoal no NIGGAN FINANCES. Analisei seus dados em tempo real (saldo, despesas fixas, comissões do TikTok Shop e a meta dos R$ 30.000). Como posso te ajudar hoje?',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Quanto posso gastar hoje sem comprometer minha meta?',
    'Se eu continuar assim, chego nos R$ 30.000 em Maio/2027?',
    'Qual a melhor estratégia para reinvestir no TikTok Shop?',
    'Como está meu dízimo e minhas contas fixas este mês?',
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsgId = `usr_${Date.now()}`;
    const newMessages = [
      ...messages,
      { id: userMsgId, sender: 'user' as const, text: questionText },
    ];
    setMessages(newMessages);
    setInputQuestion('');
    setLoading(true);

    try {
      const responseText = await aiFinancialService.askFinancialAdvisor(
        questionText,
        summary,
        transactions,
        tiktokEntries,
        settings
      );

      setMessages([
        ...newMessages,
        { id: `ai_${Date.now()}`, sender: 'ai' as const, text: responseText },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai' as const,
          text: 'Desculpe, ocorreu um erro ao processar sua pergunta.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              IA Financeira — Assistente & Mentor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pergunte sobre seus saldos, metas de R$ 30.000, estratégias de escala no TikTok Shop e otimizações
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Perguntas Rápidas de 1 Clique:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(p)}
              disabled={loading}
              className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-200 text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span>{p}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-xs'
                    : 'bg-slate-100/90 text-slate-800 rounded-bl-xs border border-slate-200/50'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-100 rounded-2xl flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Analisando suas finanças...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuestion);
          }}
          className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Digite sua dúvida financeira (ex: Posso comprar um tênis de R$ 300 hoje?)..."
            disabled={loading}
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
