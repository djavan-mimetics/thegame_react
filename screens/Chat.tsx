
import React, { useState } from 'react';
import { MOCK_CHATS, MOCK_MESSAGES, MOCK_PROFILES } from '../constants';
import { ChatPreview, AppScreen } from '../types';
import { Search, ChevronLeft, Send, Shield, X, ChevronRight } from 'lucide-react';

interface ChatProps {
    onNavigate: (screen: AppScreen) => void;
    setReportContext?: (name: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ onNavigate, setReportContext }) => {
    const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Helper to get full profile images for the gallery
    const getChatProfileImages = () => {
        if (!selectedChat) return [];
        const profile = MOCK_PROFILES.find(p => p.id === selectedChat.userId);
        return profile ? profile.images : [selectedChat.image];
    };

    const chatImages = getChatProfileImages();

    // Chat Detail View
    if (selectedChat) {
        return (
            <div className="h-full flex flex-col bg-brand-dark">
                {/* Chat Header */}
                <div className="px-4 pt-10 pb-4 bg-brand-card/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedChat(null)} className="p-2 -ml-2 text-gray-400 hover:text-white">
                            <ChevronLeft size={24} />
                        </button>
                        
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => {
                                setCurrentImageIndex(0);
                                setIsGalleryOpen(true);
                            }}
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/50 group-hover:border-brand-primary transition-colors">
                                <img src={selectedChat.image} alt={selectedChat.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white leading-tight group-hover:text-brand-primary transition-colors">{selectedChat.name}</span>
                                <span className="text-[10px] text-green-500 font-medium">Online agora</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if (setReportContext) setReportContext(selectedChat.name);
                            onNavigate(AppScreen.REPORT);
                        }}
                        className="p-2 -mr-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Denunciar Usuário"
                    >
                        <Shield size={24} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full">Hoje</span>
                    </div>
                    {MOCK_MESSAGES.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                                msg.isMe 
                                    ? 'bg-brand-primary text-white rounded-tr-none' 
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-gray-600 self-end ml-1 mb-1">{msg.timestamp}</span>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-brand-dark border-t border-white/5 pb-8">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-white/10">
                        <input 
                            type="text" 
                            placeholder="Digite uma mensagem..." 
                            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none py-2"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <button className="p-2 bg-brand-primary rounded-full text-white disabled:opacity-50" disabled={!messageText}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                {/* Profile Photo Gallery Modal */}
                {isGalleryOpen && (
                    <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
                        <button 
                            onClick={() => setIsGalleryOpen(false)}
                            className="absolute top-10 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/80"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="flex-1 relative flex items-center justify-center bg-black">
                            <img 
                                src={chatImages[currentImageIndex]} 
                                alt={`Foto ${currentImageIndex + 1}`} 
                                className="w-full h-full object-contain"
                            />
                            
                            {/* Navigation Arrows */}
                            {chatImages.length > 1 && (
                                <>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex((prev) => (prev - 1 + chatImages.length) % chatImages.length);
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                                    >
                                        <ChevronLeft size={40} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex((prev) => (prev + 1) % chatImages.length);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                                    >
                                        <ChevronRight size={40} />
                                    </button>
                                </>
                            )}

                            {/* Indicators */}
                            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
                                {chatImages.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/30'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Chat List View
    return (
        <div className="h-full flex flex-col bg-brand-dark pt-10 px-4 pb-24 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Mensagens</h1>
                <Search className="text-gray-500" size={24} />
            </div>

            {/* New Matches Carousel */}
            <div className="mb-8">
                <h2 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">Novos Matches</h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex flex-col items-center min-w-[72px]">
                        <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-dashed border-brand-primary flex items-center justify-center mb-2">
                             <div className="w-full h-full rounded-full bg-brand-primary/10 flex items-center justify-center">
                                <span className="text-brand-primary text-2xl font-light">+</span>
                             </div>
                        </div>
                        <span className="text-xs text-gray-400">Curtidas</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                         <div key={i} className="flex flex-col items-center min-w-[72px]">
                            <div className="w-16 h-16 rounded-full border-2 border-brand-primary p-0.5 mb-2 relative">
                                <img src={`https://picsum.photos/100/100?random=${10+i}`} className="w-full h-full rounded-full object-cover" alt="Match" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-black" />
                            </div>
                            <span className="text-xs text-gray-300">Nome</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message List */}
            <div>
                 <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Conversas</h2>
                 <div className="space-y-6">
                    {MOCK_CHATS.map((chat) => (
                        <div key={chat.id} onClick={() => setSelectedChat(chat)} className="flex items-center gap-4 active:bg-white/5 p-2 rounded-xl -mx-2 transition-colors cursor-pointer">
                            <div className="w-14 h-14 rounded-full relative">
                                <img src={chat.image} alt={chat.name} className="w-full h-full rounded-full object-cover" />
                                {chat.unread > 0 && (
                                    <div className="absolute top-0 right-0 bg-brand-primary text-[10px] font-bold text-white w-5 h-5 rounded-full flex items-center justify-center border border-black">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 border-b border-gray-800 pb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-white text-base">{chat.name}</h3>
                                    <span className={`text-xs ${chat.unread > 0 ? 'text-brand-primary font-bold' : 'text-gray-600'}`}>{chat.timestamp}</span>
                                </div>
                                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                                    {chat.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};
