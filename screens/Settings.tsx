
import React, { useEffect, useState } from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Check, ChevronDown, MapPin, X, Zap } from 'lucide-react';
import { apiFetch } from '../apiClient';
import type { MyProfile } from '../types';
import { loadOptionsWithCache } from '../optionsCache';
import { LOCATIONS } from '../constants';
import { Modal } from '../components/Modal';

interface SettingsProps {
  onNavigate: (screen: AppScreen) => void;
    myProfile: MyProfile;
    updateProfile: (key: keyof MyProfile, value: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate, myProfile, updateProfile }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState<Record<string, string[]>>(LOCATIONS);
    const [isStateModalOpen, setIsStateModalOpen] = useState(false);
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);

    useEffect(() => {
        const loadOptions = async () => {
            const data = await loadOptionsWithCache();
            if (data?.locations) setLocations(data.locations);
        };

        void loadOptions();
    }, []);

    const discoveryState = myProfile.discoveryState || '';
    const discoveryCity = myProfile.discoveryCity || '';
    const usingProfileLocation = !discoveryState || !discoveryCity;
    const availableCities = discoveryState ? locations[discoveryState] || [] : [];
    const activeLocationLabel = usingProfileLocation
        ? `${myProfile.city || 'Cidade do perfil'}, ${myProfile.state || 'UF do perfil'}`
        : `${discoveryCity}, ${discoveryState}`;

    const saveSettings = async () => {
        if (isSaving) return;
        setIsSaving(true);
        setError('');
        try {
            const [settingsRes, profileRes] = await Promise.all([
                apiFetch('/v1/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        minAge: myProfile.minAge,
                        maxAge: myProfile.maxAge,
                        maxDistanceKm: myProfile.maxDistanceKm,
                        expandDistance: myProfile.expandDistance,
                        expandAge: myProfile.expandAge,
                        internationalMode: myProfile.internationalMode,
                        discoveryState: discoveryState || null,
                        discoveryCity: discoveryCity || null,
                        profileVisible: myProfile.profileVisible,
                        hideAge: myProfile.hideAge,
                        readReceiptsEnabled: myProfile.readReceiptsEnabled,
                        allowMarketingEmails: myProfile.allowMarketingEmails
                    })
                }),
                apiFetch('/v1/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lookingFor: myProfile.lookingFor })
                })
            ]);

            if (!settingsRes.ok || !profileRes.ok) {
                setError('Nao foi possivel salvar seus ajustes agora.');
                return;
            }

            onNavigate(AppScreen.EDIT_PROFILE);
        } catch {
            setError('Nao foi possivel salvar seus ajustes agora.');
        } finally {
            setIsSaving(false);
        }
    };

  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.EDIT_PROFILE)} className="text-gray-400 p-2 -ml-2">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Ajustes de descoberta</h1>
      </div>

      <div className="p-4 space-y-6 pb-20">
        
        {/* Premium Banner */}
        <div className="bg-black border border-yellow-600/50 rounded-lg p-3 flex justify-between items-center mb-6">
            <span className="text-white font-bold">Descoberta Premium</span>
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">Tinder Gold™</span>
        </div>

        {/* Location */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">Localização da descoberta</h3>
                <button onClick={() => { updateProfile('discoveryState', ''); updateProfile('discoveryCity', ''); }} className="text-blue-500 text-sm font-bold cursor-pointer">Usar cidade do perfil</button>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">
                Defina uma localização manual para descoberta sem alterar a cidade pública do seu perfil.
            </p>
            <div className="rounded-xl border border-white/5 bg-black/10 p-3 mb-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Ativa agora</p>
                <p className="text-white font-semibold">{activeLocationLabel}</p>
            </div>
            <div className="flex gap-3 mb-4">
                <button onClick={() => setIsStateModalOpen(true)} className="flex-1 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-left text-white">
                    <span className="block text-xs text-gray-500 mb-1">Estado</span>
                    <span>{discoveryState || myProfile.state || 'Selecione'}</span>
                    <ChevronDown className="ml-auto -mt-5 text-gray-500" size={16} />
                </button>
                <button onClick={() => discoveryState && setIsCityModalOpen(true)} disabled={!discoveryState} className={`flex-1 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-left text-white ${!discoveryState ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span className="block text-xs text-gray-500 mb-1">Cidade</span>
                    <span>{discoveryCity || 'Selecione'}</span>
                    <ChevronDown className="ml-auto -mt-5 text-gray-500" size={16} />
                </button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-700">
                <span className="text-white text-sm">Internacional</span>
                <Toggle checked={myProfile.internationalMode} onChange={() => updateProfile('internationalMode', !myProfile.internationalMode)} />
            </div>
            {myProfile.internationalMode && (
                <p className="text-gray-500 text-xs mt-2">
                    Ao escolher o modo internacional, você poderá ver perfis de pessoas perto de você e pelo mundo.
                </p>
            )}
        </div>

        {/* Distance Slider */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Distância máxima</h3>
                <span className="text-white font-bold">{myProfile.maxDistanceKm}km</span>
            </div>
            
            <input 
                type="range" 
                min="1" 
                max="500" 
                value={myProfile.maxDistanceKm} 
                onChange={(e) => updateProfile('maxDistanceKm', parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary mb-6"
            />

            <div className="flex items-center justify-between">
                <span className="text-gray-200 text-sm max-w-[200px]">Mostrar pessoas mais longe de mim se eu ficar sem perfis pra ver</span>
                <Toggle checked={myProfile.expandDistance} onChange={() => updateProfile('expandDistance', !myProfile.expandDistance)} />
            </div>
        </div>

        {/* Interest */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5">
            <h3 className="text-white font-bold mb-2">Tem interesse em</h3>
            <div className="flex justify-between items-center cursor-pointer">
                <span className="text-gray-300">{myProfile.lookingFor.join(', ') || 'Nao definido'}</span>
                <button onClick={() => onNavigate(AppScreen.EDIT_PROFILE)} className="text-gray-500">›</button>
            </div>
        </div>

        <div className="bg-brand-card rounded-xl p-4 border border-white/5 space-y-4">
            <div>
                <h3 className="text-white font-bold">Privacidade e controle</h3>
                <p className="text-gray-500 text-xs mt-1">Preferências sensíveis da conta e da visibilidade do seu perfil.</p>
            </div>
            <PreferenceRow label="Perfil visível na descoberta" description="Oculta seu perfil de novas recomendações quando desativado." checked={myProfile.profileVisible} onChange={() => updateProfile('profileVisible', !myProfile.profileVisible)} />
            <PreferenceRow label="Ocultar minha idade" description="Mantém a idade fora do cartão público do seu perfil." checked={myProfile.hideAge} onChange={() => updateProfile('hideAge', !myProfile.hideAge)} />
            <PreferenceRow label="Confirmação de leitura no chat" description="Permite que o app use recibos de leitura nas conversas." checked={myProfile.readReceiptsEnabled} onChange={() => updateProfile('readReceiptsEnabled', !myProfile.readReceiptsEnabled)} />
            <PreferenceRow label="Receber emails de produto" description="Autoriza emails operacionais não críticos e novidades da plataforma." checked={myProfile.allowMarketingEmails} onChange={() => updateProfile('allowMarketingEmails', !myProfile.allowMarketingEmails)} />
        </div>

        {/* Age Range */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Faixa etária</h3>
                <span className="text-white font-bold">{myProfile.minAge} - {myProfile.maxAge}</span>
            </div>
            
            <div className="relative w-full h-10 mb-6">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gray-700 rounded-lg"></div>
                <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-brand-primary rounded-lg" style={{ left: `${((myProfile.minAge - 18) / 82) * 100}%`, right: `${100 - ((myProfile.maxAge - 18) / 82) * 100}%` }}></div>
                <input type="range" min="18" max="100" value={myProfile.minAge} onChange={(e) => updateProfile('minAge', Math.min(parseInt(e.target.value, 10), myProfile.maxAge))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                <input type="range" min="18" max="100" value={myProfile.maxAge} onChange={(e) => updateProfile('maxAge', Math.max(parseInt(e.target.value, 10), myProfile.minAge))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="absolute w-6 h-6 rounded-full bg-brand-primary top-1/2 -translate-y-1/2" style={{ left: `calc(${((myProfile.minAge - 18) / 82) * 100}% - 12px)` }}></div>
                <div className="absolute w-6 h-6 rounded-full bg-brand-primary top-1/2 -translate-y-1/2" style={{ left: `calc(${((myProfile.maxAge - 18) / 82) * 100}% - 12px)` }}></div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-gray-200 text-sm max-w-[220px]">Mostrar pessoas um pouco fora da minha faixa de preferência se eu ficar sem perfis pra ver</span>
                <Toggle checked={myProfile.expandAge} onChange={() => updateProfile('expandAge', !myProfile.expandAge)} />
            </div>
        </div>

        <div className="text-center pt-4 pb-8 space-y-4">
            <button onClick={saveSettings} className="w-full py-3 bg-white/5 rounded-lg text-white font-bold hover:bg-white/10 transition-colors">
                {isSaving ? 'Salvando...' : 'Salvar ajustes'}
            </button>
            <button onClick={() => onNavigate(AppScreen.SECURITY)} className="w-full py-3 text-gray-500 text-sm hover:text-white transition-colors">
                Central de segurança
            </button>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="w-12 h-12 mx-auto bg-brand-card rounded-xl flex items-center justify-center">
                 <Zap className="text-gray-600" size={24} fill="currentColor" />
            </div>
        </div>
      </div>

      <SelectionModal
        open={isStateModalOpen}
        title="Estado da descoberta"
        options={Object.keys(locations)}
        selected={discoveryState}
        onClose={() => setIsStateModalOpen(false)}
        onSelect={(state) => {
            updateProfile('discoveryState', state);
            updateProfile('discoveryCity', '');
            setIsStateModalOpen(false);
        }}
      />

      <SelectionModal
        open={isCityModalOpen}
        title="Cidade da descoberta"
        options={availableCities}
        selected={discoveryCity}
        onClose={() => setIsCityModalOpen(false)}
        onSelect={(city) => {
            updateProfile('discoveryCity', city);
            setIsCityModalOpen(false);
        }}
      />
    </div>
  );
};

const PreferenceRow = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-start justify-between gap-4 border-t border-white/5 pt-4 first:border-t-0 first:pt-0">
        <div>
            <p className="text-white text-sm font-medium">{label}</p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">{description}</p>
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
);

const SelectionModal = ({ open, title, options, selected, onClose, onSelect }: { open: boolean; title: string; options: string[]; selected: string; onClose: () => void; onSelect: (value: string) => void }) => (
    <Modal open={open} overlayClassName="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center px-4 py-6 animate-in fade-in duration-200">
        <div className="bg-[#1e1e1e] w-full max-w-md rounded-3xl border border-white/10 p-6 relative shadow-2xl max-h-[90vh] flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-1 overflow-y-auto no-scrollbar">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => onSelect(option)}
                        className={`w-full text-left p-4 rounded-xl flex justify-between items-center ${selected === option ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/50' : 'text-gray-300 hover:bg-white/5'}`}
                    >
                        {option}
                        {selected === option && <Check size={18} />}
                    </button>
                ))}
                {options.length === 0 ? <p className="text-sm text-gray-400">Nenhuma opção disponível.</p> : null}
            </div>
        </div>
    </Modal>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
        onClick={onChange}
        className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-200 ${checked ? 'bg-brand-primary' : 'bg-gray-600'}`}
    >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'left-6' : 'left-1'}`}>
            {checked ? null : <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-[10px]">x</span>}
        </div>
    </div>
);
