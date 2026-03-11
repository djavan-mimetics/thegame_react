import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { apiFetch } from '../apiClient';

interface ResetPasswordProps {
  onNavigate: (screen: AppScreen) => void;
  token: string | null;
}

const NOTICE_KEY = 'thegame_auth_notice';

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate, token }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const isStrongPassword = (value: string) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    return value.length >= 8 && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Link de redefinição inválido.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError('Use uma senha forte com letra maiúscula, minúscula, número e símbolo.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      if (!res.ok) {
        setError('O link é inválido ou expirou. Solicite um novo email.');
        return;
      }

      sessionStorage.setItem(NOTICE_KEY, 'Senha alterada com sucesso. Faça login com sua nova senha.');
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-brand-dark">
      <div className="mb-6 mt-2">
        <button onClick={() => onNavigate(AppScreen.LOGIN)} className="p-2 -ml-2 text-gray-400 hover:text-white mb-4">
          <ArrowLeft />
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">Nova<br/>Senha</h1>
        <p className="text-gray-400">Defina uma nova senha para sua conta.</p>
      </div>

      {isSuccess ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Senha atualizada</h2>
          <p className="text-gray-400 mb-8">Sua senha foi redefinida com sucesso.</p>
          <Button fullWidth onClick={() => onNavigate(AppScreen.LOGIN)}>
            Ir para o login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-brand-card border border-gray-700 rounded-xl py-3 pl-12 pr-12 text-white focus:border-brand-primary focus:outline-none transition-colors"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full bg-brand-card border border-gray-700 rounded-xl py-3 pl-12 pr-12 text-white focus:border-brand-primary focus:outline-none transition-colors"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirmPassword((v) => !v)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <Button fullWidth type="submit" className="mt-8" disabled={!newPassword || !confirmPassword || isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      )}
    </div>
  );
};
