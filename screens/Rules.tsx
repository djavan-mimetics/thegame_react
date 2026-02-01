import React, { useMemo, useState } from 'react';
import { AppScreen } from '../types';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';
import logoQD from '../src/img/logo_qd.png';

interface RulesProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Rules: React.FC<RulesProps> = ({ onNavigate }) => {
    const steps = useMemo(
        () => [
            {
                step: 'Passo 1',
                title: '🙋‍♂️ Seja Você Mesmo',
                bullets: [
                    'Não seja um vacilão que fica criando perfis fakes pra enganar os outros. Iremos detectar e você será banido. Isso é coisa de otário.'
                ]
            },
            {
                step: 'Passo 2',
                title: '🤝 Seja gentil com seus matches',
                bullets: [
                    'Não xingue ou ofenda o coleguinha. Gentileza gera gentileza. Você não vai conseguir um date ofendendo as pessoas.'
                ]
            },
            {
                step: 'Passo 3',
                title: '🕵️‍♂️ Seja um X9',
                bullets: ['Denuncie comportamento indevido. Ficaremos gratos em banir gente babaca do app.']
            },
            {
                step: 'Passo 4',
                title: '🛡️ Faça sexo seguro',
                bullets: ['Use camisinha. Aqui todo herói usa capa.']
            }
        ],
        []
    );

    const [stepIndex, setStepIndex] = useState(0);
    const current = steps[stepIndex];
    const isLast = stepIndex === steps.length - 1;

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

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{current.step} de 4</p>
                        <div className="flex gap-2">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all ${idx === stepIndex ? 'w-8 bg-brand-primary' : 'w-3 bg-white/10'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-brand-card/40 border border-white/10 rounded-3xl p-6 shadow-lg shadow-black/20">
                        <RuleStep title={current.title} bullets={current.bullets} />
                    </div>
                </div>
      </div>

      <div className="mt-8">
                <Button
                    fullWidth
                    onClick={() => {
                        if (isLast) {
                            onNavigate(AppScreen.REGISTER);
                            return;
                        }
                        setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
                    }}
                >
                    {isLast ? 'Estou de acordo' : 'Continuar'}
                </Button>
      </div>
    </div>
  );
};

const RuleStep = ({ title, bullets }: { title: string; bullets: string[] }) => (
    <div className="flex gap-4">
        <div className="mt-1">
            <Check className="text-brand-primary" size={24} strokeWidth={3} />
        </div>
        <div className="flex-1">
            <h3 className="text-white font-extrabold text-2xl leading-tight mb-4">{title}</h3>
            <ul className="list-disc pl-5 text-gray-200 text-base leading-relaxed space-y-2">
                {bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                ))}
            </ul>
        </div>
    </div>
);
