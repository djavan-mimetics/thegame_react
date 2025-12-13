
import React, { useState } from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Lock, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';

interface ChangePasswordProps {
  onNavigate: (screen: AppScreen) => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onNavigate }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isStrongPassword = (value: string) => {
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSymbol = /[^A-Za-z0-9]/.test(value);
        return value.length >= 8 && hasUpper && hasLower && hasNumber && hasSymbol;
    };

    const passwordValid = isStrongPassword(newPassword);
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const canSubmit = Boolean(
        currentPassword &&
        newPassword &&
        confirmPassword &&
        passwordValid &&
        passwordsMatch
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        if (!passwordValid) {
            alert("A nova senha precisa ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("As senhas não coincidem!");
      return;
    }
    // Simulate API call
    setTimeout(() => {
        setIsSuccess(true);
        setTimeout(() => {
            onNavigate(AppScreen.SECURITY);
        }, 1500);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.SECURITY)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Alterar Senha</h1>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {isSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                    <Check size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Sucesso!</h2>
                <p className="text-gray-400">Sua senha foi alterada com sucesso.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="bg-brand-card p-4 rounded-xl border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <label className="text-white font-bold text-sm ml-1">Senha Atual</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type={showCurrent ? 'text' : 'password'} 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-brand-dark border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(prev => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                            >
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-card p-4 rounded-xl border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <label className="text-white font-bold text-sm ml-1">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type={showNew ? 'text' : 'password'} 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full bg-brand-dark border rounded-xl py-3 pl-12 pr-12 text-white text-sm outline-none transition-colors ${newPassword && !passwordValid ? 'border-red-500 focus:border-red-400' : 'border-white/10 focus:border-brand-primary'}`}
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(prev => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                            >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className={`text-xs ml-1 ${newPassword ? (passwordValid ? 'text-gray-400' : 'text-red-500') : 'text-gray-500'}`}>
                            Use pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-white font-bold text-sm ml-1">Confirmar Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type={showConfirm ? 'text' : 'password'} 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full bg-brand-dark border rounded-xl py-3 pl-12 pr-12 text-white text-sm outline-none transition-colors ${confirmPassword && !passwordsMatch ? 'border-red-500 focus:border-red-400' : 'border-white/10 focus:border-brand-primary'}`}
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(prev => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-red-500 ml-1">As senhas precisam ser iguais.</p>
                        )}
                    </div>
                </div>

                <ul className="text-xs text-gray-500 list-disc pl-5 space-y-1">
                    <li>Pelo menos 8 caracteres.</li>
                    <li>Combine letras maiúsculas, minúsculas, números e símbolos para uma senha forte.</li>
                </ul>

                <div className="pt-4">
                    <Button fullWidth type="submit" disabled={!canSubmit} className="shadow-lg shadow-brand-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
                        Atualizar Senha
                    </Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};
