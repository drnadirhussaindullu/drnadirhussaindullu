import React from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Receipt,
  Activity,
  HeartPulse,
  Building,
  ChevronRight,
} from 'lucide-react';
import { Appointment, Language, HospitalInfoData } from '../types';
import { generatePatientHistoryPDF, generateAppointmentPDF } from '../utils/pdfGenerator';

interface PatientHistorySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  patientName: string;
  patientPhone: string;
  hospitalInfo: HospitalInfoData;
  lang: Language;
}

export const PatientHistorySummaryModal: React.FC<PatientHistorySummaryModalProps> = ({
  isOpen,
  onClose,
  appointments,
  patientName,
  patientPhone,
  hospitalInfo,
  lang,
}) => {
  if (!isOpen || appointments.length === 0) return null;

  const isUr = lang === 'ur';

  // Derived statistics
  const primaryAppointment = appointments[0];
  const displayName = patientName || primaryAppointment?.patientName || 'Patient';
  const displayPhone = patientPhone || primaryAppointment?.whatsAppNumber || '+92 340 4777745';
  const displayAge = primaryAppointment?.age ? `${primaryAppointment.age} Yrs` : 'N/A';
  const displayGender = primaryAppointment?.gender ? primaryAppointment.gender.toUpperCase() : 'N/A';

  const totalVisits = appointments.length;
  const completedVisits = appointments.filter((a) => a.status === 'completed').length;
  const activeVisits = appointments.filter((a) => a.status === 'confirmed' || a.status === 'payment_submitted').length;
  const totalFees = appointments.reduce((sum, a) => sum + (a.feePKR || 0), 0);

  const distinctDoctors = Array.from(new Set(appointments.map((a) => a.doctorNameEn).filter(Boolean)));
  const distinctDepts = Array.from(new Set(appointments.map((a) => a.departmentEn).filter(Boolean)));

  const earliestDate = appointments[appointments.length - 1]?.date;
  const latestDate = appointments[0]?.date;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generatePatientHistoryPDF(displayName, displayPhone, appointments, hospitalInfo);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-active-modal">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative border border-teal-200/80 my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Header Bar (no-print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {isUr ? 'مکمل میڈیکل اپائنٹمنٹ ہسٹری سمری کارڈ' : 'Patient Medical History Summary Card'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isUr
                  ? 'گلزار فیملی ہسپتال کے تصدیق شدہ الیکٹرانک ریکارڈز کا خلاصہ'
                  : 'Official Verified Electronic Health Records • Gulzar Family Hospital & Children Center'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download formatted official PDF document"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{isUr ? 'پی ڈی ایف ڈاؤنلوڈ' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-slate-700"
              title="Print formatted medical summary card"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">{isUr ? 'پرنٹ کریں' : 'Print Card'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Summary Card Area */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6 flex-1 bg-slate-50/50">
          
          {/* PRINTABLE CONTAINER TARGET (targeted by #printable-history-card in @media print) */}
          <div id="printable-history-card" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            
            {/* 1. Hospital Header Banner */}
            <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center font-serif font-black text-xl shadow-md shrink-0 border border-teal-500">
                  GFH
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 mb-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>Official Electronic Health Record</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    {hospitalInfo.name}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-teal-800 font-urdu" dir="rtl">
                    {hospitalInfo.nameUr}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {hospitalInfo.addressEn} • 24/7 Emergency & WhatsApp: <span className="font-semibold text-slate-700">{hospitalInfo.phone}</span>
                  </p>
                </div>
              </div>

              <div className="sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Registry Document
                </span>
                <span className="font-mono text-xs font-black text-slate-900 block">
                  GFH-EHR-{displayPhone.replace(/[^0-9]/g, '').slice(-7) || 'REC'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Issued: {new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            {/* 2. Patient Identity & Metrics Hero Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Patient Identity Profile Card */}
              <div className="md:col-span-2 bg-gradient-to-br from-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center font-bold text-lg">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                        {isUr ? 'مریض کا ریکارڈ' : 'Patient Record Profile'}
                      </div>
                      <h2 className="text-xl font-black text-white">{displayName}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-teal-400" />
                        <span>{displayPhone}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active EMR</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Age / Gender</span>
                    <span className="font-bold text-slate-100">{displayAge} / {displayGender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">First Registered</span>
                    <span className="font-bold text-slate-100">{earliestDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Latest Visit</span>
                    <span className="font-bold text-teal-300">{latestDate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* High-level Statistics Card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Care Metrics</span>
                  </span>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md font-mono">
                    {totalVisits} Visits
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Completed Visits:</span>
                    <span className="font-bold text-purple-700">{completedVisits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active / Scheduled:</span>
                    <span className="font-bold text-emerald-700">{activeVisits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Specialists Seen:</span>
                    <span className="font-bold text-slate-800">{distinctDoctors.length}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-700 font-semibold">Total Investment:</span>
                    <span className="font-mono font-black text-teal-800">PKR {totalFees.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Chronological Visit History Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>
                    {isUr ? 'مکمل طبی وزٹس اور اپائنٹمنٹس کی تفصیل' : 'Chronological Medical Visits History'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">({totalVisits})</span>
                </h3>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Sorted by most recent consultation
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-3.5">Token ID</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3.5">Consultant Doctor</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3">Modality & Reason</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3.5 text-right">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt, idx) => (
                      <tr key={appt.id} className={idx % 2 === 0 ? 'bg-white hover:bg-teal-50/40' : 'bg-slate-50/60 hover:bg-teal-50/40'}>
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {appt.id}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{appt.date}</div>
                          <div className="text-[11px] text-teal-700 font-semibold">{appt.time}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900">
                            {isUr ? appt.doctorNameUr : appt.doctorNameEn}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">
                          {isUr ? appt.departmentUr : appt.departmentEn}
                        </td>
                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="font-semibold text-slate-800 text-[11px]">
                            {appt.consultationType === 'hospital_visit'
                              ? isUr
                                ? 'ہسپتال او پی ڈی وزٹ'
                                : 'In-Clinic OPD'
                              : isUr
                              ? 'آن لائن کنسلٹیشن'
                              : 'Telemedicine'}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate" title={appt.reasonForVisit}>
                            {appt.reasonForVisit || 'General Consultation'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {appt.status === 'completed' && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-200">
                              Completed
                            </span>
                          )}
                          {appt.status === 'confirmed' && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                              Confirmed
                            </span>
                          )}
                          {appt.status === 'payment_submitted' && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200">
                              Verifying
                            </span>
                          )}
                          {appt.status === 'pending_payment' && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
                              Pending
                            </span>
                          )}
                          {appt.status === 'cancelled' && (
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-200">
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          PKR {appt.feePKR || 1500}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-200">
                    <tr>
                      <td colSpan={6} className="py-2.5 px-3.5 text-right text-xs">
                        Total Recorded Medical Consultation Fees:
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-teal-800 font-black text-sm">
                        PKR {totalFees.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 4. Clinical Instructions & Legal Footer */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-950 uppercase tracking-wide">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Patient Health Summary Advisory</span>
              </span>
              <p className="text-slate-700 leading-relaxed">
                This document is a certified chronological digest of outpatient registrations and consultations at Gulzar Family Hospital & Children Center, Chowk Azam. Please present this card at follow-up visits or pediatric vaccination check-ins. For 24/7 emergency care or pediatric intensive care (NICU), proceed directly to the Emergency Wing.
              </p>
            </div>

            {/* 5. Stamp & Verification Line */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
              <div>
                <p className="font-bold text-slate-800">Gulzar Family Hospital Electronic Health Record (EHR)</p>
                <p className="text-slate-500 text-[10px]">Computer-generated certified record • No physical signature required</p>
              </div>

              <div className="text-right font-mono text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span>Verification Ref: </span>
                <span className="font-bold text-teal-700">{displayPhone.replace(/\D/g, '').slice(-7) || 'VERIFIED'}</span>
                <span className="text-slate-400"> | 256-Bit SSL Record</span>
              </div>
            </div>

          </div>

          {/* Bottom Action Footer (no-print) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {isUr ? 'بند کریں' : 'Close'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span>{isUr ? 'پرنٹ کریں (Print Card)' : 'Print Summary Card'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isUr ? 'پی ڈی ایف ڈاؤنلوڈ کریں' : 'Download Complete PDF'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
