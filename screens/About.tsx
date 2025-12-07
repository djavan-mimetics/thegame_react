
import React from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Mail, ChevronRight, FileText, Shield, HelpCircle, RefreshCw } from 'lucide-react';

interface AboutProps {
  onNavigate: (screen: AppScreen) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.SECURITY)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Sobre</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Version Info Card */}
        <div className="bg-brand-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-2">The Game — Versão Beta</h2>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Esta é uma versão Beta do aplicativo The Game.
                Recursos podem mudar com frequência e podem ocorrer instabilidades. Seu feedback é essencial para nossa evolução.
            </p>
            <button className="bg-brand-primary text-white font-bold py-3 px-6 rounded-xl text-sm flex items-center gap-2 hover:bg-brand-primary/80 transition-colors shadow-lg shadow-brand-primary/25">
                <Mail size={16} /> Enviar feedback
            </button>
        </div>

        {/* Technical Info */}
        <div className="bg-brand-card rounded-2xl p-6 border border-white/5 text-sm space-y-2">
            <h3 className="text-white font-bold mb-3 text-base">Informações da versão</h3>
            <div className="text-gray-400">Versão: <span className="text-white">1.0.0</span></div>
            <div className="text-gray-400">Canal: <span className="text-white">production</span></div>
            <div className="text-gray-400">Plataforma: <span className="text-white">web</span></div>
            <div className="text-gray-400 mb-4">API: <span className="text-white">https://api.thegame.app/v1</span></div>
            
            <button className="w-full border border-white/20 rounded-xl py-3 flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-colors">
                <RefreshCw size={16} /> Verificar atualizações
            </button>
        </div>

        {/* Shortcuts */}
        <div className="bg-brand-card rounded-2xl overflow-hidden border border-white/5">
            <div className="p-4 border-b border-white/5">
                <h3 className="text-white font-bold">Atalhos</h3>
            </div>
            
            <ShortcutItem 
                icon={HelpCircle} 
                label="Ajuda e Suporte" 
                onClick={() => onNavigate(AppScreen.HELP)} 
            />
            <ShortcutItem 
                icon={FileText} 
                label="Termos e Condições" 
                onClick={() => onNavigate(AppScreen.TERMS_SECURITY)} 
            />
            <ShortcutItem 
                icon={Shield} 
                label="Política de Privacidade" 
                onClick={() => onNavigate(AppScreen.PRIVACY_SECURITY)} 
            />
        </div>

        <div className="text-center text-[10px] text-gray-600 pt-4 pb-8">
            © 2025 The Game. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

const ShortcutItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
        <div className="flex items-center gap-3">
            <Icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{label}</span>
        </div>
        <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
    </button>
);
