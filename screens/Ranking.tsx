
import React, { useState } from 'react';
import { RANKING_DATA, LOCATIONS } from '../constants';
import { Trophy, MapPin, X, ChevronDown } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Ranking: React.FC = () => {
  // Default location state (simulating logged user profile)
  const [location, setLocation] = useState({ city: 'Rio de Janeiro', state: 'RJ' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Selection State
  const [selectedState, setSelectedState] = useState<keyof typeof LOCATIONS>('RJ');
  const [selectedCity, setSelectedCity] = useState('Rio de Janeiro');

  const handleStateChange = (newState: string) => {
    const stateKey = newState as keyof typeof LOCATIONS;
    setSelectedState(stateKey);
    // Automatically select the first city of the new state
    if (LOCATIONS[stateKey] && LOCATIONS[stateKey].length > 0) {
        setSelectedCity(LOCATIONS[stateKey][0]);
    }
  };

  const handleSaveLocation = () => {
    setLocation({ city: selectedCity, state: selectedState });
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-brand-dark pt-6 px-4 pb-24 overflow-y-auto no-scrollbar relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pt-4">
        <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Ranking</h1>
            <div className="flex items-center gap-1 text-brand-primary mt-1">
                <MapPin size={14} fill="currentColor" />
                <span className="text-sm font-bold">{location.city}, {location.state}</span>
            </div>
        </div>
        <button 
            onClick={() => {
                setSelectedState(location.state as keyof typeof LOCATIONS);
                setSelectedCity(location.city);
                setIsModalOpen(true);
            }}
            className="p-2 bg-brand-card border border-white/10 rounded-full text-brand-primary hover:bg-white/5 transition-colors"
        >
            <MapPin size={24} />
        </button>
      </div>

      {/* User Card */}
      <div className="bg-gradient-to-r from-brand-card to-brand-dark border border-brand-primary/30 p-4 rounded-2xl mb-6 flex items-center gap-4 shadow-lg shadow-brand-primary/10">
        <div className="w-16 h-16 rounded-full border-2 border-brand-primary p-0.5">
            <img src="https://picsum.photos/100/100?random=99" className="w-full h-full rounded-full object-cover" alt="Eu" />
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-white text-lg">Você</h3>
            <p className="text-gray-400 text-sm">Rank #42 • Pontos 7.4</p>
        </div>
        <div className="text-brand-primary font-bold text-xl">#42</div>
      </div>

      {/* Ranking List */}
      <div className="space-y-4">
        {RANKING_DATA.map((user, index) => {
            let rankColor = "text-white";
            let borderColor = "border-transparent";
            
            if (index === 0) { rankColor = "text-yellow-400"; borderColor = "border-yellow-400"; }
            else if (index === 1) { rankColor = "text-gray-300"; borderColor = "border-gray-300"; }
            else if (index === 2) { rankColor = "text-amber-600"; borderColor = "border-amber-600"; }

            return (
                <div key={user.id} className="flex items-center gap-4 p-3 bg-brand-card/50 rounded-xl hover:bg-brand-card transition-colors border border-transparent hover:border-white/5">
                    <span className={`font-black text-xl w-8 text-center ${rankColor} drop-shadow-sm`}>{index + 1}</span>
                    <div className={`w-12 h-12 rounded-full border-2 p-0.5 ${borderColor}`}>
                        <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-200">{user.name}</h4>
                        <div className="flex items-center gap-1">
                             <Trophy size={12} className="text-brand-primary" />
                             <span className="text-xs text-gray-400">Pontos {user.score}</span>
                        </div>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-semibold text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-colors">
                        Ver
                    </button>
                </div>
            );
        })}
      </div>

    {/* Location Selection Modal */}
        <Modal
            open={isModalOpen}
            overlayClassName="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center px-4 py-6 animate-in fade-in duration-200"
        >
                <div className="bg-[#1e1e1e] w-full max-w-md rounded-3xl border border-white/10 p-6 relative shadow-2xl max-h-[90vh] flex flex-col">
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
                                {Object.keys(LOCATIONS).map(state => (
                                    <option key={state} value={state}>{state}</option>
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
                                {LOCATIONS[selectedState] && LOCATIONS[selectedState].map((city: string) => (
                                    <option key={city} value={city}>{city}</option>
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
    </div>
  );
};
