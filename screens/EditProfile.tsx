
import React, { useEffect, useRef, useState } from 'react';
import { AppScreen, MyProfile } from '../types';
import { TAGS_LIST, LOCATIONS } from '../constants';
import { ChevronLeft, Plus, ChevronRight, Moon, GraduationCap, Users, User, Ruler, HeartHandshake, Smile, Heart, Dog, Wine, Cigarette, Dumbbell, Pizza, X, Check, Sun, Trash2, Camera, Image as ImageIcon, RotateCcw, Facebook, Mail, Trophy, Calendar, MapPin, ChevronDown, Bell, Settings as SettingsIcon, Zap } from 'lucide-react';
import { Modal } from '../components/Modal';

interface EditProfileProps {
  onNavigate: (screen: AppScreen) => void;
  myProfile: MyProfile;
  updateProfile: (key: keyof MyProfile, value: any) => void;
  completion: number;
}

// --- Configuration Options (Translations) ---
const LABEL_MAP: Record<string, string> = {
    relationship: 'Relacionamento',
    sign: 'Signo',
    education: 'Formação',
    family: 'Família',
    pets: 'Pets',
    drink: 'Bebida',
    smoke: 'Fumo',
    exercise: 'Exercícios',
    food: 'Alimentação',
    sleep: 'Sono',
    personality: 'Personalidade',
    height: 'Altura',
    interests: 'Tag Atual',
    classification: 'Como você se classifica?',
    billSplit: 'No date você paga ou racha a conta?',
    availableToday: 'Está disponível para um date hoje?',
    gender: 'Você é',
    lookingFor: 'Você procura por'
};

const OPTIONS: Record<string, string[]> = {
    relationship: ['Casamento', 'Namoro', 'Amizade colorida', 'Peguete', 'Um pente e rala', 'Trisal', 'Suruba', 'Nem eu sei o que quero'],
  sign: ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'],
  education: ['Ensino Médio', 'Cursando Graduação', 'Superior completo', 'Pós-graduação', 'Mestrado', 'Doutorado'],
  family: ['Quero filhos', 'Não quero filhos', 'Tenho filhos', 'Talvez um dia'],
  pets: ['Cachorro', 'Gato', 'Répteis', 'Pássaros', 'Não tenho', 'Amo todos'],
  drink: ['Socialmente', 'Nunca', 'Frequentemente', 'Aos fins de semana'],
  smoke: ['Não fumo', 'Fumo socialmente', 'Fumo regularmente', 'Fumo quando bebo'],
  exercise: ['Todo dia', 'Frequentemente', 'Às vezes', 'Nunca'],
  food: ['Vegano', 'Vegetariano', 'Onívoro', 'Carnívoro', 'Halal', 'Kosher'],
  sleep: ['Madrugador', 'Coruja noturna', 'Dorme cedo', 'Insônia criativa'],
  personality: ['Aventureiro', 'Criativo', 'Extrovertido', 'Introvertido', 'Romântico', 'Engraçado', 'Ambicioso', 'Zen', 'Festeiro', 'Intelectual', 'Caseiro', 'Esportista', 'Líder', 'Empático'],
    gender: ['Homem Hétero', 'Homem Bi', 'Homem Gay', 'Homem Trans', 'Mulher Hétero', 'Mulher Bi', 'Mulher Lésbica', 'Mulher Trans', 'Outro'],
    lookingFor: ['Homem Hétero', 'Homem Bi', 'Homem Gay', 'Homem Trans', 'Mulher Hétero', 'Mulher Bi', 'Mulher Lésbica', 'Mulher Trans', 'Outro']
};

const CLASSIFICATION_OPTIONS_MASC = [
    'Pobre Premium',
    'Dublê de Rico',
    'Velho da Lancha',
    'Jovem da Lancha',
    'Zilionário',
    'Sou chato, não quero me classificar'
];

const CLASSIFICATION_OPTIONS_FEM = [
    'Pobre Premium',
    'Dublê de rica',
    'Rica',
    'Zilionária',
    'Sou chata, não quero me classificar'
];

const getGenderGroup = (gender: string): 'masc' | 'fem' | 'other' => {
    const g = (gender || '').toLowerCase();
    if (g.startsWith('mulher')) return 'fem';
    if (g.startsWith('homem')) return 'masc';
    return 'other';
};

const getClassificationOptions = (gender: string) => {
    const group = getGenderGroup(gender);
    if (group === 'fem') return CLASSIFICATION_OPTIONS_FEM;
    if (group === 'masc') return CLASSIFICATION_OPTIONS_MASC;
    return [...CLASSIFICATION_OPTIONS_MASC, ...CLASSIFICATION_OPTIONS_FEM];
};

const getBillSplitOptions = (gender: string) => {
    const group = getGenderGroup(gender);
    const base = ['Pago a conta', 'Racho a conta'];
    if (group === 'fem') return [...base, 'Sou uma princesa, meu date paga a conta'];
    if (group === 'masc') return [...base, 'Sou um princeso, meu date paga a conta'];
    return [...base, 'Sou uma princesa, meu date paga a conta', 'Sou um princeso, meu date paga a conta'];
};

const MODAL_OVERLAY = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center px-4 py-6 animate-in fade-in duration-200';
const MODAL_CONTAINER = 'bg-[#1e1e1e] w-full max-w-md rounded-3xl border border-white/10 p-6 relative shadow-2xl max-h-[90vh] flex flex-col';

export const EditProfile: React.FC<EditProfileProps> = ({ onNavigate, myProfile, updateProfile, completion }) => {
  // --- State ---
  const [smartPhotos, setSmartPhotos] = useState(false);
  
  // Local state for UI toggles
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 25]);
  const [distance, setDistance] = useState<number>(10);
  const [expandDistance, setExpandDistance] = useState(true);
  const [expandAge, setExpandAge] = useState(false);

  // Photo Editing State
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Data (Using lifted state for critical fields, local for detailed)
  const [profileData, setProfileData] = useState({
        relationship: "Namoro",
    sign: "Câncer",
    education: "Superior completo",
    family: "Não quero filhos",
    personality: "",
    pets: "Não tenho pets",
    drink: "Socialmente",
    smoke: "Fumo quando bebo",
    exercise: "Às vezes",
    food: "",
    sleep: ""
  });

  // UI State
    type ActiveModal = keyof typeof profileData | 'interests' | 'gender' | 'lookingFor' | 'height' | 'classification' | 'billSplit' | 'availableToday' | null;
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [tempInputValue, setTempInputValue] = useState("");
    const currentTag = myProfile.currentTag || '';

    // Location (custom modals to avoid native <select> sheets)
    const [isStateModalOpen, setIsStateModalOpen] = useState(false);
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // Derived state for cities based on selected state
  const availableCities = myProfile.state ? LOCATIONS[myProfile.state as keyof typeof LOCATIONS] || [] : [];

  // --- Handlers ---
  const handleUpdate = (key: string, value: string) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
    setActiveModal(null);
  };

  const toggleLookingFor = (option: string) => {
    let current = [...myProfile.lookingFor];
    if (current.includes(option)) {
        if (current.length > 1 || !current.includes(option)) {
             current = current.filter(o => o !== option);
        }
    } else {
        current.push(option);
    }
    updateProfile('lookingFor', current);
  };

  // Slider Handlers
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const val = parseInt(e.target.value);
    const newRange = [...ageRange] as [number, number];
    newRange[index] = val;
    if (index === 0 && val < newRange[1]) setAgeRange(newRange);
    if (index === 1 && val > newRange[0]) setAgeRange(newRange);
  };

  // --- Photo Handlers ---
  const handlePhotoSlotClick = (index: number) => {
    setActivePhotoIndex(index);
    setIsSourceModalOpen(true);
  };

  const handleDeletePhoto = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newPhotos = myProfile.images.filter((_, i) => i !== index);
    updateProfile('images', newPhotos);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempImageSrc(event.target.result as string);
          setIsSourceModalOpen(false);
          setIsEditorOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedImage = (croppedImageBase64: string) => {
    if (activePhotoIndex !== null) {
      const newPhotos = [...myProfile.images];
      if (activePhotoIndex >= newPhotos.length) {
        newPhotos.push(croppedImageBase64);
      } else {
        newPhotos[activePhotoIndex] = croppedImageBase64;
      }
      updateProfile('images', newPhotos);
      setIsEditorOpen(false);
      setTempImageSrc(null);
      setActivePhotoIndex(null);
    }
  };

  const triggerFileInput = (mode: 'camera' | 'gallery') => {
    if (fileInputRef.current) {
        if (mode === 'camera') {
            fileInputRef.current.setAttribute('capture', 'environment');
        } else {
            fileInputRef.current.removeAttribute('capture');
        }
        fileInputRef.current.click();
    }
  };

  // Google Icon Component (SVG)
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  // Render Modal Content
  const renderModalContent = () => {
    if (activeModal === 'interests') {
        return (
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {TAGS_LIST.map(tag => {
                        const isSelected = currentTag === tag;
                        return (
                            <button key={tag} onClick={() => { updateProfile('currentTag', tag); setActiveModal(null); }} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'bg-transparent border-gray-600 text-gray-300'}`}>{tag}</button>
                        );
                    })}
                </div>
                <p className="text-gray-500 text-xs text-center">Selecione 1 tag.</p>
            </div>
        );
    }
    if (activeModal === 'height') {
        return (
            <div className="space-y-4">
                <input type="number" placeholder="Ex: 175 (cm)" className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-600 focus:border-brand-primary outline-none" autoFocus onChange={(e) => setTempInputValue(e.target.value)} />
                <button onClick={() => { updateProfile('height', tempInputValue ? `${tempInputValue} cm` : ''); setActiveModal(null); setTempInputValue(""); }} className="w-full bg-brand-primary py-3 rounded-full font-bold text-white">Salvar</button>
            </div>
        );
    }
    if (activeModal === 'classification') {
        const options = getClassificationOptions(myProfile.gender);
        return (
            <div className="space-y-1">
                {options.map(option => (
                    <button key={option} onClick={() => { updateProfile('classification', option); setActiveModal(null); }} className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${myProfile.classification === option ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50' : 'text-gray-300 hover:bg-white/5'}`}>{option}{myProfile.classification === option && <Check size={18} />}</button>
                ))}
            </div>
        );
    }
    if (activeModal === 'billSplit') {
        const options = getBillSplitOptions(myProfile.gender);
        return (
            <div className="space-y-1">
                {options.map(option => (
                    <button key={option} onClick={() => { updateProfile('billSplit', option); setActiveModal(null); }} className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${myProfile.billSplit === option ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50' : 'text-gray-300 hover:bg-white/5'}`}>{option}{myProfile.billSplit === option && <Check size={18} />}</button>
                ))}
            </div>
        );
    }
    if (activeModal === 'availableToday') {
        const options = ['Quero sair hoje', 'Outro dia eu saio'];
        const selected = myProfile.availableToday === true ? options[0] : myProfile.availableToday === false ? options[1] : '';
        return (
            <div className="space-y-1">
                {options.map(option => (
                    <button key={option} onClick={() => { updateProfile('availableToday', option === 'Quero sair hoje'); setActiveModal(null); }} className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${selected === option ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50' : 'text-gray-300 hover:bg-white/5'}`}>{option}{selected === option && <Check size={18} />}</button>
                ))}
            </div>
        );
    }
    if (activeModal === 'gender') {
        return (
             <div className="space-y-1">
                {OPTIONS.gender.map(option => (
                    <button key={option} onClick={() => { updateProfile('gender', option); setActiveModal(null); }} className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${myProfile.gender === option ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50' : 'text-gray-300 hover:bg-white/5'}`}>{option}{myProfile.gender === option && <Check size={18} />}</button>
                ))}
            </div>
        );
    }
    if (activeModal === 'lookingFor') {
         return (
             <div className="space-y-1">
                {OPTIONS.lookingFor.map(option => {
                    const isSelected = myProfile.lookingFor.includes(option);
                    return (
                        <button key={option} onClick={() => toggleLookingFor(option)} className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${isSelected ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50' : 'text-gray-300 hover:bg-white/5'}`}>{option}{isSelected && <Check size={18} />}</button>
                    )
                })}
            </div>
        );
    }
    const options = OPTIONS[activeModal as string] || [];
    return (
        <div className="space-y-1">
            {options.map(option => (
                <button key={option} onClick={() => handleUpdate(activeModal as string, option)} className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${profileData[activeModal as keyof typeof profileData] === option ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50' : 'text-gray-300 hover:bg-white/5'}`}>{option}{profileData[activeModal as keyof typeof profileData] === option && <Check size={18} />}</button>
            ))}
        </div>
    );
  };

    return (
        <div className="h-full flex flex-col bg-brand-dark relative overflow-hidden">
      
            {/* Hidden File Input */}
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={onFileSelect} />

            {/* Persistent Header */}
            <div className="flex items-center justify-between p-4 bg-brand-dark/95 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20 z-30">
                <button onClick={() => onNavigate(AppScreen.HOME)} className="text-gray-400 p-2 hover:text-white"><ChevronLeft /></button>
                <div className="text-center">
                        <h1 className="font-bold text-white text-lg">Perfil</h1>
                        <p className="text-[10px] text-brand-primary font-bold">{completion}% Concluído</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate(AppScreen.NOTIFICATIONS)}
                        className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                        aria-label="Abrir notificações"
                    >
                        <Bell size={18} />
                    </button>
                    <button
                        onClick={() => onNavigate(AppScreen.SECURITY)}
                        className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                        aria-label="Abrir central de segurança"
                    >
                        <SettingsIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">

                    <div className="p-4 space-y-8">

            {/* Estatísticas + Premium */}
            <div className="space-y-6">
                <div className="flex items-center divide-x divide-gray-700 w-full bg-brand-card rounded-xl p-4 border border-white/5">
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

                <div className="bg-gradient-to-r from-brand-secondary to-brand-accent p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-brand-primary/20">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                             <Zap className="text-yellow-300 fill-yellow-300" size={20} />
                             <h3 className="text-white font-extrabold text-lg italic tracking-wider">PREMIUM</h3>
                        </div>
                        <p className="text-white/90 text-sm mb-4 max-w-[70%]">
                            Veja quem curtiu você, swipes ilimitados e mais.
                        </p>
                        <button
                            onClick={() => onNavigate(AppScreen.PREMIUM)}
                            className="bg-white text-brand-accent font-bold py-2 px-6 rounded-full text-sm hover:bg-gray-100 transition-colors"
                        >
                            Assinar Agora
                        </button>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6">

                 {/* Age Range Slider */}
                 <div className="bg-brand-card rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold">Faixa Etária</h3>
                        <span className="text-brand-primary font-bold">{ageRange[0]} - {ageRange[1]} anos</span>
                    </div>
                    <div className="relative h-6 flex items-center select-none mb-4">
                        <div className="absolute w-full h-1 bg-gray-700 rounded-full"></div>
                        <div className="absolute h-1 bg-brand-primary rounded-full" style={{ left: `${((ageRange[0] - 18) / (100 - 18)) * 100}%`, right: `${100 - ((ageRange[1] - 18) / (100 - 18)) * 100}%` }}></div>
                        <input type="range" min="18" max="100" value={ageRange[0]} onChange={(e) => handleAgeChange(e, 0)} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                        <input type="range" min="18" max="100" value={ageRange[1]} onChange={(e) => handleAgeChange(e, 1)} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                        {/* Visual thumbs */}
                        <div className="absolute w-5 h-5 bg-brand-primary rounded-full shadow border-2 border-brand-dark pointer-events-none z-20" style={{ left: `calc(${((ageRange[0] - 18) / (100 - 18)) * 100}% - 10px)` }}></div>
                        <div className="absolute w-5 h-5 bg-brand-primary rounded-full shadow border-2 border-brand-dark pointer-events-none z-20" style={{ left: `calc(${((ageRange[1] - 18) / (100 - 18)) * 100}% - 10px)` }}></div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-gray-300 text-sm max-w-[200px]">Mostrar pessoas um pouco fora da minha faixa de preferência se eu ficar sem perfis pra ver</span>
                        <Toggle checked={expandAge} onChange={() => setExpandAge(!expandAge)} />
                    </div>
                 </div>

                 {/* Distance Slider */}
                 <div className="bg-brand-card rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold">Distância máxima</h3>
                        <span className="text-brand-primary font-bold">{distance} km</span>
                    </div>
                    <div className="relative h-6 flex items-center select-none mb-4">
                         <div className="absolute w-full h-1 bg-gray-700 rounded-full"></div>
                         <div className="absolute h-1 bg-brand-primary rounded-full" style={{ width: `${((distance - 10) / (500 - 10)) * 100}%` }}></div>
                         <div className="absolute w-5 h-5 bg-brand-primary rounded-full shadow border-2 border-brand-dark pointer-events-none z-20" style={{ left: `calc(${((distance - 10) / (500 - 10)) * 100}% - 10px)` }}></div>
                         <input type="range" min="10" max="500" value={distance} onChange={(e) => setDistance(parseInt(e.target.value))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-gray-300 text-sm max-w-[200px]">Mostrar pessoas mais longe de mim se eu ficar sem perfis pra ver</span>
                        <Toggle checked={expandDistance} onChange={() => setExpandDistance(!expandDistance)} />
                    </div>
                 </div>
            </div>

            <div className="w-full h-px bg-white/10 my-6"></div>

            {/* Photos Grid */}
            <h3 className="text-white font-bold text-center mb-4">Fotos do Perfil</h3>
            <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                    const hasPhoto = index < myProfile.images.length;
                    const photoUrl = hasPhoto ? myProfile.images[index] : null;

                    return (
                        <div key={index} onClick={() => handlePhotoSlotClick(index)} className={`aspect-[9/16] rounded-lg bg-gray-800 relative border border-dashed border-gray-600 ${index === 0 ? 'border-brand-primary' : ''} group cursor-pointer overflow-hidden flex items-center justify-center hover:bg-gray-700 transition-colors`}>
                            {hasPhoto ? (
                                <>
                                    <img src={photoUrl!} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-1 right-1 z-10"><button onClick={(e) => handleDeletePhoto(e, index)} className="p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"><Trash2 size={14} /></button></div>
                                    {index === 0 && <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-primary text-[10px] font-bold text-white rounded-full shadow-md z-10">Principal</div>}
                                </>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shadow-lg"><Plus size={20} className="text-white" /></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Smart Photos */}
            <div className="flex items-center justify-between py-2 px-2">
                <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">Fotos Inteligentes</span>
                    <span className="text-gray-500 text-xs">Testa continuamente suas fotos para encontrar a melhor.</span>
                </div>
                <button onClick={() => setSmartPhotos(!smartPhotos)} className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${smartPhotos ? 'bg-brand-primary' : 'bg-gray-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${smartPhotos ? 'left-6' : 'left-1'}`} /></button>
            </div>

            <div className="w-full h-px bg-white/10 my-4"></div>
            
            {/* --- BASIC INFO: Name, DOB, City, State, Login, Ranking --- */}
            <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-white font-bold text-sm ml-1">Nome</label>
                    <input type="text" value={myProfile.name} onChange={(e) => updateProfile('name', e.target.value)} className="w-full bg-brand-card rounded-xl border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-colors" />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <label className="text-white font-bold text-sm ml-1">Data de Nascimento</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="text" value={myProfile.birthDate} onChange={(e) => updateProfile('birthDate', e.target.value)} placeholder="DD/MM/AAAA" className="w-full bg-brand-card rounded-xl border border-white/10 p-3 pl-10 text-white text-sm focus:outline-none focus:border-brand-primary transition-colors" />
                    </div>
                </div>

                {/* Location (State & City) - Swapped Order */}
                <div className="flex gap-3">
                    {/* State */}
                    <div className="space-y-2 w-1/3">
                        <label className="text-white font-bold text-sm ml-1">Estado</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsStateModalOpen(true)}
                                className="w-full bg-brand-card rounded-xl border border-white/10 p-3 text-center text-white text-sm focus:outline-none focus:border-brand-primary transition-colors uppercase"
                            >
                                {myProfile.state || 'UF'}
                            </button>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2 flex-1">
                        <label className="text-white font-bold text-sm ml-1">Cidade</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!myProfile.state) return;
                                    setIsCityModalOpen(true);
                                }}
                                className={`w-full bg-brand-card rounded-xl border border-white/10 p-3 pl-10 pr-8 text-left text-white text-sm focus:outline-none focus:border-brand-primary transition-colors ${
                                    !myProfile.state ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={!myProfile.state}
                            >
                                {myProfile.city || 'Selecione'}
                            </button>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Login Method */}
                <div className="flex items-center justify-between py-4 px-4 bg-brand-card rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/10 rounded-full">
                            {myProfile.loginMethod === 'google' && <GoogleIcon />}
                            {myProfile.loginMethod === 'facebook' && <Facebook size={20} className="text-[#1877F2] fill-current" />}
                            {myProfile.loginMethod === 'email' && <Mail size={20} className="text-gray-400" />}
                         </div>
                         <div>
                            <p className="text-white font-bold text-sm">Conta conectada</p>
                            <p className="text-gray-400 text-xs capitalize">{myProfile.loginMethod}</p>
                         </div>
                    </div>
                </div>

                {/* Ranking Toggle */}
                <div className="flex items-center justify-between py-4 px-4 bg-brand-card rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <Trophy size={20} className="text-yellow-500" />
                        <div>
                            <p className="text-white font-bold text-sm">Participar do Ranking</p>
                            <p className="text-gray-400 text-xs">Exibir meu perfil no placar de líderes</p>
                        </div>
                    </div>
                    <button onClick={() => updateProfile('rankingEnabled', !myProfile.rankingEnabled)} className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${myProfile.rankingEnabled ? 'bg-brand-primary' : 'bg-gray-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${myProfile.rankingEnabled ? 'left-6' : 'left-1'}`} /></button>
                </div>
            </div>

            <div className="w-full h-px bg-white/10 my-4"></div>

            {/* Bio Section */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-white font-bold text-base flex items-center gap-2">Sobre mim <span className="bg-brand-primary text-[10px] px-1.5 py-0.5 rounded text-white font-bold">IMPORTANTE</span></h2>
                    <span className={`${myProfile.bio.length > 450 ? 'text-red-500' : 'text-brand-primary'} text-xs font-bold`}>{Math.round((myProfile.bio.length / 500) * 100)}%</span>
                </div>
                <textarea className="w-full bg-brand-card rounded-xl border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-brand-primary transition-colors min-h-[120px]" value={myProfile.bio} onChange={(e) => updateProfile('bio', e.target.value)} maxLength={500} placeholder="Escreva algo sobre você..." />
            </div>

            {/* Tags / Interests */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-white font-bold text-base">Tag Atual</h2>
                    <button onClick={() => setActiveModal('interests')} className="text-brand-primary text-xs font-bold uppercase hover:underline">Editar</button>
                </div>
                <div className="bg-brand-card p-4 rounded-xl border border-white/5 flex flex-wrap gap-2 min-h-[60px]">
                    {currentTag ? (
                        <span className="px-3 py-1 rounded-full text-xs border flex items-center gap-1 transition-colors bg-brand-primary border-brand-primary text-white">{currentTag}</span>
                    ) : (
                        <button onClick={() => setActiveModal('interests')} className="px-3 py-1 border border-dashed border-gray-600 rounded-full text-xs text-gray-500 hover:text-white hover:border-white transition-colors">+ Adicionar</button>
                    )}
                </div>
            </div>

            {/* More Details Sections */}
            <div className="space-y-1 pt-2">
                <h2 className="text-gray-500 font-bold text-xs uppercase px-2 mb-2 tracking-wider">Informações Básicas</h2>
                <ListItem label="Você é" value={myProfile.gender} icon={User} onClick={() => setActiveModal('gender')} />
                <ListItem label="Você procura por" value={myProfile.lookingFor.join(', ')} icon={Heart} onClick={() => setActiveModal('lookingFor')} />
                <ListItem label="Altura" value={myProfile.height || "Adicionar"} icon={Ruler} onClick={() => setActiveModal('height')} />
                <ListItem label="Relacionamento" value={profileData.relationship} icon={HeartHandshake} onClick={() => setActiveModal('relationship')} />
                <ListItem label="Como você se classifica?" value={myProfile.classification || "Adicionar"} icon={Trophy} onClick={() => setActiveModal('classification')} />
                <ListItem label="No date você paga ou racha a conta?" value={myProfile.billSplit || "Adicionar"} icon={HeartHandshake} onClick={() => setActiveModal('billSplit')} split />
                <ListItem label="Está disponível para um date hoje?" value={myProfile.availableToday === true ? 'Quero sair hoje' : myProfile.availableToday === false ? 'Outro dia eu saio' : 'Adicionar'} icon={Sun} onClick={() => setActiveModal('availableToday')} split />
            </div>

            {/* Mais sobre mim */}
            <div className="space-y-1 pt-4">
                <h2 className="text-gray-500 font-bold text-xs uppercase px-2 mb-2 tracking-wider">Mais sobre mim</h2>
                <ListItem label="Signo" value={profileData.sign} icon={Sun} onClick={() => setActiveModal('sign')} />
                <ListItem label="Formação" value={profileData.education} icon={GraduationCap} onClick={() => setActiveModal('education')} />
                <ListItem label="Família" value={profileData.family} icon={Users} onClick={() => setActiveModal('family')} />
                <ListItem label="Personalidade" value={profileData.personality || "Adicionar"} icon={Smile} onClick={() => setActiveModal('personality')} />
            </div>

            {/* Estilo de vida */}
            <div className="space-y-1 pt-4">
                <h2 className="text-gray-500 font-bold text-xs uppercase px-2 mb-2 tracking-wider">Estilo de vida</h2>
                <ListItem label="Pets" value={profileData.pets} icon={Dog} onClick={() => setActiveModal('pets')} />
                <ListItem label="Bebida" value={profileData.drink} icon={Wine} onClick={() => setActiveModal('drink')} />
                <ListItem label="Fumo" value={profileData.smoke} icon={Cigarette} onClick={() => setActiveModal('smoke')} />
                <ListItem label="Atividade física" value={profileData.exercise} icon={Dumbbell} onClick={() => setActiveModal('exercise')} />
                <ListItem label="Minha alimentação" value={profileData.food || "Adicionar"} icon={Pizza} onClick={() => setActiveModal('food')} />
                <ListItem label="Hábitos de sono" value={profileData.sleep || "Adicionar"} icon={Moon} onClick={() => setActiveModal('sleep')} />
            </div>

            <div className="pt-6">
                <button
                    onClick={() => onNavigate(AppScreen.HOME)}
                    className="w-full py-4 bg-brand-primary rounded-full text-white font-bold hover:opacity-90 transition-opacity"
                >
                    Concluir
                </button>
            </div>

          </div>
      </div>

      {/* Generic Selection Modal */}
            <Modal
                open={!!activeModal}
                overlayClassName={MODAL_OVERLAY}
            >
                <div className={`${MODAL_CONTAINER} overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white capitalize">{LABEL_MAP[activeModal as string] || activeModal}</h3>
                        <button
                            onClick={() => setActiveModal(null)}
                            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="overflow-y-auto no-scrollbar flex-1">{renderModalContent()}</div>
                </div>
            </Modal>

            {/* State Selection Modal */}
            <Modal
                open={isStateModalOpen}
                overlayClassName={MODAL_OVERLAY}
            >
                <div className={`${MODAL_CONTAINER} overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Estado</h3>
                        <button
                            onClick={() => setIsStateModalOpen(false)}
                            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-y-auto no-scrollbar flex-1">
                        <div className="space-y-1">
                            {Object.keys(LOCATIONS).map((st) => (
                                <button
                                    key={st}
                                    onClick={() => {
                                        updateProfile('state', st);
                                        updateProfile('city', '');
                                        setIsStateModalOpen(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${
                                        myProfile.state === st
                                            ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50'
                                            : 'text-gray-300 hover:bg-white/5'
                                    }`}
                                >
                                    {st}
                                    {myProfile.state === st && <Check size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* City Selection Modal */}
            <Modal
                open={isCityModalOpen}
                overlayClassName={MODAL_OVERLAY}
            >
                <div className={`${MODAL_CONTAINER} overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Cidade</h3>
                        <button
                            onClick={() => setIsCityModalOpen(false)}
                            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-y-auto no-scrollbar flex-1">
                        {availableCities.length === 0 ? (
                            <p className="text-gray-400 text-sm">Selecione um estado primeiro.</p>
                        ) : (
                            <div className="space-y-1">
                                {availableCities.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => {
                                            updateProfile('city', city);
                                            setIsCityModalOpen(false);
                                        }}
                                        className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${
                                            myProfile.city === city
                                                ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50'
                                                : 'text-gray-300 hover:bg-white/5'
                                        }`}
                                    >
                                        {city}
                                        {myProfile.city === city && <Check size={18} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

      {/* Photo Source Modal & Editor would be here (omitted for brevity, assume reusable component or same logic) */}
            <Modal
                open={isSourceModalOpen}
                overlayClassName={MODAL_OVERLAY}
            >
                <div className={`${MODAL_CONTAINER} max-h-[80vh] overflow-y-auto space-y-4`}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-white">Adicionar Foto</h3>
                        <button
                            onClick={() => setIsSourceModalOpen(false)}
                            className="p-2 bg-gray-800 rounded-full text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => triggerFileInput('camera')}
                        className="w-full py-4 bg-gray-800 rounded-xl flex items-center gap-4 px-6 hover:bg-gray-700 transition-colors"
                    >
                        <Camera size={24} className="text-brand-primary" />
                        <span className="text-white font-bold">Tirar Foto</span>
                    </button>
                    <button
                        onClick={() => triggerFileInput('gallery')}
                        className="w-full py-4 bg-gray-800 rounded-xl flex items-center gap-4 px-6 hover:bg-gray-700 transition-colors"
                    >
                        <ImageIcon size={24} className="text-brand-primary" />
                        <span className="text-white font-bold">Escolher da Galeria</span>
                    </button>
                </div>
            </Modal>

      {/* Editor Overlay */}
      {isEditorOpen && tempImageSrc && (
        <PhotoEditor
          imageSrc={tempImageSrc}
          onSave={handleSaveCroppedImage}
          onCancel={() => {
            setIsEditorOpen(false);
            setTempImageSrc(null);
          }}
        />
      )}
    </div>
  );
};

// Robust Frame-Based Photo Editor (same behavior as Register)
const PhotoEditor = ({ imageSrc, onSave, onCancel }: { imageSrc: string, onSave: (base64: string) => void, onCancel: () => void }) => {
    const frameRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [imgLoaded, setImgLoaded] = useState(false);
    
    useEffect(() => {
        const img = imageRef.current;
        img.src = imageSrc;
        img.onload = () => setImgLoaded(true);
    }, [imageSrc]);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => setIsDragging(false);

    const handleSave = () => {
        if (!frameRef.current || !imageRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 1080, 1920);

        const frameRect = frameRef.current.getBoundingClientRect();
        const frameWidth = frameRect.width;
        const frameHeight = frameRect.height;
        if (frameWidth <= 0 || frameHeight <= 0) return;

        const img = imageRef.current;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const frameAspect = frameWidth / frameHeight;

        let baseWidth: number;
        let baseHeight: number;
        if (imgAspect > frameAspect) {
            // Wider image: fit by width (contain)
            baseWidth = frameWidth;
            baseHeight = frameWidth / imgAspect;
        } else {
            // Taller image: fit by height (contain)
            baseHeight = frameHeight;
            baseWidth = frameHeight * imgAspect;
        }

        baseWidth *= scale;
        baseHeight *= scale;

        // Position inside the visible 9:16 frame (matches the on-screen transform).
        const x = (frameWidth - baseWidth) / 2 + pan.x;
        const y = (frameHeight - baseHeight) / 2 + pan.y;

        const sx = canvas.width / frameWidth;
        const sy = canvas.height / frameHeight;

        ctx.drawImage(img, x * sx, y * sy, baseWidth * sx, baseHeight * sy);

        onSave(canvas.toDataURL('image/jpeg', 0.9));
    };

    return (
        <Modal open overlayClassName={MODAL_OVERLAY}>
            <div className="w-full max-w-[420px] bg-black rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-4">
                    <button onClick={onCancel} className="p-2 text-white"><X /></button>
                    <h3 className="text-white font-bold">Editar Foto</h3>
                    <button onClick={handleSave} className="p-2 text-brand-primary font-bold">Salvar</button>
                </div>
                
                <div className="relative bg-gray-900 flex items-center justify-center px-3 pb-3">
                    <div 
                        ref={frameRef}
                        className="relative overflow-hidden shadow-2xl border-2 border-brand-primary touch-none"
                        style={{ 
                            aspectRatio: '9/16', 
                            width: '100%',
                            maxWidth: '360px',
                            maxHeight: '55vh'
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    >
                        {imgLoaded ? (
                            <img 
                                src={imageSrc} 
                                style={{ 
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                                    transformOrigin: 'center',
                                    touchAction: 'none',
                                    maxWidth: 'none',
                                    maxHeight: 'none'
                                }}
                                draggable={false}
                            />
                        ) : <div className="text-white text-center p-4">Carregando...</div>}
                    </div>
                    
                    <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                        <p className="text-[11px] text-gray-400">Arraste para mover • Use o slider para zoom</p>
                    </div>
                </div>

                <div className="p-4 bg-black space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-gray-400">Zoom</span>
                        <span className="text-xs text-white font-bold">{Math.round(scale * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="3.5" 
                        step="0.1" 
                        value={scale} 
                        onChange={e => setScale(parseFloat(e.target.value))} 
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <div className="flex justify-between gap-3 pt-1">
                        <button onClick={() => { setScale(1); setPan({x:0, y:0}); }} className="flex-1 py-2.5 bg-gray-800 rounded-xl text-white font-bold flex items-center justify-center gap-2"><RotateCcw size={16} /> Redefinir</button>
                        <button onClick={handleSave} className="flex-1 py-2.5 bg-brand-primary rounded-xl text-white font-bold">Confirmar</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const ListItem = ({ label, value, icon: Icon, onClick, split }: { label: string, value: string, icon: any, onClick: () => void, split?: boolean }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between py-4 px-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
        <div className={`flex items-center gap-3 min-w-0 ${split ? 'basis-[45%]' : ''}`}>
            <Icon size={20} className="text-gray-500 group-hover:text-brand-primary transition-colors shrink-0" />
            <span className={`text-gray-200 text-sm font-medium ${split ? 'leading-snug' : ''}`}>{label}</span>
        </div>
        {split && <div className="basis-[10%]" />}
        <div className={`flex items-center gap-2 min-w-0 ${split ? 'basis-[45%] justify-end' : ''}`}>
            <span className={`${value === 'Vazio' || value === 'Adicionar' || value === 'Selecionar' ? 'text-gray-600' : 'text-white'} text-sm truncate ${split ? 'max-w-full' : 'max-w-[150px]'} text-right`}>{value}</span>
            <ChevronRight size={16} className="text-gray-700 group-hover:text-gray-500 shrink-0" />
        </div>
    </button>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div onClick={onChange} className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-200 ${checked ? 'bg-brand-primary' : 'bg-gray-600'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'left-6' : 'left-1'}`}>
            {checked ? null : <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-[10px]">x</span>}
        </div>
    </div>
);
