import React, { useEffect } from 'react';
import { Doctor, Language, HospitalInfoData } from '../types';
import {
  X,
  Award,
  GraduationCap,
  Briefcase,
  Clock,
  Calendar,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Globe,
  Sparkles,
  ChevronRight,
  Video,
  Building2,
  FileBadge,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectDoctorToBook: (doctor: Doctor) => void;
  hospitalInfo?: HospitalInfoData;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  isOpen,
  onClose,
  lang,
  onSelectDoctorToBook,
  hospitalInfo,
}) => {
  const isUr = lang === 'ur';

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doctor) return null;

  const phone = hospitalInfo?.phone || '+92 340 4777745';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Assalam-o-Alaikum, I would like to inquire about an appointment with ${doctor.nameEn} (${doctor.specialtyEn}) at Gulzar Family Hospital Chowk Azam.`
  )}`;

  const specializations = isUr && doctor.specializationsUr ? doctor.specializationsUr : doctor.specializationsEn || [];
  const bio = isUr && doctor.bioUr ? doctor.bioUr : doctor.bioEn;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col"
        >
          {/* Top Banner Header with Close button */}
          <div className="relative bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-7 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-8">
              {/* Avatar with verified badge */}
              <div className="relative shrink-0">
                <img
                  src={doctor.avatarUrl}
                  alt={doctor.nameEn}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-teal-300/40 shadow-lg"
                />
                {doctor.isAvailable ? (
                  <span className="absolute -bottom-2 -right-1 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{isUr ? 'دستیاب' : 'Available'}</span>
                  </span>
                ) : (
                  <span className="absolute -bottom-2 -right-1 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full shadow-xs">
                    {isUr ? 'چھٹی پر' : 'On Leave'}
                  </span>
                )}
              </div>

              {/* Doctor Basic Details */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    {isUr ? doctor.departmentUr : doctor.departmentEn}
                  </span>
                  {doctor.pmdcRegistration && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-bold rounded-md font-mono">
                      <ShieldCheck className="w-3 h-3 text-amber-300" />
                      <span>{doctor.pmdcRegistration}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  {doctor.nameEn}
                </h2>
                <p className="text-sm font-medium text-amber-300/90 font-serif">
                  {doctor.nameUr}
                </p>

                <p className="text-xs sm:text-sm text-teal-100 font-semibold flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-300 shrink-0" />
                  <span>{isUr ? doctor.specialtyUr : doctor.specialtyEn}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar: Experience, Qualifications, OPD Fee */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-200 text-center shrink-0">
            {/* Experience Metric */}
            <div className="p-3 sm:p-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {isUr ? 'طبی تجربہ' : 'Experience'}
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {doctor.experienceYears}+ {isUr ? 'سال' : 'Years'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {isUr ? 'مستند پریکٹس' : 'Active Practice'}
              </span>
            </div>

            {/* Primary Qualification */}
            <div className="p-3 sm:p-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {isUr ? 'تعلیمی قابلیت' : 'Qualifications'}
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span className="text-xs sm:text-sm font-black text-teal-900 truncate">
                  {doctor.qualificationEn.split(',')[0]}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {isUr ? 'تصدیق شدہ میڈیکل ڈگریز' : 'Board Certified'}
              </span>
            </div>

            {/* Consultation Fee */}
            <div className="p-3 sm:p-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {isUr ? 'او پی ڈی فیس' : 'OPD Fee'}
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
                PKR {doctor.feePKR}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium block">
                {isUr ? 'کاؤنٹر پر ادائیگی' : 'Pay at Counter'}
              </span>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto p-6 space-y-6 text-slate-700 text-sm">
            {/* Bio & Clinical Overview */}
            {bio && (
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>{isUr ? 'ڈاکٹر کا تعارف اور طبی پس منظر' : 'Doctor Overview & Clinical Practice'}</span>
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {bio}
                </p>
              </div>
            )}

            {/* Section: Specific Qualifications & Medical Degrees */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-700" />
                  <span>{isUr ? 'تفصیلی تعلیمی اسناد و ڈگریاں' : 'Qualifications & Board Certifications'}</span>
                </h3>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  {doctor.qualificationEn}
                </span>
              </div>

              {doctor.educationHistory && doctor.educationHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {doctor.educationHistory.map((edu, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-teal-300 transition flex flex-col sm:flex-row sm:items-start justify-between gap-2 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileBadge className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {edu.degree}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 pl-6">
                          {edu.institute}
                        </p>
                        {edu.detail && (
                          <p className="text-[11px] text-slate-500 pl-6 italic">
                            {edu.detail}
                          </p>
                        )}
                      </div>
                      {edu.year && (
                        <span className="self-start sm:self-auto px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-mono font-bold rounded-lg shrink-0">
                          {edu.year}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                  {doctor.qualificationEn} ({doctor.qualificationUr})
                </div>
              )}
            </div>

            {/* Section: Clinical Specializations */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isUr ? 'خصوصی مہارت اور شعبہ جات' : 'Clinical Specializations & Areas of Focus'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specializations.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/50 border border-teal-100/80 text-xs text-slate-800 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Clinical Procedures & Hospital Services Offered */}
            {doctor.proceduresOffered && doctor.proceduresOffered.length > 0 && (
              <div className="space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>{isUr ? 'طبی سہولیات و پروسیجرز' : 'Services & Diagnostic Procedures'}</span>
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {doctor.proceduresOffered.map((proc, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      • {proc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Career Highlights & Milestones */}
            {doctor.careerHighlights && doctor.careerHighlights.length > 0 && (
              <div className="space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{isUr ? 'طبی خدمات اور کارہائے نمایاں' : 'Career Highlights & Positions'}</span>
                  </h3>
                </div>

                <ul className="space-y-2 text-xs text-slate-700">
                  {doctor.careerHighlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Schedule & Consultation Fee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Timing Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{isUr ? 'کلینک اوقات و دن' : 'OPD Timings & Days'}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>{isUr ? 'اوقات کار:' : 'Clinic Hours:'}</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {doctor.startTime} - {doctor.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isUr ? 'سلاٹ کا دورانیہ:' : 'Slot Duration:'}</span>
                    <span className="font-bold text-slate-900">{doctor.slotDurationMinutes} Minutes</span>
                  </div>
                  <div className="pt-1 text-[11px] font-medium text-teal-800">
                    {doctor.workingDays.join(', ')}
                  </div>
                </div>
              </div>

              {/* Languages & Consultation Options */}
              <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>{isUr ? 'زبانیں و رابطہ' : 'Languages & Modalities'}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.languages?.map((langItem, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-teal-200 text-teal-900 rounded-md text-[11px] font-medium">
                        {langItem}
                      </span>
                    )) || <span>Urdu, Saraiki, English</span>}
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" /> OPD Visit: PKR {doctor.feePKR}
                    </span>
                    {doctor.acceptsOnline && (
                      <span className="flex items-center gap-1 text-teal-800">
                        <Video className="w-3.5 h-3.5 text-teal-600" /> Video: PKR {doctor.onlineFeePKR}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                title="Direct WhatsApp with Doctor Assistant"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200" />
                <span>{isUr ? 'واٹس ایپ رابطہ' : 'WhatsApp Inquiry'}</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Call Hospital Helpdesk"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span className="hidden xs:inline">{phone}</span>
              </a>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                {isUr ? 'بند کریں' : 'Close'}
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectDoctorToBook(doctor);
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-teal-200" />
                <span>
                  {isUr
                    ? `اپائنٹمنٹ بک کریں (${doctor.nameUr.split(' ')[0]} ${doctor.nameUr.split(' ')[1] || ''})`
                    : `Book Appointment with ${doctor.nameEn.split(' ')[0]} ${doctor.nameEn.split(' ')[1] || ''}`}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
