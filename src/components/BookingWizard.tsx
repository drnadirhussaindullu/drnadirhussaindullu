import React, { useState, useEffect } from 'react';
import { Doctor, Language, ConsultationType, Gender, TimeSlot, Appointment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Video,
  Building2,
  ChevronRight,
  ArrowLeft,
  Lock,
  Loader2,
  Sun,
  Moon,
  CreditCard,
  Banknote,
  Printer,
  Sparkles,
  MapPin,
  Check,
  Download,
} from 'lucide-react';
import { generateAppointmentPDF } from '../utils/pdfGenerator';
import { HOSPITAL_INFO } from '../data/mockData';

interface BookingWizardProps {
  doctors: Doctor[];
  selectedDoctor?: Doctor | null;
  lang: Language;
  onBookingSuccess: (appointment: Appointment) => void;
  onCancel: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  doctors,
  selectedDoctor,
  lang,
  onBookingSuccess,
  onCancel,
}) => {
  const isUr = lang === 'ur';

  const [step, setStep] = useState<number>(1);
  const [chosenDoctor, setChosenDoctor] = useState<Doctor | null>(selectedDoctor || doctors[0] || null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('hospital_visit');
  
  // Daily auto-updated calendar starting today
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [lockingSlot, setLockingSlot] = useState<boolean>(false);

  // Patient Info Form State
  const [patientName, setPatientName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [whatsAppNumber, setWhatsAppNumber] = useState<string>('+92');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  
  // Payment Choice: 'pay_at_counter' (no online payment required) vs 'online_payment'
  const [paymentOption, setPaymentOption] = useState<'pay_at_counter' | 'online_payment'>('pay_at_counter');
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  // Generate 30-day auto-updated calendar dates on a daily basis (Lifetime maintenance-free)
  const calendarDates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNameEn = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNameUrList = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
    const dayNameUr = dayNameUrList[d.getDay()];
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      dateStr,
      dayNameEn,
      dayNameUr,
      monthDay,
      isToday: i === 0,
      isTomorrow: i === 1,
    };
  });

  // Fetch available slots whenever chosenDoctor or selectedDate changes
  useEffect(() => {
    if (chosenDoctor && selectedDate) {
      fetchSlots();
    }
  }, [chosenDoctor, selectedDate]);

  const fetchSlots = async () => {
    if (!chosenDoctor) return;
    setLoadingSlots(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/slots?doctorId=${chosenDoctor.id}&date=${selectedDate}`);
      const data = await res.json();
      if (data.isAvailable === false) {
        setAvailableSlots([]);
        setErrorMessage(data.reason || (isUr ? 'ڈاکٹر اس تاریخ پر دستیاب نہیں ہیں۔' : 'Doctor is currently unavailable on this date.'));
      } else if (data.slots) {
        setAvailableSlots(data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(isUr ? 'ٹائم سلاٹس لوڈ کرنے میں ناکامی ہوئی۔' : 'Failed to load time slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectSlot = async (slotTime: string) => {
    if (!chosenDoctor) return;
    setSelectedTimeSlot(slotTime);
    setLockingSlot(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/appointments/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: chosenDoctor.id,
          date: selectedDate,
          time: slotTime,
          sessionId: 'client-session',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || (isUr ? 'یہ سلاٹ دیگر مریض نے بک کر لیا ہے۔' : 'Slot already locked or booked.'));
        fetchSlots();
      } else {
        // Successfully locked slot
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLockingSlot(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenDoctor || !selectedDate || !selectedTimeSlot) {
      setErrorMessage(isUr ? 'براہ کرم ڈاکٹر اور ٹائم سلاٹ منتخب کریں۔' : 'Please select doctor and time slot.');
      return;
    }

    if (!patientName.trim()) {
      setErrorMessage(isUr ? 'مریض کا نام لازمی درج کریں۔' : 'Patient name is required.');
      return;
    }

    if (!whatsAppNumber.startsWith('+92') || whatsAppNumber.length < 12) {
      setErrorMessage(
        isUr
          ? 'براہ کرم صحیح واٹس ایپ نمبر درج کریں (+92 340 4777745)'
          : 'Please enter a valid Pakistan WhatsApp number (+92 340 4777745).'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const fee = consultationType === 'online_consultation' ? chosenDoctor.onlineFeePKR : chosenDoctor.feePKR;

    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: chosenDoctor.id,
          date: selectedDate,
          time: selectedTimeSlot,
          consultationType,
          patientName,
          age: Number(age) || 0,
          gender,
          whatsAppNumber,
          reasonForVisit,
          feePKR: fee,
          paymentOption,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || (isUr ? 'بکنگ میں مسئلہ پیش آیا۔' : 'Booking failed.'));
      } else {
        setConfirmedAppt(data.appointment);
        onBookingSuccess(data.appointment);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(isUr ? 'سرور سے رابطہ نہ ہو سکا۔' : 'Server error during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const morningSlots = availableSlots.filter((s) => s.shift === 'morning' || !s.shift);
  const eveningSlots = availableSlots.filter((s) => s.shift === 'evening');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-4xl mx-auto py-6 px-4"
    >
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Wizard Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 border-b border-teal-900 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Automated OPD Token System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {isUr ? 'ان کلینک اور آن لائن اپائنٹمنٹ بکنگ' : 'In-Clinic & Online OPD Booking'}
            </h2>
            <p className="text-xs text-teal-200 mt-1">
              Gulzar Family Hospital & Children Center, Chowk Azam
            </p>
          </div>

          <button
            onClick={onCancel}
            className="text-slate-300 hover:text-white text-xs font-bold px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition cursor-pointer"
          >
            {isUr ? 'منسوخ کریں' : 'Cancel'}
          </button>
        </div>

        {/* Confirmed Ticket view if auto-booked */}
        {confirmedAppt ? (
          <div className="p-6 sm:p-10 space-y-6 bg-slate-50/50 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200 uppercase tracking-widest">
                {confirmedAppt.status === 'confirmed' ? (isUr ? 'ٹوکن کنفرم ہو گیا' : 'Token Reserved') : (isUr ? 'ادائیگی کا انتظار' : 'Pending Payment')}
              </span>
              <h3 className="text-2xl font-black text-slate-900 font-serif">
                {isUr ? 'اپائنٹمنٹ ٹوکن تیار ہے!' : 'Appointment Token Issued!'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {isUr
                  ? 'آپ کا 15 منٹ کا اپائنٹمنٹ سلاٹ کامیابی کے ساتھ بک کر لیا گیا ہے اور واٹس ایپ الرٹ بھیج دیا گیا ہے۔'
                  : 'Your 15-minute appointment slot has been successfully reserved. WhatsApp confirmation sent!'}
              </p>
            </div>

            {/* Token Ticket Card */}
            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border-2 border-dashed border-teal-600 text-left shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-800 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                OPD Slip
              </div>

              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Token ID</span>
                <span className="text-xl font-black text-slate-900 font-mono tracking-wider">{confirmedAppt.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Patient Name</span>
                  <span className="font-bold text-slate-900">{confirmedAppt.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Doctor</span>
                  <span className="font-bold text-teal-800">{isUr ? confirmedAppt.doctorNameUr : confirmedAppt.doctorNameEn}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Date & Shift Time</span>
                  <span className="font-bold text-slate-900 font-mono">{confirmedAppt.date} @ {confirmedAppt.time}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Consultation Type</span>
                  <span className="font-bold text-slate-900">
                    {confirmedAppt.consultationType === 'hospital_visit'
                      ? (isUr ? '🏥 ہسپتال میں معائنہ' : '🏥 In-Clinic OPD')
                      : (isUr ? '💻 آن لائن ویڈیو' : '💻 Online Video')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Payable Fee</span>
                  <span className="font-extrabold text-emerald-700 font-mono">PKR {confirmedAppt.feePKR}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Payment Status</span>
                  <span className="font-bold text-slate-800">
                    {confirmedAppt.paymentMethod === 'hospital_counter'
                      ? (isUr ? 'کاؤنٹر پر قابلِ ادا' : 'Pay at OPD Counter')
                      : (isUr ? 'آن لائن موصول' : 'Online Payment')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Gulzar Family Hospital, Fatehpur Road, Chowk Azam, Layyah</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => generateAppointmentPDF(confirmedAppt, HOSPITAL_INFO)}
                className="bg-teal-800 hover:bg-teal-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isUr ? 'پی ڈی ایف سلپ ڈاؤنلوڈ کریں' : 'Download PDF Slip'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span>{isUr ? 'ٹوکن سلپ پرنٹ کریں' : 'Print / Save OPD Slip'}</span>
              </button>
              <button
                onClick={onCancel}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isUr ? 'مکمل ہو گیا' : 'Close Window'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Wizard Steps Indicator */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-teal-700 font-extrabold' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  1
                </span>
                <span>{isUr ? 'ڈاکٹر اور قسم' : '1. Doctor & Type'}</span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300" />

              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-teal-700 font-extrabold' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  2
                </span>
                <span>{isUr ? 'کیلنڈر اور شفٹ وقت' : '2. Date & 15-Min Time'}</span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300" />

              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-teal-700 font-extrabold' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  3
                </span>
                <span>{isUr ? 'مریض و ادائیگی' : '3. Patient & Payment'}</span>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Select Doctor & In-Clinic vs Online Option */}
            {step === 1 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isUr ? '1. ماہر ڈاکٹر منتخب کریں' : '1. Select Specialist Doctor'}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setChosenDoctor(doc)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-center gap-4 ${
                          chosenDoctor?.id === doc.id
                            ? 'border-2 border-teal-600 bg-teal-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={doc.avatarUrl}
                          alt={doc.nameEn}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate font-serif">
                            {isUr ? doc.nameUr : doc.nameEn}
                          </h4>
                          <p className="text-xs text-teal-700 font-semibold truncate">
                            {isUr ? doc.departmentUr : doc.departmentEn}
                          </p>
                          <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">
                            In-Clinic OPD: PKR {doc.feePKR}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultation Type Selection: In-Clinic vs Online */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isUr ? '2. معا ئنہ کی قسم منتخب کریں' : '2. Choose Consultation Option'}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* IN-CLINIC OPTION */}
                    <button
                      type="button"
                      onClick={() => setConsultationType('hospital_visit')}
                      className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 cursor-pointer relative ${
                        consultationType === 'hospital_visit'
                          ? 'border-2 border-teal-600 bg-teal-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {consultationType === 'hospital_visit' && (
                        <div className="absolute top-3 right-3 bg-teal-700 text-white p-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="p-3 bg-teal-800 text-white rounded-xl shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-extrabold rounded-md mb-1">
                          RECOMMENDED
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {isUr ? '🏥 ان کلینک (ہسپتال او پی ڈی میں معائنہ)' : '🏥 In-Clinic Hospital OPD Visit'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isUr ? 'چوک اعظم کلینک پر تشریف لائیں۔ بغیر یا آن لائن ادائیگی۔' : 'Visit Gulzar Hospital Chowk Azam. Pay at counter or online.'}
                        </p>
                        <p className="text-xs font-extrabold text-teal-800 mt-2 font-mono">
                          Fee: PKR {chosenDoctor?.feePKR || 1500}
                        </p>
                      </div>
                    </button>

                    {/* ONLINE VIDEO OPTION */}
                    <button
                      type="button"
                      onClick={() => setConsultationType('online_consultation')}
                      className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 cursor-pointer relative ${
                        consultationType === 'online_consultation'
                          ? 'border-2 border-teal-600 bg-teal-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {consultationType === 'online_consultation' && (
                        <div className="absolute top-3 right-3 bg-teal-700 text-white p-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="p-3 bg-slate-900 text-amber-300 rounded-xl shrink-0">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md mb-1">
                          ONLINE VIDEO
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {isUr ? '💻 آن لائن ویڈیو مشاورت' : '💻 Online Video Consultation'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isUr ? 'گھر بیٹھے واٹس ایپ ویڈیو کال پر ڈاکٹر سے مشورہ کریں۔' : 'WhatsApp Video/Call consultation from anywhere.'}
                        </p>
                        <p className="text-xs font-extrabold text-teal-800 mt-2 font-mono">
                          Fee: PKR {chosenDoctor?.onlineFeePKR || 1200}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!chosenDoctor}
                    className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isUr ? 'آگے بڑھیں (کیلنڈر و اوقات)' : 'Next: Select Date & Slot'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Choose Date via Daily Auto-Updated Calendar & 15-Min Time Slots */}
            {step === 2 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isUr ? 'پچھلا مرحلہ' : 'Back to Doctors'}</span>
                  </button>

                  <div className="text-right">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block">
                      {isUr ? chosenDoctor?.nameUr : chosenDoctor?.nameEn}
                    </span>
                  </div>
                </div>

                {/* Regular Calendar Bar (Auto Updated Daily) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-700" />
                      <span>{isUr ? 'خودکار اپ ڈیٹ شدہ کیلنڈر' : 'Daily Auto-Updated Calendar'}</span>
                    </label>

                    {/* Custom Date Input Picker */}
                    <input
                      type="date"
                      value={selectedDate}
                      min={todayStr}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  {/* Horizontal Scrollable Date Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {calendarDates.map((item) => {
                      const isSelected = selectedDate === item.dateStr;
                      return (
                        <button
                          key={item.dateStr}
                          type="button"
                          onClick={() => setSelectedDate(item.dateStr)}
                          className={`min-w-[80px] p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center shrink-0 ${
                            isSelected
                              ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/20'
                          }`}
                        >
                          <span className={`text-[10px] font-extrabold uppercase ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                            {item.isToday ? (isUr ? 'آج' : 'TODAY') : item.isTomorrow ? (isUr ? 'کل' : 'TOMORROW') : (isUr ? item.dayNameUr : item.dayNameEn)}
                          </span>
                          <span className="text-sm font-black font-mono mt-0.5">
                            {item.monthDay}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 15-Minute Time Slots Section with Shift Filters */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isUr ? '15 منٹ ٹائم سلاٹس (صبح و شام)' : '15-Minute Appointment Slots'}
                      </label>
                      <p className="text-xs text-slate-500">
                        {isUr
                          ? 'صبح 08:00 تا 02:00 دوپہر | شام 04:00 تا 08:00 رات'
                          : 'Morning Shift: 8:00 AM – 2:00 PM | Evening Shift: 4:00 PM – 8:00 PM'}
                      </p>
                    </div>

                    {/* Shift Filter Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSelectedShiftFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          selectedShiftFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isUr ? 'تمام' : 'All Slots'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedShiftFilter('morning')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          selectedShiftFilter === 'morning' ? 'bg-teal-800 text-amber-300 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>{isUr ? 'صبح' : 'Morning'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedShiftFilter('evening')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          selectedShiftFilter === 'evening' ? 'bg-slate-900 text-teal-300 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Moon className="w-3 h-3 text-teal-300" />
                        <span>{isUr ? 'شام' : 'Evening'}</span>
                      </button>
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="py-12 text-center space-y-2">
                      <Loader2 className="w-8 h-8 text-teal-700 animate-spin mx-auto" />
                      <p className="text-xs text-slate-500">
                        {isUr ? 'ڈاکٹر کا 15 منٹ شیڈول لوڈ ہو رہا ہے...' : 'Loading 15-minute slot schedule...'}
                      </p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                      <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                      <p className="text-sm font-bold text-slate-800">
                        {isUr ? 'اس تاریخ پر کوئی سلاٹ دستیاب نہیں ہے۔' : 'No available slots for selected date.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Morning Shift Block */}
                      {(selectedShiftFilter === 'all' || selectedShiftFilter === 'morning') && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-teal-900 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl w-fit">
                            <Sun className="w-4 h-4 text-amber-500" />
                            <span>{isUr ? 'صبح کا شفٹ (08:00 AM تا 02:00 PM)' : 'Morning Shift (08:00 AM – 02:00 PM)'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({morningSlots.filter(s => s.isAvailable).length} Available)</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {morningSlots.map((slot) => (
                              <button
                                key={slot.time}
                                disabled={!slot.isAvailable || lockingSlot}
                                onClick={() => handleSelectSlot(slot.time)}
                                className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                                  !slot.isAvailable
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-60'
                                    : selectedTimeSlot === slot.time
                                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                                    : 'bg-white text-slate-800 border-slate-200 hover:border-teal-600 hover:bg-teal-50/30'
                                }`}
                              >
                                <span className="font-mono">{slot.time}</span>
                                {!slot.isAvailable ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evening Shift Block */}
                      {(selectedShiftFilter === 'all' || selectedShiftFilter === 'evening') && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 bg-indigo-50 border border-indigo-200/60 px-3 py-1.5 rounded-xl w-fit">
                            <Moon className="w-4 h-4 text-indigo-600" />
                            <span>{isUr ? 'شام کا شفٹ (04:00 PM تا 08:00 PM)' : 'Evening Shift (04:00 PM – 08:00 PM)'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({eveningSlots.filter(s => s.isAvailable).length} Available)</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {eveningSlots.map((slot) => (
                              <button
                                key={slot.time}
                                disabled={!slot.isAvailable || lockingSlot}
                                onClick={() => handleSelectSlot(slot.time)}
                                className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                                  !slot.isAvailable
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-60'
                                    : selectedTimeSlot === slot.time
                                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                                    : 'bg-white text-slate-800 border-slate-200 hover:border-teal-600 hover:bg-teal-50/30'
                                }`}
                              >
                                <span className="font-mono">{slot.time}</span>
                                {!slot.isAvailable ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Patient Information & Payment Choice (With or Without Online Payment) */}
            {step === 3 && (
              <form onSubmit={handleSubmitBooking} className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isUr ? 'وقت تبدیل کریں' : 'Change Slot'}</span>
                  </button>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono block">
                      {selectedDate} @ {selectedTimeSlot}
                    </span>
                    <span className="text-[11px] text-teal-700 font-bold">
                      {isUr ? chosenDoctor?.nameUr : chosenDoctor?.nameEn}
                    </span>
                  </div>
                </div>

                {/* Patient Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'مریض کا پورا نام (Patient Name) *' : 'Patient Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder={isUr ? 'مثلاً علی رضا' : 'e.g. Ali Raza'}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'مریض کی عمر (عمر برس میں) *' : 'Age (Years) *'}
                    </label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'جنس (Gender) *' : 'Gender *'}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="male">{isUr ? 'مرد / لڑکا' : 'Male'}</option>
                      <option value="female">{isUr ? 'عورت / لڑکی' : 'Female'}</option>
                      <option value="other">{isUr ? 'دیگر' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'واٹس ایپ نمبر (WhatsApp Number) *' : 'WhatsApp Number (+92...) *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsAppNumber}
                      onChange={(e) => setWhatsAppNumber(e.target.value)}
                      placeholder="+92 340 4777745"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'معائنہ کی وجہ / علامات (Reason for Visit)' : 'Reason for Visit / Symptoms'}
                    </label>
                    <textarea
                      rows={2}
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder={
                        isUr
                          ? 'مثلاً تیز بخار، کھانسی، یا روٹین چیک اپ...'
                          : 'e.g. High fever, chest infection, routine checkup...'
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* PAYMENT OPTION: WITHOUT OR WITH ONLINE PAYMENT */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isUr ? 'ادائیگی کا طریقہ انتخاب کریں' : 'Choose Payment Option (Without or With Online Payment)'}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* OPTION 1: PAY AT OPD COUNTER (WITHOUT ADVANCE ONLINE PAYMENT) */}
                    <div
                      onClick={() => setPaymentOption('pay_at_counter')}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        paymentOption === 'pay_at_counter'
                          ? 'border-2 border-teal-700 bg-teal-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2.5 bg-emerald-700 text-white rounded-xl shrink-0">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {isUr ? 'ادائیگی ہسپتال کاؤنٹر پر (Pay on Arrival)' : 'Pay at Hospital OPD Counter'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isUr ? 'بغیر آن لائن ایڈوانس۔ فوری خودکار ٹوکن ہسپتال میں کیش بذریعہ کاؤنٹر۔' : 'No online payment required now. Pay cash on arrival at OPD counter.'}
                        </p>
                      </div>
                    </div>

                    {/* OPTION 2: PAY ONLINE (JAZZCASH / EASYPAISA) */}
                    <div
                      onClick={() => setPaymentOption('online_payment')}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        paymentOption === 'online_payment'
                          ? 'border-2 border-teal-700 bg-teal-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2.5 bg-slate-900 text-amber-300 rounded-xl shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {isUr ? 'آن لائن ادائیگی (JazzCash / Easypaisa)' : 'Online Payment (JazzCash / Easypaisa)'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isUr ? 'اکاؤنٹ 0340-4777745 پر فیس بھیج کر کیو آر یا سلپ اپ لوڈ کریں۔' : 'Pay via JazzCash/Easypaisa 0340-4777745 for priority ticket.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      {isUr ? 'قابل ادا فیس:' : 'Total Consultation Fee'}
                    </span>
                    <span className="text-xl font-black text-teal-800 font-mono">
                      PKR{' '}
                      {consultationType === 'online_consultation'
                        ? chosenDoctor?.onlineFeePKR
                        : chosenDoctor?.feePKR}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isUr ? 'ٹوکن بن رہا ہے...' : 'Issuing Token...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                        <span>
                          {paymentOption === 'pay_at_counter'
                            ? (isUr ? 'خودکار ٹوکن کنفرم کریں' : 'Confirm & Reserve OPD Token')
                            : (isUr ? 'آن لائن آرڈر بنائیں' : 'Proceed to Online Payment')}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </motion.div>
  );
};
