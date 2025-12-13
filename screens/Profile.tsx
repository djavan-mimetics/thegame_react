
import React from 'react';
import { Settings as SettingsIcon, Edit2, Shield, Camera, Bell, Zap } from 'lucide-react';
import { AppScreen, MyProfile } from '../types';

interface ProfileProps {
    onNavigate: (screen: AppScreen) => void;
    isPremium: boolean;
    myProfile: MyProfile;
    completion: number;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate, isPremium, myProfile, completion }) => {
    // Calculate age from birthDate (simple approximation for display)
    const getAge = (dateString: string) => {
        if (!dateString) return 28; // Default fallback
        const parts = dateString.split('/');
        if (parts.length !== 3) return 28;
        const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="h-full flex flex-col bg-brand-dark pt-10 pb-24 overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-center px-4 mb-6">
                <h1 className="text-2xl font-bold text-white">Perfil</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate(AppScreen.NOTIFICATIONS)}
                        className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                        aria-label="Abrir notificações"
                    >
                        <Bell size={20} />
                    </button>
                    {/* Settings now redirects to SECURITY as requested */}
                    <button onClick={() => onNavigate(AppScreen.SECURITY)} className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/40 transition-colors" aria-label="Abrir configurações">
                        <SettingsIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Profile Card */}
            <div className="flex flex-col items-center mb-8 relative px-4">
                <div className="w-32 h-32 rounded-full p-1 border-2 border-brand-primary mb-4 relative">
                    <img src={myProfile.images[0] || "https://picsum.photos/400/400?random=99"} alt="Eu" className="w-full h-full rounded-full object-cover" />
                    <button 
                        onClick={() => onNavigate(AppScreen.EDIT_PROFILE)}
                        className="absolute bottom-0 right-0 p-2 bg-brand-primary rounded-full text-white border-4 border-brand-dark hover:scale-110 transition-transform"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
                {/* Occupation removed as requested */}
                <h2 className="text-2xl font-bold text-white mb-1">{myProfile.name}, {getAge(myProfile.birthDate)}</h2>

                {/* Stats */}
                <div className="flex items-center divide-x divide-gray-700 mt-6 w-full max-w-xs bg-brand-card rounded-xl p-4 border border-white/5">
                    <div className="flex-1 flex flex-col items-center">
                        <span className="font-bold text-brand-primary text-lg">{completion}%</span>
                        <span className="text-xs text-gray-500 uppercase">Completo</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="font-bold text-white text-lg">42</span>
                        <span className="text-xs text-gray-500 uppercase">Matches</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="font-bold text-white text-lg">7.4</span>
                        <span className="text-xs text-gray-500 uppercase">Pontos</span>
                    </div>
                </div>
            </div>

            {/* Premium Banner */}
            <div className="px-4 mb-8">
                <div className="bg-gradient-to-r from-brand-secondary to-brand-accent p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-brand-primary/20">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                             <Zap className="text-yellow-300 fill-yellow-300" size={20} />
                             <h3 className="text-white font-extrabold text-lg italic tracking-wider">PREMIUM</h3>
                        </div>
                        <p className="text-white/90 text-sm mb-4 max-w-[70%]">
                            {isPremium 
                                ? 'Você já é Premium! Aproveite seus benefícios exclusivos.' 
                                : 'Veja quem curtiu você, swipes ilimitados e mais.'
                            }
                        </p>
                        <button 
                            onClick={() => onNavigate(AppScreen.PREMIUM)}
                            className="bg-white text-brand-accent font-bold py-2 px-6 rounded-full text-sm hover:bg-gray-100 transition-colors"
                        >
                            {isPremium ? 'Configurar' : 'Assinar Agora'}
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                </div>
            </div>

            {/* Menu Options */}
            <div className="px-4 space-y-3">
                <MenuOption icon={Camera} label="Gerenciar Fotos" onClick={() => onNavigate(AppScreen.EDIT_PROFILE)} />
                <MenuOption icon={Shield} label="Central de Segurança" onClick={() => onNavigate(AppScreen.SECURITY)} />
            </div>
            
            <div className="mt-8 px-4 text-center">
                <div className="mt-2 text-xs text-gray-700">
                    Versão 1.0.0
                </div>
            </div>
        </div>
    );
};

const MenuOption = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-brand-card hover:bg-brand-card/80 rounded-xl transition-colors group">
        <div className="flex items-center gap-3">
            <Icon className="text-brand-primary group-hover:scale-110 transition-transform" size={20} />
            <span className="text-gray-200 font-medium">{label}</span>
        </div>
        <div className="text-gray-600">›</div>
    </button>
);
