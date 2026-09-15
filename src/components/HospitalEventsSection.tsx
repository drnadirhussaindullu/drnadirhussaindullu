import React, { useState } from 'react';
import { HospitalEvent, Language } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  RefreshCw,
  Gift,
  HeartPulse,
  Stethoscope,
  Building,
} from 'lucide-react';

interface HospitalEventsSectionProps {
  events: HospitalEvent[];
  lang: Language;
  onOpenBooking: (doctorName?: string) => void;
  isLiveConnected?: boolean;
}

export const HospitalEventsSection: React.FC<HospitalEventsSectionProps> = ({
  events,
  lang,
  onOpenBooking,
  isLiveConnected = true,
}) => {
  const isUr = lang === 'ur';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter out any past events automatically so expired dates are never shown
  const today = new Date().toISOString().split('T')[0];
  const activeEvents = events.filter((e) => {
    const end = e.endDate || e.startDate;
    return end >= today;
  });

  const filteredEvents = activeEvents.filter((e) => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  const getCategoryBadge = (cat: HospitalEvent['category']) => {
    switch (cat) {
      case 'medical_camp':
        return {
          labelEn: 'Free Medical Camp',
          labelUr: 'مفت طبی کیمپ',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <Gift className="w-3.5 h-3.5 text-emerald-700" />,
        };
      case 'specialist_visit':
        return {
          labelEn: 'Visiting Specialist',
          labelUr: 'مہمان سپیشلسٹ دورہ',
          color: 'bg-teal-100 text-teal-800 border-teal-300',
          icon: <Stethoscope className="w-3.5 h-3.5 text-teal-700" />,
        };
      case 'holiday':
        return {
          labelEn: 'Holiday OPD Schedule',
          labelUr: 'تعطیل شیڈول و ایمرجنسی',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-700" />,
        };
      case 'vaccination_drive':
        return {
          labelEn: 'Vaccination Drive',
          labelUr: 'حفاظتی ٹیکہ جات مہم',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <HeartPulse className="w-3.5 h-3.5 text-blue-700" />,
        };
      default:
        return {
          labelEn: 'Health Program',
          labelUr: 'صحت پروگرام',
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-700" />,
        };
    }
  };

  const getRelativeBadge = (startDate: string, endDate: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (startDate <= todayStr && endDate >= todayStr) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white text-xs font-black rounded-full animate-pulse shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          {isUr ? '⚡ آج فعال ہے (LIVE TODAY)' : '⚡ HAPPENING TODAY'}
        </span>
      );
    }

    const start = new Date(startDate);
    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 bg-amber-500 text-white text-xs font-extrabold rounded-full shadow-sm">
          {isUr ? 'کل شروع ہوگا (Tomorrow)' : 'Starts Tomorrow'}
        </span>
      );
    }

    if (diffDays > 1 && diffDays <= 7) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 bg-teal-700 text-white text-xs font-bold rounded-full">
          {isUr ? `${diffDays} دنوں میں` : `In ${diffDays} days`}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
        {startDate}
      </span>
    );
  };

  return (
    <section id="hospital-events-section" className="py-12 bg-gradient-to-b from-teal-50/60 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full border border-teal-200">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                {isUr ? 'طبی کیمپس، تاریخیں و ہسپتال نوٹسز' : 'Medical Camps, Dates & Hospital Events'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isUr ? 'لائیو ڈیٹا بیس سے خودکار اپ ڈیٹ' : 'Live Database Synced'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isUr
                ? 'مفت طبی کیمپس، تعطیلات و شیڈول'
                : 'Upcoming Medical Camps & Hospital Dates'}
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {isUr
                ? 'گلزار فیملی ہسپتال کے تمام طبی کیمپس، مہمان سپیشلسٹ ڈاکٹرز اور عام تعطیلات کا شیڈول براہ راست لائیو ڈیٹا بیس سے اپ ڈیٹ رہتا ہے اور پرانی تاریخیں خودکار طریقے سے ختم ہو جاتی ہیں۔'
                : 'All consultation camps, visiting specialists, and holiday OPD notices are dynamically pulled from the live database. Expired dates are automatically removed.'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', en: 'All Events', ur: 'تمام' },
              { id: 'medical_camp', en: 'Medical Camps', ur: 'طبی کیمپس' },
              { id: 'specialist_visit', en: 'Specialist Visits', ur: 'مہمان ڈاکٹرز' },
              { id: 'holiday', en: 'Holidays & OPD', ur: 'تعطیلات' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-800 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isUr ? cat.ur : cat.en}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">
              {isUr ? 'اس کیٹیگری میں فی الحال کوئی کیمپ نہیں ہے' : 'No Active Events in this Category'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isUr
                ? 'تمام پرانی تاریخیں خودکار حذف ہو چکی ہیں۔ باقاعدہ او پی ڈی اور 24 گھنٹے ایمرجنسی کھلی ہے۔'
                : 'Expired dates have been automatically cleaned. Regular 24/7 Emergency & OPD are running.'}
            </p>
          </div>
        )}

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const badge = getCategoryBadge(event.category);
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header & Badges */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${badge.color}`}
                    >
                      {badge.icon}
                      {isUr ? badge.labelUr : badge.labelEn}
                    </span>

                    {getRelativeBadge(event.startDate, event.endDate)}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-teal-800 transition-colors">
                    {isUr ? event.titleUr : event.titleEn}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {isUr ? event.descriptionUr : event.descriptionEn}
                  </p>
                </div>

                {/* Details List */}
                <div className="p-5 space-y-2.5 bg-slate-50/50 text-xs text-slate-700 flex-1">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">
                        {isUr ? 'تاریخ:' : 'Dates:'}{' '}
                      </span>
                      {event.startDate === event.endDate
                        ? event.startDate
                        : `${event.startDate} ${isUr ? 'تا' : 'to'} ${event.endDate}`}
                    </div>
                  </div>

                  {event.timeRangeEn && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900">
                          {isUr ? 'اوقات:' : 'Timings:'}{' '}
                        </span>
                        {isUr ? event.timeRangeUr || event.timeRangeEn : event.timeRangeEn}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">
                        {isUr ? 'مقام:' : 'Location:'}{' '}
                      </span>
                      {isUr ? event.locationUr : event.locationEn}
                    </div>
                  </div>

                  {event.doctorInChargeEn && (
                    <div className="flex items-start gap-2">
                      <UserCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900">
                          {isUr ? 'نگران ڈاکٹر:' : 'Supervising Doctor:'}{' '}
                        </span>
                        {isUr
                          ? event.doctorInChargeUr || event.doctorInChargeEn
                          : event.doctorInChargeEn}
                      </div>
                    </div>
                  )}

                  {/* Pricing / Free Indicator */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 mt-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        event.isFree
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {event.isFree
                        ? isUr
                          ? 'مفت طبی سہولت (100% Free)'
                          : '100% Free Consultation'
                        : isUr
                        ? 'رعایتی / ہسپتال فیس'
                        : 'Standard Hospital Fee'}
                    </span>

                    <span
                      className={`text-[11px] font-semibold ${
                        event.registrationOpen ? 'text-teal-700' : 'text-slate-500'
                      }`}
                    >
                      {event.registrationOpen
                        ? isUr
                          ? 'رجسٹریشن کھلی ہے'
                          : 'Registration Open'
                        : isUr
                        ? 'رجسٹریشن بند'
                        : 'Registration Closed'}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 italic">
                    {isUr ? 'ٹوکن پہلے سے بک کروائیں' : 'Reserve token early'}
                  </span>

                  <button
                    onClick={() => onOpenBooking(event.doctorInChargeEn)}
                    disabled={!event.registrationOpen}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      event.registrationOpen
                        ? 'bg-teal-800 text-white hover:bg-teal-900 shadow-sm active:scale-95 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isUr ? 'ٹوکن حاصل کریں' : 'Book Token'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
