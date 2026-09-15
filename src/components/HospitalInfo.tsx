import React, { useState } from 'react';
import { HospitalInfoData, Language } from '../types';
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  HeartPulse,
  ShieldCheck,
  Building2,
  ExternalLink,
  Award,
  Sparkles,
  Navigation,
  Copy,
  Check,
  Compass,
  Car,
  Maximize2
} from 'lucide-react';

interface HospitalInfoProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
}

export const HospitalInfo: React.FC<HospitalInfoProps> = ({
  hospitalInfo,
  lang,
}) => {
  const isUr = lang === 'ur';
  const [copiedField, setCopiedField] = useState<'address' | 'coords' | null>(null);

  const googleMapsUrl = hospitalInfo.googleMapsUrl || 'https://share.google/nClgUpNiP0qDg6Dpe';
  const embedUrl = hospitalInfo.googleMapsEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.65!2d71.2125!3d30.9628!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39245563569b6677%3A0xf76d48d0e81989b3!2sGulzar%20family%20Hospital%20and%20Children%20center%2C%20Chowk%20Azam!5e0!3m2!1sen!2spk!4v1710000000000!5m2!1sen!2spk';

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=30.9628,71.2125`;

  const copyToClipboard = (text: string, type: 'address' | 'coords') => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-teal-50 border border-teal-100 text-[#0D9488] text-[10px] font-bold rounded-full uppercase tracking-widest">
          <Building2 className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>{isUr ? 'سرکاری معلومات و گوگل میپ' : 'Official Identity, Location & Google Map'}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900">
          {hospitalInfo.name}
        </h2>
        <p className="text-xl text-[#0D9488] font-bold font-serif" dir="rtl">
          {hospitalInfo.nameUr}
        </p>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Official Location */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition">
          <div className="p-3 bg-teal-50 text-[#0D9488] rounded-2xl w-fit">
            <MapPin className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-serif text-slate-900">
              {isUr ? 'سرکاری پتہ' : 'Official Address'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
              {isUr ? hospitalInfo.addressUr : hospitalInfo.addressEn}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0D9488] hover:text-teal-800"
            >
              <span>{isUr ? 'گوگل نقشے پر دیکھیں' : 'View on Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => copyToClipboard(isUr ? hospitalInfo.addressUr : hospitalInfo.addressEn, 'address')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition"
              title="Copy Address"
            >
              {copiedField === 'address' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{isUr ? 'کاپی ہو گیا' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isUr ? 'پتہ کاپی کریں' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Contact & Emergency */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition">
          <div className="p-3 bg-red-50 text-red-700 rounded-2xl w-fit">
            <Phone className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-serif text-slate-900">
              {isUr ? 'ایمرجنسی و واٹس ایپ' : 'Emergency & WhatsApp'}
            </h3>
            <p className="text-xl font-bold text-slate-900 font-mono mt-1">
              {hospitalInfo.phone}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              {isUr ? '۲۴ گھنٹے ایمرجنسی سروس دستیاب ہے' : '24/7 Helpline for appointments & emergency'}
            </p>
          </div>

          <a
            href={`tel:${hospitalInfo.phone}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-800"
          >
            <span>{isUr ? 'ابھی کال کریں' : 'Call Emergency Now'}</span>
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Card 3: JazzCash & Easypaisa Accounts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-serif text-slate-900">
              {isUr ? 'سرکاری جاز کیش و ایزی پیسہ' : 'JazzCash & Easypaisa'}
            </h3>
            <p className="text-xl font-bold text-[#0D9488] font-mono mt-1">
              {hospitalInfo.jazzCash || '0340-4777745'}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Account Title: Gulzar Family Hospital & Children Center
            </p>
          </div>
        </div>

      </div>

      {/* Embedded Google Map Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Map Header Bar */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isUr ? 'گوگل میپ تصدیق شدہ لوکیشن' : 'Verified Google Maps Location'}
              </span>
            </div>
            <h3 className="text-lg font-serif text-slate-900">
              {isUr ? 'گلزار فیملی ہسپتال کا نقشہ و رہنمائی' : 'Live Google Map & Navigation'}
            </h3>
            <p className="text-xs text-slate-600">
              {isUr
                ? 'فتح پور روڈ، زرعی ترقیاتی بینک کے سامنے، چوک اعظم'
                : 'Fatehpur Road, Opposite ZTBL Bank, Ward #4, Chowk Azam, Layyah'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Direct Google Maps Share Link */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isUr ? 'گوگل میپ ایپ میں کھولیں' : 'Open in Google Maps'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Directions Link */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
              <span>{isUr ? 'راستہ حاصل کریں' : 'Directions'}</span>
            </a>

            {/* Copy GPS Coordinates */}
            <button
              onClick={() => copyToClipboard('30.9628, 71.2125', 'coords')}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
              title="Copy GPS coordinates"
            >
              {copiedField === 'coords' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{isUr ? 'کاپی ہو گیا' : 'GPS Copied'}</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>30.9628° N, 71.2125° E</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Embedded Map iFrame */}
        <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-100">
          <iframe
            title="Gulzar Family Hospital & Children Center Google Map"
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Action Badge on bottom corner */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 shadow-md text-xs space-y-1 pointer-events-auto">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Car className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>{isUr ? 'آسان رسائی و پارکنگ' : 'Easy Access & Ambulance Entry'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              {isUr
                ? 'مین فتح پور روڈ پر واقع، چوک اعظم مین چوک سے صرف ۳ منٹ کا فاصلہ۔ ایمرجنسی مریضوں کے لیے علیحدہ ایمبولینس گیٹ اور وسیع پارکنگ موجود ہے۔'
                : 'Located directly on Fatehpur Road, 3 mins drive from Chowk Azam main chowk. Dedicated 24/7 ambulance bay and visitor parking available.'}
            </p>
          </div>
        </div>

        {/* Map Footer Route Landmarks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs bg-white border-t border-slate-200">
          <div className="p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isUr ? 'مرکزی نشان' : 'Prominent Landmark'}
            </span>
            <p className="font-semibold text-slate-800">
              {isUr ? 'زرعی ترقیاتی بینک (ZTBL) کے بالمقابل' : 'Directly Opposite Zarai Taraqiati Bank (ZTBL)'}
            </p>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isUr ? 'چوک اعظم مین چوک سے فاصلہ' : 'From Chowk Azam City Center'}
            </span>
            <p className="font-semibold text-slate-800">
              {isUr ? '~۱.۲ کلومیٹر (۳ منٹ بذریعہ گاڑی/رکشہ)' : '~1.2 km (approx. 3 mins drive)'}
            </p>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isUr ? 'گوگل لنک' : 'Direct Google Share'}
            </span>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0D9488] hover:underline"
            >
              <span>share.google/nClgUpNiP0qDg6Dpe</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* Facilities Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-serif text-teal-400 text-center">
          {isUr ? 'گلزار فیملی ہسپتال کی طبی سہولیات' : 'Medical Facilities & Infrastructure'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-teal-300 font-bold text-sm block">Pediatric ICU / NICU</span>
            <span className="text-xs text-slate-400">نوزائیدہ بچوں کے لیے نرسری</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-teal-300 font-bold text-sm block">Maternity Care</span>
            <span className="text-xs text-slate-400">لیبر روم و زچگی ہال</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-teal-300 font-bold text-sm block">Operation Theatre</span>
            <span className="text-xs text-slate-400">جدید ترین آپریشن تھیٹر</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-teal-300 font-bold text-sm block">24/7 Pharmacy & Lab</span>
            <span className="text-xs text-slate-400">لیبارٹری و میڈیکل سٹور</span>
          </div>
        </div>
      </div>

    </div>
  );
};
