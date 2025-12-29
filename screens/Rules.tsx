
import React from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';
import logoQD from '../src/img/logo_qd.png';

interface RulesProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Rules: React.FC<RulesProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col bg-brand-dark p-8">
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-center mb-8">
                    <img 
                        src={`${logoQD}?v=${__APP_BUILD_ID__}`} 
                        alt="Logomarca The Game" 
                        className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(233,30,99,0.35)]" 
                    />
                </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Bem Vindo ao The Game!</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-10">Por favor, siga estas regras!</p>

        <div className="space-y-8">
            <RuleItem 
                title="Seja você mesmo" 
                desc="Certifique-se de que suas fotos, idade e biografia sejam fiéis a quem você é."
            />
            <RuleItem 
                title="Faça sexo seguro" 
                desc="Use camisinha. Aqui todo herói usa capa."
            />
            <RuleItem 
                title="Converse com calma" 
                desc="Respeite os outros e trate-os como gostaria de ser tratado."
            />
            <RuleItem 
                title="Seja proativo" 
                desc="Sempre relate mau comportamento."
            />
        </div>
      </div>

      <div className="mt-8">
        <Button fullWidth onClick={() => onNavigate(AppScreen.REGISTER)}>
            Estou de acordo
        </Button>
      </div>
    </div>
  );
};

const RuleItem = ({ title, desc, linkText }: { title: string, desc: string, linkText?: string }) => (
    <div className="flex gap-4">
        <div className="mt-1">
            <Check className="text-brand-primary" size={24} strokeWidth={3} />
        </div>
        <div>
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
                {linkText ? (
                    <>
                        {desc.replace(linkText, '')}
                        <span className="text-blue-500 font-bold cursor-pointer">{linkText}</span>
                    </>
                ) : desc}
            </p>
        </div>
    </div>
);
