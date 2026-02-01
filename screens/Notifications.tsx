import React from 'react';
import { ArrowLeft, Bell, Heart, MessageCircle, Sparkles, Info } from 'lucide-react';
import { AppScreen, NotificationItem } from '../types';

interface NotificationsProps {
  onNavigate: (screen: AppScreen) => void;
  items: NotificationItem[];
}

const typeStyles: Record<NotificationItem['type'], { icon: React.ReactNode; accent: string }> = {
  match: { icon: <Heart size={18} className="text-brand-primary" />, accent: 'from-brand-primary/20 to-brand-primary/5' },
  message: { icon: <MessageCircle size={18} className="text-sky-400" />, accent: 'from-sky-400/20 to-sky-400/5' },
  superlike: { icon: <Sparkles size={18} className="text-yellow-300" />, accent: 'from-yellow-300/20 to-yellow-300/5' },
  system: { icon: <Info size={18} className="text-gray-300" />, accent: 'from-white/10 to-white/5' }
};

export const Notifications: React.FC<NotificationsProps> = ({ onNavigate, items }) => {
  return (
    <div className="h-full flex flex-col bg-brand-dark text-white pt-12 pb-8">
      <header className="px-4 mb-8 flex items-center gap-4">
        <button
          onClick={() => onNavigate(AppScreen.EDIT_PROFILE)}
          className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-primary font-bold">Atualizações</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Notificações</h1>
            <Bell size={20} className="text-brand-primary" />
          </div>
          <p className="text-sm text-gray-400">Veja o que rolou com seu perfil recentemente</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 no-scrollbar">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 py-16 border border-dashed border-white/10 rounded-3xl">
            <Bell size={32} className="text-gray-600 mb-4" />
            <p className="font-semibold text-white">Sem novidades por aqui</p>
            <p className="text-sm text-gray-400">Quando alguém interagir com você, avisaremos nesse espaço.</p>
          </div>
        )}

        {items.map((notification) => {
          const style = typeStyles[notification.type];
          return (
            <div
              key={notification.id}
              className={`rounded-3xl border border-white/5 p-4 bg-gradient-to-r ${style.accent} flex gap-4 hover:border-white/20 transition-colors`}
            >
              <div className="w-12 h-12 rounded-2xl bg-black/30 flex items-center justify-center border border-white/5">
                {style.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white">{notification.title}</p>
                  {!notification.seen && (
                    <span className="text-[10px] uppercase text-brand-primary font-bold tracking-widest">Novo</span>
                  )}
                </div>
                <p className="text-sm text-gray-300 leading-snug">{notification.description}</p>
                <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
