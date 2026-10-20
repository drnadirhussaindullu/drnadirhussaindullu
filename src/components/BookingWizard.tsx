import React, { useState, useEffect } from 'react';
import { Doctor, Language, ConsultationType, Gender, TimeSlot, Appointment, BookingOption, PatientType } from '../types';
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
  ShieldCheck,
  Smartphone,
  KeyRound,
  RefreshCw,
  MessageCircle,
  FileText,
  BadgeAlert,
  ArrowRight,
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

  // Step 0: Method Selection (Pay at Hospital vs Pay Online)
  // Step 1: Doctor & Department Selection
  // Step 2: Date & 15-Min Slot Selection
  // Step 3: Patient Info & Mobile Number Verification
  // Step 4: Online Payment Gateway (Option 2 only)
  const [step, setStep] = useState<number>(0);
  const [bookingOption, setBookingOption] = useState<BookingOption | null>(null);

  // Selection state
  const [chosenDoctor, setChosenDoctor] = useState<Doctor | null>(selectedDoctor || doctors[0] || null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('hospital_visit');

  // Daily auto-updated calendar
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [lockingSlot, setLockingSlot] = useState<boolean>(false);

  // Patient Info Form State
  const [patientName, setPatientName] = useState<string>('');
  const [patientType, setPatientType] = useState<PatientType>('new');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [whatsAppNumber, setWhatsAppNumber] = useState<string>('+92');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');

  // Mobile OTP Verification State
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpMessage, setOtpMessage] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(0);

  // Online Payment State (for Option 2)
  const [onlineGateway, setOnlineGateway] = useState<'jazzcash' | 'easypaisa' | 'card' | 'bank'>('jazzcash');
  const [accountNumber, setAccountNumber] = useState<string>('03404777745');
  const [cnicLast4, setCnicLast4] = useState<string>('1234');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentTransactionId, setPaymentTransactionId] = useState<string>('');

  // General Status State
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  // Generate 30-day auto-updated calendar
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

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (chosenDoctor && selectedDate) {
      fetchSlots();
    }
  }, [chosenDoctor, selectedDate]);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const fetchSlots = async () => {
    if (!chosenDoctor) return;
    setLoadingSlots(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/slots?doctorId=${chosenDoctor.id}&date=${selectedDate}`);
      const data = await res.json();
      if (data.isAvailable === false) {
        setAvailableSlots([]);
        setErrorMessage(
          data.reason ||
            (isUr ? 'ڈاکٹر اس تاریخ پر دستیاب نہیں ہیں۔' : 'Doctor is currently unavailable on this date.')
        );
      } else if (data.slots) {
        setAvailableSlots(data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(isUr ? 'ٹائم سلاٹس لوڈ کرنے میں مسئلہ پیش آیا۔' : 'Failed to load time slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectBookingOption = (option: BookingOption) => {
    setBookingOption(option);
    setStep(1);
    setErrorMessage('');
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
        setErrorMessage(
          data.error ||
            (isUr ? 'یہ سلاٹ پہلے سے بک یا ہولڈ پر ہے۔' : 'Slot already locked or booked by another patient.')
        );
        fetchSlots();
      } else {
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(isUr ? 'سلاٹ لاک کرنے میں مسئلہ پیش آیا۔' : 'Failed to hold time slot.');
    } finally {
      setLockingSlot(false);
    }
  };

  // OTP Send Handler
  const handleSendOtp = async () => {
    if (!whatsAppNumber || whatsAppNumber.length < 10) {
      setErrorMessage(
        isUr ? 'براہ کرم درست موبائل نمبر درج کریں۔' : 'Please enter a valid mobile number (+92 3XX XXXXXXX).'
      );
      return;
    }
    setOtpSending(true);
    setErrorMessage('');
    setOtpMessage('');
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: whatsAppNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setOtpTimer(60);
        setOtpMessage(
          data.testCode
            ? `Demo OTP Sent: ${data.testCode} (Simulation Mode)`
            : isUr
            ? 'او ٹی پی کوڈ موبائل پر بھیج دیا گیا ہے۔'
            : 'OTP code sent to your mobile number.'
        );
      } else {
        setErrorMessage(data.error || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending OTP code.');
    } finally {
      setOtpSending(false);
    }
  };

  // OTP Verify Handler
  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setErrorMessage(isUr ? 'او ٹی پی کوڈ درج کریں۔' : 'Please enter the 4-digit OTP code.');
      return;
    }
    setOtpVerifying(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: whatsAppNumber, code: otpCode }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setIsOtpVerified(true);
        setOtpMessage(isUr ? 'موبائل نمبر کی تصدیق کامیاب ہو گئی! ✓' : 'Mobile number verified successfully! ✓');
      } else {
        setErrorMessage(data.error || 'Incorrect OTP code. Try 1234 in test mode.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error verifying OTP code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Submission for Option 1 (Pay at Hospital) OR preparation for Option 2
  const handleProceedFromPatientDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenDoctor || !selectedDate || !selectedTimeSlot) {
      setErrorMessage(isUr ? 'ڈاکٹر اور ٹائم سلاٹ منتخب کریں۔' : 'Please select doctor and time slot.');
      return;
    }

    if (!patientName.trim()) {
      setErrorMessage(isUr ? 'مریض کا نام لازمی ہے۔' : 'Patient name is required.');
      return;
    }

    if (!whatsAppNumber.startsWith('+92') && !whatsAppNumber.startsWith('03')) {
      setErrorMessage(
        isUr
          ? 'براہ کرم درست پاکستانی موبائل نمبر درج کریں (+92 340 4777745 یا 0340-4777745)'
          : 'Please enter a valid Pakistan mobile number (+92 340 4777745).'
      );
      return;
    }

    // If Option 2 (Pay Online), advance to payment step
    if (bookingOption === 'pay_online') {
      // First create pending appointment so user has a hold
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
            patientName: patientName.trim(),
            patientType,
            age: Number(age) || 0,
            gender,
            whatsAppNumber: whatsAppNumber.trim(),
            reasonForVisit: reasonForVisit.trim(),
            bookingOption: 'pay_online',
            paymentMethod: onlineGateway,
            feePKR: fee,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || (isUr ? 'بکنگ میں مسئلہ پیش آیا۔' : 'Booking failed.'));
        } else {
          setConfirmedAppt(data.appointment);
          setStep(4); // Advance to Online Payment Gateway Screen
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(isUr ? 'سرور سے رابطہ نہ ہو سکا۔' : 'Server error during booking.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Option 1: Pay at Hospital (Direct instant booking, no online payment)
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
          patientName: patientName.trim(),
          patientType,
          age: Number(age) || 0,
          gender,
          whatsAppNumber: whatsAppNumber.trim(),
          reasonForVisit: reasonForVisit.trim(),
          bookingOption: 'pay_at_hospital',
          paymentMethod: 'hospital_counter',
          feePKR: fee,
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

  // Option 2: Execute Online Payment via Gateway
  const handleExecuteOnlinePayment = async (simulatedOutcome: 'success' | 'fail' = 'success') => {
    if (!confirmedAppt) return;
    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const res = await fetch('/api/payments/process-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: confirmedAppt.id,
          gateway: onlineGateway,
          accountOrCard: onlineGateway === 'card' ? '•••• 4242' : accountNumber,
          cnicLast4,
          simulatedOutcome,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPaymentError(
          data.error ||
            (isUr
              ? 'ادائیگی مسترد ہو گئی ہے۔ براہ کرم دوبارہ کوشش کریں یا "ہسپتال میں ادائیگی" منتخب کریں۔'
              : 'Payment transaction was declined or failed. Please retry or switch to Pay at Hospital.')
        );
      } else {
        setConfirmedAppt(data.appointment);
        setPaymentTransactionId(data.transactionId || 'TRX-ONLINE-SUCCESS');
        onBookingSuccess(data.appointment);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment processing error.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Fallback: Switch from Online Payment to Pay at Hospital without re-entering
  const handleFallbackToPayAtHospital = async () => {
    if (!confirmedAppt) return;
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`/api/admin/appointments/${confirmedAppt.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          paymentStatus: 'pay_at_hospital',
          notes: 'Switched from online payment to Pay at Hospital counter.',
        }),
      });

      const data = await res.json();
      if (res.ok && data.appointment) {
        setBookingOption('pay_at_hospital');
        setConfirmedAppt(data.appointment);
        setPaymentError('');
        onBookingSuccess(data.appointment);
      } else {
        setPaymentError('Could not switch payment method.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to switch method.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const morningSlots = availableSlots.filter((s) => s.shift === 'morning' || !s.shift);
  const eveningSlots = availableSlots.filter((s) => s.shift === 'evening');

  // WhatsApp click-to-chat message text formatted exactly as required
  const getWhatsAppShareLink = (appt: Appointment) => {
    const paymentText =
      appt.paymentStatus === 'paid_online' || appt.bookingOption === 'pay_online' && appt.status === 'confirmed'
        ? 'Paid Online'
        : 'Pay at Hospital';

    const text = `Dear ${appt.patientName},\nYour appointment with Gulzar Family Hospital & Children Center has been successfully booked.\nAppointment ID: ${appt.id}\nDoctor: ${appt.doctorNameEn}\nDate: ${appt.date}\nTime: ${appt.time}\nPayment: ${paymentText}\nPlease arrive 15 minutes before your appointment.\nThank you for choosing Gulzar Family Hospital & Children Center.`;

    const cleanPhone = appt.whatsAppNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone || '923404777745'}?text=${encodeURIComponent(text)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-4xl mx-auto py-6 px-4"
    >
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Wizard Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-7 border-b border-teal-900 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Dual Appointment Booking System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {isUr ? 'گلزار فیملی ہسپتال اپائنٹمنٹ بکنگ' : 'Hospital Appointment Booking'}
            </h2>
            <p className="text-xs text-teal-200 mt-1">
              Gulzar Family Hospital & Children Center, Fatehpur Road, Chowk Azam
            </p>
          </div>

          <button
            onClick={onCancel}
            className="text-slate-300 hover:text-white text-xs font-bold px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition cursor-pointer"
          >
            {isUr ? 'بند کریں' : 'Close'}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ON-SCREEN CONFIRMATION VIEW (AFTER SUCCESSFUL BOOKING OR PAYMENT) */}
        {/* ========================================================================= */}
        {confirmedAppt && (step !== 4 || confirmedAppt.paymentStatus === 'paid_online' || confirmedAppt.bookingOption === 'pay_at_hospital') ? (
          <div className="p-6 sm:p-10 space-y-6 bg-slate-50/50 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span
                className={`inline-block px-3 py-1 text-xs font-extrabold rounded-full border uppercase tracking-widest ${
                  confirmedAppt.paymentStatus === 'paid_online'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {confirmedAppt.paymentStatus === 'paid_online'
                  ? isUr
                    ? 'آن لائن ادا شدہ • تصدیق شدہ'
                    : 'Payment: Paid Online (Verified)'
                  : isUr
                  ? 'ادائیگی: ہسپتال کاؤنٹر پر'
                  : 'Payment: Pay at Hospital'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                {isUr ? 'اپائنٹمنٹ کامیابی سے بک ہو گئی!' : 'Appointment Successfully Booked!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                {isUr
                  ? 'آپ کی اپائنٹمنٹ درج ہو چکی ہے اور ہسپتال سسٹم میں محفوظ ہے۔'
                  : 'Your appointment is confirmed and recorded in the hospital system.'}
              </p>
            </div>

            {/* MANDATORY INSTRUCTION CALLOUT BANNER */}
            <div className="max-w-md mx-auto bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-4 text-center shadow-xs">
              <div className="flex items-center justify-center gap-2 text-amber-900 font-black text-sm sm:text-base">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>“Please arrive 15 minutes before your appointment.”</span>
              </div>
              <p className="text-xs text-amber-800 mt-1 font-semibold">
                {isUr
                  ? 'براہ کرم اپنی اپائنٹمنٹ کے وقت سے 15 منٹ قبل او پی ڈی کاؤنٹر پر تشریف لائیں۔'
                  : 'Please check in at the reception counter with your Appointment ID.'}
              </p>
            </div>

            {/* Token Ticket Card */}
            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border-2 border-dashed border-teal-600 text-left shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Appointment ID
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-wider">
                    {confirmedAppt.id}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    confirmedAppt.paymentStatus === 'paid_online'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {confirmedAppt.bookingOption === 'pay_online' ? 'Online Paid' : 'Pay at Hospital'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">{confirmedAppt.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Patient Type</span>
                  <span className="font-bold text-teal-800">
                    {confirmedAppt.patientType === 'followup'
                      ? isUr
                        ? 'دوبارہ معائنہ (Follow-up)'
                        : 'Follow-up Patient'
                      : isUr
                      ? 'نیا مریض (New Patient)'
                      : 'New Patient'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Doctor</span>
                  <span className="font-bold text-teal-900">
                    {isUr ? confirmedAppt.doctorNameUr : confirmedAppt.doctorNameEn}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{confirmedAppt.departmentEn}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Date & Time Slot</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {confirmedAppt.date} @ {confirmedAppt.time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Consultation Fee</span>
                  <span className="font-extrabold text-slate-900 font-mono">PKR {confirmedAppt.feePKR}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Payment Status</span>
                  <span
                    className={`font-bold ${
                      confirmedAppt.paymentStatus === 'paid_online' ? 'text-emerald-700' : 'text-blue-700'
                    }`}
                  >
                    {confirmedAppt.paymentStatus === 'paid_online'
                      ? 'Payment: Paid Online'
                      : 'Payment: Pay at Hospital'}
                  </span>
                </div>

                {confirmedAppt.transactionId && (
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Transaction ID</span>
                    <span className="font-mono text-emerald-800 font-bold">{confirmedAppt.transactionId}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Gulzar Family Hospital, Fatehpur Road, In Front of ZTBL, Chowk Azam</span>
              </div>
            </div>

            {/* ACTION BUTTONS: WhatsApp, PDF, Print */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={getWhatsAppShareLink(confirmedAppt)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>{isUr ? 'واٹس ایپ پر رسید کھولیں' : 'Open WhatsApp Confirmation'}</span>
              </a>

              <button
                onClick={() => generateAppointmentPDF(confirmedAppt, HOSPITAL_INFO)}
                className="bg-teal-800 hover:bg-teal-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isUr ? 'پی ڈی ایف سلپ ڈاؤنلوڈ کریں' : 'Download PDF Receipt'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span>{isUr ? 'سلپ پرنٹ کریں' : 'Print Slip'}</span>
              </button>

              <button
                onClick={() => {
                  setConfirmedAppt(null);
                  setStep(0);
                  setBookingOption(null);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isUr ? 'نئی اپائنٹمنٹ بک کریں' : 'Book Another'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Breadcrumb Indicator */}
            {step > 0 && (
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1 text-teal-800 hover:underline cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
                    0
                  </span>
                  <span>{bookingOption === 'pay_online' ? 'Pay Online' : 'Pay at Hospital'}</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-1 cursor-pointer ${
                    step >= 1 ? 'text-teal-800 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 1 ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    1
                  </span>
                  <span>{isUr ? 'ڈاکٹر' : 'Doctor'}</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-1 cursor-pointer ${
                    step >= 2 ? 'text-teal-800 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 2 ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    2
                  </span>
                  <span>{isUr ? 'تاریخ و وقت' : 'Date & Time'}</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                <div
                  className={`flex items-center gap-1 ${
                    step >= 3 ? 'text-teal-800 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 3 ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    3
                  </span>
                  <span>{isUr ? 'مریض کی تفصیل' : 'Patient Info'}</span>
                </div>

                {bookingOption === 'pay_online' && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div
                      className={`flex items-center gap-1 ${
                        step === 4 ? 'text-teal-800 font-extrabold' : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          step === 4 ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        4
                      </span>
                      <span>{isUr ? 'ادائیگی' : 'Payment'}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 0: METHOD SELECTION — TWO CLEAR CHOICES (PAY AT HOSPITAL vs PAY ONLINE) */}
            {/* ========================================================================= */}
            {step === 0 && (
              <div className="p-6 sm:p-10 space-y-6">
                <div className="text-center space-y-2 max-w-xl mx-auto">
                  <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200 uppercase tracking-wider">
                    {isUr ? 'اپائنٹمنٹ کا طریقہ منتخب کریں' : 'Choose Your Preferred Booking Method'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {isUr ? 'آپ اپائنٹمنٹ کیسے بک کرنا چاہتے ہیں؟' : 'How Would You Like to Book?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {isUr
                      ? 'ہر مریض کے لیے دو واضح اور آسان سہولیات: بغیر آن لائن ادائیگی ہسپتال کاؤنٹر پر فیس دیں، یا ایڈوانس ادا کر کے سلاٹ محفوظ کریں۔'
                      : 'Two simple options: Book immediately and pay cash on arrival, or pay in advance to secure your appointment.'}
                  </p>
                </div>

                {/* THE TWO LARGE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* CARD 1: BOOK APPOINTMENT — PAY AT HOSPITAL */}
                  <div
                    onClick={() => handleSelectBookingOption('pay_at_hospital')}
                    className="p-6 sm:p-7 rounded-3xl border-2 border-slate-200 hover:border-teal-600 bg-white hover:bg-teal-50/20 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group relative overflow-hidden text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-teal-100 text-teal-800 rounded-2xl group-hover:bg-teal-800 group-hover:text-white transition">
                          <Building2 className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                          Option 1 • No Online Payment
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-900 transition">
                          {isUr ? 'ہسپتال میں ادائیگی — Pay at Hospital' : 'Book Appointment — Pay at Hospital'}
                        </h4>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">
                          {isUr ? 'فوری اپائنٹمنٹ • آن لائن فیس کی کوئی ضرورت نہیں' : 'Quick Appointment • No Online Payment Required'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {isUr
                            ? 'صرف مریض کا نام اور موبائل نمبر درج کریں۔ فیس ہسپتال آمد پر کاؤنٹر پر کیش دیں۔'
                            : 'Patient only needs to enter Name, Mobile Number, Doctor, and Date. Pay consultation fee in cash or card upon arrival.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>No debit card or JazzCash account required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Instant unique Appointment ID & on-screen confirmation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>WhatsApp confirmation option available</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-800 font-semibold bg-amber-50/80 p-2 rounded-xl">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>“Please arrive 15 minutes before your appointment.”</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        className="w-full bg-slate-900 group-hover:bg-teal-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span>{isUr ? 'ہسپتال میں ادائیگی کا انتخاب کریں' : 'Book Appointment — Pay at Hospital'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: BOOK APPOINTMENT — PAY ONLINE */}
                  <div
                    onClick={() => handleSelectBookingOption('pay_online')}
                    className="p-6 sm:p-7 rounded-3xl border-2 border-slate-200 hover:border-teal-600 bg-white hover:bg-teal-50/20 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group relative overflow-hidden text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-slate-900 text-amber-300 rounded-2xl group-hover:bg-teal-800 group-hover:text-white transition">
                          <CreditCard className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                          Option 2 • Prior Online Payment
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-900 transition">
                          {isUr ? 'آن لائن ادائیگی — Pay Online' : 'Book Appointment — Pay Online'}
                        </h4>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">
                          {isUr ? 'پیشگی تصدیق شدہ سلاٹ • محفوظ ڈیجیٹل رسید' : 'Prior Online Payment • Confirmed Reservation'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {isUr
                            ? 'پیشگی فیس ادا کر کے اپنا سلاٹ محفوظ کریں۔ جاز کیش، ایزی پیسہ، یا کارڈ سپورٹ۔'
                            : 'Pay consultation fee in advance to secure your priority slot. Instant digital receipt and priority check-in.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Guaranteed slot reservation without queue wait</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Supports JazzCash, Easypaisa, or Debit/Credit Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Digital verified receipt with unique Transaction ID</span>
                        </div>
                        <div className="flex items-center gap-2 text-teal-800 font-semibold bg-teal-50/80 p-2 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Priority check-in upon arrival at hospital reception</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        className="w-full bg-slate-900 group-hover:bg-teal-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span>{isUr ? 'آن لائن ادائیگی کا انتخاب کریں' : 'Book Appointment — Pay Online'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: DOCTOR & DEPARTMENT SELECTION */}
            {/* ========================================================================= */}
            {step === 1 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isUr ? 'طریقہ تبدیل کریں' : 'Change Booking Method'}</span>
                  </button>

                  <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full">
                    {bookingOption === 'pay_online' ? 'Option: Pay Online' : 'Option: Pay at Hospital'}
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isUr ? '1. ماہر ڈاکٹر / شعبہ منتخب کریں' : '1. Select Specialist Doctor / Department'}
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
                            Consultation Fee: PKR {doc.feePKR}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultation Type: In-Clinic vs Online Video */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isUr ? '2. معائنہ کی نوعیت منتخب کریں' : '2. Consultation Modality'}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setConsultationType('hospital_visit')}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-4 cursor-pointer relative ${
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
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {isUr ? '🏥 ان کلینک (ہسپتال میں معائنہ)' : '🏥 In-Clinic Hospital Visit'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isUr
                            ? 'گلزار فیملی ہسپتال چوک اعظم لیہ تشریف لائیں۔'
                            : 'Visit Gulzar Family Hospital OPD, Fatehpur Road, Chowk Azam.'}
                        </p>
                        <p className="text-xs font-bold text-teal-800 mt-1.5 font-mono">
                          Fee: PKR {chosenDoctor?.feePKR || 1500}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType('online_consultation')}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-4 cursor-pointer relative ${
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
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {isUr ? '💻 آن لائن ویڈیو مشاورت' : '💻 Telemedicine Video Consultation'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isUr
                            ? 'گھر بیٹھے واٹس ایپ ویڈیو کال پر ڈاکٹر سے مشورہ کریں۔'
                            : 'Consult specialist from home via secure WhatsApp video call.'}
                        </p>
                        <p className="text-xs font-bold text-teal-800 mt-1.5 font-mono">
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
                    className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isUr ? 'تاریخ و وقت منتخب کریں' : 'Next: Select Date & Time'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: PREFERRED DATE & 15-MINUTE TIME SLOTS */}
            {/* ========================================================================= */}
            {step === 2 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isUr ? 'ڈاکٹر تبدیل کریں' : 'Back to Doctors'}</span>
                  </button>

                  <div className="text-right">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block">
                      {isUr ? chosenDoctor?.nameUr : chosenDoctor?.nameEn}
                    </span>
                  </div>
                </div>

                {/* Calendar Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-700" />
                      <span>{isUr ? 'تاریخ کا انتخاب کریں' : 'Preferred Appointment Date'}</span>
                    </label>

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
                          <span
                            className={`text-[10px] font-extrabold uppercase ${
                              isSelected ? 'text-amber-300' : 'text-slate-400'
                            }`}
                          >
                            {item.isToday
                              ? isUr
                                ? 'آج'
                                : 'TODAY'
                              : item.isTomorrow
                              ? isUr
                                ? 'کل'
                                : 'TOMORROW'
                              : isUr
                              ? item.dayNameUr
                              : item.dayNameEn}
                          </span>
                          <span className="text-sm font-black font-mono mt-0.5">{item.monthDay}</span>
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
                        {isUr ? '15 منٹ ٹائم سلاٹ منتخب کریں' : 'Preferred 15-Minute Time Slot'}
                      </label>
                      <p className="text-xs text-slate-500">
                        {isUr
                          ? 'صبح کا شفٹ: 08:00 AM تا 02:00 PM | شام کا شفٹ: 04:00 PM تا 08:00 PM'
                          : 'Morning Shift: 8:00 AM – 2:00 PM | Evening Shift: 4:00 PM – 8:00 PM'}
                      </p>
                    </div>

                    {/* Shift Filter Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSelectedShiftFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          selectedShiftFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isUr ? 'تمام' : 'All'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedShiftFilter('morning')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          selectedShiftFilter === 'morning'
                            ? 'bg-teal-800 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>{isUr ? 'صبح' : 'Morning'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedShiftFilter('evening')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          selectedShiftFilter === 'evening'
                            ? 'bg-slate-900 text-teal-300 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
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
                        {isUr ? 'شیڈول لوڈ ہو رہا ہے...' : 'Loading time slots...'}
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
                            <span>
                              {isUr
                                ? 'صبح کا شفٹ (08:00 AM تا 02:00 PM)'
                                : 'Morning Shift (08:00 AM – 02:00 PM)'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({morningSlots.filter((s) => s.isAvailable).length} Available)
                            </span>
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
                            <span>
                              {isUr
                                ? 'شام کا شفٹ (04:00 PM تا 08:00 PM)'
                                : 'Evening Shift (04:00 PM – 08:00 PM)'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({eveningSlots.filter((s) => s.isAvailable).length} Available)
                            </span>
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

            {/* ========================================================================= */}
            {/* STEP 3: PATIENT INFORMATION & MANDATORY MOBILE NUMBER (WITH OTP) */}
            {/* ========================================================================= */}
            {step === 3 && (
              <form onSubmit={handleProceedFromPatientDetails} className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
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

                {/* Patient Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Patient Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'مریض کا نام (Patient Name) *' : 'Patient Name *'}
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

                  {/* Patient Type: New vs Follow-up */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'مریض کی قسم (Patient Type) *' : 'Patient Type: New / Follow-up *'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPatientType('new')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          patientType === 'new'
                            ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isUr ? 'نیا مریض (New Patient)' : 'New Patient'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientType('followup')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          patientType === 'followup'
                            ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isUr ? 'دوبارہ معائنہ (Follow-up)' : 'Follow-up'}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Number with OTP Verification */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isUr ? 'موبائل نمبر (Mobile Number / WhatsApp) *' : 'Mobile Number (Mandatory) *'}
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="tel"
                        required
                        value={whatsAppNumber}
                        onChange={(e) => {
                          setWhatsAppNumber(e.target.value);
                          setIsOtpVerified(false);
                        }}
                        placeholder="+92 340 4777745"
                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                      />

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending || otpTimer > 0}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
                      >
                        {otpSending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                        )}
                        <span>
                          {otpTimer > 0
                            ? `Resend in ${otpTimer}s`
                            : isOtpSent
                            ? 'Resend OTP'
                            : isUr
                            ? 'او ٹی پی کوڈ بھیجیں'
                            : 'Send OTP'}
                        </span>
                      </button>
                    </div>

                    {/* OTP Entry Row */}
                    {isOtpSent && !isOtpVerified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs"
                      >
                        <span className="text-slate-600 font-semibold">Enter 4-Digit OTP:</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="1234"
                          className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold tracking-widest text-sm outline-none focus:ring-1 focus:ring-teal-600"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpVerifying}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                        >
                          {otpVerifying && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>{isUr ? 'تصدیق کریں' : 'Verify'}</span>
                        </button>
                        <span className="text-[11px] text-teal-700 font-semibold">
                          (Test Mode: Code 1234)
                        </span>
                      </motion.div>
                    )}

                    {isOtpVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Mobile Number Verified Successfully</span>
                      </div>
                    )}

                    {otpMessage && !isOtpVerified && (
                      <p className="text-[11px] text-teal-700 font-medium">{otpMessage}</p>
                    )}
                  </div>

                  {/* Age & Gender */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'عمر (سال میں)' : 'Age (Years)'}
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'جنس (Gender)' : 'Gender'}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="male">{isUr ? 'مرد / لڑکا (Male)' : 'Male'}</option>
                      <option value="female">{isUr ? 'عورت / لڑکی (Female)' : 'Female'}</option>
                      <option value="other">{isUr ? 'دیگر (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  {/* Reason for Visit */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                      {isUr ? 'معائنہ کی وجہ / علامات (اختیاری)' : 'Short Reason for Visit (Optional)'}
                    </label>
                    <textarea
                      rows={2}
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder={
                        isUr
                          ? 'مثلاً تیز بخار، کھانسی، یا فالو اپ چیک اپ...'
                          : 'e.g. Routine consultation, checkup, fever, pediatric follow-up...'
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* HIGHLIGHTED INSTRUCTION BOX FOR OPTION 1 */}
                {bookingOption === 'pay_at_hospital' && (
                  <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                      <span>Payment Method:</span>
                      <span className="bg-teal-800 text-white px-2.5 py-0.5 rounded-full font-mono">
                        Payment: Pay at Hospital
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {isUr
                        ? 'آپ کو اب کوئی آن لائن ادائیگی نہیں کرنی ہے۔ کاؤنٹر پر تشریف لا کر فیس ادا کریں۔'
                        : 'No online payment is required. Please pay the consultation fee upon arrival at the hospital OPD counter.'}
                    </p>
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs pt-1">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>“Please arrive 15 minutes before your appointment.”</span>
                    </div>
                  </div>
                )}

                {/* HIGHLIGHTED SUMMARY FOR OPTION 2 */}
                {bookingOption === 'pay_online' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Payment Method:</span>
                      <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-mono">
                        Payment: Pay Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {isUr
                        ? 'اگلے مرحلے پر جاز کیش، ایزی پیسہ یا کارڈ کے ذریعے محفوظ آن لائن ادائیگی کی جائے گی۔'
                        : 'Next step: Secure payment via JazzCash, Easypaisa, or Debit/Credit Card to confirm your reserved slot.'}
                    </p>
                  </div>
                )}

                {/* Submit / Proceed Button */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Consultation Fee:
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
                        <span>{isUr ? 'پروسیس ہو رہا ہے...' : 'Processing...'}</span>
                      </>
                    ) : bookingOption === 'pay_at_hospital' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                        <span>{isUr ? 'اپائنٹمنٹ مکمل کریں (کاؤنٹر پر ادائیگی)' : 'Confirm Appointment (Pay at Hospital)'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isUr ? 'آن لائن ادائیگی کی طرف بڑھیں' : 'Proceed to Secure Payment'}</span>
                        <ChevronRight className="w-4 h-4 text-teal-400" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: OPTION 2 SECURE ONLINE PAYMENT GATEWAY */}
            {/* ========================================================================= */}
            {step === 4 && confirmedAppt && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isUr ? 'مریض کی معلومات' : 'Back to Details'}</span>
                  </button>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ID: {confirmedAppt.id}
                    </span>
                  </div>
                </div>

                {/* Amount to Pay Banner */}
                <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">
                      Consultation Amount Payable
                    </span>
                    <h4 className="text-2xl font-black font-mono text-white mt-0.5">
                      PKR {confirmedAppt.feePKR}
                    </h4>
                    <p className="text-xs text-teal-200 mt-1">
                      For: {confirmedAppt.patientName} ({confirmedAppt.doctorNameEn})
                    </p>
                  </div>

                  <div className="bg-teal-800/60 border border-teal-700 p-3 rounded-xl text-xs space-y-1 sm:text-right">
                    <span className="text-amber-300 font-bold block">10-Min Reserved Slot Hold</span>
                    <span className="text-slate-200 font-mono">
                      {confirmedAppt.date} @ {confirmedAppt.time}
                    </span>
                  </div>
                </div>

                {/* Payment Gateway Error Alert */}
                {paymentError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">{paymentError}</p>
                      <p className="mt-0.5 text-red-700">
                        You can retry online payment or immediately switch to Pay at Hospital without losing your slot.
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Gateway Options Tabs */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Select Secure Payment Provider
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'jazzcash', label: 'JazzCash', sub: 'Mobile Wallet' },
                      { id: 'easypaisa', label: 'Easypaisa', sub: 'Mobile Wallet' },
                      { id: 'card', label: 'Debit / Credit', sub: 'Visa / Mastercard' },
                      { id: 'bank', label: 'Bank Transfer', sub: 'Direct IBAN' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setOnlineGateway(g.id as any)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                          onlineGateway === g.id
                            ? 'border-2 border-teal-600 bg-teal-50/50 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-slate-900 text-xs block">{g.label}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">{g.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Provider Specific Input Form */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  {(onlineGateway === 'jazzcash' || onlineGateway === 'easypaisa') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {onlineGateway === 'jazzcash' ? 'JazzCash Mobile Account' : 'Easypaisa Mobile Account'}
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="03XXXXXXXXX"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          CNIC Last 4 Digits
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={cnicLast4}
                          onChange={(e) => setCnicLast4(e.target.value)}
                          placeholder="1234"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  {onlineGateway === 'card' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Full name as on card"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Card Number (PCI-DSS Tokenized)
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        🔒 End-to-end encrypted. Sensitive card details are never stored on hospital servers.
                      </p>
                    </div>
                  )}

                  {onlineGateway === 'bank' && (
                    <div className="text-xs space-y-2 text-slate-700">
                      <div className="p-3 bg-white border rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">ZTBL Chowk Azam Branch:</span>
                        <p className="font-mono text-xs">A/C: 0041-029482-01 | Title: Gulzar Family Hospital</p>
                        <p className="text-[11px] text-slate-500">
                          Helpline WhatsApp: +92 340 4777745 for receipt verification.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Testing helper buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Simulation Helpers:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExecuteOnlinePayment('success')}
                        disabled={isProcessingPayment}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Simulate Success
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteOnlinePayment('fail')}
                        disabled={isProcessingPayment}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Simulate Decline
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Payment Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {/* Fallback button: Switch to Pay at Hospital without losing slot */}
                  <button
                    type="button"
                    onClick={handleFallbackToPayAtHospital}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-teal-700" />
                    <span>Switch to Pay at Hospital (No Payment Now)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteOnlinePayment('success')}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        <span>Pay PKR {confirmedAppt.feePKR} Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </motion.div>
  );
};
