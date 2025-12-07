
import React, { useState } from 'react';
import { MOCK_PROFILES, TAGS_LIST } from '../constants';
import { UserProfile, AppScreen } from '../types';
import { Heart, HeartCrack, MapPin, Info, X, ChevronDown, Instagram, Music, Ruler, Moon, GraduationCap, Wine, Cigarette, Dog, Dumbbell, Briefcase, Search, Globe, Lightbulb } from 'lucide-react';

interface HomeProps {
    onNavigate?: (screen: AppScreen) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State for the user's active active tag
  const [myTag, setMyTag] = useState<string>("Jogar videogame");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const currentProfile = profiles[0];

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    setIsExpanded(false); // Reset expansion on swipe
    setLastDirection(direction);
    // Simulate delay for animation
    setTimeout(() => {
        setProfiles((prev) => prev.slice(1));
        setLastDirection(null);
    }, 300);
  };

  const getCardStyle = () => {
    switch (lastDirection) {
        case 'left': return '-translate-x-[150%] rotate-[-20deg]';
        case 'right': return 'translate-x-[150%] rotate-[20deg]';
        case 'up': return '-translate-y-[150%] scale-110';
        case 'down': return 'translate-y-[50%] opacity-0 scale-90';
        default: return '';
    }
  };

  if (!currentProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-brand-dark relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[20%] left-[-10%] w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[-10%] w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center max-w-[280px]">
            {/* Radar Animation */}
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping opacity-75 duration-[3s]" />
                <div className="absolute inset-4 bg-brand-primary/10 rounded-full animate-ping opacity-50 duration-[2s] delay-75" />
                <div className="w-16 h-16 bg-brand-dark rounded-full border border-brand-primary flex items-center justify-center shadow-[0_0_30px_rgba(233,30,99,0.3)] z-10">
                    <Search className="text-brand-primary" size={32} />
                </div>
                <div className="absolute -right-1 -bottom-1 bg-brand-card rounded-full p-1.5 border border-gray-700 shadow-lg z-20">
                    <Globe size={16} className="text-blue-400" />
                </div>
            </div>

            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent mb-4 tracking-tight">
                Explorando...
            </h2>
            
            <p className="text-white font-medium text-base mb-2">
                Você visualizou todos os perfis disponíveis na sua região!
            </p>
            
            <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                Que tal expandir sua busca ou aguardar novos usuários?
            </p>

            <button 
                onClick={() => onNavigate && onNavigate(AppScreen.EDIT_PROFILE)}
                className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full text-white font-bold shadow-lg shadow-brand-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
                <Globe size={20} />
                Buscar em área maior
            </button>
            
            <div className="mt-8 flex items-start gap-2 text-left opacity-60">
                <Lightbulb size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300">
                    <span className="font-bold text-yellow-400">Dica:</span> Novos usuários aparecem a cada dia! Volte mais tarde para ver mais.
                </p>
            </div>
            
            {/* Optional: Reset for Demo */}
            <button 
                onClick={() => setProfiles(MOCK_PROFILES)}
                className="mt-6 text-xs text-gray-600 hover:text-gray-400 underline"
            >
                (Demo: Recarregar Perfis)
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-black overflow-hidden">
        {/* Custom Animations Styles */}
        <style>{`
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
            }
            @keyframes heartbeat {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.4); }
                50% { transform: scale(1.05); box-shadow: 0 0 20px 5px rgba(156, 39, 176, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); }
            }
            @keyframes shake-subtle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-5deg); }
                75% { transform: rotate(5deg); }
            }

            .btn-anim-float { animation: float 3.5s ease-in-out infinite; }
            .btn-anim-float-delayed { animation: float 3.5s ease-in-out 1.75s infinite; }
            .btn-anim-shake { animation: shake-subtle 5s ease-in-out infinite; }
            .btn-anim-heartbeat { animation: heartbeat 2s infinite; }
        `}</style>
        
      {/* Floating Header - Z-Index 50 to be on top of gesture overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 pt-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
            <span className="font-extrabold text-2xl tracking-tighter text-white drop-shadow-md">The Game</span>
        </div>
        
        {/* Active Tag Button */}
        <button 
            onClick={() => setIsTagModalOpen(true)}
            className="pointer-events-auto bg-brand-card/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-primary/30 flex items-center gap-1 hover:bg-brand-card/80 transition-colors active:scale-95"
        >
            <span className="text-[12px] font-bold text-brand-primary tracking-wide">#{myTag.toUpperCase()}</span>
        </button>
      </div>

      {/* Card Stack Container */}
      <div className="absolute inset-0 z-10">
        {/* Next Card (Behind) */}
        {profiles[1] && (
            <div className="absolute inset-0 bg-brand-dark overflow-hidden">
                <img src={profiles[1].images[0]} alt="Next" className="w-full h-full object-cover opacity-100" />
                <div className="absolute inset-0 bg-black/40" />
            </div>
        )}

        {/* Current Card */}
        <div className={`absolute inset-0 bg-brand-dark overflow-hidden transition-all duration-300 ease-out origin-bottom ${getCardStyle()}`}>
            {/* Image */}
            <div className="h-full w-full relative">
                <img src={currentProfile.images[0]} alt={currentProfile.name} className="w-full h-full object-cover" />
                
                {/* Info Container - Animated Bottom Sheet */}
                <div 
                    className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col items-start transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isExpanded 
                        ? 'h-[85%] bg-black/80 backdrop-blur-xl rounded-t-3xl border-t border-white/10' 
                        : 'h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent'
                    }`}
                >
                    {/* Content Scroll Wrapper */}
                    <div className="w-full h-full overflow-y-auto no-scrollbar px-5 pt-8">
                        
                        {/* Header Row (Name + Age + Info Button) */}
                        <div className="w-full flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-extrabold text-white drop-shadow-md">{currentProfile.name}</h2>
                                <span className="text-2xl font-medium text-gray-200 drop-shadow-md">{currentProfile.age}</span>
                            </div>
                            {/* Info Button - Clickable */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 pointer-events-auto z-40 ${
                                    isExpanded 
                                    ? 'bg-brand-primary border-brand-primary text-white rotate-180' 
                                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                }`}
                            >
                                {isExpanded ? <ChevronDown size={20} /> : <Info size={20} />}
                            </button>
                        </div>
                        
                        {/* Basic Info (Distance / Tag) */}
                        <div className="flex items-center gap-2 text-gray-200 mb-4 text-sm font-medium drop-shadow-sm">
                            <MapPin size={16} className="text-brand-primary" />
                            <span>{currentProfile.distance} km • #{currentProfile.tags[0] || 'Geral'}</span>
                        </div>

                        {/* Tags List */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {currentProfile.tags.slice(0, isExpanded ? 10 : 3).map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/10">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Bio */}
                        <p className={`text-gray-200 text-sm leading-relaxed drop-shadow-sm transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3 opacity-90'}`}>
                            {currentProfile.bio}
                        </p>

                        {/* Expanded Only Content */}
                        <div className={`space-y-6 mt-8 transition-all duration-700 delay-100 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 hidden'}`}>
                             
                             <div className="w-full h-px bg-white/10 mb-6" />

                             {/* Detailed Info Grid */}
                             <h3 className="text-white font-bold mb-3">Sobre {currentProfile.name}</h3>
                             <div className="grid grid-cols-2 gap-3">
                                {currentProfile.job && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <Briefcase size={20} className="text-brand-primary shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Profissão</p>
                                            <p className="text-sm text-white truncate">{currentProfile.job}</p>
                                        </div>
                                    </div>
                                )}
                                {currentProfile.sign && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <Moon size={20} className="text-brand-primary shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Signo</p>
                                            <p className="text-sm text-white">{currentProfile.sign}</p>
                                        </div>
                                    </div>
                                )}
                                {currentProfile.height && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <Ruler size={20} className="text-brand-primary shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Altura</p>
                                            <p className="text-sm text-white">{currentProfile.height}</p>
                                        </div>
                                    </div>
                                )}
                                {currentProfile.education && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <GraduationCap size={20} className="text-brand-primary shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Formação</p>
                                            <p className="text-sm text-white truncate">{currentProfile.education}</p>
                                        </div>
                                    </div>
                                )}
                                {currentProfile.drink && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <Wine size={20} className="text-pink-500 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Bebida</p>
                                            <p className="text-sm text-white">{currentProfile.drink}</p>
                                        </div>
                                    </div>
                                )}
                                {currentProfile.smoke && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <Cigarette size={20} className="text-gray-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Fumo</p>
                                            <p className="text-sm text-white">{currentProfile.smoke}</p>
                                        </div>
                                    </div>
                                )}
                                {currentProfile.pets && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <Dog size={20} className="text-orange-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Pets</p>
                                            <p className="text-sm text-white">{currentProfile.pets}</p>
                                        </div>
                                    </div>
                                )}
                                {currentProfile.exercise && (
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <Dumbbell size={20} className="text-green-500 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Exercício</p>
                                            <p className="text-sm text-white">{currentProfile.exercise}</p>
                                        </div>
                                    </div>
                                )}
                             </div>

                             {/* Mock Instagram */}
                             <div className="bg-white/5 rounded-xl p-4 border border-white/5 mt-4">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Instagram size={18} className="text-pink-500" /> Instagram
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                                        <img src={`https://picsum.photos/200/200?random=${currentProfile.id}1`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                                        <img src={`https://picsum.photos/200/200?random=${currentProfile.id}2`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                                        <img src={`https://picsum.photos/200/200?random=${currentProfile.id}3`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                                <div className="mt-3 text-center">
                                    <span className="text-xs font-bold text-gray-400 cursor-pointer hover:text-white">@usuario_insta</span>
                                </div>
                             </div>

                             {/* Mock Spotify */}
                             <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Music size={18} className="text-green-500" /> Minha Vibe
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-800 rounded-md overflow-hidden shrink-0">
                                        <img src="https://picsum.photos/100/100?random=music" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Best Part (feat. H.E.R.)</p>
                                        <p className="text-gray-400 text-xs">Daniel Caesar</p>
                                    </div>
                                </div>
                             </div>

                             <div className="pb-32 text-center">
                                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="text-gray-500 text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                                    Fechar Perfil
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Action Buttons - Z-Index 50 - Always visible on top */}
      <div className="absolute bottom-[100px] left-0 right-0 flex justify-center items-center gap-5 z-50 px-4 pointer-events-none">
        {/* Dislike (Heart Crack) - Gray */}
        <button 
            onClick={() => handleSwipe('left')}
            className="pointer-events-auto w-14 h-14 rounded-full bg-[#1a1a1a]/80 backdrop-blur-lg border border-gray-500/30 text-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.1)] flex items-center justify-center btn-anim-shake hover:bg-gray-600 hover:text-white hover:border-gray-500 hover:scale-110 transition-all duration-300"
        >
            <HeartCrack size={24} strokeWidth={2.5} />
        </button>
        
        {/* Neutral (Hollow Heart) - Red */}
        <button 
            onClick={() => handleSwipe('down')}
            className="pointer-events-auto w-12 h-12 rounded-full bg-[#1a1a1a]/80 backdrop-blur-lg border border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center justify-center btn-anim-float hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-110 transition-all duration-300"
        >
            <Heart size={22} strokeWidth={2.5} />
        </button>

        {/* Like (Filled Heart) - Pink */}
        <button 
            onClick={() => handleSwipe('right')}
            className="pointer-events-auto w-14 h-14 rounded-full bg-[#1a1a1a]/80 backdrop-blur-lg border border-brand-primary/50 text-brand-primary shadow-[0_0_15px_rgba(233,30,99,0.3)] flex items-center justify-center btn-anim-float-delayed hover:bg-brand-primary hover:text-white hover:border-brand-primary hover:scale-110 transition-all duration-300"
        >
            <Heart size={26} fill="currentColor" strokeWidth={0} />
        </button>

        {/* Superlike (Big Heart) - Gradient */}
        <button 
            onClick={() => handleSwipe('up')}
            className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white shadow-[0_0_25px_rgba(156,39,176,0.5)] flex items-center justify-center btn-anim-heartbeat hover:scale-110 hover:shadow-[0_0_35px_rgba(156,39,176,0.7)] transition-all duration-300 border border-white/20"
        >
            <Heart size={34} fill="currentColor" strokeWidth={0} />
        </button>
      </div>

      {/* Tag Selection Modal - Z-Index 60 to be above everything */}
      {isTagModalOpen && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#120516] w-full max-w-xs rounded-3xl border border-white/10 p-6 relative shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <button 
                    onClick={() => setIsTagModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">Escolha sua Vibe</h3>
                    <p className="text-gray-400 text-sm mt-1">Como você está se sentindo hoje?</p>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex flex-wrap gap-2.5 pb-4">
                        {TAGS_LIST.map(tag => (
                            <button
                                key={tag}
                                onClick={() => { setMyTag(tag); setIsTagModalOpen(false); }}
                                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 ${
                                    myTag === tag 
                                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/25' 
                                    : 'bg-transparent border-gray-700 text-gray-400 hover:border-brand-primary hover:text-brand-primary'
                                }`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Gesture Areas Overlay - Z-Index 20 (Below buttons/info) */}
      <div className={`absolute inset-0 z-20 flex flex-col ${isExpanded ? 'pointer-events-none' : ''}`}>
        {!isExpanded && (
            <>
                <div className="h-1/4 w-full" /> 
                <div className="flex-1 flex">
                    <div className="w-1/4 h-full" />
                    <div className="flex-1 h-full" />
                    <div className="w-1/4 h-full" />
                </div>
                <div className="h-1/4 w-full" />
            </>
        )}
      </div>
    </div>
  );
};
