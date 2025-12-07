
import React from 'react';
import { Filter, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { AppScreen } from '../types';

interface LikesProps {
    isPremium: boolean;
    onNavigate?: (screen: AppScreen) => void;
}

export const Likes: React.FC<LikesProps> = ({ isPremium, onNavigate }) => {
    // Generate mock likes
    const likes = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        image: `https://picsum.photos/200/300?random=${200 + i}`,
        isBlurred: !isPremium, // Blur all if not premium
        name: isPremium ? ['Sarah', 'Emily', 'Ana', 'Julia'][i % 4] : 'Desconhecido'
    }));

    return (
        <div className="h-full flex flex-col bg-brand-dark pt-10 px-4 pb-24 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Curtidas</h1>
                    <p className="text-sm text-gray-500">{likes.length} pessoas curtiram você</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-brand-card rounded-full text-gray-400">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {likes.map((like) => (
                    <div key={like.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-brand-card group">
                         <img 
                            src={like.image} 
                            alt="Like" 
                            className={`w-full h-full object-cover transition-all duration-300 ${like.isBlurred ? 'blur-xl opacity-60 scale-110' : ''}`} 
                        />
                        
                        {like.isBlurred && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-10 p-2">
                                <div className="w-10 h-10 rounded-full bg-brand-primary/80 flex items-center justify-center mb-2 backdrop-blur-md shadow-lg shadow-brand-primary/30">
                                    <Lock size={18} className="text-white" />
                                </div>
                            </div>
                        )}

                        {!like.isBlurred && (
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                <span className="text-white font-bold">{like.name}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Upsell Sticky Button - Only show if not premium */}
            {!isPremium && (
                <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto">
                    <Button 
                        fullWidth 
                        className="shadow-2xl shadow-brand-primary/50"
                        onClick={() => onNavigate && onNavigate(AppScreen.PREMIUM)}
                    >
                        Veja quem curtiu você
                    </Button>
                </div>
            )}
        </div>
    );
};
