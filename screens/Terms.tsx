
import React from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface TermsProps {
  onNavigate: (screen: AppScreen) => void;
  backScreen?: AppScreen;
}

export const Terms: React.FC<TermsProps> = ({ onNavigate, backScreen = AppScreen.WELCOME }) => {
  return (
    <div className="h-full flex flex-col bg-brand-dark">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-white/10 bg-brand-card/50 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={() => onNavigate(backScreen)}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-2 text-xl font-bold text-white flex-1 text-center pr-8">Termos de Uso</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-sm leading-relaxed no-scrollbar">
        <div className="flex justify-center mb-6">
            <ShieldCheck size={64} className="text-brand-primary opacity-80" />
        </div>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">1. Aceitação dos Termos</h2>
            <p>
                Ao criar uma conta ou usar o aplicativo "The Game", você concorda em ficar vinculado a estes Termos de Uso. Se você não concordar com todos os termos e condições deste acordo, não use o serviço.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">2. Elegibilidade</h2>
            <p>
                Você deve ter pelo menos 18 anos de idade para criar uma conta no The Game. Ao criar uma conta, você declara e garante que tem capacidade legal para celebrar este contrato vinculativo.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">3. Regras da Comunidade</h2>
            <p>
                O The Game é um espaço para conexões autênticas. Você concorda em NÃO:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                <li>Assediar, intimidar ou difamar outros usuários.</li>
                <li>Publicar conteúdo ilegal, pornográfico ou de ódio.</li>
                <li>Usar o serviço para fins comerciais sem autorização.</li>
                <li>Falsificar sua identidade ou idade.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">4. Segurança</h2>
            <p>
                Embora nos esforcemos para incentivar uma experiência respeitosa, não somos responsáveis pela conduta de nenhum usuário dentro ou fora do serviço. Você é o único responsável por suas interações com outros usuários. Use o bom senso e siga nossas dicas de segurança.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">5. Compras e Assinaturas</h2>
            <p>
                O aplicativo oferece produtos e serviços para compra ("Compras no App"). Se você optar por fazer uma compra no app, você será solicitado a confirmar sua compra com o provedor de pagamento aplicável.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">6. Rescisão</h2>
            <p>
                Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.
            </p>
        </section>

        <div className="pt-8 pb-4 text-center text-xs text-gray-600">
            Última atualização: 24 de Maio de 2024
        </div>
      </div>
    </div>
  );
};
