import React from 'react';
import { HospitalInfoData, Language } from '../types';
import { MapPin, Phone, MessageSquare, ShieldCheck, HeartPulse } from 'lucide-react';

interface FooterProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenPayment: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  hospitalInfo,
  lang,
  setActiveTab,
  onOpenBooking,
  onOpenPayment,
}) => {
  const isUr = lang === 'ur';

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Hospital Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0D9488] rounded-xl flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
                G
              </div>
              <div>
                <h3 className="font-serif text-white text-base leading-tight">
                  {hospitalInfo.name}
                </h3>
                <p className="text-xs text-teal-400 font-bold font-serif" dir="rtl">
                  {hospitalInfo.nameUr}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {isUr
                ? 'چوک اعظم میں بچوں اور خواتین کے امراض کا معیاری و بھروسے مند ہسپتال۔ ۲۴ گھنٹے ایمرجنسی و نوزائیدہ آئی سی یو سہولت۔'
                : 'Trusted medical center in Chowk Azam, Layyah for specialized pediatric, maternity, and surgical healthcare.'}
            </p>
          </div>

          {/* Col 2: Official Contact & Address */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-2">
              {isUr ? 'سرکاری معلومات' : 'Official Contact'}
            </h4>

            <div className="space-y-2 text-xs text-slate-400">
              <a
                href={hospitalInfo.googleMapsUrl || 'https://share.google/nClgUpNiP0qDg6Dpe'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-teal-300 transition group"
              >
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 group-hover:scale-110 transition" />
                <span className="font-sans underline decoration-slate-700 underline-offset-2">{isUr ? hospitalInfo.addressUr : hospitalInfo.addressEn}</span>
              </a>

              <p className="flex items-center gap-2 font-mono">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{hospitalInfo.phone}</span>
              </p>

              <p className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400 shrink-0" />
                <span>WhatsApp: {hospitalInfo.whatsApp}</span>
              </p>
            </div>
          </div>

          {/* Col 3: Payment Accounts */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-2">
              {isUr ? 'ادائیگی کے اکاؤنٹس' : 'Payment Accounts'}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-amber-400 font-bold">JazzCash</span>
                <span className="font-mono text-white font-bold">0340-4777745</span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-teal-400 font-bold">Easypaisa</span>
                <span className="font-mono text-white font-bold">0340-4777745</span>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-2">
              {isUr ? 'فوری لنکس' : 'Quick Actions'}
            </h4>

            <div className="space-y-1 text-xs">
              <button
                onClick={onOpenBooking}
                className="block text-teal-400 font-bold hover:underline cursor-pointer"
              >
                📅 BOOK APPOINTMENT / اپائنٹمنٹ بک کریں
              </button>

              <button
                onClick={onOpenPayment}
                className="block text-slate-300 hover:text-white cursor-pointer"
              >
                💳 PAY ONLINE / آن لائن فیس
              </button>

              <button
                onClick={() => setActiveTab('patient_portal')}
                className="block text-slate-300 hover:text-white cursor-pointer"
              >
                📋 Patient Portal
              </button>

              <button
                onClick={() => setActiveTab('faq')}
                className="block text-slate-300 hover:text-white cursor-pointer"
              >
                ❓ Questions & Answers (FAQ) / سوالات
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className="block text-slate-400 hover:text-teal-400 cursor-pointer"
              >
                🛡️ Admin Dashboard
              </button>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Gulzar Family Hospital & Children Center. All rights reserved.</p>
          <p>Chowk Azam, Layyah, Punjab, Pakistan</p>
        </div>

      </div>
    </footer>
  );
};
