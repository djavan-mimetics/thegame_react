
import React from 'react';
import { AppScreen, ReportTicket } from '../types';
import { ArrowLeft, Flag, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportListProps {
  onNavigate: (screen: AppScreen) => void;
  reports: ReportTicket[];
  onSelectReport: (id: string) => void;
}

export const ReportList: React.FC<ReportListProps> = ({ onNavigate, reports, onSelectReport }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-brand-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-brand-dark z-20 border-b border-white/5">
        <button onClick={() => onNavigate(AppScreen.SECURITY)} className="text-gray-400 p-2 -ml-2 hover:text-white transition-colors">
            <ArrowLeft />
        </button>
        <h1 className="font-bold text-white text-lg ml-2">Minhas Denúncias</h1>
      </div>

      <div className="p-4 space-y-4">
        {reports.length > 0 ? (
            reports.map((report) => (
                <button 
                    key={report.id}
                    onClick={() => onSelectReport(report.id)}
                    className="w-full bg-brand-card border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group text-left"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                            <Flag size={20} className="text-red-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white text-sm">{report.offenderName}</span>
                                <StatusBadge status={report.status} />
                            </div>
                            <p className="text-gray-400 text-xs line-clamp-1">{report.reason}</p>
                            <p className="text-gray-600 text-[10px] mt-1">{report.date}</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-white" />
                </button>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Flag size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-400 font-bold">Nenhuma denúncia realizada</p>
                <p className="text-gray-600 text-xs mt-2 text-center max-w-[200px]">
                    Suas denúncias aparecerão aqui para acompanhamento.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = "bg-gray-700 text-gray-300";
    let icon = <Clock size={10} />;

    if (status === 'Pendente') {
        colorClass = "bg-yellow-500/20 text-yellow-500";
        icon = <Clock size={10} />;
    } else if (status === 'Em Análise') {
        colorClass = "bg-blue-500/20 text-blue-500";
        icon = <AlertCircle size={10} />;
    } else if (status === 'Resolvido') {
        colorClass = "bg-green-500/20 text-green-500";
        icon = <CheckCircle2 size={10} />;
    }

    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colorClass}`}>
            {icon} {status}
        </span>
    );
};
