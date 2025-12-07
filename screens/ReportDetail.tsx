
import React from 'react';
import { AppScreen, ReportTicket } from '../types';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';

interface ReportDetailProps {
  onNavigate: (screen: AppScreen) => void;
  report: ReportTicket | null;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({ onNavigate, report }) => {
  if (!report) return null;

  return (
    <div className="h-full flex flex-col bg-brand-dark">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.REPORT_LIST)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Detalhes da Denúncia</h1>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          {/* Ticket Info */}
          <div className="p-4 bg-brand-card/50 border-b border-white/5 space-y-3">
              <div className="flex justify-between items-start">
                  <div>
                      <h2 className="text-lg font-bold text-white">Denúncia #{report.id.slice(-4)}</h2>
                      <p className="text-gray-400 text-xs">Aberto em {report.date}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      report.status === 'Resolvido' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
                  }`}>
                      {report.status}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-black/20 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Acusado</p>
                      <p className="text-sm text-white">{report.offenderName}</p>
                  </div>
                  <div className="bg-black/20 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Motivo</p>
                      <p className="text-sm text-white">{report.reason}</p>
                  </div>
              </div>
              
              <div className="bg-black/20 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Descrição</p>
                  <p className="text-sm text-gray-300 leading-relaxed italic">"{report.description}"</p>
              </div>
          </div>

          {/* Chat / Updates Area */}
          <div className="flex-1 p-4 space-y-6">
              <div className="flex items-center justify-center gap-2 opacity-50 mb-4">
                  <ShieldCheck size={14} className="text-brand-primary" />
                  <span className="text-xs text-brand-primary font-bold">Chat de Suporte Seguro</span>
              </div>

              {report.updates.map((update) => (
                  <div key={update.id} className={`flex gap-3 ${update.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          update.sender === 'support' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-300'
                      }`}>
                          {update.sender === 'support' ? <ShieldCheck size={16} /> : <User size={16} />}
                      </div>
                      
                      <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                          update.sender === 'support' 
                          ? 'bg-brand-card border border-brand-primary/20 text-gray-200 rounded-tl-none' 
                          : 'bg-gray-800 text-white rounded-tr-none'
                      }`}>
                          <p className="mb-1">{update.text}</p>
                          <span className="text-[10px] opacity-50 block text-right">{update.timestamp}</span>
                      </div>
                  </div>
              ))}
              
              {/* Static "Resolved" message if status is done, or "We are reviewing" if pending */}
              {report.status !== 'Resolvido' && (
                  <div className="flex justify-center pt-4">
                      <p className="text-xs text-gray-600 bg-white/5 px-4 py-2 rounded-full">
                          Aguardando resposta do suporte...
                      </p>
                  </div>
              )}
          </div>
      </div>
      
      {/* Input Area (Disabled for demo purposes as it's a one-way notification usually, or simple interaction) */}
      <div className="p-4 bg-brand-dark border-t border-white/5">
        <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Este chamado está sendo analisado. Você será notificado sobre atualizações.</p>
        </div>
      </div>
    </div>
  );
};
