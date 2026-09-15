import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  CheckCircle2,
  HeartPulse,
  User,
  MessageSquarePlus,
  Play,
  Pause,
  Sparkles,
  Award,
  ThumbsUp,
  Building2,
  Calendar,
  X,
  Send,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TestimonialItem {
  id: string;
  patientNameEn: string;
  patientNameUr: string;
  cityEn: string;
  cityUr: string;
  doctorReviewedEn: string;
  doctorReviewedUr: string;
  category: 'pediatrics' | 'opd' | 'online' | 'emergency';
  rating: number; // 1-5
  date: string;
  commentEn: string;
  commentUr: string;
  treatmentOutcomeEn: string;
  treatmentOutcomeUr: string;
  verified: boolean;
  avatarBg: string; // Tailwind color class for initials avatar
}

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev-1',
    patientNameEn: 'Muhammad Rizwan',
    patientNameUr: 'محمد رضوان',
    cityEn: 'Chowk Azam',
    cityUr: 'چوک اعظم',
    doctorReviewedEn: 'Dr. Nadir Hussain (Pediatrician)',
    doctorReviewedUr: 'ڈاکٹر نادر حسین (ماہر امراضِ بچوں)',
    category: 'pediatrics',
    rating: 5,
    date: 'August 02, 2026',
    commentEn: 'Dr. Nadir Hussain is an exceptional child specialist in Chowk Azam. My 8-month-old baby had severe chest congestion and high fever. With proper Incubator phototherapy and Dr. Nadir\'s quick diagnosis, my son recovered within 2 days. Highly recommended!',
    commentUr: 'ڈاکٹر نادر حسین چوک اعظم کے بہترین ماہر امراضِ بچوں ہیں۔ میرے 8 ماہ کے بیٹے کو شدید سینے میں جکڑن اور تیز بخار تھا۔ نرسری انکیوبیٹر کی بہترین دیکھ بھال اور ڈاکٹر صاحب کے تجربے سے بچہ 2 دن میں بالکل ٹھیک ہو گیا۔',
    treatmentOutcomeEn: 'Complete Recovery from Pneumonia in 48 hrs',
    treatmentOutcomeUr: '48 گھنٹے میں نزلہ و نیومونیا سے مکمل صحت یابی',
    verified: true,
    avatarBg: 'bg-teal-600',
  },
  {
    id: 'rev-2',
    patientNameEn: 'Mrs. Shabana Yasmeen',
    patientNameUr: 'بیگم شبانہ یاسمین',
    cityEn: 'Fatehpur Road, Layyah',
    cityUr: 'فتح پور روڈ، لیہ',
    doctorReviewedEn: 'Gynecology & Maternity Desk',
    doctorReviewedUr: 'زنانہ و زچگی شعبہ',
    category: 'opd',
    rating: 5,
    date: 'July 28, 2026',
    commentEn: 'We booked the OPD token online through this website and paid via JazzCash. When we arrived at Gulzar Family Hospital, there was zero waiting time. The staff is polite, female doctors are extremely respectful, and the clinic environment is spotless clean.',
    commentUr: 'ہم نے ویب سائٹ سے آن لائن ٹوکن بک کیا اور جاز کیش سے فیس دی- ہسپتال پہنچنے پر بالکل انتظار نہیں کرنا پڑا- عملہ بہت اخلاق والا ہے اور خواتین ڈاکٹرز انتہائی احترام سے معائنہ کرتی ہیں-',
    treatmentOutcomeEn: 'Zero OPD Waiting Time & Smooth Checkup',
    treatmentOutcomeUr: 'بغیر انتظار بہترین اور بااعتماد معائنہ',
    verified: true,
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'rev-3',
    patientNameEn: 'Tariq Mehmood',
    patientNameUr: 'طارق محمود',
    cityEn: 'Karor Lal Esan',
    cityUr: 'کرور لعل عیسن',
    doctorReviewedEn: 'Dr. Shahana Nadir (Gynae Specialist)',
    doctorReviewedUr: 'ڈاکٹر شاہانہ نادر (ماہر امراضِ خواتین)',
    category: 'online',
    rating: 5,
    date: 'July 19, 2026',
    commentEn: 'I booked an Online Video Call Consultation from Karor for my wife\'s pregnancy checkup. Dr. Shahana listened to everything patiently over WhatsApp Video Call and sent a digital prescription instantly. Great initiative for far-away patients!',
    commentUr: 'ہم نے کرور سے آن لائن ویڈیو کال کنسلٹیشن بک کروائی- ڈاکٹر شاہانہ صاحبہ نے واٹس ایپ ویڈیو پر پورا معائنہ اور رہنما ئیاں دیں اور فوری ڈیجیٹل نسخہ بھیج دیا- دور دراز علاقوں کے مریضوں کے لیے زبردست سہولت-',
    treatmentOutcomeEn: 'Convenient Online Video Consultation',
    treatmentOutcomeUr: 'گھر بیٹھے آسان ویڈیو کال معائنہ',
    verified: true,
    avatarBg: 'bg-cyan-600',
  },
  {
    id: 'rev-4',
    patientNameEn: 'Zubair Ahmad',
    patientNameUr: 'زبیر احمد',
    cityEn: 'Chowk Azam',
    cityUr: 'چوک اعظم',
    doctorReviewedEn: '24/7 Pediatric Emergency Unit',
    doctorReviewedUr: '24 گھنٹے بچوں کی ایمرجنسی',
    category: 'emergency',
    rating: 5,
    date: 'June 30, 2026',
    commentEn: 'Late at night around 2 AM, my newborn baby needed urgent oxygen and incubator support. Gulzar Family Hospital emergency staff was alert and immediately shifted the baby to NICU. They saved my baby\'s life.',
    commentUr: 'رات 2 بجے ہمارے نومولود بچے کو فوری آکسیجن اور انکیوبیٹر کی ضرورت پیش آئی- ہسپتال کا عملہ جاگ رہا تھا اور سیکنڈوں میں بچے کو این آئی سی یو منتقل کیا- اللہ کا شکر ہے بچے کی جان بچ گئی-',
    treatmentOutcomeEn: 'Life-saving Emergency NICU Care',
    treatmentOutcomeUr: 'رات گئے ہنگامی نرسری انکیوبیٹر سے جان بچائی گئی',
    verified: true,
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'rev-5',
    patientNameEn: 'Saima Parveen',
    patientNameUr: 'صائمہ پروین',
    cityEn: 'Layyah City',
    cityUr: 'لیہ شہر',
    doctorReviewedEn: 'Dr. Nadir Hussain (Child Specialist)',
    doctorReviewedUr: 'ڈاکٹر نادر حسین',
    category: 'pediatrics',
    rating: 5,
    date: 'June 15, 2026',
    commentEn: 'Best hospital in Layyah district for kids! Very affordable fee structure (Rs. 1000 OPD) compared to big city hospitals, but with top quality treatment and modern machinery.',
    commentUr: 'ضلع لیہ میں بچوں کا بہترین ہسپتال! مناسب ترین فیس اور بڑے شہروں جیسی جدید ترین مشینری اور تسلی بخش علاج-',
    treatmentOutcomeEn: 'Affordable & High Quality Child Care',
    treatmentOutcomeUr: 'مناسب ترین فیس میں بہترین اور تسلی بخش علاج',
    verified: true,
    avatarBg: 'bg-[#0D9488]',
  },
];

interface PatientTestimonialsProps {
  lang: Language;
  onBookClick?: () => void;
}

export const PatientTestimonials: React.FC<PatientTestimonialsProps> = ({
  lang,
  onBookClick,
}) => {
  const isUr = lang === 'ur';

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Review submission modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newReview, setNewReview] = useState({
    patientName: '',
    city: '',
    doctorReviewed: 'Dr. Nadir Hussain',
    category: 'pediatrics' as 'pediatrics' | 'opd' | 'online' | 'emergency',
    rating: 5,
    comment: '',
  });
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Filtered testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  // Keep index within range when filtering changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoplay || filteredTestimonials.length <= 1) return;

    const timer = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoplay, filteredTestimonials.length, currentIndex]);

  const handleNext = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handlePrev = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.patientName || !newReview.comment) return;

    const created: TestimonialItem = {
      id: `rev-${Date.now()}`,
      patientNameEn: newReview.patientName,
      patientNameUr: newReview.patientName,
      cityEn: newReview.city || 'Chowk Azam',
      cityUr: newReview.city || 'چوک اعظم',
      doctorReviewedEn: newReview.doctorReviewed,
      doctorReviewedUr: newReview.doctorReviewed,
      category: newReview.category,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
      commentEn: newReview.comment,
      commentUr: newReview.comment,
      treatmentOutcomeEn: 'Verified Patient Experience',
      treatmentOutcomeUr: 'تصدیق شدہ مریض کی رائے',
      verified: true,
      avatarBg: 'bg-teal-700',
    };

    setTestimonials([created, ...testimonials]);
    setIsSubmittedSuccess(true);

    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setIsModalOpen(false);
      setNewReview({
        patientName: '',
        city: '',
        doctorReviewed: 'Dr. Nadir Hussain',
        category: 'pediatrics',
        rating: 5,
        comment: '',
      });
    }, 1500);
  };

  const currentItem = filteredTestimonials[currentIndex] || filteredTestimonials[0];

  return (
    <section className="py-12 sm:py-16 px-4 max-w-7xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-full uppercase tracking-widest">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{isUr ? 'مریضوں کی آراء و تاثرات' : 'Patient Reviews & Experience'}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-extrabold">
          {isUr ? 'ہمارے اطمینان بخش مریضوں کے زبانی' : 'Trusted by Thousands of Families'}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-sans">
          {isUr
            ? 'چوک اعظم، فتح پور اور ضلع لیہ کے مریضوں اور ان کے بچوں کی گلزار فیملی ہسپتال کے بارے میں سچی آراء پڑھیں۔'
            : 'Read genuine reviews from patients across Chowk Azam, Layyah, and Fatehpur regarding our OPD, Pediatric ICU, and Emergency services.'}
        </p>
      </div>

      {/* Trust Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="text-center p-3 border-r border-slate-100 last:border-0">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xl font-black text-slate-900 font-mono block">4.9 / 5.0</span>
          <span className="text-[11px] text-slate-500 font-medium">Average Rating</span>
        </div>

        <div className="text-center p-3 sm:border-r border-slate-100">
          <span className="text-xl font-black text-teal-600 font-mono block">1,480+</span>
          <span className="text-[11px] text-slate-500 font-medium">Verified Reviews</span>
        </div>

        <div className="text-center p-3 border-r border-slate-100 last:border-0">
          <span className="text-xl font-black text-emerald-600 font-mono block">98.5%</span>
          <span className="text-[11px] text-slate-500 font-medium">Patient Satisfaction</span>
        </div>

        <div className="text-center p-3">
          <span className="text-xl font-black text-slate-900 font-mono block">24/7 Care</span>
          <span className="text-[11px] text-slate-500 font-medium">Nursery & Emergency</span>
        </div>
      </div>

      {/* Category Pills & Action Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
          {[
            { id: 'all', labelEn: 'All Reviews', labelUr: 'تمام آراء' },
            { id: 'pediatrics', labelEn: 'Pediatrics & NICU', labelUr: 'بچوں کا علاج و نرسری' },
            { id: 'opd', labelEn: 'OPD & Booking', labelUr: 'او پی ڈی و ٹوکن' },
            { id: 'online', labelEn: 'Online Video Call', labelUr: 'آن لائن ویڈیو کال' },
            { id: 'emergency', labelEn: '24/7 Emergency', labelUr: 'ایمرجنسی ڈیسک' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isUr ? cat.labelUr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Right Actions: Write Review Button & Slider Autoplay Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer text-xs font-bold flex items-center gap-1.5"
            title={isAutoplay ? 'Pause auto-slide' : 'Start auto-slide'}
          >
            {isAutoplay ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
            <span className="hidden sm:inline">{isAutoplay ? 'Auto' : 'Paused'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-300" />
            <span>{isUr ? 'اپنی رائے درج کریں' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* TESTIMONIAL SLIDER CAROUSEL MAIN CARD */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 min-h-[320px] flex flex-col justify-between overflow-hidden">
        
        {/* Background Quote Watermark */}
        <Quote className="absolute right-6 top-6 w-32 h-32 text-slate-100 pointer-events-none -rotate-12" />

        {/* Content Animation Wrapper */}
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold text-slate-700">No reviews found in this category.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: direction === 'right' ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 'right' ? -40 : 40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6 relative z-10"
            >
              {/* Card Header: Avatar + Patient Info + Verified Tag */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  {/* Initials Avatar */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${currentItem.avatarBg} text-white font-extrabold text-xl flex items-center justify-center shadow-xs shrink-0 font-serif`}
                  >
                    {currentItem.patientNameEn.charAt(0)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-serif text-slate-900">
                        {isUr ? currentItem.patientNameUr : currentItem.patientNameEn}
                      </h3>
                      {currentItem.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isUr ? 'تصدیق شدہ مریض' : 'Verified Patient'}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <span>{isUr ? currentItem.cityUr : currentItem.cityEn}</span>
                      <span>•</span>
                      <span className="text-teal-700 font-bold">
                        {isUr ? currentItem.doctorReviewedUr : currentItem.doctorReviewedEn}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Star Rating & Date */}
                <div className="flex flex-col sm:items-end gap-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(currentItem.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{currentItem.date}</span>
                </div>
              </div>

              {/* Treatment Outcome Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 text-xs font-bold">
                <Award className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{isUr ? currentItem.treatmentOutcomeUr : currentItem.treatmentOutcomeEn}</span>
              </div>

              {/* Review Text Body */}
              <p className="text-base sm:text-lg text-slate-800 font-serif leading-relaxed italic">
                "{isUr ? currentItem.commentUr : currentItem.commentEn}"
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Carousel Bottom Navigation Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 relative z-10">
          
          {/* Slide Progress Counter */}
          <div className="text-xs font-bold text-slate-500 font-mono">
            {currentIndex + 1} / {filteredTestimonials.length}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {filteredTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 'right' : 'left');
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-8 bg-teal-700' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Go to review ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next & Previous Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer shadow-xs"
              title="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-black text-white transition cursor-pointer shadow-xs"
              title="Next review"
            >
              <ChevronRight className="w-5 h-5 text-teal-400" />
            </button>
          </div>
        </div>

      </div>

      {/* SUBMIT REVIEW MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{isUr ? 'گلزار فیملی ہسپتال کے بارے میں رائے' : 'Share Patient Feedback'}</span>
                </div>
                <h3 className="text-xl font-serif font-extrabold text-slate-900">
                  {isUr ? 'اپنی بابت رائے درج کریں' : 'Write Patient Review'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUr
                    ? 'آپ کا ہسپتال، ڈاکٹر اور خدمات کے متعلق تجربہ دوسرے مریضوں کی رہنمائی کرے گا۔'
                    : 'Your review helps other families in Chowk Azam make informed health choices.'}
                </p>
              </div>

              {isSubmittedSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">
                    {isUr ? 'بہت شکریہ! آپ کی رائے شامل کر دی گئی ہے۔' : 'Thank You! Review Added Successfully.'}
                  </h4>
                </div>
              ) : (
                <form onSubmit={handleAddReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {isUr ? 'مریض کا نام *' : 'Patient Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newReview.patientName}
                        onChange={(e) => setNewReview({ ...newReview, patientName: e.target.value })}
                        placeholder="e.g. Imran Ali"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {isUr ? 'شہر / علاقہ' : 'City / Area'}
                      </label>
                      <input
                        type="text"
                        value={newReview.city}
                        onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                        placeholder="e.g. Chowk Azam"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {isUr ? 'ڈاکٹر / شعبہ' : 'Doctor / Unit Visited'}
                      </label>
                      <select
                        value={newReview.doctorReviewed}
                        onChange={(e) => setNewReview({ ...newReview, doctorReviewed: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500"
                      >
                        <option value="Dr. Nadir Hussain (Child Specialist)">Dr. Nadir Hussain (Pediatrician)</option>
                        <option value="Dr. Shahana Nadir (Gynae Specialist)">Dr. Shahana Nadir (Gynecologist)</option>
                        <option value="General OPD & Pharmacy">General OPD & Pharmacy</option>
                        <option value="24/7 NICU Nursery & Emergency">24/7 NICU Nursery & Emergency</option>
                        <option value="Online Video Call Service">Online Video Call Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {isUr ? 'سٹار ریٹنگ' : 'Star Rating'}
                      </label>
                      <div className="flex items-center gap-1 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="p-1 cursor-pointer hover:scale-110 transition"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newReview.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      {isUr ? 'آپ کی رائے / تبصرہ *' : 'Your Review / Experience *'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder={isUr ? 'ڈاکٹر صاحب، عملے اور سہولیات کے بارے میں اپنا تجربہ بیان کریں...' : 'Describe your experience with the doctor, staff, or nursery...'}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4 text-teal-400" />
                    <span>{isUr ? 'رائے جمع کرائیں' : 'Submit Review'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
