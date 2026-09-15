import React, { useState } from 'react';
import { Camera, Sparkles, MapPin, ExternalLink, ShieldCheck, Layers, Maximize2, X, Building, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import { Language, HospitalInfoData } from '../types';

// Importing generated assets
import extDay from '../assets/images/hospital_exterior_day_1786200860724.jpg';
import extNight from '../assets/images/hospital_exterior_night_1786200877212.jpg';
import reception from '../assets/images/hospital_reception_1786200892480.jpg';
import pediatric from '../assets/images/hospital_pediatric_1786200905385.jpg';
import consultation from '../assets/images/hospital_consultation_1786200918671.jpg';
import lab from '../assets/images/hospital_emergency_lab_1786200946162.jpg';
import patientSuite from '../assets/images/hospital_patient_suite_1786200962192.jpg';

interface ConceptItem {
  id: number;
  titleEn: string;
  titleUr: string;
  category: 'exterior' | 'clinical' | 'diagnostics' | 'pediatric_patient';
  imageUrl: string;
  descEn: string;
  descUr: string;
  specs: string[];
}

const CONCEPTS: ConceptItem[] = [
  {
    id: 1,
    titleEn: '1. Modern Hospital Exterior & Main Entrance',
    titleUr: '۱. ہسپتال کا جدید بیرونی منظر و مرکزی داخلی راستہ',
    category: 'exterior',
    imageUrl: extDay,
    descEn: 'Architectural elevation featuring glass atrium, ambulance drop-off, royal blue and emerald green metallic cladding, and prominent illuminated branding.',
    descUr: 'شیشے کے وسیع لابی اٹریم، ایمبولینس راستہ اور شاہانہ گہرے نیلے و زمردی سبز شیڈز کے ساتھ عالمی معیار کا ہسپتال منظر۔',
    specs: ['Royal Blue Cladding', 'Emerald Accents', 'Ambulance Bay', 'All-weather Canopy'],
  },
  {
    id: 2,
    titleEn: '2. Premium Hospital Branding & Signage',
    titleUr: '۲. گلزار فیملی ہسپتال کی باوقار سائن بورڈ برانڈنگ',
    category: 'exterior',
    imageUrl: extDay,
    descEn: '3D acrylic and polished gold trim exterior sign displaying GULZAR FAMILY HOSPITAL & CHILDREN CENTER visible from Fatehpur Road.',
    descUr: 'فتح پور روڈ سے واضح نظر آنے والا تھری ڈی ایکریلک اور سنہری و نیلے بارڈر والا برانڈڈ سائن بورڈ۔',
    specs: ['3D LED Letters', 'Gold Bordering', 'Fatehpur Road Visibility', '24/7 Illumination'],
  },
  {
    id: 3,
    titleEn: '3. Reception & Spacious Waiting Atrium',
    titleUr: '۳. کشادہ مرکزی استقبالیہ و ویٹنگ لابی',
    category: 'clinical',
    imageUrl: reception,
    descEn: 'Double-height lobby with white marble flooring, digital queue display system, comfortable executive seating, and reception counter.',
    descUr: 'سفید مرمر کا ہموار فرش، ڈیجیٹل ٹوکن نمبر ڈسپلے، اور مریضوں و لواحقین کے لیے انتہائی پرسکون ویٹنگ ایریا۔',
    specs: ['Marble Terrazzo Floor', 'Token Queue Screens', 'Air-Conditioned Hall', 'Information Desk'],
  },
  {
    id: 4,
    titleEn: '4. Emergency Department Entrance & Triage',
    titleUr: '۴. ایمرجنسی شعبہ کا داخلی راستہ و ٹریج کاؤنٹر',
    category: 'clinical',
    imageUrl: extDay,
    descEn: 'Dedicated 24/7 direct trauma entry with automatic sliding doors, instant stretcher access, and rapid triage response station.',
    descUr: '۲۴ گھنٹے ایمرجنسی ڈائریکٹ انٹری، آٹومیٹک شیشے کے دروازے اور فوری طبی امداد کا سنٹر۔',
    specs: ['Direct Stretcher Bay', 'Automatic Doors', '24/7 Rapid Triage', 'Direct Oxygen Outlets'],
  },
  {
    id: 5,
    titleEn: '5. Specialist Consultation Rooms',
    titleUr: '۵. سینئر ماہرین کا جدید معائنہ روم',
    category: 'clinical',
    imageUrl: consultation,
    descEn: 'Sound-proofed clinical consultation suites equipped with modern examination couches, diagnostic tools, and digital EMR workstations.',
    descUr: 'خاموش اور حفظانِ صحت کے اصولوں کے مطابق آراستہ ڈاکٹر کلینک و کمپیوٹرائزڈ میڈیکل ریکارڈ سسٹم۔',
    specs: ['Acoustic Soundproofing', 'Digital EMR Desk', 'Ergonomic Patient Bed', 'Privacy Screens'],
  },
  {
    id: 6,
    titleEn: '6. Family Medicine Consultation Suite',
    titleUr: '۶. فیملی میڈیسن و جنرل او پی ڈی کلینک',
    category: 'clinical',
    imageUrl: consultation,
    descEn: 'Spacious consultation environment designed for comprehensive multi-generational family health checks and preventive counseling.',
    descUr: 'تمام خاندانی افراد کے تفصیلی معائنے کے لیے وسیع، آرام دہ اور جدید ترین طبی آلات سے لیس روم۔',
    specs: ['Family Seating', 'Vital Monitoring', 'Preventive Care Desk', 'Hygiene Station'],
  },
  {
    id: 7,
    titleEn: '7. Pediatric Department & NICU Unit',
    titleUr: '۷. شعبہ امراضِ بچوں و نوزائیدہ این آئی سی یو',
    category: 'pediatric_patient',
    imageUrl: pediatric,
    descEn: 'Child-friendly clinical department with specialized pediatric monitoring, radiant warmers, incubators, and warm color accents.',
    descUr: 'نوزائیدہ و چھوٹے بچوں کے لیے این آئی سی یو انکیوبیٹرز، ریڈی اینٹ وارمرز اور پرکشش رنگین ڈیزائن۔',
    specs: ['Neonatal Incubators', 'Phototherapy Units', 'Pediatric Monitors', 'Sterile Environment'],
  },
  {
    id: 8,
    titleEn: '8. Modern Automated Diagnostic Laboratory',
    titleUr: '۸. جدید ترین خودکار پیتھالوجی لیبارٹری',
    category: 'diagnostics',
    imageUrl: lab,
    descEn: 'High-precision computerized lab equipped with automated hematology analyzers, biochemistry units, and fast online report generation.',
    descUr: 'سی بی سی، بائیو کیمسٹری، اور ایمرجنسی ٹیسٹوں کے لیے انتہائی بااعتماد و تیز رفتار کمپیوٹرائزڈ لیب۔',
    specs: ['Automated Analyzers', 'Barcode Tracking', 'Cold Storage System', 'Online WhatsApp Reports'],
  },
  {
    id: 9,
    titleEn: '9. Ultrasound & Color Doppler Room',
    titleUr: '۹. الٹراساؤنڈ و کلر ڈوپلر تشخیصی سینٹر',
    category: 'diagnostics',
    imageUrl: lab,
    descEn: 'Advanced 4D Ultrasound and echocardiography suite for pediatric, abdominal, and high-risk pregnancy fetal scans.',
    descUr: 'حاملہ خواتین اور بچوں کی اندرونی بیماریوں کی بروقت تشخیص کے لیے فور ڈی کلر ڈوپلر الٹراساؤنڈ۔',
    specs: ['High-Res 4D Probe', 'Dimmed Lighting Suite', 'Fetal Monitoring', 'Comfortable Couch'],
  },
  {
    id: 10,
    titleEn: '10. Digital X-Ray & Radiology Suite',
    titleUr: '۱۰. ڈیجیٹل ایکسرے و ریڈیالوجی ڈیپارٹمنٹ',
    category: 'diagnostics',
    imageUrl: lab,
    descEn: 'Lead-lined radiation safe digital radiography room delivering instant crystal-clear orthopedic and chest X-rays.',
    descUr: 'جدید ڈیجیٹل ایکسرے یونٹ جو سیکنڈوں میں واضح تصویر فراہم کرتا ہے مکمل ریڈی ایشن سیفٹی کے ساتھ۔',
    specs: ['Lead Protection Walls', 'CR/DR Digital System', 'Instant PACS View', 'Pediatric Positioners'],
  },
  {
    id: 11,
    titleEn: '11. ECG & Cardiac Diagnostics Suite',
    titleUr: '۱۱. ای سی جی و دل کی بیماریوں کا تشخیصی روم',
    category: 'diagnostics',
    imageUrl: consultation,
    descEn: '12-lead multi-channel digital ECG and continuous cardiac rhythm monitoring bay for immediate pediatric and adult triage.',
    descUr: 'دل کی دھڑکن اور ای سی جی ریکارڈنگ کے لیے ملٹی چینل کمپیوٹرائزڈ مشین۔',
    specs: ['12-Lead ECG Machine', 'Cardiac Monitor', 'Instant Printouts', 'Emergency Crash Cart'],
  },
  {
    id: 12,
    titleEn: '12. 24/7 In-House Hospital Pharmacy',
    titleUr: '۱۲. ۲۴ گھنٹے آن سائٹ میڈیکل سٹور و فارمیسی',
    category: 'clinical',
    imageUrl: reception,
    descEn: 'Fully stocked, temperature-controlled pharmacy providing authentic pediatric formulations, vaccines, and emergency life-saving drugs.',
    descUr: 'درجہ حرارت کنٹرولڈ ایئرکنڈیشنڈ فارمیسی جہاں مستند ادویات اور تمام ضروری اینٹی بائیوٹکس دستیاب ہیں۔',
    specs: ['Cold Chain Vaccine Fridge', 'Authentic Medicines', 'Computerized Billing', '24/7 Staffed'],
  },
  {
    id: 13,
    titleEn: '13. Private Patient Rooms & Inpatient Wards',
    titleUr: '۱۳. پرائیویٹ لکژری رومز و ان پیٹنٹ وارڈز',
    category: 'pediatric_patient',
    imageUrl: patientSuite,
    descEn: 'Spacious executive private rooms with attendant sofa bed, attached tiled washroom, LED TV, central oxygen lines, and nurse call button.',
    descUr: 'مریض اور لواحقین کے لیے گھر جیسا آرام دہ پرائیویٹ روم جس میں اٹیچ باتھ، ایل ای ڈی اور آکسیجن لائن موجود ہے۔',
    specs: ['Central Oxygen Outlet', 'Attendant Sofa Bed', 'Nurse Call Remote', 'Climate Controlled'],
  },
  {
    id: 14,
    titleEn: '14. Central Nursing Station & Monitoring Desk',
    titleUr: '۱۴. سینٹرل نرسنگ اسٹیشن و مانیٹرنگ ڈیسک',
    category: 'clinical',
    imageUrl: reception,
    descEn: 'Strategically located ward command post with multi-patient telemetry monitors, emergency response alarms, and drug preparation counters.',
    descUr: 'وارڈ کا مرکزی پوائنٹ جہاں نرسنگ اسٹاف ہر مریض کی کنڈیشن اور سائنز پر مسلسل نظر رکھتا ہے۔',
    specs: ['Central Telemetry', 'Medication Prep Counter', 'Patient Call Board', 'Direct Doctor Intercom'],
  },
  {
    id: 15,
    titleEn: '15. Hygienic Clean Corridors & Elevators',
    titleUr: '۱۵. صاف ستھرے کارپوریٹ راہداری و سٹریچر گیلری',
    category: 'exterior',
    imageUrl: extDay,
    descEn: 'Wide antibacterially coated corridors with handrails, LED ceiling lights, stretchers clearance, and smooth floor transitions.',
    descUr: 'مریضوں کی باآسانی منتقلی کے لیے کشادہ کورڈورز اور ہینڈ ریلز سے آراستہ۔',
    specs: ['Antibacterial Coating', 'Wide Stretcher Access', 'Handrail Guards', 'Directional Signage'],
  },
  {
    id: 16,
    titleEn: '16. Professional Healthcare Staff Environment',
    titleUr: '۱۶. ماہر میڈیکل ٹیم و کنسلٹنٹس ورکنگ ہال',
    category: 'clinical',
    imageUrl: consultation,
    descEn: 'Dedicated doctor conference room, shift hand-over lounge, and professional environment empowering compassionate clinical excellence.',
    descUr: 'ہمارے ڈاکٹرز اور پیرا میڈیکل اسٹاف کے لیے بہترین و معیاری ہسپتال ورکنگ انوائرمنٹ۔',
    specs: ['Doctors Lounge', 'Digital Handover Screens', 'Continuous Education', 'Strict Hygiene Rules'],
  },
  {
    id: 17,
    titleEn: '17. Modern Children\'s Play & Waiting Area',
    titleUr: '۱۷. بچوں کے لیے دلچسپ ویٹنگ ایریا و پلے زون',
    category: 'pediatric_patient',
    imageUrl: pediatric,
    descEn: 'Vibrant pediatric waiting corner with soft sanitized toys, cartoon murals, books, and interactive play screens to ease hospital anxiety.',
    descUr: 'بچوں کے خوف کو دور کرنے کے لیے کھلونوں اور پلے زون سے آراستہ خصوصی گوشہ۔',
    specs: ['Sanitized Soft Toys', 'Cartoon Murals', 'Safe Soft Flooring', 'Calming Music/Videos'],
  },
  {
    id: 18,
    titleEn: '18. Landscaped Outdoor Hospital Gardens',
    titleUr: '۱۸. ہسپتال کا سرسبز و شاداب گارڈن و گرینری',
    category: 'exterior',
    imageUrl: extDay,
    descEn: 'Peaceful healing garden featuring indigenous flora, manicured grass lawns, shaded walkways, and fresh air sitting benches.',
    descUr: 'مریضوں کی ذہنی تازگی اور شفایابی کے لیے خوبصورت پھول، سرسبز گھاس اور بنچ۔',
    specs: ['Healing Green Lawn', 'Fresh Air Walkways', 'Shaded Tree Canopy', 'Night Landscape Lights'],
  },
  {
    id: 19,
    titleEn: '19. Ample Vehicle Parking & Access Roads',
    titleUr: '۱۹. وسیع گاڑیاں و موٹر سائیکل پارکنگ زون',
    category: 'exterior',
    imageUrl: extDay,
    descEn: 'Paved, well-lit automobile parking area with dedicated emergency vehicle clearance and security guard checkpoint.',
    descUr: 'گاڑیوں اور موٹر سائیکلوں کے لیے مکمل محفوظ و کشادہ پکی پارکنگ کی جگہ۔',
    specs: ['CCTV Monitored', 'Direct Gate Access', 'Free Patient Parking', 'Clear Paving Markers'],
  },
  {
    id: 20,
    titleEn: '20. Night-Time Illuminated Hospital Campus',
    titleUr: '۲۰. ہسپتال کی رات کے وقت شاندار نائٹ لائٹنگ',
    category: 'exterior',
    imageUrl: extNight,
    descEn: 'Architectural facade lighting rendering a safe, reassuring beacon of healthcare visible 24/7 along Fatehpur Road, Layyah.',
    descUr: 'رات کے وقت روشن اور محفوظ لینڈ مارک جو فتح پور روڈ پر دور سے نظر آتا ہے۔',
    specs: ['Architectural LED Facade', 'Emergency Neon Signs', 'High Security Lights', '24/7 Active Glow'],
  },
];

interface FutureGalleryProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  onOpenBooking: () => void;
}

export const FutureGallery: React.FC<FutureGalleryProps> = ({
  hospitalInfo,
  lang,
  onOpenBooking,
}) => {
  const isUr = lang === 'ur';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<ConceptItem | null>(null);

  const filteredConcepts = CONCEPTS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        {/* Decorative architectural grid lines */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Future Hospital Concept / Proposed Design • گلزار فیملی ہسپتال</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif text-white leading-tight">
              {isUr ? 'ہمارا مستقبل: گلزار فیملی ہسپتال کی جدید عمارت' : 'Digital Future Hospital Photography Gallery'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {isUr
                ? 'چوک اعظم، ضلع لیہ میں گلزار فیملی ہسپتال و چلڈرن سینٹر کی آئندہ توسیع اور بین الاقوامی معیار کے ہیلتھ کیئر انفراسٹرکچر کا مجوزہ ڈیزائن۔'
                : 'Explore the 20 future development concepts for Gulzar Family Hospital & Children Center. A modern architectural vision featuring Royal Blue cladding, Emerald Green accents, and state-of-the-art medical technology.'}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-amber-300/90 font-mono">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Architectural Values: Trust • Modern Healthcare • Family • Safety • Compassion • Professionalism</span>
            </div>
          </div>

          <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 text-xs space-y-2 shrink-0 max-w-xs">
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block">Official Location</span>
            <p className="font-semibold text-slate-200">
              Fatehpur Road, In Front of ZTBL, Chowk Azam, Layyah, Punjab
            </p>
            <a
              href="https://share.google/nClgUpNiP0qDg6Dpe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-teal-400 font-bold hover:underline pt-1 text-[11px]"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Open Google Maps Location</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isUr ? 'تمام ۲۰ مناظر (All Concepts)' : 'All 20 Future Concepts'}
          </button>

          <button
            onClick={() => setSelectedCategory('exterior')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'exterior'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isUr ? 'عمارت و بیرونی منظر (Exterior)' : 'Exterior & Campus'}
          </button>

          <button
            onClick={() => setSelectedCategory('clinical')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'clinical'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isUr ? 'کلینکس و استقبالیہ (Clinical)' : 'Clinical & Emergency'}
          </button>

          <button
            onClick={() => setSelectedCategory('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'diagnostics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isUr ? 'لیبارٹری و ایکسرے (Diagnostics)' : 'Diagnostics & Labs'}
          </button>

          <button
            onClick={() => setSelectedCategory('pediatric_patient')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'pediatric_patient'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isUr ? 'بچوں کا شعبہ و مریض رومز (Pediatric & Rooms)' : 'Patient & Children Rooms'}
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono font-medium">
          Showing {filteredConcepts.length} of 20 Concepts
        </span>
      </div>

      {/* Grid of Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConcepts.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModalItem(item)}
            className="group bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Image Container with Badge */}
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />

                {/* Mandatory Concept Badge Overlay */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Proposed Concept</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalItem(item);
                  }}
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-xl backdrop-blur-md shadow-md transition"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Text Info */}
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-serif text-slate-900 group-hover:text-[#0D9488] transition leading-snug">
                  {isUr ? item.titleUr : item.titleEn}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3">
                  {isUr ? item.descUr : item.descEn}
                </p>

                {/* Specifications Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.specs.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="text-[11px] font-mono text-[#0D9488]">
                Concept #{item.id}
              </span>
              <span className="flex items-center gap-1 text-[#0D9488] group-hover:translate-x-1 transition">
                <span>View Specs</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <span className="inline-block px-3 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-widest border border-amber-500/30">
                  Future Hospital Concept / Proposed Design
                </span>
                <h3 className="text-lg sm:text-xl font-serif text-white">
                  {isUr ? activeModalItem.titleUr : activeModalItem.titleEn}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Large Image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-96 object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700">
                  Gulzar Family Hospital & Children Center • Proposed Design
                </div>
              </div>

              {/* Text Description */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Architectural & Functional Overview
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed font-sans">
                  {activeModalItem.descEn}
                </p>
                <p className="text-sm text-[#0D9488] leading-relaxed font-serif text-right" dir="rtl">
                  {activeModalItem.descUr}
                </p>
              </div>

              {/* Specifications */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Design Specifications & Identity
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-xs">
                  {activeModalItem.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Note */}
              <div className="flex items-center justify-between bg-teal-50 p-4 rounded-2xl border border-teal-100 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#0D9488] block">Hospital Location</span>
                  <span className="text-slate-600">Fatehpur Road, In Front of ZTBL, Chowk Azam, Layyah</span>
                </div>
                <a
                  href="https://share.google/nClgUpNiP0qDg6Dpe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Book consultations with current specialist team today
              </span>
              <button
                onClick={() => {
                  setActiveModalItem(null);
                  onOpenBooking();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                Book Appointment Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
