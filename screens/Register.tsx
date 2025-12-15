
import React, { useState, useRef, useEffect } from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ArrowLeft, Mail, Facebook, ChevronRight, Camera, Check, User, Calendar, MapPin, Heart, Plus, ChevronDown, RotateCcw, X, Image as ImageIcon, Trash2, Eye, EyeOff } from 'lucide-react';
import { TAGS_LIST, LOCATIONS, GENDER_OPTIONS, LOOKING_FOR_OPTIONS, RELATIONSHIP_OPTIONS } from '../constants';
import logoQD from '../src/img/logo_qd.png';

interface RegisterProps {
  onNavigate: (screen: AppScreen) => void;
}

const LogoFooter = () => (
    <div className="mt-auto pt-8 pb-4 flex justify-center">
        <img 
            src={`${logoQD}?v=${__APP_BUILD_ID__}`} 
            alt="Logomarca The Game" 
            className="w-16 h-16 object-contain opacity-90" 
        />
    </div>
);

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    method: 'email', // email, google, facebook
    email: '',
    password: '',
    name: '',
    birthDate: '',
    city: '',
    state: '',
    gender: '',
    lookingFor: [] as string[],
    relationship: '',
    images: [] as string[]
  });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Photo Editing State
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => {
    if (step === 0) onNavigate(AppScreen.WELCOME);
    else setStep(step - 1);
  };

  const updateData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

    const isStrongPassword = (value: string) => {
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSymbol = /[^A-Za-z0-9]/.test(value);
        return value.length >= 8 && hasUpper && hasLower && hasNumber && hasSymbol;
    };

  // --- Helper Functions ---
  const handleDateChange = (value: string) => {
    // Mask DD/MM/AAAA
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    updateData('birthDate', v);
  };

  const validateAge = (dateString: string) => {
    if (dateString.length !== 10) return false;
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    const birth = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
  };

  // --- Photo Logic ---
  const handlePhotoSlotClick = (index: number) => {
    setActivePhotoIndex(index);
    setIsSourceModalOpen(true);
  };

  const handleDeletePhoto = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newPhotos = formData.images.filter((_, i) => i !== index);
    updateData('images', newPhotos);
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

  const triggerFileInput = (mode: 'camera' | 'gallery') => {
    if (fileInputRef.current) {
        if (mode === 'camera') fileInputRef.current.setAttribute('capture', 'environment');
        else fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
    }
  };

  const handleSaveCroppedImage = (croppedImageBase64: string) => {
    if (activePhotoIndex !== null) {
      const newPhotos = [...formData.images];
      if (activePhotoIndex >= newPhotos.length) {
        newPhotos.push(croppedImageBase64);
      } else {
        newPhotos[activePhotoIndex] = croppedImageBase64;
      }
      updateData('images', newPhotos);
      setIsEditorOpen(false);
      setTempImageSrc(null);
      setActivePhotoIndex(null);
    }
  };

  // Google Icon
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  // STEP 0: METHOD SELECTION
  if (step === 0) {
        return (
            <div className="min-h-screen flex flex-col p-6 bg-brand-dark">
        <div className="mb-6 mt-2">
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-400 hover:text-white mb-4"><ArrowLeft /></button>
            <h1 className="text-4xl font-bold text-white mb-2">Vamos<br/>Começar</h1>
            <p className="text-gray-400">Como você prefere entrar?</p>
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-4">
            <button onClick={() => { updateData('method', 'google'); setStep(2); }} className="w-full bg-white text-black font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"><GoogleIcon />Continuar com Google</button>
            <button onClick={() => { updateData('method', 'facebook'); setStep(2); }} className="w-full bg-[#1877F2] text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-colors"><Facebook size={20} fill="currentColor" />Continuar com Facebook</button>
            <div className="relative py-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-brand-dark text-gray-500">ou</span></div></div>
            <button onClick={() => { updateData('method', 'email'); handleNext(); }} className="w-full bg-brand-card border-2 border-brand-primary/50 text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-brand-card/80 transition-colors"><Mail size={20} />Entrar com Email</button>
        </div>
                <LogoFooter />
      </div>
    );
  }

  // STEP 1: CREDENTIALS (IF EMAIL)
  if (step === 1) {
    const passwordValid = isStrongPassword(formData.password);
    const passwordsMatch = confirmPassword.length > 0 && formData.password === confirmPassword;
    const canContinue = Boolean(
        formData.email &&
        formData.password &&
        confirmPassword &&
        passwordValid &&
        passwordsMatch
    );

    return (
      <WizardLayout title="Criar Conta" subtitle="Digite seu email e senha" onBack={handleBack}>
         <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Email</label>
                <input type="email" value={formData.email} onChange={e => updateData('email', e.target.value)} className="w-full bg-brand-card border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none" placeholder="seu@email.com" />
            </div>
            <div>
                <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Senha</label>
                <div className="relative">
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={formData.password} 
                        onChange={e => updateData('password', e.target.value)} 
                        className={`w-full bg-brand-card border rounded-xl px-4 pr-12 py-3 text-white focus:border-brand-primary focus:outline-none ${formData.password && !passwordValid ? 'border-red-500' : 'border-gray-700'}`} 
                        placeholder="••••••••" 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(prev => !prev)} 
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <p className={`text-xs mt-1 ml-1 ${formData.password ? (passwordValid ? 'text-gray-400' : 'text-red-500') : 'text-gray-500'}`}>
                    Use ao menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos.
                </p>
            </div>
            <div>
                <label className="text-xs font-bold text-brand-primary uppercase ml-1 mb-1 block">Confirmar senha</label>
                <div className="relative">
                    <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className={`w-full bg-brand-card border rounded-xl px-4 pr-12 py-3 text-white focus:border-brand-primary focus:outline-none ${confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-700'}`} 
                        placeholder="Repita a senha" 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(prev => !prev)} 
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                    >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1 ml-1">As senhas precisam ser iguais.</p>
                )}
            </div>
         </div>
         <Button fullWidth onClick={handleNext} disabled={!canContinue} className="mt-8">Continuar</Button>
      </WizardLayout>
    );
  }

  // STEP 2: NAME
  if (step === 2) {
    return (
      <WizardLayout title="Qual seu nome?" subtitle="É assim que você aparecerá no The Game" onBack={handleBack}>
         <div className="relative">
             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
             <input type="text" value={formData.name} onChange={e => updateData('name', e.target.value)} className="w-full bg-brand-card border border-gray-700 rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:border-brand-primary focus:outline-none" placeholder="Seu nome" autoFocus />
         </div>
         <Button fullWidth onClick={handleNext} disabled={!formData.name} className="mt-8">Continuar</Button>
      </WizardLayout>
    );
  }

  // STEP 3: DETAILS (DOB, CITY, STATE)
  if (step === 3) {
    const isValidAge = validateAge(formData.birthDate);
    const availableCities = formData.state ? LOCATIONS[formData.state as keyof typeof LOCATIONS] || [] : [];

    return (
      <WizardLayout title="Mais detalhes" subtitle="Conte um pouco mais sobre você" onBack={handleBack}>
         <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Data de Nascimento</label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                        type="text" 
                        value={formData.birthDate} 
                        onChange={e => handleDateChange(e.target.value)} 
                        className={`w-full bg-brand-card border ${formData.birthDate.length === 10 && !isValidAge ? 'border-red-500' : 'border-gray-700'} rounded-xl py-4 pl-12 pr-4 text-white focus:border-brand-primary focus:outline-none`} 
                        placeholder="DD/MM/AAAA" 
                        maxLength={10}
                        inputMode="numeric"
                    />
                </div>
                {formData.birthDate.length === 10 && !isValidAge && (
                    <p className="text-red-500 text-xs mt-1 ml-1">Você deve ter pelo menos 18 anos.</p>
                )}
            </div>

            <div className="flex gap-3">
                 <div className="w-1/3">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Estado</label>
                    <div className="relative">
                        <select 
                            value={formData.state} 
                            onChange={e => {
                                updateData('state', e.target.value);
                                updateData('city', ''); // Reset city when state changes
                            }} 
                            className="w-full bg-brand-card border border-gray-700 rounded-xl py-4 pl-4 pr-8 text-white focus:border-brand-primary focus:outline-none appearance-none uppercase"
                        >
                            <option value="">UF</option>
                            {Object.keys(LOCATIONS).map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                 </div>

                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Cidade</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <select
                            value={formData.city}
                            onChange={e => updateData('city', e.target.value)}
                            disabled={!formData.state}
                            className="w-full bg-brand-card border border-gray-700 rounded-xl py-4 pl-12 pr-8 text-white focus:border-brand-primary focus:outline-none appearance-none disabled:opacity-50"
                        >
                            <option value="">Selecione</option>
                            {availableCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                 </div>
            </div>
         </div>
         <Button fullWidth onClick={handleNext} disabled={!isValidAge || !formData.city || !formData.state} className="mt-8">Continuar</Button>
      </WizardLayout>
    );
  }

  // STEP 4: GENDER
  if (step === 4) {
    return (
        <WizardLayout title="Seu Gênero" subtitle="Como você se identifica?" onBack={handleBack}>
           <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1 no-scrollbar">
               {GENDER_OPTIONS.map(g => (
                   <button key={g} onClick={() => { updateData('gender', g); handleNext(); }} className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${formData.gender === g ? 'bg-brand-primary/20 border-brand-primary text-white font-bold' : 'bg-brand-card border-gray-800 text-gray-300 hover:bg-gray-800'}`}>
                       {g} {formData.gender === g && <Check size={20} className="text-brand-primary" />}
                   </button>
               ))}
           </div>
        </WizardLayout>
    );
  }

  // STEP 5: INTERESTED IN
  if (step === 5) {
      const toggle = (opt: string) => {
          let current = [...formData.lookingFor];
          if (current.includes(opt)) {
            if (current.length > 1 || !current.includes(opt)) {
                current = current.filter(o => o !== opt);
            }
          }
          else current.push(opt);
          updateData('lookingFor', current);
      };
      
      return (
        <WizardLayout title="Tenho interesse em" subtitle="Quem você quer conhecer?" onBack={handleBack}>
           <div className="space-y-3 overflow-y-auto max-h-[52vh] pr-1 pb-4 no-scrollbar">
               {LOOKING_FOR_OPTIONS.map(opt => (
                   <button key={opt} onClick={() => toggle(opt)} className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${formData.lookingFor.includes(opt) ? 'bg-brand-primary/20 border-brand-primary text-white font-bold' : 'bg-brand-card border-gray-800 text-gray-300 hover:bg-gray-800'}`}>
                       {opt} {formData.lookingFor.includes(opt) && <Check size={20} className="text-brand-primary" />}
                   </button>
               ))}
           </div>
           <Button fullWidth onClick={handleNext} disabled={formData.lookingFor.length === 0} className="mt-8">Continuar</Button>
        </WizardLayout>
      );
  }

  // STEP 6: RELATIONSHIP
  if (step === 6) {
      return (
        <WizardLayout title="Relacionamento" subtitle="O que você busca?" onBack={handleBack}>
           <div className="space-y-3">
               {RELATIONSHIP_OPTIONS.map(r => (
                   <button key={r} onClick={() => { updateData('relationship', r); handleNext(); }} className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${formData.relationship === r ? 'bg-brand-primary/20 border-brand-primary text-white font-bold' : 'bg-brand-card border-gray-800 text-gray-300 hover:bg-gray-800'}`}>
                       {r} {formData.relationship === r && <Check size={20} className="text-brand-primary" />}
                   </button>
               ))}
           </div>
        </WizardLayout>
      );
  }

  // STEP 7: PHOTOS
  if (step === 7) {
            return (
                <div className="min-h-screen flex flex-col bg-brand-dark overflow-hidden relative">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={onFileSelect} />
            
            <WizardLayout title="Suas Fotos" subtitle="Adicione pelo menos 2 fotos" onBack={handleBack}>
                <div className="grid grid-cols-3 gap-3 mb-6">
                        {[0, 1, 2, 3, 4, 5].map(i => {
                            const hasPhoto = i < formData.images.length;
                            const photoUrl = hasPhoto ? formData.images[i] : null;
                            return (
                                <div key={i} className={`aspect-[9/16] bg-brand-card rounded-lg border border-dashed border-gray-600 flex items-center justify-center relative cursor-pointer hover:bg-gray-800 transition-colors ${i === 0 ? 'border-brand-primary' : ''}`}
                                    onClick={() => handlePhotoSlotClick(i)}>
                                    {hasPhoto ? (
                                        <>
                                            <img src={photoUrl!} className="w-full h-full object-cover rounded-lg" />
                                            <div className="absolute bottom-1 right-1 z-10"><button onClick={(e) => handleDeletePhoto(e, i)} className="p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"><Trash2 size={14} /></button></div>
                                        </>
                                    ) : (
                                        <Plus className="text-gray-500" />
                                    )}
                                    {hasPhoto && <div className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"><Check size={12} className="text-white"/></div>}
                                </div>
                            );
                        })}
                </div>
                <p className="text-xs text-gray-500 text-center mb-6">Toque para adicionar/remover. A primeira foto será a principal.</p>
                <Button fullWidth onClick={handleNext} disabled={formData.images.length < 2} className="mt-auto">Concluir Cadastro</Button>
            </WizardLayout>

            {/* Photo Source Modal */}
            <Modal
                open={isSourceModalOpen}
                overlayClassName="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <div className="w-full max-w-md bg-[#1e1e1e] rounded-3xl p-6 space-y-4 animate-in fade-in duration-200 shadow-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-white">Adicionar Foto</h3>
                        <button onClick={() => setIsSourceModalOpen(false)} className="p-2 bg-gray-800 rounded-full text-white"><X size={20} /></button>
                    </div>
                    <button onClick={() => triggerFileInput('camera')} className="w-full py-4 bg-gray-800 rounded-xl flex items-center gap-4 px-6 hover:bg-gray-700 transition-colors"><Camera size={24} className="text-brand-primary" /><span className="text-white font-bold">Tirar Foto</span></button>
                    <button onClick={() => triggerFileInput('gallery')} className="w-full py-4 bg-gray-800 rounded-xl flex items-center gap-4 px-6 hover:bg-gray-700 transition-colors"><ImageIcon size={24} className="text-brand-primary" /><span className="text-white font-bold">Escolher da Galeria</span></button>
                </div>
            </Modal>

            {/* Editor Overlay */}
            {isEditorOpen && tempImageSrc && (
                <PhotoEditor 
                    imageSrc={tempImageSrc} 
                    onSave={handleSaveCroppedImage} 
                    onCancel={() => { setIsEditorOpen(false); setTempImageSrc(null); }} 
                />
            )}
        </div>
      );
  }

  // STEP 8: SUCCESS
    return (
        <div className="min-h-screen flex flex-col p-8 bg-brand-dark animate-in fade-in duration-500">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <Check size={48} className="text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Tudo pronto!</h1>
                        <p className="text-gray-400 text-center mb-10 max-w-sm">Seu perfil foi criado com sucesso. Agora é só entrar e começar a jogar.</p>
                        <Button fullWidth onClick={() => onNavigate(AppScreen.LOGIN)}>Efetuar Login</Button>
                </div>
                <LogoFooter />
        </div>
    );
};

const WizardLayout = ({ title, subtitle, onBack, children }: { title: string, subtitle: string, onBack: () => void, children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col p-6 bg-brand-dark">
        <div className="mb-8 mt-2">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white mb-4"><ArrowLeft /></button>
            <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
            <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
            {children}
        </div>
        <LogoFooter />
    </div>
);

// Robust Frame-Based Photo Editor
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

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 1080, 1920);

        const frameRect = frameRef.current.getBoundingClientRect();
        const visibleWidth = frameRect.width;
        const visibleHeight = frameRect.height;
        const widthRatio = canvas.width / visibleWidth;
        const heightRatio = canvas.height / visibleHeight;

        const img = imageRef.current;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const frameAspect = visibleWidth / visibleHeight;

        let baseWidth: number;
        let baseHeight: number;
        if (imgAspect > frameAspect) {
            baseHeight = visibleHeight;
            baseWidth = visibleHeight * imgAspect;
        } else {
            baseWidth = visibleWidth;
            baseHeight = visibleWidth / imgAspect;
        }

        baseWidth *= scale;
        baseHeight *= scale;

        const offsetX = (visibleWidth - baseWidth) / 2 + pan.x;
        const offsetY = (visibleHeight - baseHeight) / 2 + pan.y;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(widthRatio, heightRatio);
        ctx.translate(offsetX, offsetY);
        ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
        ctx.restore();

        onSave(canvas.toDataURL('image/jpeg', 0.9));
    };

    return (
        <Modal open overlayClassName="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex justify-between items-center p-4 z-20">
                <button onClick={onCancel} className="p-2 text-white"><X /></button>
                <h3 className="text-white font-bold">Editar Foto</h3>
                <button onClick={handleSave} className="p-2 text-brand-primary font-bold">Salvar</button>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
                {/* Visual Reference Frame (9:16) */}
                <div 
                    ref={frameRef}
                    className="relative overflow-hidden shadow-2xl border-2 border-brand-primary touch-none"
                    style={{ 
                        aspectRatio: '9/16', 
                        height: '80%', 
                        width: 'auto',
                        maxWidth: '90%' 
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
                
                {/* Instructions */}
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <p className="text-xs text-gray-500">Arraste para mover • Use o slider para zoom</p>
                </div>
            </div>

            {/* Controls */}
            <div className="p-6 bg-black space-y-4">
                <div className="flex justify-between items-center px-2">
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
                <div className="flex justify-between gap-4 pt-2">
                    <button onClick={() => { setScale(1); setPan({x:0, y:0}); }} className="flex-1 py-3 bg-gray-800 rounded-xl text-white font-bold flex items-center justify-center gap-2"><RotateCcw size={16} /> Redefinir</button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-brand-primary rounded-xl text-white font-bold">Confirmar</button>
                </div>
            </div>
        </Modal>
    );
};
