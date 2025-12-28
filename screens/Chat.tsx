
import React, { useEffect, useState } from 'react';
import { MOCK_CHATS, MOCK_MESSAGES, MOCK_PROFILES } from '../constants';
import { ChatPreview, AppScreen, Message } from '../types';
import { Search, ChevronLeft, Send, Shield, X, ChevronRight, Heart } from 'lucide-react';
import { Modal } from '../components/Modal';
import appIcon from '../src/img/icon1024.png';

const MY_INTEREST_TAGS = ['Jogar videogame', 'Praia e água de côco', 'Tomar um café', 'Netflix', 'Vinho à dois'];
const gradientBubbleClass = 'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg border border-white/10';

const createIcebreaker = (name: string, tags: string[]) => {
    const shared = tags.find(tag => MY_INTEREST_TAGS.includes(tag));
    if (shared) {
        return `Ei ${name}! Também amo ${shared.toLowerCase()} e achei que seria o gancho perfeito pra quebrar o gelo. Qual seu rolê favorito com isso?`;
    }
    const highlight = tags[0]?.toLowerCase() || 'novas aventuras';
    return `Oi ${name}! Sua vibe em ${highlight} chamou minha atenção demais. Conta qual foi sua melhor história com isso?`;
};

const createCompliments = (name: string, tags: string[]) => {
    const focus = tags[0]?.toLowerCase() || 'essa vibe toda';
    const safeName = name || 'Você';
    return [
        `${safeName}, seu brilho falando de ${focus} é contagiante demais!`,
        `Curti como ${focus} combina com sua energia — fica tudo muito natural.`,
        `É impossível não notar o quanto você vive ${focus} com autenticidade.`,
        `${safeName}, dá pra ver que ${focus} rende histórias incríveis contigo.`
    ];
};

const getTimestamp = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

interface ChatProps {
    onNavigate: (screen: AppScreen) => void;
    setReportContext?: (name: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ onNavigate, setReportContext }) => {
    const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isComplimentModalOpen, setIsComplimentModalOpen] = useState(false);

    const activeProfile = selectedChat ? MOCK_PROFILES.find(p => p.id === selectedChat.userId) : null;
    const complimentOptions = selectedChat ? createCompliments(selectedChat.name, activeProfile?.tags || []) : [];

    // Helper to get full profile images for the gallery
    const getChatProfileImages = () => {
        if (activeProfile) return activeProfile.images;
        if (selectedChat) return [selectedChat.image];
        return [];
    };

    const openGallery = (images: string[]) => {
        if (!images || images.length === 0) return;
        setGalleryImages(images);
        setCurrentImageIndex(0);
        setIsGalleryOpen(true);
    };

    useEffect(() => {
        if (!selectedChat) {
            setMessages([]);
            return;
        }

        const profile = MOCK_PROFILES.find(p => p.id === selectedChat.userId);
        const tags = profile?.tags || [];
        const icebreaker: Message = {
            id: `icebreaker-${selectedChat.id}`,
            senderId: selectedChat.userId,
            text: createIcebreaker(selectedChat.name, tags),
            timestamp: getTimestamp(),
            isMe: false,
            variant: 'icebreaker'
        };

        const history = MOCK_MESSAGES.slice(1);
        setMessages([icebreaker, ...history]);
        setIsComplimentModalOpen(false);
        setIsGalleryOpen(false);
    }, [selectedChat]);

    const appendMessage = (text: string, variant?: Message['variant'], fromApp = false) => {
        if (!selectedChat) return;
        const trimmed = text.trim();
        if (!trimmed) return;

        const newMessage: Message = {
            id: `local-${Date.now()}`,
            senderId: fromApp ? 'app' : 'me',
            text: trimmed,
            timestamp: getTimestamp(),
            isMe: !fromApp,
            variant
        };

        setMessages(prev => [...prev, newMessage]);
    };

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        appendMessage(messageText);
        setMessageText('');
    };

    const handleSendCompliment = (text: string) => {
        appendMessage(text, 'compliment', true);
        setIsComplimentModalOpen(false);
    };

    const handleOpenChat = (chat: ChatPreview) => {
        setSelectedChat(chat);
        setMessageText('');
    };

    const handleBackToList = () => {
        setSelectedChat(null);
        setMessageText('');
        setIsGalleryOpen(false);
        setIsComplimentModalOpen(false);
    };

    const resolveBubbleClasses = (msg: Message) => {
        if (msg.variant) {
            return `${gradientBubbleClass} ${msg.isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`;
        }
        return msg.isMe 
            ? 'bg-brand-primary text-white rounded-tr-none'
            : 'bg-gray-800 text-gray-200 rounded-tl-none';
    };

    // Chat Detail View
    if (selectedChat) {
        return (
            <div className="min-h-screen min-h-[100dvh] flex flex-col bg-brand-dark">
                {/* Chat Header */}
                <div className="px-4 pt-10 pb-4 bg-brand-card/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBackToList} className="p-2 -ml-2 text-gray-400 hover:text-white">
                            <ChevronLeft size={24} />
                        </button>
                        
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => openGallery(getChatProfileImages())}
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

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsComplimentModalOpen(true)}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-primary border border-brand-primary/40 rounded-full hover:bg-brand-primary/10 transition-colors flex items-center gap-1"
                        >
                            <Heart size={16} />
                            Elogio
                        </button>

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
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32">
                    <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full">Hoje</span>
                    </div>
                    {messages.map((msg) => {
                        const bubbleClass = resolveBubbleClasses(msg);
                        const isAppMessage = msg.variant === 'icebreaker' || msg.variant === 'compliment' || msg.senderId === 'app';
                        const isMine = msg.isMe && !isAppMessage;
                        const alignClass = isAppMessage ? 'justify-start' : isMine ? 'justify-end' : 'justify-start';

                        return (
                            <div key={msg.id} className={`flex w-full ${alignClass} items-end gap-2`}>
                                {isAppMessage && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-black/60 flex-shrink-0">
                                        <img src={appIcon} alt="The Game" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${bubbleClass}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-600 self-end mb-1">{msg.timestamp}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="fixed left-0 right-0 p-4 bg-brand-dark/95 backdrop-blur border-t border-white/5 z-30 bottom-24">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.45)]">
                        <input 
                            type="text" 
                            placeholder="Digite uma mensagem..." 
                            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none py-2"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button 
                            type="button"
                            className="p-2 bg-brand-primary rounded-full text-white disabled:opacity-50"
                            disabled={!messageText.trim()}
                            onClick={handleSendMessage}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                {/* Profile Photo Gallery Modal */}
                <Modal
                    open={isGalleryOpen && galleryImages.length > 0}
                    overlayClassName="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200"
                >
                    <button 
                        onClick={() => setIsGalleryOpen(false)}
                        className="absolute top-10 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/80"
                    >
                        <X size={24} />
                    </button>
                    
                    <div className="flex-1 relative flex items-center justify-center bg-black">
                        <img 
                            src={galleryImages[currentImageIndex]} 
                            alt={`Foto ${currentImageIndex + 1}`} 
                            className="w-full h-full object-contain"
                        />
                        
                        {/* Navigation Arrows */}
                        {galleryImages.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                                >
                                    <ChevronLeft size={40} />
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                                >
                                    <ChevronRight size={40} />
                                </button>
                            </>
                        )}

                        {/* Indicators */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
                            {galleryImages.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/30'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={isComplimentModalOpen && !!selectedChat}
                    overlayClassName="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200"
                >
                    <div className="bg-[#150515] w-full max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase text-gray-500 tracking-[0.3em]">Elogio rápido</p>
                                <h3 className="text-white text-xl font-bold">Mande um carinho</h3>
                            </div>
                            <button onClick={() => setIsComplimentModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 no-scrollbar">
                            {complimentOptions.map((compliment, idx) => (
                                <button 
                                    key={`${compliment}-${idx}`}
                                    onClick={() => handleSendCompliment(compliment)}
                                    className={`${gradientBubbleClass} rounded-2xl w-full text-left px-4 py-3 text-sm font-semibold hover:brightness-110 transition-all`}
                                >
                                    {compliment}
                                </button>
                            ))}
                        </div>

                        <p className="text-[11px] text-gray-500 text-center">
                            Escolha um elogio para iniciar com boa energia. Ele aparecerá na conversa com o mesmo destaque que o icebreaker.
                        </p>
                    </div>
                </Modal>
            </div>
        );
    }

    // Chat List View
    const recentMatches = MOCK_PROFILES.slice(0, 6);

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col bg-brand-dark pt-10 px-4 pb-24 overflow-y-auto no-scrollbar">
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
                    {recentMatches.map((match) => (
                         <button 
                            key={match.id} 
                            className="flex flex-col items-center min-w-[72px] cursor-pointer"
                            onClick={() => openGallery(match.images)}
                         >
                            <div className="w-16 h-16 rounded-full border-2 border-brand-primary p-0.5 mb-2 relative">
                                <img src={match.images[0]} className="w-full h-full rounded-full object-cover" alt={match.name} />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-black" />
                            </div>
                            <span className="text-xs text-gray-300">{match.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Message List */}
            <div>
                 <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Conversas</h2>
                 <div className="space-y-6">
                    {MOCK_CHATS.map((chat) => (
                        <div key={chat.id} onClick={() => handleOpenChat(chat)} className="flex items-center gap-4 active:bg-white/5 p-2 rounded-xl -mx-2 transition-colors cursor-pointer">
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
