import React from 'react';
import { Home, Trophy, Heart, MessageCircle, User } from 'lucide-react';
import { AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { icon: Home, screen: AppScreen.HOME, label: 'Início' },
    { icon: Trophy, screen: AppScreen.RANKING, label: 'Ranking' },
    { icon: Heart, screen: AppScreen.LIKES, label: 'Curtidas' },
    { icon: MessageCircle, screen: AppScreen.CHAT, label: 'Chat' },
    { icon: User, screen: AppScreen.PROFILE, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-white/5 pb-6 pt-3 px-4 z-50 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;
          
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive ? 'text-brand-primary' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <Icon size={isActive ? 28 : 24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} fillOpacity={0.2} />
              <span className={`text-[10px] mt-1 ${isActive ? 'text-brand-primary font-bold' : 'text-transparent'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};