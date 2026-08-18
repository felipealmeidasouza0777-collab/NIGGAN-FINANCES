import React, { useState } from 'react';
import { Wallet, Loader2, CloudCheck } from 'lucide-react';
import { authService } from '../services/supabase/authService';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === 'signin'
        ? await authService.signIn(email, password)
        : await authService.signUp(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === 'signup' && !result.session) {
      // Supabase pode exigir confirmação de e-mail antes de criar a sessão
      setSignupDone(true);
      return;
    }

    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-700/50 mb-4">
            <span className="font-black text-2xl tracking-wider text-emerald-400">N</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            NIGGAN <span className="text-emerald-600">FINANCES</span>
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
            Seus dados sincronizados na nuvem
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          {signupDone ? (
            <div className="text-center space-y-3 py-4">
              <Wallet className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Conta criada!</p>
              <p className="text-xs text-slate-500">
                Confirme seu e-mail (verifique a caixa de entrada de {email}) e depois entre normalmente.
              </p>
              <button
                onClick={() => {
                  setSignupDone(false);
                  setMode('signin');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {error && (
                <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signin' ? 'Entrar' : 'Criar conta'}
              </button>

              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-emerald-700 cursor-pointer"
              >
                {mode === 'signin' ? 'Ainda não tem conta? Criar agora' : 'Já tem conta? Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
