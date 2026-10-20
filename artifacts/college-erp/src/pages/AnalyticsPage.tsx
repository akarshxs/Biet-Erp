import { BarChart3, Database } from 'lucide-react';

export default function AnalyticsPage({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Center</h1>
        <p className="text-sm text-slate-400">Institutional insights and reporting.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-16 text-center flex flex-col items-center justify-center border-dashed">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
            <Database className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight mb-2">Insufficient Data Pipeline</h3>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            The analytics engine requires more data points to generate meaningful institutional insights. Connect more data sources or wait for the system to populate.
          </p>
        </div>
      </div>
    </div>
  );
}
