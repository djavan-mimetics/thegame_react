
import React from 'react';
import { AppScreen } from '../types';
import { MOCK_PAYMENTS } from '../constants';
import { ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard } from 'lucide-react';

interface PaymentHistoryProps {
  onNavigate: (screen: AppScreen) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.PREMIUM)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Extrato de Pagamentos</h1>
      </div>

      <div className="p-4 space-y-4">
        {MOCK_PAYMENTS.length > 0 ? (
            MOCK_PAYMENTS.map((payment) => (
                <div key={payment.id} className="bg-brand-card border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payment.status === 'Pago' ? 'bg-green-500/10 text-green-500' : 
                            payment.status === 'Falha' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                            {payment.status === 'Pago' && <CheckCircle2 size={20} />}
                            {payment.status === 'Falha' && <XCircle size={20} />}
                            {payment.status === 'Pendente' && <Clock size={20} />}
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{payment.plan}</p>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                {payment.date} • <CreditCard size={10} /> **** {payment.cardLast4}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-bold text-sm">{payment.amount}</p>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                             payment.status === 'Pago' ? 'bg-green-500/20 text-green-500' : 
                             payment.status === 'Falha' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                            {payment.status}
                        </span>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-10">
                <p className="text-gray-500">Nenhum pagamento encontrado.</p>
            </div>
        )}
      </div>
    </div>
  );
};
