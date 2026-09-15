import React, { useState } from 'react';
import { Appointment, Language, HospitalInfoData } from '../types';
import {
  Search,
  Calendar,
  Clock,
  Phone,
  MapPin,
  MessageSquare,
  CreditCard,
  Printer,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Loader2,
  Download,
  Sparkles,
  ShieldCheck,
  User,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { generateAppointmentPDF, generatePatientHistoryPDF } from '../utils/pdfGenerator';
import { PatientHistorySummaryModal } from './PatientHistorySummaryModal';

interface PatientPortalProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  onPayNow: (appointment: Appointment) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  hospitalInfo,
  lang,
  onPayNow,
}) => {
  const isUr = lang === 'ur';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedSlipAppointment, setSelectedSlipAppointment] = useState<Appointment | null>(null);

  // Medical History Summary State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [showInlineHistoryCard, setShowInlineHistoryCard] = useState<boolean>(false);

  // Reschedule Modal State
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('11:00 AM');
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);

  const executeSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/appointments/search?query=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSearch(searchQuery);
  };

  const handleDemoSearch = (query: string) => {
    setSearchQuery(query);
    executeSearch(query);
  };

  const handleDownloadEntireHistoryPDF = () => {
    if (searchResults.length === 0) return;
    const name = searchResults[0]?.patientName || 'Patient';
    const phone = searchResults[0]?.whatsAppNumber || '';
    generatePatientHistoryPDF(name, phone, searchResults, hospitalInfo);
  };

  const handlePrintHistory = () => {
    setIsHistoryModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (
      !window.confirm(
        isUr
          ? 'کیا آپ واقعی یہ اپائنٹمنٹ منسوخ کرنا چاہتے ہیں؟'
          : 'Are you sure you want to cancel this appointment?'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${apptId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSearchResults((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, status: 'cancelled' } : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppointment || !newDate || !newTime) return;

    setIsRescheduling(true);
    try {
      const res = await fetch(`/api/appointments/${reschedulingAppointment.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, time: newTime }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResults((prev) =>
          prev.map((a) => (a.id === data.appointment.id ? data.appointment : a))
        );
        setReschedulingAppointment(null);
      } else {
        alert(data.error || 'Failed to reschedule');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUr ? '✅ تصدیق شدہ' : '✅ CONFIRMED'}</span>
          </span>
        );
      case 'payment_submitted':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{isUr ? 'ادائیگی جمع شد - زیر تصدیق' : 'Payment Submitted'}</span>
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{isUr ? 'غیر تصدیق شدہ - فیس واجب الادا' : 'Pending Payment'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{isUr ? 'منسوخ شدہ' : 'Cancelled'}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-300">
            <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>{isUr ? 'معائنہ مکمل' : 'Completed'}</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900">
          {isUr ? 'مریضوں کا پورٹل - اپائنٹمنٹ تلاش کریں' : 'Patient Portal & Appointments'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans">
          {isUr
            ? 'اپنا واٹس ایپ نمبر (+92...) یا اپائنٹمنٹ آئی ڈی (GFH-2026-...) درج کر کے اپنی اپائنٹمنٹ کی صورتحال دیکھیں۔'
            : 'Enter your WhatsApp number or Appointment ID to view status, reschedule, or download slip.'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto space-y-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUr
                  ? 'واٹس ایپ نمبر یا اپائنٹمنٹ نمبر درج کریں (مثلاً GFH-2026-101 یا +92300...)'
                  : 'Enter WhatsApp Number (+92300...) or Appointment ID (GFH-2026-101)...'
              }
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold shadow-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-teal-400" /> : <Search className="w-4 h-4 text-teal-400" />}
            <span>{isUr ? 'تلاش کریں' : 'Search'}</span>
          </button>
        </form>

        {/* Quick Demo History Shortcuts */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{isUr ? 'نمونہ مریض تاریخ:' : 'Quick Patient History:'}</span>
          </span>
          <button
            type="button"
            onClick={() => handleDemoSearch('+923001234567')}
            className="bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <User className="w-3 h-3 text-teal-600" />
            <span>Ali Raza (+923001234567)</span>
            <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">3 visits</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSearch('+923405551234')}
            className="bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <User className="w-3 h-3 text-teal-600" />
            <span>Fatima Bibi (+923405551234)</span>
            <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">2 visits</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          
          {/* TOP FORMATTED MEDICAL APPOINTMENT HISTORY SUMMARY CARD BANNER */}
          {searchResults.length > 0 && (
            <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-teal-700/50 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                {/* Left: Patient Profile Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-teal-300" />
                      <span>{isUr ? 'سرکاری میڈیکل ہسٹری کارڈ' : 'Verified Medical History Card'}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      GFH-EHR-{(searchResults[0]?.whatsAppNumber || '').replace(/[^0-9]/g, '').slice(-7) || 'REC'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {searchResults[0]?.patientName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <span className="font-mono">{searchResults[0]?.whatsAppNumber}</span>
                    </span>
                    <span>•</span>
                    <span>Age / Gender: <strong className="text-white">{searchResults[0]?.age} Yrs / {searchResults[0]?.gender?.toUpperCase()}</strong></span>
                    <span>•</span>
                    <span>Registered Visits: <strong className="text-teal-300">{searchResults.length} Total</strong></span>
                  </div>
                </div>

                {/* Right: Key Stats & Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                  <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg hover:shadow-teal-500/20 cursor-pointer"
                    title="View Formatted Medical History Summary Card"
                  >
                    <FileText className="w-4 h-4 text-slate-950" />
                    <span>{isUr ? 'میڈیکل سمری کارڈ دیکھیں' : 'View History Card'}</span>
                  </button>

                  <button
                    onClick={handleDownloadEntireHistoryPDF}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-teal-800/80 hover:bg-teal-700 text-white font-bold px-4 py-3 rounded-2xl text-xs uppercase tracking-wider transition border border-teal-600/50 shadow-sm cursor-pointer"
                    title="Download Official Multi-Visit History PDF"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>{isUr ? 'تمام ریکارڈ پی ڈی ایف' : 'Download All PDF'}</span>
                  </button>

                  <button
                    onClick={handlePrintHistory}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-2xl text-xs uppercase tracking-wider transition border border-slate-700 shadow-sm cursor-pointer"
                    title="Print Entire History Summary Card"
                  >
                    <Printer className="w-4 h-4 text-teal-400" />
                    <span>{isUr ? 'پرنٹ سمری' : 'Print Summary'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Quick Metric Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Consultations</span>
                  <span className="text-base font-bold text-teal-300 font-mono">{searchResults.length} Visits</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completed Visits</span>
                  <span className="text-base font-bold text-purple-300 font-mono">
                    {searchResults.filter((a) => a.status === 'completed').length} Visits
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active / Confirmed</span>
                  <span className="text-base font-bold text-emerald-300 font-mono">
                    {searchResults.filter((a) => a.status === 'confirmed' || a.status === 'payment_submitted').length}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Outlay</span>
                  <span className="text-base font-bold text-white font-mono">
                    PKR {searchResults.reduce((sum, a) => sum + (a.feePKR || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Inline Preview Toggle */}
              <div className="pt-3 mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInlineHistoryCard(!showInlineHistoryCard)}
                  className="text-xs text-teal-300 hover:text-white font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>{showInlineHistoryCard ? (isUr ? 'سمری کارڈ چھپائیں' : 'Collapse Inline Summary Card') : (isUr ? 'مکمل سمری کارڈ کھولیں' : 'Expand Formatted Summary Card')}</span>
                  {showInlineHistoryCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* INLINE FORMATTED SUMMARY CARD VIEW (WHEN EXPANDED) */}
              {showInlineHistoryCard && (
                <div className="mt-5 pt-5 border-t border-slate-800 animate-in fade-in duration-200">
                  <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-sm border border-teal-200 space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="text-base font-black text-slate-900">
                          {hospitalInfo.name} — {isUr ? 'مریض کا طبی خلاصہ' : 'Patient Clinical History Summary'}
                        </h4>
                        <p className="text-xs text-slate-500 font-urdu" dir="rtl">{hospitalInfo.nameUr}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadEntireHistoryPDF}
                          className="px-3 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-teal-900 transition"
                        >
                          <Download className="w-3 h-3 text-amber-300" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={handlePrintHistory}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-black transition"
                        >
                          <Printer className="w-3 h-3 text-teal-400" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                          <tr>
                            <th className="py-2.5 px-3">Token Ref</th>
                            <th className="py-2.5 px-3">Date & Time</th>
                            <th className="py-2.5 px-3">Doctor & Specialty</th>
                            <th className="py-2.5 px-3">Modality & Reason</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-right">Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {searchResults.map((a, i) => (
                            <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{a.id}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-900 block">{a.date}</span>
                                <span className="text-[10px] text-teal-700 font-bold">{a.time}</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 block">{isUr ? a.doctorNameUr : a.doctorNameEn}</span>
                                <span className="text-[10px] text-slate-500">{isUr ? a.departmentUr : a.departmentEn}</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-700 block">
                                  {a.consultationType === 'hospital_visit' ? 'In-Clinic OPD' : 'Telemedicine'}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate block max-w-[180px]">{a.reasonForVisit}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {getStatusBadge(a.status)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                PKR {a.feePKR}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {isUr ? `تلاش کے نتائج (${searchResults.length})` : `Individual Appointment Slips (${searchResults.length})`}
            </h3>
            {searchResults.length > 0 && (
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isUr ? 'مکمل ہسٹری سمری کارڈ کھولیں' : 'Open Full Medical History Card'}</span>
              </button>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">
                {isUr ? 'کوئی اپائنٹمنٹ نہیں ملی۔' : 'No appointments found.'}
              </p>
              <p className="text-xs text-slate-500">
                {isUr
                  ? 'براہ کرم درج کیا گیا واٹس ایپ نمبر یا اپائنٹمنٹ آئی ڈی دوبارہ چیک کریں۔'
                  : 'Please double check the entered WhatsApp number or Appointment ID.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                        {appt.id}
                      </span>
                      {getStatusBadge(appt.status)}
                      <span className="text-xs text-slate-500 font-medium">
                        {appt.consultationType === 'hospital_visit'
                          ? isUr
                            ? 'ہسپتال وزٹ'
                            : 'Hospital Visit'
                          : isUr
                          ? 'آن لائن کنسلٹیشن'
                          : 'Online Consultation'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-serif text-slate-900">
                        {isUr ? appt.doctorNameUr : appt.doctorNameEn}
                      </h4>
                      <p className="text-xs text-[#0D9488] font-bold">
                        {isUr ? appt.departmentUr : appt.departmentEn}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Patient</span>
                        <span className="font-bold text-slate-900">{appt.patientName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Date & Time</span>
                        <span className="font-semibold text-[#0D9488]">
                          {appt.date} @ {appt.time}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Fee</span>
                        <span className="font-bold text-slate-900 font-mono">PKR {appt.feePKR}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => generateAppointmentPDF(appt, hospitalInfo)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Download formatted official PDF receipt"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isUr ? 'پی ڈی ایف ڈاؤنلوڈ' : 'Download PDF'}</span>
                    </button>

                    <button
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      title="View Patient's Full Appointment History Summary Card"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-700" />
                      <span>{isUr ? 'ہسٹری کارڈ' : 'History Card'}</span>
                    </button>

                    {appt.status === 'pending_payment' && (
                      <button
                        onClick={() => onPayNow(appt)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-[#0D9488] hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isUr ? 'فیس جمع کریں' : 'Pay Now'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedSlipAppointment(appt)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isUr ? 'سلپ پرنٹ کریں' : 'Print Slip'}</span>
                    </button>

                    {appt.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setReschedulingAppointment(appt);
                          setNewDate(appt.date);
                          setNewTime(appt.time);
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                        <span>{isUr ? 'تاریخ تبدیل کریں' : 'Reschedule'}</span>
                      </button>
                    )}

                    {appt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isUr ? 'منسوخ کریں' : 'Cancel'}</span>
                      </button>
                    )}

                    <a
                      href={`https://wa.me/923404777745?text=${encodeURIComponent(
                        `Assalam-o-Alaikum, I have a query regarding my Appointment ID: ${appt.id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-[#0D9488] px-3 py-2 rounded-xl text-xs font-bold transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{isUr ? 'واٹس ایپ' : 'WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {isUr ? 'اپائنٹمنٹ تبدیل کریں (Reschedule)' : 'Reschedule Appointment'}
            </h3>
            <p className="text-xs text-slate-500">
              Appointment ID: {reschedulingAppointment.id} ({reschedulingAppointment.patientName})
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Time Slot
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                >
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingAppointment(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  {isRescheduling ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE SLIP MODAL */}
      {selectedSlipAppointment && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full space-y-6 shadow-2xl relative border border-emerald-200 my-8">
            <button
              onClick={() => setSelectedSlipAppointment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2"
            >
              ✕
            </button>

            {/* Printable Area */}
            <div id="printable-slip" className="space-y-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                  GFH
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  {hospitalInfo.name}
                </h2>
                <p className="text-sm font-bold text-emerald-800 font-serif" dir="rtl">
                  {hospitalInfo.nameUr}
                </p>
                <p className="text-[11px] text-slate-500">
                  {hospitalInfo.addressEn}
                </p>
                <p className="text-[11px] text-emerald-700 font-mono">
                  Emergency & WhatsApp: {hospitalInfo.phone}
                </p>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Appointment Slip ID</span>
                  <span className="font-mono font-black text-sm text-slate-900">{selectedSlipAppointment.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                  <span className="font-bold text-emerald-700 uppercase">{selectedSlipAppointment.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSlipAppointment.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Age / Gender</span>
                  <span className="font-semibold text-slate-800">{selectedSlipAppointment.age} Yrs / {selectedSlipAppointment.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Doctor</span>
                  <span className="font-bold text-slate-900">{selectedSlipAppointment.doctorNameEn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                  <span className="font-semibold text-emerald-800">{selectedSlipAppointment.departmentEn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date & Time Slot</span>
                  <span className="font-bold text-emerald-900">{selectedSlipAppointment.date} @ {selectedSlipAppointment.time}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Fee Paid</span>
                  <span className="font-black text-slate-900 font-mono">PKR {selectedSlipAppointment.feePKR}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <p>Please reach 10 minutes prior to your time slot.</p>
                <span className="font-mono text-[9px]">Printed on {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedSlipAppointment(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => generateAppointmentPDF(selectedSlipAppointment, hospitalInfo)}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Official PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PATIENT MEDICAL HISTORY SUMMARY MODAL */}
      <PatientHistorySummaryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        appointments={searchResults}
        patientName={searchResults[0]?.patientName || 'Patient'}
        patientPhone={searchResults[0]?.whatsAppNumber || ''}
        hospitalInfo={hospitalInfo}
        lang={lang}
      />

    </div>
  );
};
