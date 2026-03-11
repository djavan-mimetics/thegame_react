
import React from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Lock, FileText, EyeOff, Flag, HelpCircle, Info, LogOut, Trash2 } from 'lucide-react';
import logoQD from '../src/img/logo_qd.png';
import { clearSessionTokens } from '../authClient';
import { apiFetch } from '../apiClient';

interface SecurityProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Security: React.FC<SecurityProps> = ({ onNavigate }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleLogout = async () => {
    await clearSessionTokens();
    onNavigate(AppScreen.WELCOME);
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    const confirmDelete = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.');
    if (!confirmDelete) return;

    const password = window.prompt('Confirme sua senha para excluir sua conta:');
    if (password === null) return;

    setIsDeleting(true);
    try {
      const res = await apiFetch('/v1/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(password ? { currentPassword: password } : {})
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        if (payload?.error === 'password_required') {
          window.alert('Senha obrigatória para excluir a conta.');
        } else if (payload?.error === 'invalid_current_password') {
          window.alert('Senha atual inválida.');
        } else {
          window.alert('Não foi possível excluir sua conta agora.');
        }
        return;
      }

      await clearSessionTokens();
      onNavigate(AppScreen.WELCOME);
    } catch {
      window.alert('Não foi possível excluir sua conta agora.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.EDIT_PROFILE)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
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
              onClick={handleLogout}
              className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <LogOut size={20} />
              Sair da Conta
            </button>

            <button 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={20} />
              {isDeleting ? 'Excluindo...' : 'Excluir Minha Conta'}
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
