
import React, { useState } from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (screen: AppScreen) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate API call
      setTimeout(() => {
        setIsSent(true);
      }, 1000);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-brand-dark">
      <div className="mb-6 mt-2">
        <button onClick={() => onNavigate(AppScreen.LOGIN)} className="p-2 -ml-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft />
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">Recuperar<br/>Senha</h1>
        <p className="text-gray-400">Informe seu email para receber o link de redefinição.</p>
      </div>

      {isSent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Enviado!</h2>
            <p className="text-gray-400 mb-8">
                Verifique sua caixa de entrada (e spam) para redefinir sua senha.
            </p>
            <Button fullWidth onClick={() => onNavigate(AppScreen.LOGIN)}>
                Voltar para o Login
            </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Email Cadastrado</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            type="email" 
                            className="w-full bg-brand-card border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-brand-primary focus:outline-none transition-colors"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            <Button fullWidth type="submit" className="mt-8" disabled={!email}>
                Enviar Link
            </Button>
        </form>
      )}
    </div>
  );
};
