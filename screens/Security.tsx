
import React from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Lock, FileText, EyeOff, Flag, HelpCircle, Info, LogOut, Trash2 } from 'lucide-react';
import logoQD from '../src/img/logo_qd.png';

interface SecurityProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Security: React.FC<SecurityProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.PROFILE)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Central de Segurança</h1>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        
        {/* Menu Items */}
        <div className="space-y-3 mb-8">
            <MenuOption icon={Lock} label="Alterar minha senha" onClick={() => onNavigate(AppScreen.CHANGE_PASSWORD)} />
            <MenuOption icon={FileText} label="Termos de Uso" onClick={() => onNavigate(AppScreen.TERMS_SECURITY)} />
            <MenuOption icon={EyeOff} label="Política de Privacidade" onClick={() => onNavigate(AppScreen.PRIVACY_SECURITY)} />
            <MenuOption icon={Flag} label="Denúncia de Assédio" onClick={() => onNavigate(AppScreen.REPORT_LIST)} />
            <MenuOption icon={HelpCircle} label="Ajuda" onClick={() => onNavigate(AppScreen.HELP)} />
            <MenuOption icon={Info} label="Sobre" onClick={() => onNavigate(AppScreen.ABOUT)} />
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-6 pb-10">
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate(AppScreen.WELCOME)}
              className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <LogOut size={20} />
              Sair da Conta
            </button>

            <button 
              className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={20} />
              Excluir Minha Conta
            </button>
          </div>

          {/* Brand Footer */}
          <div className="mt-auto pb-1"></div>
          <div className="flex flex-col items-center gap-2 text-center">
            <img src={`${logoQD}?v=${__APP_BUILD_ID__}`} alt="The Game" className="w-20 h-20 object-contain drop-shadow-lg" />
          </div>
        </div>

      </div>
    </div>
  );
};

const MenuOption = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-brand-card hover:bg-brand-card/80 rounded-xl transition-colors group">
        <div className="flex items-center gap-3">
            <Icon className="text-gray-400 group-hover:text-brand-primary transition-colors" size={20} />
            <span className="text-gray-200 font-medium text-sm">{label}</span>
        </div>
        <div className="text-gray-600">›</div>
    </button>
);
