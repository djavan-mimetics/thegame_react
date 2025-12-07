
import React from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { Heart } from 'lucide-react';

interface WelcomeProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col items-center justify-between p-8 bg-brand-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-primary rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-brand-accent rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="w-24 h-24 mb-6 relative">
             <Heart className="w-full h-full text-brand-primary drop-shadow-[0_0_15px_rgba(233,30,99,0.5)]" fill="currentColor" />
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-brand-accent mix-blend-overlay" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-brand-primary to-white bg-clip-text text-transparent">
          The Game
        </h1>
        <p className="text-gray-400 text-center text-lg max-w-[250px] font-medium">
          Venha aonde o Jogo é Jogado.
        </p>
      </div>

      <div className="w-full space-y-4 z-10 mb-8">
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
  );
};
