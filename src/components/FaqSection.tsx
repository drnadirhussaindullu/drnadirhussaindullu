import React, { useState } from 'react';
import { Language, HospitalInfoData } from '../types';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  PhoneCall,
  Clock,
  Building2,
  CreditCard,
  HeartPulse,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqItem {
  id: string;
  category: string;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
}

interface FaqSectionProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  onOpenBooking?: () => void;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'opd',
    questionEn: 'How can I book an OPD token or doctor appointment?',
    questionUr: 'میں او پی ڈی ٹوکن یا ڈاکٹر کی اپائنٹمنٹ کیسے بک کر سکتا ہوں؟',
    answerEn:
      'You can book an OPD token online through this website by clicking "Book Appointment". Select your doctor, choose a date and a 15-minute time slot (Morning 8 AM–2 PM or Evening 4 PM–8 PM), and fill in patient details. You can choose to pay at the hospital counter on arrival or pay online in advance.',
    answerUr:
      'آپ اس ویب سائٹ پر "اپائنٹمنٹ بک کریں" کے بٹن پر کلک کر کے آن لائن او پی ڈی ٹوکن بک کر سکتے ہیں۔ اپنے ڈاکٹر کا انتخاب کریں، تاریخ اور 15 منٹ کا ٹائم سلاٹ چنیں (صبح 8 سے 2 یا شام 4 سے 8)، اور مریض کی تفصیلات درج کریں۔ آپ ہسپتال پہنچ کر کاؤنٹر پر بھی فیس ادا کر سکتے ہیں یا پہلے آن لائن بھی جمع کرا سکتے ہیں۔',
  },
  {
    id: 'faq-2',
    category: 'opd',
    questionEn: 'What are the OPD clinic timings at Gulzar Family Hospital?',
    questionUr: 'گلزار فیملی ہسپتال میں او پی ڈی کلینک کے اوقات کیا ہیں؟',
    answerEn:
      'The hospital operates two primary OPD shifts daily: Morning Shift from 08:00 AM to 02:00 PM, and Evening Shift from 04:00 PM to 08:00 PM. Emergency and Pediatric Urgent Care remain open 24 hours a day, 7 days a week.',
    answerUr:
      'ہسپتال میں روزانہ دو اہم او پی ڈی شفٹس ہوتی ہیں: صبح کی شفٹ 08:00 AM سے 02:00 PM اور شام کی شفٹ 04:00 PM سے 08:00 PM تک۔ جبکہ ایمرجنسی اور بچوں کی ہنگامی دیکھ بھال 24 گھنٹے ہفتے کے 7 دن جاری رہتی ہے۔',
  },
  {
    id: 'faq-3',
    category: 'fees',
    questionEn: 'Can I pay the consultation fee at the hospital OPD counter?',
    questionUr: 'کیا میں ڈاکٹر کی فیس ہسپتال کے کاؤنٹر پر ادا کر سکتا ہوں؟',
    answerEn:
      'Yes, absolutely! We support both "Pay at Hospital Counter" (cash on arrival) and advance online payment via JazzCash / Easypaisa / Bank Transfer. Advance online payment provides priority queue confirmation.',
    answerUr:
      'جی ہاں، بالکل! آپ ہسپتال کاؤنٹر پر تشریف لا کر نقد فیس ادا کر سکتے ہیں، یا پھر جاز کیش/ایزی پیسہ/بینک ٹرانسفر کے ذریعے پیشگی آن لائن فیس جمع کروا سکتے ہیں۔ پیشگی ادائیگی سے آپ کو ترجیحی ٹوکن نمبر ملتا ہے۔',
  },
  {
    id: 'faq-4',
    category: 'fees',
    questionEn: 'What are the JazzCash and Easypaisa payment account numbers?',
    questionUr: 'جاز کیش اور ایزی پیسہ ادائیگی کے اکاؤنٹ نمبرز کیا ہیں؟',
    answerEn:
      'Official Hospital Payment Accounts:\n• JazzCash: 0340-4777745 (Title: Gulzar Family Hospital)\n• Easypaisa: 0340-4777745 (Title: Dr. Nadir Hussain)\nAfter payment, upload the screenshot/TID on the payment page for automatic slip generation.',
    answerUr:
      'ہسپتال کے سرکاری ادائیگی اکاؤنٹس:\n• جاز کیش: 0340-4777745 (عنوان: Gulzar Family Hospital)\n• ایزی پیسہ: 0340-4777745 (عنوان: Dr. Nadir Hussain)\nادائیگی کے بعد رسیپٹ یا ٹی آئی ڈی ویب سائٹ پر اپ لوڈ کریں تاکہ خودکار سلپ تیار ہو جائے۔',
  },
  {
    id: 'faq-5',
    category: 'online',
    questionEn: 'How does Online Video Consultation work?',
    questionUr: 'آن لائن ویڈیو کنسلٹیشن کا طریقہ کار کیا ہے؟',
    answerEn:
      'Select "Online Video Consultation" during booking. After confirming your appointment, you will receive a WhatsApp video link at your scheduled time. Dr. Nadir Hussain or the consulting specialist will conduct a video call and issue a digital prescription.',
    answerUr:
      'بکنگ کے وقت "آن لائن ویڈیو مشاورت" کا انتخاب کریں۔ اپائنٹمنٹ کنفرم ہونے کے بعد مقررہ وقت پر آپ کو واٹس ایپ پر ویڈیو لنک موصول ہو جائے گا۔ ڈاکٹر صاحب آپ سے ویڈیو کال پر معائنہ کریں گے اور ڈیجیٹل نسخہ فراہم کریں گے۔',
  },
  {
    id: 'faq-6',
    category: 'emergency',
    questionEn: 'Is 24/7 Emergency and Nursery (Incubator) facility available?',
    questionUr: 'کیا 24 گھنٹے ایمرجنسی اور نرسری (انکیوبیٹر) کی سہولت میسر ہے؟',
    answerEn:
      'Yes! Gulzar Family Hospital features a fully equipped Neonatal ICU (NICU) with modern baby incubators, phototherapy units, pediatric emergency care, and oxygen support available 24/7 in Chowk Azam.',
    answerUr:
      'جی ہاں! گلزار فیملی ہسپتال چوک اعظم میں جدید نیونیٹل آئی سی یو (انکیوبیٹر/نرسری)، فوٹو تھراپی، بچوں کی ایمرجنسی، اور آکسیجن کی سہولت 24 گھنٹے میسر ہے۔',
  },
  {
    id: 'faq-7',
    category: 'location',
    questionEn: 'Where is Gulzar Family Hospital located in Chowk Azam?',
    questionUr: 'گلزار فیملی ہسپتال چوک اعظم میں کہاں واقع ہے؟',
    answerEn:
      'The hospital is located on Fatehpur Road, Opposite Govt Higher Secondary School, Chowk Azam, District Layyah, Punjab. You can open the live Google Map location from our website.',
    answerUr:
      'ہسپتال فتح پور روڈ، بالمقابل گورنمنٹ ہائر سیکنڈری سکول، چوک اعظم، ضلع لیہ، پنجاب میں واقع ہے۔ آپ ہماری ویب سائٹ پر گوگل میپ لوکیشن بھی دیکھ سکتے ہیں۔',
  },
  {
    id: 'faq-8',
    category: 'pediatrics',
    questionEn: 'Who are the specialist pediatricians at the hospital?',
    questionUr: 'ہسپتال میں بچوں کے کون سے ماہر ڈاکٹرز موجود ہیں؟',
    answerEn:
      'Dr. Nadir Hussain (Consultant Pediatrician & Child Specialist - MBBS, FCPS Pediatrics) leads the pediatric team alongside specialized gynecologists and child surgeons.',
    answerUr:
      'ڈاکٹر نادر حسین (کنسلٹنٹ پیڈیاٹریشن و چائلڈ سپیشلسٹ - MBBS, FCPS Pediatrics) اور ماہر امراضِ نسواں و چائلڈ سرجنز کی ٹیم مریضوں کی دیکھ بھال کے لیے موجود ہے۔',
  },
];

export const FaqSection: React.FC<FaqSectionProps> = ({
  hospitalInfo,
  lang,
  onOpenBooking,
}) => {
  const isUr = lang === 'ur';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // Question Submission Form state
  const [patientQuestion, setPatientQuestion] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('+92 ');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState<boolean>(false);

  const categories = [
    { id: 'all', nameEn: 'All Questions', nameUr: 'تمام سوالات' },
    { id: 'opd', nameEn: 'OPD & Booking', nameUr: 'او پی ڈی و ٹوکن' },
    { id: 'fees', nameEn: 'Fees & Payment', nameUr: 'فیس و آن لائن ادائیگی' },
    { id: 'online', nameEn: 'Online Video Call', nameUr: 'آن لائن ویڈیو کال' },
    { id: 'emergency', nameEn: '24/7 Emergency', nameUr: 'ایمرجنسی و نرسری' },
    { id: 'pediatrics', nameEn: 'Child Care', nameUr: 'بچوں کا ہسپتال' },
  ];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const qText = (item.questionEn + ' ' + item.questionUr + ' ' + item.answerEn + ' ' + item.answerUr).toLowerCase();
    const matchesSearch = qText.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientQuestion.trim()) return;

    setIsSubmittingQuestion(true);

    setTimeout(() => {
      setIsSubmittingQuestion(false);
      setSubmittedMessage(
        isUr
          ? 'آپ کا سوال کامیابی سے موصول ہو گیا ہے! ہسپتال کا اے آئی ڈیسک یا واٹس ایپ نمائندہ جلد آپ سے رابطہ کرے گا۔'
          : 'Your question has been received! Our medical desk or automated WhatsApp assistant will respond shortly.'
      );
      setPatientQuestion('');
    }, 800);
  };

  return (
    <section className="py-12 sm:py-16 px-4 max-w-7xl mx-auto space-y-10">
      
      {/* Title Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-teal-50 border border-teal-100 text-[#0D9488] text-[11px] font-bold rounded-full uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 text-[#0D9488]" />
          <span>{isUr ? 'عام پوچھے جانے والے سوالات' : 'Frequently Asked Questions (FAQ)'}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-extrabold">
          {isUr ? 'سوالات و جوابات سیکشن' : 'Questions & Answers Desk'}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-sans">
          {isUr
            ? 'گلزار فیملی ہسپتال کے او پی ڈی، فیس، آن لائن ویڈیو مشاورت اور ہنگامی خدمات کے تمام جوابات یہاں حاصل کریں۔'
            : 'Find clear answers about doctor OPD timings, consultation fees, payment methods, baby incubators, and online booking.'}
        </p>
      </div>

      {/* Category Pills & Search Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isUr ? cat.nameUr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUr ? 'سوال کی تلاش کریں...' : 'Search questions...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Accordion List (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">
                {isUr ? 'کوئی سوال نہیں ملا۔ براہ کرم نیچے فارم میں اپنا سوال لکھیں۔' : 'No matching questions found. Type your query in the form on the right.'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqId === faq.id;

              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-teal-600 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleFaq(faq.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isOpen ? 'bg-teal-800 text-amber-300' : 'bg-slate-100 text-slate-700'}`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {isUr ? faq.questionUr : faq.questionEn}
                        </h3>
                        {isUr && (
                          <p className="text-xs text-slate-500 font-sans mt-0.5 dir-ltr text-left">
                            {faq.questionEn}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`p-1.5 rounded-full shrink-0 transition ${isOpen ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50"
                      >
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                          {isUr ? faq.answerUr : faq.answerEn}
                        </p>

                        {!isUr && (
                          <p className="text-xs text-slate-500 font-sans mt-2 pt-2 border-t border-slate-200/60 leading-relaxed">
                            {faq.answerUr}
                          </p>
                        )}

                        {faq.category === 'opd' && onOpenBooking && (
                          <div className="mt-3 pt-2">
                            <button
                              onClick={onOpenBooking}
                              className="inline-flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              <span>{isUr ? 'فوری او پی ڈی ٹوکن لیں' : 'Book OPD Token Now'}</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Submit Question Side Box (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800 shadow-md relative overflow-hidden">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-widest border border-teal-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{isUr ? 'براہِ راست سوال پوچھیں' : 'Ask Hospital Helpdesk'}</span>
              </div>
              <h3 className="text-xl font-serif font-extrabold text-white">
                {isUr ? 'کیا آپ کا سوال موجود نہیں؟' : 'Have a Specific Question?'}
              </h3>
              <p className="text-xs text-slate-300">
                {isUr
                  ? 'اپنا طبی یا او پی ڈی سوال درج کریں۔ ہمارا خودکار سسٹم آپ کو واٹس ایپ پر جواب دے گا۔'
                  : 'Submit your query below. Our automated desk or hospital WhatsApp team will answer you.'}
              </p>
            </div>

            {submittedMessage ? (
              <div className="p-4 bg-teal-950 border border-teal-700/80 rounded-2xl space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                <p className="text-xs text-teal-200 font-bold leading-relaxed">
                  {submittedMessage}
                </p>
                <button
                  onClick={() => setSubmittedMessage(null)}
                  className="text-[11px] text-amber-300 underline font-bold cursor-pointer"
                >
                  {isUr ? 'ایک اور سوال پوچھیں' : 'Ask another question'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {isUr ? 'آپ کا سوال (Question) *' : 'Your Medical / OPD Query *'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={patientQuestion}
                    onChange={(e) => setPatientQuestion(e.target.value)}
                    placeholder={
                      isUr
                        ? 'مثلاً کیا بچوں کی واکسینیشن کی سہولت دستیاب ہے؟'
                        : 'e.g. Is baby vaccination available on Sundays?'
                    }
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {isUr ? 'واٹس ایپ نمبر (WhatsApp Number)' : 'WhatsApp Number (+92...)'}
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+92 340 4777745"
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingQuestion}
                  className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{isSubmittingQuestion ? (isUr ? 'جمع ہو رہا ہے...' : 'Submitting...') : (isUr ? 'سوال بھیجیں' : 'Submit Question')}</span>
                </button>
              </form>
            )}

            {/* Direct WhatsApp Call Banner */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {isUr ? 'فوری فون فار ہیلپ ڈیسک:' : 'Direct Phone Line:'}
              </span>
              <a
                href={`tel:${hospitalInfo.phone}`}
                className="text-amber-300 font-extrabold font-mono hover:underline flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{hospitalInfo.phone}</span>
              </a>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
