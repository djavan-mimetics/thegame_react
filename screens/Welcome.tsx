
import React from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import logoQD from '../src/img/logo_qd.png';

interface WelcomeProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen h-screen flex flex-col items-center justify-center p-8 bg-brand-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-primary rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-brand-accent rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center text-center gap-10">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="welcome-blur welcome-blur-one" aria-hidden="true" />
            <div className="welcome-blur welcome-blur-two" aria-hidden="true" />
            <img 
              src={`${logoQD}?v=${__APP_BUILD_ID__}`} 
              alt="Logomarca The Game" 
              className="relative z-10 w-64 h-64 object-contain drop-shadow-[0_0_25px_rgba(233,30,99,0.45)]" 
            />
          </div>
          <p className="text-gray-200 text-lg font-small">
            Venha aonde o Jogo é Jogado.
          </p>
        </div>

        <div className="mt-auto pb-1"></div>
        <div className="w-full space-y-4">
          <Button fullWidth onClick={() => onNavigate(AppScreen.RULES)}>
            Começar
          </Button>
          <Button fullWidth variant="secondary" onClick={() => onNavigate(AppScreen.LOGIN)}>
            Já tenho uma conta
          </Button>
          <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
            Ao tocar em Começar, você concorda com nossos{' '}
            <button 
              onClick={() => onNavigate(AppScreen.TERMS)} 
              className="text-brand-primary underline hover:text-brand-secondary transition-colors"
            >
              Termos
            </button>
            {' '}e{' '}
            <button 
              onClick={() => onNavigate(AppScreen.PRIVACY)} 
              className="text-brand-primary underline hover:text-brand-secondary transition-colors"
            >
              Política de Privacidade
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
};
