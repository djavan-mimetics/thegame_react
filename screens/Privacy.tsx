
import React from 'react';
import { AppScreen } from '../types';
import { ArrowLeft, Lock } from 'lucide-react';

interface PrivacyProps {
  onNavigate: (screen: AppScreen) => void;
  backScreen?: AppScreen;
}

export const Privacy: React.FC<PrivacyProps> = ({ onNavigate, backScreen = AppScreen.WELCOME }) => {
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
        <h1 className="ml-2 text-xl font-bold text-white flex-1 text-center pr-8">Política de Privacidade</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-sm leading-relaxed no-scrollbar">
        <div className="flex justify-center mb-6">
            <Lock size={64} className="text-brand-accent opacity-80" />
        </div>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">1. Coleta de Dados</h2>
            <p>
                Coletamos informações que você nos fornece diretamente, como nome, fotos, biografia e preferências. Também coletamos dados automaticamente, como sua localização (com permissão), endereço IP e dados de uso do dispositivo para melhorar nosso algoritmo de correspondência.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">2. Uso das Informações</h2>
            <p>
                Utilizamos seus dados para:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                <li>Criar e gerenciar sua conta.</li>
                <li>Conectar você com outros usuários próximos.</li>
                <li>Processar pagamentos de serviços Premium.</li>
                <li>Melhorar a segurança e prevenir fraudes.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">3. Compartilhamento</h2>
            <p>
                Não vendemos seus dados pessoais. Compartilhamos informações com terceiros apenas quando necessário para operar o serviço (ex: processadores de pagamento) ou quando exigido por lei.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">4. Geolocalização</h2>
            <p>
                O recurso principal do The Game é conectar pessoas próximas. Coletamos sua geolocalização exata enquanto o aplicativo está em uso para mostrar perfis relevantes. Você pode revogar essa permissão nas configurações do seu dispositivo.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">5. Seus Direitos</h2>
            <p>
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações do aplicativo ou entrando em contato com nosso suporte.
            </p>
        </section>

        <section>
            <h2 className="text-white font-bold text-lg mb-2">6. Segurança de Dados</h2>
            <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado.
            </p>
        </section>

        <div className="pt-8 pb-4 text-center text-xs text-gray-600">
            Última atualização: 24 de Maio de 2024
        </div>
      </div>
    </div>
  );
};
