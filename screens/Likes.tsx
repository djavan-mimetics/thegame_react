
import React, { useEffect, useState } from 'react';
import { Filter, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { AppScreen } from '../types';
import { apiFetch } from '../apiClient';

interface LikesProps {
    isPremium: boolean;
    onNavigate?: (screen: AppScreen) => void;
}

export const Likes: React.FC<LikesProps> = ({ isPremium, onNavigate }) => {
    const [likes, setLikes] = useState<{ id: string; image: string | null; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLikes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiFetch('/v1/likes');
            if (!res.ok) {
                setError('Nao foi possivel carregar as curtidas.');
                return;
            }
            const data = (await res.json()) as { likes: { id: string; image: string | null; name: string }[] };
            setLikes(data.likes || []);
        } catch (err) {
            setError('Nao foi possivel carregar as curtidas.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLikes();
    }, []);

    return (
        <div className="h-full flex flex-col bg-brand-dark pt-10 px-4 pb-24 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Curtidas</h1>
                    <p className="text-sm text-gray-500">
                        {isLoading ? 'Carregando...' : `${likes.length} pessoas curtiram voce`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-brand-card rounded-full text-gray-400">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 flex flex-col gap-3">
                    <span>{error}</span>
                    <button
                        onClick={loadLikes}
                        className="self-start rounded-full border border-red-400/40 px-4 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/10"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {!isLoading && !error && likes.length === 0 && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-400 flex flex-col items-center gap-3">
                    <span>Nenhuma curtida por aqui ainda.</span>
                    <button
                        onClick={loadLikes}
                        className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                    {likes.map((like) => (
                    <div key={like.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-brand-card group">
                         <img 
                            src={like.image || 'https://picsum.photos/200/300?random=200'} 
                            alt="Like" 
                            className={`w-full h-full object-cover transition-all duration-300 ${!isPremium ? 'blur-xl opacity-60 scale-110' : ''}`} 
                        />
                        
                        {!isPremium && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-10 p-2">
                                <div className="w-10 h-10 rounded-full bg-brand-primary/80 flex items-center justify-center mb-2 backdrop-blur-md shadow-lg shadow-brand-primary/30">
                                    <Lock size={18} className="text-white" />
                                </div>
                            </div>
                        )}

                        {isPremium && (
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                <span className="text-white font-bold">{like.name}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Upsell Sticky Button - Only show if not premium */}
            {!isPremium && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
                    <Button 
                        fullWidth 
                        className="shadow-[0_20px_45px_rgba(233,30,99,0.35)]"
                        onClick={() => onNavigate && onNavigate(AppScreen.PREMIUM)}
                    >
                        Veja quem curtiu você
                    </Button>
                </div>
            )}
        </div>
    );
};
