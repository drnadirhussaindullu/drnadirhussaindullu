import React, { useState } from 'react';
import { Doctor, Language, HospitalInfoData } from '../types';
import {
  Calendar,
  Stethoscope,
  Clock,
  Check,
  Video,
  Building2,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Award,
  GraduationCap,
  ShieldCheck,
  Info,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { DoctorDetailModal } from './DoctorDetailModal';
import { HOSPITAL_INFO } from '../data/mockData';

interface DoctorsListProps {
  doctors: Doctor[];
  lang: Language;
  onSelectDoctorToBook: (doctor: Doctor) => void;
  hospitalInfo?: HospitalInfoData;
}

interface DoctorCapacityData {
  day: string;
  dayUr: string;
  morningFree: number;
  morningBooked: number;
  eveningFree: number;
  eveningBooked: number;
  totalFree: number;
  totalBooked: number;
}

const getDoctorWeeklyCapacity = (doctorId: string): DoctorCapacityData[] => {
  const isDrNadir = doctorId === 'doc-1';
  const isDrShahana = doctorId === 'doc-2';

  return [
    { day: 'Mon', dayUr: 'پیر', morningFree: isDrNadir ? 18 : 14, morningBooked: isDrNadir ? 6 : 10, eveningFree: 12, eveningBooked: 4, totalFree: isDrNadir ? 30 : 26, totalBooked: isDrNadir ? 10 : 14 },
    { day: 'Tue', dayUr: 'منگل', morningFree: isDrShahana ? 12 : 20, morningBooked: isDrShahana ? 12 : 4, eveningFree: 10, eveningBooked: 6, totalFree: isDrShahana ? 22 : 30, totalBooked: isDrShahana ? 18 : 10 },
    { day: 'Wed', dayUr: 'بدھ', morningFree: 22, morningBooked: 2, eveningFree: 14, eveningBooked: 2, totalFree: 36, totalBooked: 4 },
    { day: 'Thu', dayUr: 'جمعرات', morningFree: 16, morningBooked: 8, eveningFree: 8, eveningBooked: 8, totalFree: 24, totalBooked: 16 },
    { day: 'Fri', dayUr: 'جمعہ', morningFree: 14, morningBooked: 10, eveningFree: 11, eveningBooked: 5, totalFree: 25, totalBooked: 15 },
    { day: 'Sat', dayUr: 'ہفتہ', morningFree: 20, morningBooked: 4, eveningFree: 13, eveningBooked: 3, totalFree: 33, totalBooked: 7 },
  ];
};

export const DoctorsList: React.FC<DoctorsListProps> = ({
  doctors,
  lang,
  onSelectDoctorToBook,
  hospitalInfo,
}) => {
  const isUr = lang === 'ur';
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Detailed doctor profile modal state
  const [selectedDetailDoctor, setSelectedDetailDoctor] = useState<Doctor | null>(null);

  // Chart visualization state
  const [selectedChartDocId, setSelectedChartDocId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [expandedCardDocId, setExpandedCardDocId] = useState<string | null>(null);

  const departments = Array.from(new Set(doctors.map((d) => d.departmentEn)));

  const filteredDoctors = doctors.filter((d) => {
    const matchesDept = selectedDept === 'all' || d.departmentEn === selectedDept;
    const matchesSearch =
      d.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.nameUr.includes(searchQuery) ||
      d.specialtyEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const chartDoctor = doctors.find((d) => d.id === selectedChartDocId) || doctors[0];
  const chartData = getDoctorWeeklyCapacity(selectedChartDocId);

  // Compute summary stats
  const totalFreeSlotsWeek = chartData.reduce((acc, curr) => acc + curr.totalFree, 0);
  const totalBookedSlotsWeek = chartData.reduce((acc, curr) => acc + curr.totalBooked, 0);
  const occupancyPercentage = Math.round((totalBookedSlotsWeek / (totalFreeSlotsWeek + totalBookedSlotsWeek)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="py-12 px-4 max-w-7xl mx-auto space-y-10"
    >
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center max-w-3xl mx-auto space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-teal-50 border border-teal-100 text-[#0D9488] text-[10px] font-bold rounded-full uppercase tracking-widest">
          <Stethoscope className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>{isUr ? 'گلزار فیملی ہسپتال کے ماہر ڈاکٹرز' : 'Gulzar Family Hospital Specialist Team'}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900">
          {isUr ? 'ہمارے سینئر ماہر امراض و معالجین' : 'Specialist Doctors & Live OPD Schedule'}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-sans">
          {isUr
            ? 'بچوں کے سینئر ماہرین، ماہر امراض نسواں و زچگی اور چائلڈ سرجنز کی ٹیم بوقت ضرورت دستیاب ہے۔'
            : 'Consult with top pediatricians, gynecologists, child surgeons, and family physicians in Layyah.'}
        </p>
      </motion.div>

      {/* RECHARTS: Doctor Availability & Slot Capacity Visualizer Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-extrabold uppercase tracking-widest">
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>{isUr ? 'لائیو ٹائم سلاٹ کیپیسٹی ویژولائزر' : 'Live Slot Availability Chart'}</span>
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900">
              {isUr ? 'ڈاکٹر ٹائم سلاٹ کپیسیٹی اینڈ بکنگ چارٹ' : 'Doctor Weekly Capacity & Slot Demand'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUr
                ? 'مختلف ایام میں دستیاب 15 منٹ کے آزاد بمقابلہ بک شدہ سلاٹس دیکھیں'
                : 'Interactive chart showing 15-minute free vs. booked appointment slots per day.'}
            </p>
          </div>

          {/* Doctor Selector Tabs for Chart */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedChartDocId(doc.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                  selectedChartDocId === doc.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <img
                  src={doc.avatarUrl}
                  alt={doc.nameEn}
                  className="w-5 h-5 rounded-full object-cover border border-slate-300"
                />
                <span>{isUr ? doc.nameUr.split(' ')[0] + ' ' + (doc.nameUr.split(' ')[1] || '') : doc.nameEn.split(' ')[1] || doc.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Capacity Summary Stats Pill Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">Available Free Slots</span>
            <span className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">{totalFreeSlotsWeek} Slots</span>
          </div>
          <div className="bg-teal-50/60 border border-teal-100 p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest block">Reserved / Booked</span>
            <span className="text-lg font-black text-teal-800 font-mono mt-0.5 block">{totalBookedSlotsWeek} Tokens</span>
          </div>
          <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">Slot Demand Occupancy</span>
            <span className="text-lg font-black text-amber-700 font-mono mt-0.5 block">{occupancyPercentage}% Occupied</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Shift Schedule</span>
            <span className="text-xs font-extrabold text-slate-900 block mt-1">8 AM–2 PM & 4 PM–8 PM</span>
          </div>
        </div>

        {/* Recharts BarChart Component */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey={isUr ? 'dayUr' : 'day'}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                  padding: '12px 16px',
                }}
                formatter={(value: number, name: string) => [
                  `${value} Slots`,
                  name === 'totalFree' ? 'Free 15-min Slots' : 'Booked Appointments',
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 600 }}
                formatter={(value) => (value === 'totalFree' ? 'Available Free Slots' : 'Booked / Reserved Tokens')}
              />
              <Bar dataKey="totalFree" name="totalFree" fill="#0D9488" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="totalBooked" name="totalBooked" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedDept === 'all'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isUr ? 'تمام شعبہ جات' : 'All Departments'}
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedDept === dept
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUr ? 'ڈاکٹر کا نام تلاش کریں...' : 'Search doctor name...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
          />
        </div>
      </motion.div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc, idx) => {
          const docCapacity = getDoctorWeeklyCapacity(doc.id);
          const isCardExpanded = expandedCardDocId === doc.id;

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * idx + 0.25 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                {/* Doctor Header (Clickable for full profile) */}
                <div
                  onClick={() => setSelectedDetailDoctor(doc)}
                  className="flex items-start gap-4 cursor-pointer group/profile"
                  title={isUr ? 'ڈاکٹر کی مکمل تعلیمی اسناد اور تجربہ دیکھیں' : 'Click to view doctor credentials & experience'}
                >
                  <div className="relative shrink-0">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.nameEn}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs group-hover/profile:border-teal-500 group-hover/profile:scale-105 transition"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-slate-200 shadow-2xs text-teal-700">
                      <Info className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-[#0D9488] text-[10px] font-bold uppercase rounded">
                        {isUr ? doc.departmentUr : doc.departmentEn}
                      </span>
                      {doc.pmdcRegistration && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                          <ShieldCheck className="w-2.5 h-2.5 text-teal-600" />
                          <span>{doc.pmdcRegistration}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-serif text-slate-900 group-hover/profile:text-teal-800 transition leading-snug truncate">
                      {isUr ? doc.nameUr : doc.nameEn}
                    </h3>
                    <p className="text-xs text-[#0D9488] font-bold truncate">
                      {isUr ? doc.specialtyUr : doc.specialtyEn}
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono line-clamp-1">
                      {isUr ? doc.qualificationUr : doc.qualificationEn}
                    </p>
                  </div>
                </div>

                {/* Experience & Qualifications Pill Bar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>{doc.experienceYears}+ {isUr ? 'سال پریکٹس' : 'Years Experience'}</span>
                  </span>
                  <span className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-teal-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-teal-600" />
                    <span>{doc.qualificationEn.split(',')[0]}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                      doc.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${doc.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{doc.isAvailable ? (isUr ? 'دستیاب' : 'Available') : (isUr ? 'رخصت پر' : 'On Leave')}</span>
                  </span>
                </div>

                {/* Doctor On Leave Banner if unavailable */}
                {!doc.isAvailable && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-xs flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0 animate-ping" />
                    <div>
                      <span className="font-bold block">
                        {isUr ? 'ڈاکٹر اس وقت رخصت پر ہیں:' : 'Doctor on Leave / Unavailable:'}
                      </span>
                      <span className="text-[11px] text-rose-700">
                        {doc.unavailabilityReason || (isUr ? 'عارضی طور پر بکنگ معطل ہے' : 'Temporarily unavailable for bookings')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Specializations Teaser */}
                {doc.specializationsEn && doc.specializationsEn.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {isUr ? 'اہم شعبہ جاتی مہارت:' : 'Key Specializations:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(isUr && doc.specializationsUr ? doc.specializationsUr : doc.specializationsEn).slice(0, 2).map((spec, sIdx) => (
                        <span key={sIdx} className="text-[10px] bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]">
                          • {spec}
                        </span>
                      ))}
                      {doc.specializationsEn.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDetailDoctor(doc)}
                          className="text-[10px] text-teal-700 hover:text-teal-900 font-bold px-1.5 py-0.5 hover:underline cursor-pointer"
                        >
                          +{doc.specializationsEn.length - 2} {isUr ? 'مزید اسناد' : 'more...'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Working Days & Hours */}
                <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-2 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                      {isUr ? 'کلینک کے اوقات:' : 'Clinic Hours:'}
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      08:00 AM - 08:00 PM
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">{isUr ? 'کام کے ایام:' : 'Working Days:'}</span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {doc.workingDays.slice(0, 3).join(', ')}...
                    </span>
                  </div>
                </div>

                {/* Fee Structure */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {isUr ? 'ہسپتال وزٹ' : 'Hospital Visit'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono block mt-0.5">
                      PKR {doc.feePKR}
                    </span>
                  </div>

                  <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100">
                    <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#0D9488] uppercase">
                      <Video className="w-3 h-3 text-[#0D9488]" />
                      {isUr ? 'آن لائن کنسلٹیشن' : 'Online Call'}
                    </span>
                    <span className="text-sm font-bold text-[#0D9488] font-mono block mt-0.5">
                      PKR {doc.onlineFeePKR}
                    </span>
                  </div>
                </div>

                {/* Mini Chart Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedCardDocId(isCardExpanded ? null : doc.id)}
                    className="w-full py-2 px-3 bg-teal-50/70 hover:bg-teal-100/60 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isUr ? 'ہفتہ وار سلٹ کیپیسیٹی چارٹ' : 'View Weekly Slot Chart'}</span>
                    </span>
                    {isCardExpanded ? (
                      <ChevronUp className="w-4 h-4 text-teal-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-teal-700" />
                    )}
                  </button>

                  {/* Expandable Recharts Mini Bar Chart */}
                  <AnimatePresence>
                    {isCardExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-slate-900 text-white rounded-2xl space-y-2 overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-teal-300">
                          <span>15-Min Slots Availability</span>
                          <span>Mon–Sat</span>
                        </div>
                        <div className="h-36 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={docCapacity} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                              <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                              <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                              />
                              <Bar dataKey="totalFree" name="Free" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="totalBooked" name="Booked" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons: View Detailed Profile + Book Appointment */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDetailDoctor(doc)}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-teal-50 border border-slate-300 hover:border-teal-400 text-slate-800 hover:text-teal-900 py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs"
                  title="View complete qualifications, specializations, degrees, and career milestones"
                >
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>{isUr ? 'تفصیلی پروفائل و اسناد' : 'Doctor Qualifications'}</span>
                </button>

                <button
                  type="button"
                  disabled={!doc.isAvailable}
                  onClick={() => onSelectDoctorToBook(doc)}
                  className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition ${
                    doc.isAvailable
                      ? 'bg-slate-900 hover:bg-black text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                  }`}
                >
                  <Calendar className={`w-4 h-4 ${doc.isAvailable ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>
                    {doc.isAvailable
                      ? isUr
                        ? 'ٹوکن بک کریں'
                        : 'Book Token'
                      : isUr
                      ? 'ڈاکٹر رخصت پر ہیں'
                      : 'Doctor On Leave'}
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Doctor Detailed Profile Modal */}
      <DoctorDetailModal
        doctor={selectedDetailDoctor}
        isOpen={!!selectedDetailDoctor}
        onClose={() => setSelectedDetailDoctor(null)}
        lang={lang}
        onSelectDoctorToBook={onSelectDoctorToBook}
        hospitalInfo={hospitalInfo || HOSPITAL_INFO}
      />
    </motion.div>
  );
};

