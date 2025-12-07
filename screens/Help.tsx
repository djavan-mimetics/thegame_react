
import React from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Mail, ChevronRight } from 'lucide-react';

interface HelpProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Help: React.FC<HelpProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.SECURITY)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Ajuda e Suporte</h1>
      </div>

      <div className="p-4 space-y-8">
        
        {/* Contact Support */}
        <section>
            <h2 className="text-lg font-bold text-white mb-2">Como podemos ajudar?</h2>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Fale com nossa equipe por e-mail.<br/>
                Responderemos o quanto antes.
            </p>
            <button className="w-full bg-brand-card border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-300" />
                    <span className="text-white font-medium">Enviar e-mail para suporte</span>
                </div>
                <ChevronRight size={18} className="text-gray-600 group-hover:text-brand-primary transition-colors" />
            </button>
        </section>

        {/* FAQ */}
        <section>
            <h2 className="text-lg font-bold text-white mb-4">FAQ</h2>
            <div className="space-y-6">
                
                <FaqItem 
                    question="Como funciona o Match?" 
                    answer='Quando duas pessoas se curtem (deslizam para a direita), acontece um "Match". A partir desse momento, vocês podem conversar livremente pelo chat.' 
                />

                <FaqItem 
                    question="O que é o Superlike?" 
                    answer='O Superlike (botão de coração maior) é uma forma de mostrar que você realmente gostou de alguém. O perfil dessa pessoa será notificado imediatamente sobre seu interesse.' 
                />

                <FaqItem 
                    question="Como denunciar um perfil suspeito?" 
                    answer='Vá até o perfil do usuário, toque no ícone de escudo ou opções (três pontos) e selecione "Denunciar". Nossa equipe de segurança analisará o caso.' 
                />

                <FaqItem 
                    question="Posso recuperar um perfil que deslizei para a esquerda?" 
                    answer='Sim, se você tiver uma assinatura Premium ativa, pode usar a função "Voltar" (ícone de seta giratória) para desfazer sua última ação.' 
                />

                <FaqItem 
                    question="Minhas conversas são privadas?" 
                    answer='Sim, suas mensagens são criptografadas e visíveis apenas para você e seu Match. Nunca compartilhamos o conteúdo das suas conversas com terceiros.' 
                />

                <FaqItem 
                    question="Como funcionam as assinaturas?" 
                    answer='Oferecemos planos Mensal, Semestral e Anual. As assinaturas renovam automaticamente, mas você pode cancelar a renovação a qualquer momento nas configurações do seu celular ou na área Premium.' 
                />

                <FaqItem 
                    question="Dicas de segurança para encontros reais" 
                    answer='Sempre marque o primeiro encontro em local público, avise um amigo sobre onde você vai e nunca envie dinheiro para pessoas que você conheceu online.' 
                />

            </div>
        </section>

      </div>
    </div>
  );
};

const FaqItem = ({ question, answer }: { question: string, answer: string }) => (
    <div className="border-b border-white/5 pb-4 last:border-0">
        <h3 className="text-white font-bold text-sm mb-1">{question}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">{answer}</p>
    </div>
);
