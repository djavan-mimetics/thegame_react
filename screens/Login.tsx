
import React, { useState } from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Mail, Facebook } from 'lucide-react';
import logoQD from '../src/img/logo_qd.png';
import { apiFetch } from '../apiClient';
import { setSessionTokens } from '../authClient';

interface LoginProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'selection' | 'email'>('selection');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        setError('Email ou senha invalidos.');
        return;
      }

      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      await setSessionTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      onNavigate(AppScreen.HOME);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Icon Component (SVG)
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6 mt-2">
        <button onClick={() => {
            if (loginMethod === 'email') setLoginMethod('selection');
            else onNavigate(AppScreen.WELCOME);
        }} className="p-2 -ml-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft />
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo<br/>de volta</h1>
        <p className="text-gray-400">Faça login para continuar.</p>
        </div>

      {loginMethod === 'selection' ? (
        <div className="flex-1 flex flex-col justify-center space-y-4">
            <button 
                onClick={() => onNavigate(AppScreen.HOME)}
                className="w-full bg-white text-black font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
            >
                <GoogleIcon />
                Continuar com Google
            </button>

            <button 
                onClick={() => onNavigate(AppScreen.HOME)}
                className="w-full bg-[#1877F2] text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-colors"
            >
                <Facebook size={20} fill="currentColor" />
                Continuar com Facebook
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-brand-dark text-gray-500">ou</span>
                </div>
            </div>

            <button 
                onClick={() => setLoginMethod('email')}
                className="w-full bg-brand-card border-2 border-brand-primary/50 text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-brand-card/80 transition-colors"
            >
                <Mail size={20} />
                Entrar com Email
            </button>
        </div>
      ) : (
          <form onSubmit={handleLogin} className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Email</label>
                    <input 
                        type="email" 
                        className="w-full bg-brand-card border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none transition-colors"
                        placeholder="usuario@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Senha</label>
                    <input 
                        type="password" 
                        className="w-full bg-brand-card border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none transition-colors"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex justify-end">
                    <button 
                        type="button" 
                        onClick={() => onNavigate(AppScreen.FORGOT_PASSWORD)}
                        className="text-sm text-gray-500 hover:text-brand-primary"
                    >
                        Esqueceu a senha?
                    </button>
                </div>
            </div>

            <Button fullWidth type="submit" className="mt-8">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        </form>
      )}
      
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
              Não tem uma conta? <button onClick={() => onNavigate(AppScreen.REGISTER)} className="text-brand-primary font-bold hover:underline">Cadastre-se</button>
          </p>
        </div>
      </div>

      <footer className="py-6 flex justify-center border-t border-white/5">
        <img 
            src={`${logoQD}?v=${__APP_BUILD_ID__}`}
            alt="Logomarca The Game"
            className="w-16 h-16 object-contain opacity-90"
        />
      </footer>
    </div>
  );
};
