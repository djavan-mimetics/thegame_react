
import React, { useState } from 'react';
import { AppScreen } from '../types';
import { LOCATIONS } from '../constants';
import { ArrowLeft, Check, X, MapPin, Zap, ChevronDown, Lock, CreditCard, Calendar, User, Receipt, History } from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

interface PremiumProps {
  onNavigate: (screen: AppScreen) => void;
  isPremium: boolean;
  setPremium: (value: boolean) => void;
}

export const Premium: React.FC<PremiumProps> = ({ onNavigate, isPremium, setPremium }) => {
  const [hideAge, setHideAge] = useState(false);
  
  // Location State
  const [location, setLocation] = useState({ city: 'Rio de Janeiro', state: 'RJ' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<keyof typeof LOCATIONS>('RJ');
  const [selectedCity, setSelectedCity] = useState('Rio de Janeiro');

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semiannual' | 'annual'>('annual');
  const [isRecurring, setIsRecurring] = useState(true);

  const handleStateChange = (newState: string) => {
    const stateKey = newState as keyof typeof LOCATIONS;
    setSelectedState(stateKey);
    if (LOCATIONS[stateKey] && LOCATIONS[stateKey].length > 0) {
        setSelectedCity(LOCATIONS[stateKey][0]);
    }
  };

  const handleSaveLocation = () => {
    setLocation({ city: selectedCity, state: selectedState });
    setIsModalOpen(false);
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
        setPremium(true);
        setIsCheckoutOpen(false);
    }, 1500);
  };

  const features = [
    { label: 'Curtidas diárias Ilimitadas', active: isPremium },
    { label: 'Mudanças de tags ilimitadas', active: isPremium },
    { label: '+ 10 Superlikes diários', active: isPremium },
    { label: 'Visualizar os perfis que te curtiram', active: isPremium }
  ];

  const plans = {
    monthly: { price: '19,90', label: 'Mensal', period: 'mês', discount: undefined },
    semiannual: { price: '59,90', label: 'Semestral', discount: '50%', period: '6 meses' },
    annual: { price: '99,90', label: 'Anual', discount: '60%', period: 'ano' }
  };

  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar relative">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.EDIT_PROFILE)} className="text-gray-400 p-2 -ml-2 hover:text-white">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Funções Premium</h1>
      </div>

      <div className="p-4 space-y-6 pb-20">
        
        {/* Plan Status Card */}
        <div className="bg-gradient-to-br from-brand-secondary to-brand-accent rounded-2xl p-6 shadow-xl shadow-brand-primary/20 relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-yellow-300 fill-yellow-300" size={24} />
                    <h2 className="text-2xl font-extrabold text-white italic tracking-wider">PREMIUM</h2>
                </div>
                
                {isPremium ? (
                    <div className="mt-4">
                        <span className="inline-block bg-white text-brand-primary font-bold px-3 py-1 rounded-full text-xs uppercase mb-2">Plano Ativo</span>
                        <p className="text-white/90 text-sm">Seu plano renova em 30/12/2025</p>
                        <button onClick={() => setPremium(false)} className="mt-4 text-xs text-white/70 hover:text-white underline">
                            Cancelar assinatura (Demo)
                        </button>
                    </div>
                ) : (
                    <div className="mt-4">
                         <p className="text-white/90 text-sm mb-4">Desbloqueie todo o potencial do The Game e maximize suas conexões.</p>
                         <button 
                            onClick={() => setIsCheckoutOpen(true)}
                            className="w-full py-3 bg-white text-brand-accent font-bold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            Contratar Agora
                         </button>
                    </div>
                )}
             </div>
        </div>

        {/* Location Settings */}
        <div className={`bg-brand-card rounded-xl p-4 border border-white/5 transition-opacity duration-300 ${!isPremium ? 'opacity-70' : ''}`}>
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <MapPin className="text-brand-primary" size={20} />
                    <h3 className="text-white font-bold">Localização</h3>
                </div>
                {!isPremium && <Lock size={16} className="text-gray-500" />}
             </div>
             
             <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2">
                 <div>
                    <p className="text-gray-400 text-xs font-bold uppercase">Local Atual</p>
                    <p className="text-white font-medium">{location.city}, {location.state}</p>
                 </div>
                 {isPremium ? (
                     <button 
                        onClick={() => {
                             setSelectedState(location.state as keyof typeof LOCATIONS);
                             setSelectedCity(location.city);
                             setIsModalOpen(true);
                        }}
                        className="text-brand-primary text-sm font-bold hover:underline"
                    >
                        Alterar
                     </button>
                 ) : (
                     <span className="text-gray-600 text-xs italic">Premium</span>
                 )}
             </div>
             <p className="text-gray-500 text-xs">Permite alterar cidade e estado para ver pessoas de outros locais.</p>
        </div>

        {/* Hide Age Toggle */}
        <div className={`bg-brand-card rounded-xl p-4 border border-white/5 transition-opacity duration-300 ${!isPremium ? 'opacity-70' : ''}`}>
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-white font-bold text-sm">Ocultar Idade</h3>
                    <p className="text-gray-500 text-xs mt-1">Não mostrar minha idade no perfil</p>
                </div>
                <div className="flex items-center gap-3">
                    {!isPremium && <Lock size={16} className="text-gray-500" />}
                    <Toggle 
                        checked={isPremium ? hideAge : false} 
                        onChange={() => isPremium && setHideAge(!hideAge)} 
                        disabled={!isPremium}
                    />
                </div>
            </div>
        </div>

        {/* Feature List */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5 space-y-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Benefícios Inclusos</h3>
            {features.map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className={`text-sm ${feature.active ? 'text-white' : 'text-gray-500'}`}>{feature.label}</span>
                    {feature.active ? (
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check size={14} className="text-green-500" />
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                            <X size={14} className="text-red-500" />
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Statement Button (Extract) */}
        <button 
            onClick={() => onNavigate(AppScreen.PAYMENT_HISTORY)}
            className="w-full py-4 bg-brand-card rounded-xl border border-white/10 flex items-center justify-between px-6 hover:bg-white/5 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <Receipt className="text-gray-400 group-hover:text-brand-primary transition-colors" size={20} />
                <span className="text-gray-200 font-bold">Ver Histórico de Pagamentos</span>
            </div>
            <History size={18} className="text-gray-600" />
        </button>

      </div>

      {/* Location Selection Modal (Reused Logic) */}
            <Modal
                open={isModalOpen}
                overlayClassName="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            >
                <div className="bg-[#1e1e1e] w-full max-w-md rounded-3xl border border-white/10 p-6 relative shadow-2xl max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Alterar Localização</h3>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        {/* State Selector */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Estado</label>
                            <div className="relative">
                                <select
                                    value={selectedState}
                                    onChange={(e) => handleStateChange(e.target.value)}
                                    className="w-full bg-brand-card border border-white/10 rounded-xl p-4 text-white appearance-none focus:border-brand-primary outline-none cursor-pointer"
                                >
                                    {Object.keys(LOCATIONS).map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        {/* City Selector */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Cidade</label>
                            <div className="relative">
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-brand-card border border-white/10 rounded-xl p-4 text-white appearance-none focus:border-brand-primary outline-none cursor-pointer"
                                >
                                    {LOCATIONS[selectedState] &&
                                        LOCATIONS[selectedState].map((city: string) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveLocation}
                        className="w-full py-4 bg-brand-primary rounded-xl font-bold text-white shadow-lg shadow-brand-primary/25 hover:brightness-110 transition-all active:scale-95"
                    >
                        Confirmar
                    </button>
                </div>
            </Modal>

      {/* Checkout Modal */}
        <Modal
            open={isCheckoutOpen}
            overlayClassName="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200"
        >
            <div className="bg-[#120516] w-full max-w-md rounded-3xl border border-brand-primary/20 p-6 relative shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Assinar Premium</h3>
                    <button 
                        onClick={() => setIsCheckoutOpen(false)}
                        className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handlePurchase} className="flex-1 flex flex-col overflow-y-auto no-scrollbar gap-6">
                    
                    {/* Plan Selection */}
                    <div className="mt-auto pb-1"></div>
                    <div className="grid grid-cols-3 gap-3">
                        {(['monthly', 'semiannual', 'annual'] as const).map((planKey) => {
                            const plan = plans[planKey];
                            const isSelected = selectedPlan === planKey;
                            return (
                                <div 
                                    key={planKey}
                                    onClick={() => setSelectedPlan(planKey)}
                                    className={`relative rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer border-2 transition-all h-32 overflow-visible ${
                                        isSelected 
                                        ? 'bg-brand-primary/10 border-brand-primary' 
                                        : 'bg-brand-card border-transparent hover:border-gray-700'
                                    }`}
                                >
                                    {plan.discount && (
                                        <div className="absolute -top-4 right-2 bg-green-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg z-20 pointer-events-none">
                                            {plan.discount} OFF
                                        </div>
                                    )}
                                    <span className={`text-xs font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>{plan.label}</span>
                                    <span className={`text-lg font-black ${isSelected ? 'text-brand-primary' : 'text-white'}`}>
                                        R${plan.price.split(',')[0]}
                                    </span>
                                    <span className="text-[10px] text-gray-500 mt-1">/{plan.period}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recurrence Switch */}
                    <div className="flex items-center justify-between bg-brand-card p-4 rounded-xl border border-white/5">
                        <span className="text-sm font-bold text-white">Renovação automática</span>
                        <Toggle checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                    </div>

                    {/* Credit Card Form (Stripe-like) */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase">Dados do Cartão</h4>
                        
                        <div className="space-y-3">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <CreditCard size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Número do Cartão" 
                                    className="w-full bg-brand-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-brand-primary outline-none placeholder:text-gray-600"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Nome no Cartão" 
                                    className="w-full bg-brand-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-brand-primary outline-none placeholder:text-gray-600"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Calendar size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="MM/AA" 
                                        className="w-full bg-brand-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-brand-primary outline-none placeholder:text-gray-600"
                                        required
                                        maxLength={5}
                                    />
                                </div>
                                <div className="relative w-1/3">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Lock size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="CVC" 
                                        className="w-full bg-brand-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-brand-primary outline-none placeholder:text-gray-600"
                                        required
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-gray-400">Total a pagar:</span>
                            <span className="text-xl font-black text-white">R$ {plans[selectedPlan].price}</span>
                        </div>
                        <Button fullWidth type="submit" className="shadow-lg shadow-brand-primary/40">
                            Finalizar Pagamento
                        </Button>
                        <p className="text-[10px] text-gray-600 text-center mt-3">
                            Pagamento processado de forma segura via Stripe. Ao confirmar, você concorda com os Termos de Serviço.
                        </p>
                    </div>
                </form>
            </div>
                </Modal>

    </div>
  );
};

const Toggle = ({ checked, onChange, disabled }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
    <div 
        onClick={() => !disabled && onChange()}
        className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${checked ? 'bg-brand-primary' : 'bg-gray-600'}`}
    >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'left-6' : 'left-1'}`}>
            {checked ? null : <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-[10px]">x</span>}
        </div>
    </div>
);
