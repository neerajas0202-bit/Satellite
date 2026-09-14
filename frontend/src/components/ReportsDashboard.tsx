import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  Database, 
  CheckCircle2, 
  Printer, 
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { ReportItem } from '../types';

interface ReportsDashboardProps {
  reports: ReportItem[];
  onViewReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  selectedReportDetail: any | null;
  onCloseDetail: () => void;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  reports,
  onViewReport,
  onDeleteReport,
  selectedReportDetail,
  onCloseDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = reports.filter(r => 
    r.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.analysis_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.dataset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-space-900 border border-space-750 p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-radar-cyan" />
            <h1 className="text-lg font-bold text-white tracking-wide">
              Intelligence Dossiers & Reports
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
              {reports.length} DOSSIERS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Persisted geospatial assessments, execution traces, and verification certificates.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reports by query, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-space-950 border border-space-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-radar-cyan"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="bg-space-900 border border-space-750 hover:border-space-600 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30 font-bold">
                    {report.analysis_type}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{report.confidence}% Conf</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mt-3 line-clamp-2 leading-snug">
                  "{report.query}"
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 font-sans leading-relaxed">
                  {report.key_finding_summary}
                </p>

                <div className="mt-4 pt-3 border-t border-space-750/80 space-y-1 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Database className="w-3 h-3 text-slate-400" />
                      <span>{report.dataset}</span>
                    </span>
                    <span>{report.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{report.date}</span>
                    </span>
                    <span className="text-slate-400">#{report.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4 mt-3 border-t border-space-750">
                <button
                  onClick={() => onViewReport(report.id)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-space-850 hover:bg-space-800 text-xs font-mono text-radar-cyan hover:text-white border border-radar-cyan/30 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <a
                  href={`/api/export/${report.id}?format=html`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 rounded-lg bg-space-850 hover:bg-space-800 text-xs font-mono text-slate-300 hover:text-white border border-space-700 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </a>
                <button
                  onClick={() => onDeleteReport(report.id)}
                  className="p-1.5 rounded-lg bg-space-850 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 border border-space-700 transition-colors"
                  title="Delete Report"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-space-900 border border-space-750 rounded-xl p-12 text-center font-mono">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-300">No Intelligence Reports Found</div>
          <p className="text-xs text-slate-400 mt-1">
            Run natural-language queries in the Analyze dashboard to record verified intelligence dossiers.
          </p>
        </div>
      )}

      {/* Report Inspection Modal */}
      {selectedReportDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-space-900 border border-space-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-space-750">
              <div>
                <div className="text-xs font-mono text-radar-cyan uppercase tracking-wider">
                  SATQUERY AI // INTELLIGENCE DOSSIER
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  Report #{selectedReportDetail.id}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`/api/export/${selectedReportDetail.id}?format=html`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-space-800 hover:bg-space-750 text-slate-200 text-xs font-mono flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print HTML</span>
                </a>
                <button
                  onClick={onCloseDetail}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-space-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[10px] uppercase text-slate-400">Natural-Language Query</div>
                <div className="text-sm font-semibold text-white mt-0.5">"{selectedReportDetail.query}"</div>
              </div>

              <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 font-sans text-xs text-slate-200 leading-relaxed">
                {selectedReportDetail.answer}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded bg-space-850 border border-space-700">
                  <div className="text-[10px] text-slate-400">Confidence</div>
                  <div className="text-sm font-bold text-emerald-400">{selectedReportDetail.confidence}%</div>
                </div>
                <div className="p-2.5 rounded bg-space-850 border border-space-700">
                  <div className="text-[10px] text-slate-400">Task Mode</div>
                  <div className="text-sm font-bold text-radar-cyan">{selectedReportDetail.analysis_mode}</div>
                </div>
                <div className="p-2.5 rounded bg-space-850 border border-space-700">
                  <div className="text-[10px] text-slate-400">Model Engine</div>
                  <div className="text-sm font-bold text-white truncate">{selectedReportDetail.model_used}</div>
                </div>
                <div className="p-2.5 rounded bg-space-850 border border-space-700">
                  <div className="text-[10px] text-slate-400">Timestamp</div>
                  <div className="text-sm font-bold text-slate-300">{selectedReportDetail.created_at?.slice(0, 10)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
