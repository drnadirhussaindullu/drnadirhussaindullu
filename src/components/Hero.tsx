import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CreditCard,
  MessageSquare,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  Maximize2,
  X,
  ChevronRight,
  Stethoscope,
  Baby,
  Activity,
  Heart,
  FileText,
  Building2,
  Zap,
} from 'lucide-react';
import { Language, HospitalInfoData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  onOpenBooking: () => void;
  onOpenPayment: () => void;
  onNavigateDoctors: () => void;
  onNavigateAbout?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  hospitalInfo,
  lang,
  onOpenBooking,
  onOpenPayment,
  onNavigateDoctors,
  onNavigateAbout,
}) => {
  const isUr = lang === 'ur';
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live Pakistan Standard Time (PKT) clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        const dateStr = now.toLocaleDateString(isUr ? 'ur-PK' : 'en-US', {
          timeZone: 'Asia/Karachi',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        setCurrentTime(`${dateStr} • ${timeStr} PKT`);
      } catch {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isUr]);

  return (
    <div className="relative overflow-hidden bg-slate-50 text-slate-900 selection:bg-teal-600 selection:text-white">
      
      {/* Background Subtle Modern Gradient Grids */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 sm:pb-16 space-y-8">

        {/* 1. TOP LIVE TICKER / EMERGENCY BAR */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 sm:px-5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isUr ? '۲۴/۷ او پی ڈی اور ایمرجنسی کھلی ہے' : '24/7 OPD & Emergency Open'}
            </span>

            <span className="hidden sm:inline-block text-slate-300">|</span>

            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-mono text-[11px] sm:text-xs">{currentTime || 'Live Hospital Clock'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center gap-1.5 text-slate-800 hover:text-teal-700 font-bold transition text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>{hospitalInfo.phone}</span>
            </a>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] font-semibold text-slate-500">
              {isUr ? 'فتح پور روڈ، چوک اعظم' : 'Fatehpur Rd, Chowk Azam'}
            </span>
          </div>
        </div>

        {/* 2. OFFICIAL HOSPITAL HERO BANNER SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group rounded-3xl overflow-hidden border-2 border-teal-600/20 shadow-xl bg-slate-900 cursor-pointer"
          onClick={() => setIsBannerModalOpen(true)}
        >
          {/* Banner Graphic Image */}
          <div className="relative w-full aspect-[16/7] sm:aspect-[21/8] md:aspect-[24/8] lg:aspect-[28/9] max-h-[440px] overflow-hidden bg-slate-950">
            <img
              src="/images/hospital_hero_banner.jpg"
              alt="Gulzar Family Hospital & Children Center Official Banner"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              loading="eager"
            />
            
            {/* Subtle Gradient Vignette Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
            <div className="absolute inset-0 bg-teal-900/10 mix-blend-overlay pointer-events-none" />

            {/* Top Badge: Verified Official Hospital Banner */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 backdrop-blur-md text-teal-300 border border-teal-500/30 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>{isUr ? 'سرکاری ہسپتال بینر' : 'Official Hospital Banner'}</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                <Baby className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUr ? 'ماہر امراضِ اطفال و فیملی' : 'Specialized Child Care & Maternity'}</span>
              </span>
            </div>

            {/* Top Right: Zoom / Expand Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBannerModalOpen(true);
              }}
              className="absolute top-3 sm:top-4 right-3 sm:right-5 p-2 sm:px-3 sm:py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl backdrop-blur-md border border-white/20 text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
              title="Click to view full high-definition banner"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{isUr ? 'بڑا بینر دیکھیں' : 'View Full HD Banner'}</span>
            </button>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 text-white">
              <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 max-w-xl">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <span>Gulzar Family Hospital & Children Center</span>
                  <span className="text-xs text-teal-400 font-urdu font-normal">گلزار فیملی ہسپتال</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  {isUr
                    ? 'صحت کا آسان راستہ • چوک اعظم ضلع لیہ • ڈاکٹر نادر حسین ڈلو و ماہر ڈاکٹرز کی ٹیم'
                    : 'Sehat Ka Asaan Rasta • Chowk Azam, Layyah • Dr. Nadir Hussain Dullu & Specialists Team'}
                </p>
              </div>

              {/* Bottom Right Floating Badge */}
              <div className="hidden md:flex items-center gap-2 bg-teal-950/85 backdrop-blur-md border border-teal-500/30 px-3.5 py-2 rounded-2xl text-xs font-semibold text-teal-200">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isUr ? 'فوری ٹوکن بکنگ — پیشگی ادائیگی ضروری نہیں' : 'Instant Token — Advance Payment Optional'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. MODERN HERO EDITORIAL GRID & CALL TO ACTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Left Editorial Block (8 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isUr ? 'چوک اعظم کا سب سے قابلِ اعتماد ہسپتال' : 'Chowk Azam’s Premier Hospital & Child Care'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>{isUr ? 'صحت کا آسان راستہ' : 'Sehat Ka Asaan Rasta'}</span>
                </span>
                {onNavigateAbout && (
                  <button
                    onClick={onNavigateAbout}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                  >
                    <span>{isUr ? '🏥 ہسپتال کا تعارف (About Us)' : '🏥 About Us & Services'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-slate-900 font-bold leading-tight">
                Gulzar Family Hospital
                <span className="block text-2xl sm:text-3xl lg:text-4xl text-teal-700 font-serif font-normal italic mt-1" dir="rtl">
                  {hospitalInfo.nameUr}
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                {isUr
                  ? 'گلزار فیملی ہسپتال چوک اعظم میں بچوں کے سینئر سپیشلسٹ ڈاکٹر نادر حسین ڈلو، امراضِ نسواں و زچگی، چائلڈ سرجری اور ۲۴ گھنٹے ایمرجنسی او پی ڈی کی سہولیات۔ اب گھر بیٹھے فوری ٹوکن حاصل کریں — بغیر کسی پیشگی لازمی ادائیگی کے، فیس ہسپتال کاؤنٹر پر بھی ادا کی جا سکتی ہے۔'
                  : 'Welcome to Gulzar Family Hospital & Children Center, Chowk Azam. Led by Senior Child Specialist Dr. Nadir Hussain Dullu, providing 24/7 pediatric emergency, baby nursery with incubators, maternity care, and family medicine. Book your appointment token online with zero friction — advance payment is completely optional (pay at hospital OPD counter or online via JazzCash/Easypaisa).'}
              </p>
            </div>

            {/* Quick Feature Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Baby className="w-5 h-5 text-teal-600 mb-1" />
                <h4 className="text-xs font-bold text-slate-900">{isUr ? 'امراضِ اطفال' : 'Pediatric Care'}</h4>
                <p className="text-[10px] text-slate-500">{isUr ? 'نرسری و انکیوبیٹرز' : 'NICU & Nursery'}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Activity className="w-5 h-5 text-rose-600 mb-1" />
                <h4 className="text-xs font-bold text-slate-900">{isUr ? '۲۴/۷ ایمرجنسی' : '24/7 Emergency'}</h4>
                <p className="text-[10px] text-slate-500">{isUr ? 'فوری طبی امداد' : 'Immediate Response'}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Zap className="w-5 h-5 text-amber-600 mb-1" />
                <h4 className="text-xs font-bold text-slate-900">{isUr ? 'فوری ٹوکن' : 'Instant Token'}</h4>
                <p className="text-[10px] text-slate-500">{isUr ? 'بغیر قطار انتظار' : 'Zero Waiting Queue'}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                <h4 className="text-xs font-bold text-slate-900">{isUr ? 'اختیاری ادائیگی' : 'Flexible Payment'}</h4>
                <p className="text-[10px] text-slate-500">{isUr ? 'کاؤنٹر یا آن لائن' : 'Counter / Online'}</p>
              </div>
            </div>

            {/* PRIMARY HIGH-CONVERTING ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              
              {/* Button 1: Book Appointment / OPD Token */}
              <button
                onClick={onOpenBooking}
                className="bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold p-4 rounded-2xl shadow-lg shadow-teal-700/20 transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] uppercase font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                    FREE TOKEN
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-teal-200 font-bold">Step 1 • No Prepayment</div>
                  <div className="text-sm sm:text-base font-extrabold leading-tight">
                    {isUr ? 'اپائنٹمنٹ ٹوکن لیں' : 'BOOK APPOINTMENT'}
                  </div>
                  <div className="text-[11px] text-teal-100 font-normal mt-0.5">
                    {isUr ? 'کاؤنٹر پر ادائیگی کا اختیار' : 'Pay at counter or online'}
                  </div>
                </div>
              </button>

              {/* Button 2: Pay Online via JazzCash / Easypaisa (Optional) */}
              <button
                onClick={onOpenPayment}
                className="bg-white border-2 border-slate-200 hover:border-teal-600 text-slate-900 font-bold p-4 rounded-2xl transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-xl group-hover:bg-teal-700 group-hover:text-white transition">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">0340-4777745</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-teal-700 font-extrabold">Optional Mobile Pay</div>
                  <div className="text-sm sm:text-base font-extrabold leading-tight">
                    {isUr ? 'جاز کیش / ایزی پیسہ' : 'PAY ONLINE (OPTIONAL)'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    {isUr ? 'تصدیقی رسید اپلوڈ کریں' : 'JazzCash & Easypaisa'}
                  </div>
                </div>
              </button>

              {/* Button 3: WhatsApp Support */}
              <a
                href={`https://wa.me/923404777745?text=${encodeURIComponent(
                  isUr
                    ? 'السلام علیکم! میں گلزار فیملی ہسپتال چوک اعظم سے اپائنٹمنٹ یا ٹوکن کے بارے میں معلومات لینا چاہتا ہوں۔'
                    : 'Hello! I would like to inquire about appointments at Gulzar Family Hospital & Children Center, Chowk Azam.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-950 text-white font-bold p-4 rounded-2xl shadow-sm transition-all text-left flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    24/7 ACTIVE
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Official WhatsApp</div>
                  <div className="text-sm sm:text-base font-extrabold leading-tight">
                    {isUr ? 'واٹس ایپ پر رابطہ' : 'WHATSAPP HELPDESK'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    +92 340 4777745
                  </div>
                </div>
              </a>

            </div>

            {/* Address & Google Maps Location Link */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
                    {isUr ? 'ہسپتال کا سرکاری پتہ' : 'Official Hospital Landmark'}
                  </span>
                  <span className="font-semibold text-slate-800 leading-relaxed">
                    {isUr ? hospitalInfo.addressUr : hospitalInfo.addressEn}
                  </span>
                </div>
              </div>

              <a
                href={hospitalInfo.googleMapsUrl || 'https://share.google/nClgUpNiP0qDg6Dpe'}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>{isUr ? 'گوگل میپ لوکیشن' : 'Open Google Map'}</span>
              </a>
            </div>

          </motion.div>

          {/* Right Column: Doctor Spotlight & Live Hospital Desk (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 space-y-4 flex flex-col justify-between"
          >
            
            {/* Dr. Nadir Hussain Spotlight Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Head of Pediatrics</span>
                </div>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">
                  22+ Yrs Exp
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src="/images/dr_nadir_hussain.jpg"
                  alt="Dr. Nadir Hussain Dullu"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-600 shadow-md shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-serif">
                    {isUr ? 'ڈاکٹر نادر حسین ڈلو' : 'Dr. Nadir Hussain Dullu'}
                  </h3>
                  <p className="text-xs text-teal-700 font-semibold">
                    {isUr ? 'سینئر فیملی فزیشن و ماہر امراضِ اطفال' : 'Senior Pediatrician & Family Specialist'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    MBBS, MCPS • In-Clinic OPD
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">{isUr ? 'صبح کا وقت:' : 'Morning Shift:'}</span>
                  <span className="font-mono font-bold text-slate-800">09:00 AM – 01:00 PM</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">{isUr ? 'شام کا وقت:' : 'Evening Shift:'}</span>
                  <span className="font-mono font-bold text-slate-800">04:00 PM – 08:00 PM</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                  <span className="font-medium">{isUr ? 'معائنہ فیس:' : 'Consultation Fee:'}</span>
                  <span className="font-mono font-extrabold text-teal-800">PKR 1500</span>
                </div>
              </div>

              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isUr ? 'ڈاکٹر نادر کی اپائنٹمنٹ بک کریں' : 'Book Dr. Nadir Hussain Slot'}</span>
              </button>
            </div>

            {/* Official Mobile Accounts Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Official Payment Accounts
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  100% Verified
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#ED1C24] text-white rounded-md font-black text-[10px] flex items-center justify-center italic shadow-xs">
                      JC
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">JazzCash</p>
                      <p className="text-[11px] font-mono font-bold text-slate-700">0340-4777745</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">Gulzar Hospital</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#37B34A] text-white rounded-md font-black text-[10px] flex items-center justify-center italic shadow-xs">
                      EP
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Easypaisa</p>
                      <p className="text-[11px] font-mono font-bold text-slate-700">0340-4777745</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">Gulzar Hospital</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={onNavigateDoctors}
                  className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{isUr ? 'تمام ڈاکٹرز کا شیڈول' : 'View All 5 Doctors'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenPayment}
                  className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline text-[11px]"
                >
                  {isUr ? 'رسید جمع کریں' : 'Upload Receipt'}
                </button>
              </div>
            </div>

          </motion.div>

        </div>

        {/* 4. KEY REASSURANCE STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-mono">15,000+</div>
              <div className="text-xs text-slate-500 font-medium">{isUr ? 'بچے و فیملیز صحتیاب' : 'Kids & Families Served'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-mono">100%</div>
              <div className="text-xs text-slate-500 font-medium">{isUr ? 'ماہر مستند ڈاکٹرز' : 'Verified Specialists'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-mono">24/7</div>
              <div className="text-xs text-slate-500 font-medium">{isUr ? 'نرسری و ایمرجنسی' : 'NICU & Emergency Care'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-mono">0 Mins</div>
              <div className="text-xs text-slate-500 font-medium">{isUr ? 'فوری ٹوکن بکنگ' : 'No Waiting For Token'}</div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. LIGHTBOX MODAL FOR FULL-HD OFFICIAL BANNER */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsBannerModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
                <div>
                  <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Gulzar Family Hospital & Children Center — Official Banner</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Chowk Azam, Layyah • Sehat Ka Asaan Rasta
                  </p>
                </div>

                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Full Image Display */}
              <div className="p-2 sm:p-4 bg-black flex items-center justify-center max-h-[75vh] overflow-auto">
                <img
                  src="/images/hospital_hero_banner.jpg"
                  alt="Gulzar Family Hospital & Children Center Banner Full"
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                />
              </div>

              {/* Modal Footer Quick Actions */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-teal-400">Dr. Nadir Hussain Dullu</span> & Senior Medical Team • 24/7 Care
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsBannerModalOpen(false);
                      onOpenBooking();
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isUr ? 'اپائنٹمنٹ لیں' : 'Book Appointment'}</span>
                  </button>
                  <button
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {isUr ? 'بند کریں' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
