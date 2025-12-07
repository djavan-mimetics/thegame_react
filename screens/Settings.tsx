
import React, { useState } from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, MapPin, Zap } from 'lucide-react';

interface SettingsProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [distance, setDistance] = useState(35);
  const [ageRange, setAgeRange] = useState([18, 94]);
  const [isInternational, setIsInternational] = useState(false);

  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.PROFILE)} className="text-gray-400 p-2 -ml-2">
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
                <h3 className="text-white font-medium">Localização</h3>
                <span className="text-blue-500 text-sm font-bold cursor-pointer">Minha localização atual</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">
                Altere sua localização e veja membros do Tinder de outras cidades.
            </p>
            <div className="flex items-center justify-between py-3 border-t border-gray-700">
                <span className="text-white text-sm">Internacional</span>
                <Toggle checked={isInternational} onChange={() => setIsInternational(!isInternational)} />
            </div>
            {isInternational && (
                <p className="text-gray-500 text-xs mt-2">
                    Ao escolher o modo internacional, você poderá ver perfis de pessoas perto de você e pelo mundo.
                </p>
            )}
        </div>

        {/* Distance Slider */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Distância máxima</h3>
                <span className="text-white font-bold">{distance}km</span>
            </div>
            
            <input 
                type="range" 
                min="1" 
                max="100" 
                value={distance} 
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary mb-6"
            />

            <div className="flex items-center justify-between">
                <span className="text-gray-200 text-sm max-w-[200px]">Mostrar pessoas mais longe de mim se eu ficar sem perfis pra ver</span>
                <Toggle checked={true} onChange={() => {}} />
            </div>
        </div>

        {/* Interest */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5">
            <h3 className="text-white font-bold mb-2">Tem interesse em</h3>
            <div className="flex justify-between items-center cursor-pointer">
                <span className="text-gray-300">Mulheres</span>
                <span className="text-gray-500">›</span>
            </div>
        </div>

        {/* Age Range */}
        <div className="bg-brand-card rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Faixa etária</h3>
                <span className="text-white font-bold">{ageRange[0]} - {ageRange[1]}</span>
            </div>
            
            {/* Mock Dual Slider visual */}
            <div className="relative w-full h-1 bg-gray-700 rounded-lg mb-6">
                <div className="absolute left-[0%] right-[5%] h-full bg-brand-primary rounded-lg"></div>
                <div className="absolute left-[0%] top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-primary rounded-full shadow cursor-pointer"></div>
                <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-primary rounded-full shadow cursor-pointer"></div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-gray-200 text-sm max-w-[220px]">Mostrar pessoas um pouco fora da minha faixa de preferência se eu ficar sem perfis pra ver</span>
                <Toggle checked={false} onChange={() => {}} />
            </div>
        </div>

        <div className="text-center pt-4 pb-8 space-y-4">
            <button className="w-full py-3 bg-white/5 rounded-lg text-white font-bold hover:bg-white/10 transition-colors">
                Desconectar
            </button>
            <button className="w-full py-3 text-gray-500 text-sm hover:text-white transition-colors">
                Excluir conta
            </button>
            <div className="w-12 h-12 mx-auto bg-brand-card rounded-xl flex items-center justify-center">
                 <Zap className="text-gray-600" size={24} fill="currentColor" />
            </div>
        </div>
      </div>
    </div>
  );
};

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
