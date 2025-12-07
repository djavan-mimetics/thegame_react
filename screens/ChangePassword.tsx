
import React, { useState } from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { Button } from '../components/Button';

interface ChangePasswordProps {
  onNavigate: (screen: AppScreen) => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onNavigate }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-brand-dark border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-brand-card p-4 rounded-xl border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <label className="text-white font-bold text-sm ml-1">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-brand-dark border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-white font-bold text-sm ml-1">Confirmar Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-brand-dark border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>

                <ul className="text-xs text-gray-500 list-disc pl-5 space-y-1">
                    <li>Mínimo de 6 caracteres</li>
                    <li>Use uma mistura de letras e números para maior segurança</li>
                </ul>

                <div className="pt-4">
                    <Button fullWidth type="submit" className="shadow-lg shadow-brand-primary/20">
                        Atualizar Senha
                    </Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};
