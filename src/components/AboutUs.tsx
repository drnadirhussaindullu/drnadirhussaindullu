import React from 'react';
import {
  HospitalInfoData,
  Language,
  Doctor,
} from '../types';
import {
  Heart,
  Baby,
  ShieldCheck,
  Stethoscope,
  Activity,
  Wind,
  Ambulance,
  FlaskConical,
  Pill,
  Sparkles,
  MapPin,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Compass,
  Award,
  ChevronRight,
  ArrowRight,
  Shield,
  Building2,
  HeartPulse,
} from 'lucide-react';

interface AboutUsProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  onOpenBooking: () => void;
  onNavigateDoctors?: () => void;
  onNavigateContact?: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({
  hospitalInfo,
  lang,
  onOpenBooking,
  onNavigateDoctors,
  onNavigateContact,
}) => {
  const isUr = lang === 'ur';

  const missionPoints = [
    {
      en: 'Safe and compassionate patient care',
      ur: 'محفوظ، معیاری اور ہمدردانہ مریضوں کی دیکھ بھال',
    },
    {
      en: 'Qualified doctors and trained healthcare professionals',
      ur: 'مستند و تجربہ کار ڈاکٹرز اور تربیت یافتہ پیرامیڈیکل اسٹاف',
    },
    {
      en: 'Modern diagnostic and treatment facilities',
      ur: 'جدید تشخیصی لیبارٹری اور جدید طریقہ علاج کی سہولیات',
    },
    {
      en: '24/7 emergency and essential medical services',
      ur: '۲۴ گھنٹے ایمرجنسی، ڈیلیوری اور ضروری طبی خدمات',
    },
    {
      en: 'Comprehensive family healthcare',
      ur: 'پورے خاندان کے لیے جامع بنیادی و خصوصی طبی معائنہ',
    },
    {
      en: "Specialized children's healthcare",
      ur: 'نوزائیدہ اور بچوں کے امراض کا خصوصی چلڈرن کیئر سینٹر',
    },
    {
      en: "Complete maternity and women's healthcare",
      ur: 'خواتین اور زچہ و بچہ کی مکمل نگہداشت و میٹرنٹی ہوم',
    },
    {
      en: 'Preventive healthcare and health education',
      ur: 'حفاظتی تدابیر، بروقت تشخیص اور طبی آگاہی',
    },
    {
      en: 'Affordable and accessible medical services',
      ur: 'مناسب فیس اور ہر خاص و عام کے لیے آسان رسائی',
    },
    {
      en: 'Continuity of care from childhood through adulthood and older age',
      ur: 'بچپن سے جوانی اور بڑھاپے تک مسلسل طبی نگرانی و علاج',
    },
  ];

  const coreValues = [
    { en: 'Patient Safety', ur: 'مریض کی حفاظت' },
    { en: 'Compassion', ur: 'ہمدردی و شفقت' },
    { en: 'Integrity', ur: 'دیانت داری' },
    { en: 'Professionalism', ur: 'پیشہ ورانہ مہارت' },
    { en: 'Accessibility', ur: 'آسان رسائی' },
    { en: 'Respect', ur: 'احترام و عزت' },
    { en: 'Continuous Improvement', ur: 'مسلسل بہتری' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 text-white pt-16 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/10 border border-teal-400/30 rounded-full text-teal-300 text-xs font-bold uppercase tracking-widest backdrop-blur-xs">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span>{isUr ? 'ہمارے بارے میں' : 'About Us'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif leading-tight">
            {hospitalInfo.name}
          </h1>
          <p className="text-xl sm:text-2xl text-teal-300 font-bold font-serif" dir="rtl">
            {hospitalInfo.nameUr}
          </p>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-sans leading-relaxed">
            {isUr
              ? 'گلزار فیملی ہسپتال اینڈ چلڈرن سینٹر ایک جدید، مریض دوست طبی مرکز ہے جو خاندان کے ہر فرد کے لیے ہر عمر میں مکمل، ہمدردانہ اور قابلِ رسائی علاج فراہم کرنے کے لیے وقف ہے۔'
              : 'A modern, patient-centered healthcare facility dedicated to providing comprehensive, compassionate, and accessible medical care for individuals and families at every stage of life.'}
          </p>

          {/* Location & Mission Banner */}
          <div className="pt-4 max-w-3xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md text-left flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs sm:text-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-teal-400 tracking-wider block">
                  {isUr ? 'ہسپتال کا پتہ' : 'Hospital Location'}
                </span>
                <p className="text-white font-medium">
                  {isUr ? hospitalInfo.addressUr : hospitalInfo.addressEn}
                </p>
                <p className="text-slate-400 text-xs">
                  {isUr
                    ? 'فتح پور روڈ، زرعی ترقیاتی بینک (ZTBL) کے سامنے، چوک اعظم، ضلع لیہ'
                    : 'Fatehpur Road, in front of Zarai Taraqiati Bank (ZTBL), Chowk Azam'}
                </p>
              </div>
            </div>
          </div>

          {/* Core Mission Statement */}
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-teal-900/60 to-slate-800/80 border border-teal-500/30 rounded-2xl p-5 sm:p-6 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              {isUr ? 'ہمارا بنیادی مشن' : 'Our Mission Statement'}
            </span>
            <p className="text-base sm:text-lg font-semibold text-white italic">
              {isUr
                ? '“ہمارا مشن سادہ ہے: گھر کے قریب محفوظ، قابلِ اعتماد، اور مستند طبی علاج فراہم کرنا اور ہر مریض کا احترام، ہمدردی اور وقار کے ساتھ خیال رکھنا۔”'
                : '“To provide safe, reliable, evidence-based healthcare close to home while treating every patient with dignity, respect, and compassion.”'}
            </p>
          </div>
        </div>
      </section>

      {/* VISION & MISSION PILLARS */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">
                  {isUr ? 'ہمارا وژن' : 'Our Vision'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isUr ? 'بھروسہ مند طبی مرکز' : 'A Trusted Healthcare Center'}
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {isUr
                ? 'چوک اعظم، لیہ اور گردونواح کی عوام کے لیے ایک قابلِ اعتبار طبی مرکز بننا، جہاں جدید طبی خدمات، مستند ڈاکٹرز، جدید تشخیصی آلات اور خاندان دوست ماحول میں بہترین دیکھ بھال میسر ہو۔'
                : 'To become a trusted healthcare center for the people of Chowk Azam, Layyah and surrounding areas, providing modern medical services, qualified healthcare professionals, advanced diagnostics, and family-centered care.'}
            </p>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block">
                  {isUr ? 'مستند ڈاکٹرز' : 'Qualified Doctors'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isUr ? 'تجربہ کار فزیشنز و ماہرین' : 'Specialist medical team'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block">
                  {isUr ? 'جدید تشخیصی سہولیات' : 'Modern Diagnostics'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isUr ? 'لیب اور کارڈیک ای سی جی' : 'Lab & ECG screening'}
                </span>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
                  {isUr ? 'ہمارا مشن' : 'Our Mission'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isUr ? 'عوامی صحت و تندرستی' : 'Community Health & Wellbeing'}
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {isUr
                ? 'ہماری اولین ترجیح کمیونٹی کی صحت اور بہبود کو بہتر بنانا ہے۔ ہم ہر عمر کے مریضوں کے لیے محفوظ، ہمدردانہ اور سستی طبی خدمات کی بلا تعطل فراہمی یقینی بناتے ہیں۔'
                : 'Our mission is to improve the health and wellbeing of our community through safe patient care, advanced diagnostics, and dedicated family-centered services.'}
            </p>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block">
                  {isUr ? '۲۴/۷ ایمرجنسی' : '24/7 Emergency'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isUr ? 'فوری طبی امداد و داخلہ' : 'Round the clock urgent care'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block">
                  {isUr ? 'سستی و آسان فیس' : 'Affordable Access'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isUr ? 'عوامی فلاحی نرخ' : 'Accessible for all patients'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 10 Mission Commitments Grid */}
        <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                {isUr ? 'عوامی خدمات' : 'Hospital Commitments'}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isUr ? 'ہم کیا فراہم کرتے ہیں؟' : 'How We Fulfill Our Mission'}
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {isUr ? '۱۰ بنیادی خدمات کے ستون' : '10 Essential Service Pillars'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 text-xs">
            {missionPoints.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-teal-50/50 hover:border-teal-200 transition"
              >
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                  {index + 1}
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">{item.en}</p>
                  <p className="text-teal-800 font-medium text-[11px]" dir="rtl">
                    {item.ur}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPARTMENTS & SERVICES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 mt-16 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{isUr ? 'شعبہ جات اور خدمات' : 'Our Departments & Services'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif">
            {isUr ? 'مکمل اور جامع طبی نگہداشت' : 'Comprehensive Clinical Excellence'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isUr
              ? 'ہر شعبے میں ماہر ڈاکٹرز، تربیت یافتہ عملہ اور جدید سہولیات کے ساتھ مریضوں کا بہترین علاج'
              : 'Specialist consultations, advanced diagnostics, and dedicated clinical facilities under one roof.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* 1. General Medicine & Family Physician */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-blue-600 tracking-wider">
                    {isUr ? 'شعبہ فیملی فزیشن' : 'Primary Care'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    🏥 General Medicine & Family Physician Department
                  </h3>
                  <p className="text-sm font-semibold text-slate-600" dir="rtl">
                    شعبہ امراض عامہ، فیملی میڈیسن و دائمی امراض کا معائنہ
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-2 text-xs text-blue-900 font-medium">
                Long-term doctor-patient relationship & prevention
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Our <strong>Family Physician Department</strong> provides comprehensive primary healthcare for individuals and families.
              Our approach emphasizes <strong>long-term doctor-patient relationships, prevention, early diagnosis, treatment, and continuity of care.</strong>
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Evaluation and management services include:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {[
                  'Diabetes and blood sugar problems',
                  'High and low blood pressure',
                  'Fever and infections',
                  'Stomach and digestive disorders',
                  'Liver-related problems',
                  'Respiratory complaints',
                  'Asthma and allergies',
                  'Common neurological and musculoskeletal complaints',
                  'General weakness and nutritional concerns',
                  'Preventive healthcare and routine checkups',
                  'Chronic disease monitoring',
                  'Health screening and follow-up care',
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Children Center & Pediatrics */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                  <Baby className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">
                    {isUr ? 'چلڈرن سینٹر' : 'Pediatrics'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    👶 Children Center & Pediatrics
                  </h3>
                  <p className="text-sm font-semibold text-slate-600" dir="rtl">
                    شعبہ امراضِ اطفال و نوزائیدہ بچوں کی دیکھ بھال
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-xl px-4 py-2 text-xs text-amber-900 font-medium">
                Child-friendly environment & NICU support
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Our dedicated <strong>Children Center</strong> provides healthcare for newborns, infants, children, and adolescents in a child-friendly environment designed to make children and their families feel comfortable, safe, and supported.
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Pediatric services include:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {[
                  'Newborn and infant care',
                  'Pediatric consultations',
                  'Growth and developmental monitoring',
                  'Childhood infections',
                  'Fever and respiratory illnesses',
                  'Asthma and allergies',
                  'Nutritional assessment',
                  'Childhood vaccination guidance',
                  'Gastrointestinal problems',
                  'Anemia and nutritional deficiencies',
                  'School-age health assessments',
                  'Adolescent healthcare',
                  'Pediatric emergency assessment',
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Maternity Center & Specialized Gynecology Department */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-rose-600 tracking-wider">
                    {isUr ? 'میٹرنٹی و گائناکالوجی' : "Women's Health"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    🤰 Maternity Center & Specialized Gynecology Department
                  </h3>
                  <p className="text-sm font-semibold text-slate-600" dir="rtl">
                    میٹرنٹی ہوم، لیبر روم اور شعبہ امراضِ نسواں
                  </p>
                </div>
              </div>

              <div className="bg-rose-50/70 border border-rose-100 rounded-xl px-4 py-2 text-xs text-rose-900 font-medium">
                Lifelong women's healthcare & safe delivery
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Our <strong>Maternity Center with a specialized Gynecology Section</strong> provides comprehensive, lifelong healthcare for women, seamlessly transitioning from routine reproductive wellness to specialized <strong>prenatal, delivery, and postpartum care</strong>.
            </p>

            {/* 4 Stages Sub-grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Stage 1: Women's Wellness */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Women's Wellness</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li>• Routine gynecological consultations</li>
                  <li>• Menstrual and reproductive health</li>
                  <li>• Women's preventive health assessments</li>
                  <li>• Family planning counseling</li>
                  <li>• Preconception counseling</li>
                </ul>
              </div>

              {/* Stage 2: Pregnancy & Antenatal Care */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Pregnancy & Antenatal Care</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li>• Pregnancy confirmation and assessment</li>
                  <li>• Regular antenatal checkups</li>
                  <li>• Maternal health monitoring</li>
                  <li>• Fetal wellbeing assessment</li>
                  <li>• Pregnancy-related investigations</li>
                  <li>• High-risk pregnancy assessment and referral</li>
                </ul>
              </div>

              {/* Stage 3: Maternity & Delivery Care */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Maternity & Delivery Care</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li>• Labor and delivery services</li>
                  <li>• Maternal and fetal monitoring</li>
                  <li>• Normal vaginal delivery care</li>
                  <li>• Emergency obstetric assessment</li>
                  <li>• Post-delivery maternal care</li>
                  <li>• Newborn care and monitoring</li>
                </ul>
              </div>

              {/* Stage 4: Postpartum & Women's Care */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Postpartum & Women's Care</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li>• Postnatal follow-up</li>
                  <li>• Breastfeeding support</li>
                  <li>• Maternal nutrition counseling</li>
                  <li>• Postpartum health assessment</li>
                  <li>• Family planning and reproductive health</li>
                </ul>
              </div>
            </div>

            {/* Referral Protocol Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 font-medium">
              <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Emergency or high-risk obstetric cases</strong> are assessed promptly and referred or transferred to an appropriate higher-level facility when specialized care is required.
              </p>
            </div>
          </div>

          {/* 4. Cardiology Department */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-red-600 tracking-wider">
                    {isUr ? 'شعبہ امراض قلب' : 'Cardiovascular Care'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    ❤️ Cardiology Department
                  </h3>
                  <p className="text-sm font-semibold text-slate-600" dir="rtl">
                    دل کے امراض کی تشخیص، ای سی جی اور بلڈ پریشر کنٹرول
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-xl px-4 py-2 text-xs text-red-900 font-medium">
                ECG & cardiovascular risk evaluation
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Our <strong>Cardiology Services</strong> focus on the prevention, assessment, diagnosis, and ongoing management of cardiovascular conditions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {[
                'Chest pain assessment',
                'Blood pressure management',
                'Heart disease risk assessment',
                'Palpitations & irregular heartbeat evaluation',
                'Shortness-of-breath assessment',
                'ECG and cardiac evaluation',
                'Cardiovascular risk screening',
                'Diabetes-related cardiovascular risk management',
                'Follow-up of known heart disease',
                'Specialist referral and tertiary coordination',
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-medium">{s}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <h4 className="font-bold text-slate-900">Fully Equipped Cardiac Assessment</h4>
              <p className="text-slate-600">
                Our cardiac services are supported by appropriate diagnostic equipment and trained healthcare staff, with clear referral pathways for patients requiring advanced cardiology procedures or tertiary cardiac care.
              </p>
            </div>
          </div>

          {/* 5. Respiratory Medicine & Pulmonary Care */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0 shadow-xs">
                  <Wind className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-cyan-700 tracking-wider">
                    {isUr ? 'شعبہ امراض پھیپھڑا و سانس' : 'Pulmonary Medicine'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    🫁 Respiratory Medicine & Pulmonary Care
                  </h3>
                  <p className="text-sm font-semibold text-slate-600" dir="rtl">
                    دمہ، الرجی، سانس کی تکلیف اور سینے کے انفیکشن کا علاج
                  </p>
                </div>
              </div>

              <div className="bg-cyan-50/70 border border-cyan-100 rounded-xl px-4 py-2 text-xs text-cyan-900 font-medium">
                Nebulization & oxygen support
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Our <strong>Respiratory Medicine Section</strong> provides assessment and management of diseases affecting the lungs and respiratory system.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {[
                'Asthma',
                'Chronic cough',
                'Shortness of breath',
                'Wheezing',
                'Chest infections',
                'Bronchitis',
                'COPD assessment and management',
                'Allergic respiratory conditions',
                'Smoking-related respiratory problems',
                'Recurrent respiratory infections',
                'Pulmonary health assessment',
                'Respiratory emergency assessment',
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0" />
                  <span className="font-medium">{s}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic">
              Where appropriate, patients may undergo respiratory investigations and be referred for advanced pulmonary testing or specialist care.
            </p>
          </div>

          {/* 6. Emergency & Urgent Care */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0 shadow-xs">
                  <Ambulance className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-rose-700 tracking-wider">
                    {isUr ? '۲۴ گھنٹے ایمرجنسی' : '24/7 Urgent Care'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    🚑 Emergency & Urgent Care
                  </h3>
                  <p className="text-sm font-semibold text-slate-600" dir="rtl">
                    چوبیس گھنٹے حادثاتی و فوری طبی امداد
                  </p>
                </div>
              </div>

              <div className="bg-rose-100 text-rose-900 rounded-xl px-4 py-2 text-xs font-bold animate-pulse">
                Always Open 24/7
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Our hospital provides facilities for the assessment and initial management of urgent medical conditions. Emergency services include assessment and stabilization of:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {[
                'Acute fever and infections',
                'Breathing difficulties',
                'Chest pain',
                'Severe allergic reactions',
                'Acute abdominal problems',
                'Injuries and minor trauma',
                'Dehydration',
                'Pediatric emergencies',
                'Pregnancy-related emergencies',
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{s}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-600">
              Patients requiring advanced emergency intervention, intensive care, surgery, or tertiary-level treatment are stabilized where possible and referred promptly to an appropriate facility.
            </div>
          </div>

          {/* 7. Laboratory, Diagnostics & Pharmacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Laboratory */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
                    {isUr ? 'تشخیصی لیب' : 'Diagnostics'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    🔬 Laboratory & Diagnostic Services
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Our healthcare system integrates diagnostic services to support accurate and timely clinical decision-making.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'Routine blood investigations',
                  'Blood glucose testing',
                  'Complete blood count (CBC)',
                  'Liver & kidney function testing',
                  'Urine testing',
                  'Infection-related investigations',
                  'Pregnancy testing',
                  'ECG recording',
                  'Diagnostic imaging partnerships',
                  'Health screening packages',
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pharmacy & Medication */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-teal-700 tracking-wider">
                      {isUr ? 'فارمیسی' : 'Pharmacy'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      💊 Pharmacy & Medication Support
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Our healthcare facility can provide convenient access to prescribed medicines and medication-related guidance through an appropriately managed pharmacy service, subject to applicable regulatory requirements.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-teal-900">
                    <strong>Authentic Pharmaceuticals:</strong> Temperature-monitored storage for pediatric syrups, vaccines, insulin, and maternal medications.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                    <strong>Pharmacist Counseling:</strong> Clear instructions on dosage, timing, and pediatric administration for parents.
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between text-xs text-slate-500">
                <span>Available for OPD & Emergency</span>
                <span className="font-bold text-teal-700">24/7 Access</span>
              </div>
            </div>
          </div>

          {/* 8. Preventive & Health Screening Services */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">
                    {isUr ? 'بچاؤ و اسکریننگ' : 'Wellness & Prevention'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    🩺 Preventive & Health Screening Services
                  </h3>
                  <p className="text-sm font-semibold text-slate-600" dir="rtl">
                    حفاظتی طبی معائنہ، شوگر بلڈ پریشر اسکریننگ اور خاندانی مشاورت
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-900 rounded-xl px-4 py-2 text-xs font-bold border border-emerald-200">
                Prevention Before Disease
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              We believe healthcare is not only about treating disease—it is also about <strong>preventing illness and detecting health problems early</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {[
                'General health checkups',
                'Diabetes screening',
                'Blood pressure screening',
                'Cardiovascular risk assessment',
                "Women's health screening",
                "Children's growth monitoring",
                'Nutritional assessment',
                'Lifestyle counseling',
                'Preventive health education',
                'Chronic disease follow-up',
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PATIENT-CENTERED HEALTHCARE BANNER */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-teal-400/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>{isUr ? 'مریض دوست طبی ماحول' : 'Patient-Centered Healthcare'}</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">
              {isUr
                ? 'سنا گیا۔ عزت دی گئی۔ محفوظ۔ نگہداشت کی گئی۔'
                : 'Heard. Respected. Safe. Cared For.'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {isUr
                ? 'گلزار فیملی ہسپتال اینڈ چلڈرن سینٹر میں ہمارا مقصد ایک ایسا تجربہ تخلیق کرنا ہے جہاں ہر مریض اور خاندان کو بروقت، قابلِ اعتماد اور ہمدردانہ ماحول میں طبی امداد ملے۔'
                : 'At Gulzar Family Hospital & Children Center, our multidisciplinary approach allows patients to access primary care, pediatric services, women’s healthcare, maternity services, respiratory care, cardiac assessment, diagnostics, and emergency support within an integrated healthcare environment.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3 bg-[#0D9488] hover:bg-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-teal-900/50 transition cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{isUr ? 'آن لائن اپائنٹمنٹ بک کریں' : 'Book an Appointment Today'}</span>
            </button>

            {onNavigateDoctors && (
              <button
                onClick={onNavigateDoctors}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm border border-white/20 transition cursor-pointer flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-300" />
                <span>{isUr ? 'ڈاکٹرز کی فہرست دیکھیں' : 'View Doctor Directory'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* COMMITMENT TO THE COMMUNITY & CORE VALUES */}
      <section className="max-w-7xl mx-auto px-4 mt-16 space-y-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              {isUr ? 'کمیونٹی کا عزم' : 'Our Commitment to the Community'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
              {isUr
                ? 'چوک اعظم اور گردونواح کے خاندانوں کی خدمت'
                : 'Serving Chowk Azam, Layyah & Surrounding Communities'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isUr
                ? 'ہم مسلسل اپنی طبی خدمات، ٹیکنالوجی، کلینیکل سسٹمز، مریضوں کے تحفظ کے طریقہ کار اور پیشہ ورانہ معیارات کو بہتر بناتے ہیں تاکہ خاندان گھر کے قریب قابلِ اعتماد صحت کی سہولیات حاصل کر سکیں۔'
                : 'We continuously aim to improve our services, healthcare technology, clinical systems, patient safety practices, and professional standards so that families can access dependable healthcare closer to home.'}
            </p>
          </div>

          {/* Core Values Pills */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider text-center">
              {isUr ? 'ہمارے بنیادی اقدار' : 'Our Core Values'}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-teal-50 border border-teal-200 rounded-full flex items-center gap-2 text-xs font-bold text-teal-900 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{val.en}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-teal-700 font-serif text-[11px]" dir="rtl">
                    {val.ur}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Healthcare for the Whole Family Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-3 max-w-3xl mx-auto">
            <h4 className="text-base font-bold text-slate-900">
              {isUr ? 'پورے خاندان کے لیے جامع صحت' : 'Healthcare for the Whole Family'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              From a newborn's first examination to childhood healthcare, women's reproductive and maternity care, adult family medicine, respiratory and cardiac health, chronic disease management, and healthy aging,{' '}
              <strong>
                Gulzar Family Hospital & Children Center is committed to caring for the whole family throughout life.
              </strong>
            </p>
          </div>

          {/* Hospital Address Card & Contact Action */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-bold font-serif text-xl shadow-md">
                G
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-base">
                  {hospitalInfo.name}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Fatehpur Road, In Front of Zarai Taraqiati Bank (ZTBL), Chowk Azam
                </p>
                <p className="text-xs font-bold text-teal-700 mt-0.5">
                  Your Family's Health in Safe Hands
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`tel:${hospitalInfo.phone}`}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>Call Helpline</span>
              </a>

              <a
                href={`https://wa.me/923404777745?text=${encodeURIComponent(
                  isUr
                    ? 'السلام علیکم! مجھے گلزار فیملی ہسپتال کے بارے میں معلومات چاہیے۔'
                    : 'Hello! I would like more information about Gulzar Family Hospital.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
