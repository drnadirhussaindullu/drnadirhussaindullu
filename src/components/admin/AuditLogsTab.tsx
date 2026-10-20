import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  Download,
  CheckCircle2,
  Terminal,
  Activity,
  Globe,
  User,
} from 'lucide-react';
import { AuditLogEntry, Language } from '../../types';

interface AuditLogsTabProps {
  lang: Language;
  token: string;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ lang, token }) => {
  const isUr = lang === 'ur';

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?limit=150&filter=${filterCategory}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token, filterCategory]);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      (log.affectedRecord || '').toLowerCase().includes(q) ||
      (log.ipAddress || '').includes(q)
    );
  });

  const exportAuditLogJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_logs_gfh_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isUr ? 'ناقابل تنسیخ آڈٹ ٹریل' : 'Immutable Security Audit Trail'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {isUr ? 'ہسپتال کی تمام انتظامی سرگرمیوں کا خودکار ریکارڈ' : 'Administrative Activity & Compliance Audit Log'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {isUr
              ? 'ہر لاگ ان، اپائنٹمنٹ تصدیق، اسٹیٹس کی تبدیلی، فیس ری فنڈ اور ایڈمن کھاتوں کی تبدیلی کا وقت، نام اور IP ایڈریس سمیت ریکارڈ۔'
              : 'Every administrative action, authentication attempt, appointment status update, refund and credential change is cryptographically logged with IP and actor identity.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportAuditLogJson}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isUr ? 'لاگ فائل محفوظ کریں' : 'Export Logs JSON'}</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs transition cursor-pointer shadow-md"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUr ? 'ایکشن، ایڈمن کا نام، ریکارڈ آئی ڈی یا IP تلاش کریں...' : 'Search by action, administrator, record ID or IP address...'}
            className="w-full ps-9 pe-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{isUr ? 'فلٹر:' : 'Filter:'}</span>
          </span>
          {[
            { id: 'all', labelEn: 'All Actions', labelUr: 'تمام' },
            { id: 'appointment', labelEn: 'Appointments & Status', labelUr: 'اپائنٹمنٹس' },
            { id: 'admin', labelEn: 'Admins & RBAC', labelUr: 'ایڈمن اکاؤنٹس' },
            { id: 'auth', labelEn: 'Login & Security', labelUr: 'لاگ ان سیکیورٹی' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isUr ? cat.labelUr : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 text-start">{isUr ? 'وقت اور تاریخ' : 'Timestamp'}</th>
                <th className="py-3 px-4 text-start">{isUr ? 'ایڈمنسٹریٹر (Actor)' : 'Actor'}</th>
                <th className="py-3 px-4 text-start">{isUr ? 'سرگرمی (Action Performed)' : 'Action Details'}</th>
                <th className="py-3 px-4 text-start">{isUr ? 'متاثرہ ریکارڈ' : 'Target Record'}</th>
                <th className="py-3 px-4 text-start">{isUr ? 'IP ایڈریس' : 'Origin IP'}</th>
                <th className="py-3 px-4 text-end">{isUr ? 'تفصیل' : 'Inspect'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                    {loading ? (isUr ? 'لاگز لوڈ ہو رہے ہیں...' : 'Loading audit trail records...') : (isUr ? 'کوئی لاگ ریکارڈ موجود نہیں' : 'No audit entries match the current filter.')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuper = log.userRole === 'super_admin';
                  return (
                    <tr key={log.id} className="hover:bg-indigo-50/40 transition">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] font-mono text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(log.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSuper ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                          />
                          <div className="font-bold text-slate-900 text-[11px]">{log.userName}</div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isSuper
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {log.userRole === 'super_admin' ? 'Super' : 'Admin'}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4">
                        <div className="text-slate-900 font-semibold text-xs max-w-md line-clamp-2">
                          {log.action}
                        </div>
                        {log.previousValue && log.newValue && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                            <span className="text-rose-600 line-through">{log.previousValue}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                            <span className="text-emerald-600 font-bold">{log.newValue}</span>
                          </div>
                        )}
                      </td>

                      {/* Affected Record */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-indigo-700 font-semibold">
                        {log.affectedRecord || '—'}
                      </td>

                      {/* Origin IP */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </td>

                      {/* Inspect */}
                      <td className="py-3 px-4 text-end">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer"
                        >
                          {isUr ? 'دیکھیں' : 'View'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  {isUr ? 'آڈٹ لاگ تفصیلی ریکارڈ' : 'Audit Trail Inspection'}
                </h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Entry ID:</span>
                  <span className="text-slate-900 font-bold">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-900">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actor:</span>
                  <span className="text-indigo-600 font-bold">{selectedLog.userName} ({selectedLog.userRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID:</span>
                  <span className="text-slate-700">{selectedLog.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="text-slate-700">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 mb-1">{isUr ? 'تفصیل ایکشن:' : 'Action Performed:'}</div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-950 font-medium">
                  {selectedLog.action}
                </div>
              </div>

              {selectedLog.affectedRecord && (
                <div>
                  <div className="font-bold text-slate-700 mb-1">{isUr ? 'متاثرہ ریکارڈ / اینٹیٹی:' : 'Affected Record ID:'}</div>
                  <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-slate-800">
                    {selectedLog.affectedRecord}
                  </div>
                </div>
              )}

              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 mb-1">Previous Value:</div>
                    <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-mono text-[10px] break-all">
                      {selectedLog.previousValue || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 mb-1">New Value:</div>
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-mono text-[10px] break-all">
                      {selectedLog.newValue || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                {isUr ? 'بند کریں' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
