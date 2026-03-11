
import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../apiClient';

interface ReportProps {
  onNavigate: (screen: AppScreen) => void;
    initialContext?: { name: string; date: string; userId?: string } | null;
}

export const Report: React.FC<ReportProps> = ({ onNavigate, initialContext }) => {
  const [formData, setFormData] = useState({
      name: '',
      date: '',
      reason: '',
      description: ''
  });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialContext) {
        setFormData(prev => ({
            ...prev,
            name: initialContext.name,
            date: initialContext.date
        }));
    } else {
        // Default date to today if no context
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  }, [initialContext]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

            setIsSubmitting(true);
            setSubmitError(null);
            try {
                const res = await apiFetch('/v1/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        offenderName: formData.name,
                        date: formData.date,
                        reason: formData.reason,
                        description: formData.description,
                        accusedUserId: initialContext?.userId ?? null
                    })
                });
                if (!res.ok) {
                    setSubmitError('Nao foi possivel enviar a denuncia. Tente novamente.');
                    return;
                }
                onNavigate(AppScreen.REPORT_LIST);
            } catch {
                setSubmitError('Nao foi possivel enviar a denuncia. Tente novamente.');
            } finally {
                setIsSubmitting(false);
            }
  };

  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.CHAT)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Denunciar Assédio</h1>
      </div>

      <div className="p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 mb-6">
            <AlertTriangle className="text-red-500 shrink-0" />
            <p className="text-xs text-red-200">
                Levamos denúncias muito a sério. Se você estiver em perigo imediato, contate as autoridades locais.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-white font-bold text-sm ml-1">Nome do Acusado</label>
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-brand-card border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none"
                    placeholder="Nome do perfil"
                    required
                    readOnly={!!initialContext} // Read-only if coming from context
                />
            </div>

            <div className="space-y-2">
                <label className="text-white font-bold text-sm ml-1">Data do Ocorrido</label>
                <input 
                    type="text" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-brand-card border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none"
                    required
                    readOnly={!!initialContext}
                />
            </div>

            <div className="space-y-2">
                <label className="text-white font-bold text-sm ml-1">Tipo de Assédio</label>
                <select 
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full bg-brand-card border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none"
                    required
                >
                    <option value="" disabled>Selecione um motivo</option>
                    <option value="Assédio Verbal / Ofensas">Assédio Verbal / Ofensas</option>
                    <option value="Conteúdo Sexual Indesejado">Conteúdo Sexual Indesejado</option>
                    <option value="Ameaça ou Intimidação">Ameaça ou Intimidação</option>
                    <option value="Perfil Falso / Spam">Perfil Falso / Spam</option>
                    <option value="Outro">Outro</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-white font-bold text-sm ml-1">Descrição</label>
                <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-brand-card border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none min-h-[120px]"
                    placeholder="Descreva o que aconteceu com o máximo de detalhes possível..."
                    required
                />
            </div>

            <Button fullWidth type="submit" className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 shadow-none border-none">
                                <Send size={18} /> {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
                        {submitError && <p className="text-center text-xs text-red-300">{submitError}</p>}
        </form>
      </div>
    </div>
  );
};
