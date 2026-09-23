import React from 'react';
import { Phone, MapPin, Clock, Calendar, MessageSquare, CreditCard, Shield, User, ChevronRight, Sparkles } from 'lucide-react';
import { Language, HospitalInfoData, AdminUser } from '../types';

interface HeaderProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenPayment: () => void;
  isLiveConnected?: boolean;
  adminUser?: AdminUser | null;
  onAdminLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hospitalInfo,
  lang,
  setLang,
  activeTab,
  setActiveTab,
  onOpenBooking,
  onOpenPayment,
  isLiveConnected = true,
  adminUser,
  onAdminLogout,
}) => {
  const isUr = lang === 'ur';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Announcement & Emergency Bar */}
      <div className="bg-slate-900 text-white text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab('hospital_info')}
              className="flex items-center gap-1.5 font-medium text-slate-300 hover:text-white transition cursor-pointer"
              title={isUr ? 'گوگل میپ اور ہسپتال کا پتہ دیکھیں' : 'View Google Map & Hospital Address'}
            >
              <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{isUr ? 'چوک اعظم (گوگل میپ)' : 'Chowk Azam (Google Map)'}</span>
            </button>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
              {isUr ? '۲۴/۷ ایمرجنسی و او پی ڈی سروس' : '24/7 Emergency & Child Care'}
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isLiveConnected ? (isUr ? 'لائیو ڈیٹا بیس کنیکٹڈ' : 'Live Database Synced') : 'Reconnecting...'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="flex items-center gap-1.5 bg-[#0D9488] hover:bg-teal-700 text-white px-3 py-1 rounded-md text-xs font-bold transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{hospitalInfo.phone}</span>
            </a>

            <div className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition ${
                  lang === 'en' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('ur')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition ${
                  lang === 'ur' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                اردو
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Emergency Notice / Live Announcement Strip from Database */}
      {(hospitalInfo.emergencyNoticeEn || hospitalInfo.activeAnnouncementEn) && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold border-b border-amber-600">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="px-1.5 py-0.5 bg-slate-950 text-amber-300 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
                {isUr ? 'ہسپتال الرٹ' : 'LIVE NOTICE'}
              </span>
              <span className="truncate">
                {isUr
                  ? hospitalInfo.activeAnnouncementUr || hospitalInfo.emergencyNoticeUr
                  : hospitalInfo.activeAnnouncementEn || hospitalInfo.emergencyNoticeEn}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('events')}
              className="underline text-slate-950 hover:text-slate-800 text-[11px] font-black shrink-0 cursor-pointer"
            >
              {isUr ? 'تفصیلات دیکھیں' : 'View Schedule'}
            </button>
          </div>
        </div>
      )}

      {/* Main Branding Header */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-3.5 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-11 h-11 bg-[#0D9488] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-100 group-hover:scale-105 transition transform">
            G
          </div>

          <div>
            <p className="text-base sm:text-lg font-bold leading-tight tracking-tight uppercase text-slate-900 group-hover:text-[#0D9488] transition">
              {hospitalInfo.name}
            </p>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
              {hospitalInfo.nameUr} • LAYYAH
            </p>
          </div>
        </div>

        {/* Quick CTA Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenBooking}
            className="bg-[#0D9488] hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex flex-col items-center leading-tight shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> BOOK APPOINTMENT</span>
            <span className="text-[10px] font-medium text-teal-100">فوری ٹوکن • ادائیگی اختیاری</span>
          </button>

          <button
            onClick={onOpenPayment}
            className="bg-white border-2 border-[#0D9488] hover:bg-teal-50 text-[#0D9488] px-5 py-2.5 rounded-xl font-bold text-sm flex flex-col items-center leading-tight transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> PAY ONLINE</span>
            <span className="text-[10px] font-medium text-slate-500">اختیاری (JazzCash/EP)</span>
          </button>

          <a
            href={`https://wa.me/923404777745?text=${encodeURIComponent(
              isUr ? 'السلام علیکم! مجھے ڈاکٹر اپائنٹمنٹ کے بارے میں معلومات چاہیے۔' : 'Hello! I need information regarding doctor appointment.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4 text-[#0D9488]" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-slate-200 bg-white px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'home'
                  ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isUr ? 'صفحہ اول' : 'Home'}
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'doctors'
                  ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isUr ? 'ڈاکٹرز' : 'Doctors'}
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'events'
                  ? 'bg-teal-900 text-amber-300 font-extrabold shadow-xs'
                  : 'text-teal-700 bg-teal-50/70 hover:bg-teal-100 hover:text-teal-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{isUr ? 'طبی کیمپس و تاریخیں' : 'Camps & Dates'}</span>
            </button>

            <button
              onClick={onOpenBooking}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'booking'
                  ? 'bg-[#0D9488] text-white font-extrabold shadow-sm'
                  : 'text-[#0D9488] font-extrabold hover:bg-teal-50'
              }`}
            >
              {isUr ? 'اپائنٹمنٹ بک کریں' : 'Book Appointment'}
            </button>

            <button
              onClick={onOpenPayment}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'payment'
                  ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isUr ? 'آن لائن فیس' : 'Payment'}
            </button>

            <button
              onClick={() => setActiveTab('patient_portal')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'patient_portal'
                  ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isUr ? 'میری اپائنٹمنٹس' : 'Patient Portal'}
            </button>

            <button
              onClick={() => setActiveTab('ai_chat')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'ai_chat'
                  ? 'bg-teal-900 text-amber-300 font-extrabold shadow-xs border border-teal-800'
                  : 'text-teal-700 bg-teal-50 hover:bg-teal-100 font-bold border border-teal-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isUr ? 'گلزار اے آئی اسسٹنٹ' : 'AI Healthcare Chat'}</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp_auto')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'whatsapp_auto'
                  ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isUr ? 'واٹس ایپ اسٹوڈیو' : 'WhatsApp Studio'}
            </button>

            <button
              onClick={() => setActiveTab('future_gallery')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition border ${
                activeTab === 'future_gallery'
                  ? 'bg-slate-900 text-amber-300 border-slate-800 font-extrabold shadow-xs'
                  : 'text-[#0D9488] border-teal-200 bg-teal-50/60 hover:bg-teal-100 font-bold'
              }`}
            >
              {isUr ? 'مستقبل کا ہسپتال (Future Concepts)' : 'Future Concepts'}
            </button>

            <button
              onClick={() => setActiveTab('hospital_info')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'hospital_info'
                  ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{isUr ? 'معلومات و گوگل میپ' : 'Hospital Info & Map'}</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'faq'
                  ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isUr ? 'سوالات و جوابات' : 'Q&A / FAQ'}
            </button>

            <button
              onClick={() => setActiveTab('testimonials')}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'testimonials'
                  ? 'bg-slate-900 text-amber-300 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isUr ? 'مریضوں کی آراء' : 'Patient Reviews'}
            </button>
          </div>

          <div className="py-2 pl-2 border-l border-slate-200 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-teal-400 border border-slate-800 shadow-xs'
                  : adminUser
                  ? 'bg-teal-950 text-teal-300 border border-teal-700/60 hover:bg-teal-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={adminUser ? `Logged in: ${adminUser.email}` : 'Authorized Admin Login'}
            >
              <Shield className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>
                {adminUser
                  ? isUr
                    ? 'ایڈمن کنٹرول'
                    : 'Admin Control'
                  : isUr
                  ? 'ایڈمن لاگ ان'
                  : 'Admin Login'}
              </span>
              {adminUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Admin Session" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
