import React, { useState } from 'react';
import { Appointment, Language, PaymentMethod, HospitalInfoData } from '../types';
import { CreditCard, Upload, CheckCircle2, ShieldCheck, Copy, Check, FileText, AlertCircle, ArrowRight, Loader2, Sparkles, Building2, Smartphone } from 'lucide-react';

interface PaymentScreenProps {
  appointment: Appointment | null;
  hospitalInfo: HospitalInfoData;
  lang: Language;
  onPaymentSubmitted: (updatedAppointment: Appointment) => void;
  onBackToPortal: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  appointment,
  hospitalInfo,
  lang,
  onPaymentSubmitted,
  onBackToPortal,
}) => {
  const isUr = lang === 'ur';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('jazzcash');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showApiGatewaySettings, setShowApiGatewaySettings] = useState<boolean>(false);

  // Merchant API Config State (for production readiness)
  const [merchantId, setMerchantId] = useState<string>('JC-MERCHANT-88421');
  const [apiKey, setApiKey] = useState<string>('**************************');

  if (!appointment) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl inline-block text-amber-800 text-sm font-semibold">
          {isUr ? 'کوئی اپائنٹمنٹ منتخب نہیں کی گئی ہے۔' : 'No appointment selected for payment.'}
        </div>
        <div>
          <button
            onClick={onBackToPortal}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow"
          >
            {isUr ? 'میری اپائنٹمنٹس دیکھیں' : 'View My Appointments'}
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(isUr ? 'تصویر کا سائز 5MB سے کم ہونا چاہیے۔' : 'File size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReference.trim()) {
      setErrorMessage(
        isUr
          ? 'براہ کرم جاز کیش یا ایزی پیسہ کا ٹرانزیکشن نمبر (TRX ID) درج کریں۔'
          : 'Please enter transaction reference number (TRX ID).'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/appointments/${appointment.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          paymentReference: paymentReference.trim(),
          paymentScreenshotUrl: screenshotPreview || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit payment.');
      } else {
        onPaymentSubmitted(data.appointment);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(isUr ? 'سرور سے رابطہ نہ ہو سکا۔' : 'Server error while submitting payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
        
        {/* Header Title Banner */}
        <div className="bg-slate-900 text-white p-8 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-teal-500/20 text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Official Payment Gateway</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white">
              Complete Your Appointment
            </h2>
            <p className="text-slate-400 text-sm italic font-serif" dir="rtl">
              اپنی اپائنٹمنٹ مکمل کریں - Please select your payment method below
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-800/80 p-4 rounded-2xl border border-slate-700 min-w-[180px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment Fee</p>
            <p className="text-2xl font-bold text-[#0D9488] font-mono">PKR {appointment.feePKR}</p>
          </div>
        </div>

        {/* Appointment Fee Summary */}
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {isUr ? 'اپائنٹمنٹ تفصیلات' : 'Appointment Reference'}
            </span>
            <div className="text-sm font-bold text-slate-900">
              Patient: {appointment.patientName} <span className="text-xs text-[#0D9488] font-mono font-bold">({appointment.id})</span>
            </div>
            <div className="text-xs text-slate-600">
              Doctor: {appointment.doctorNameEn} • {appointment.date} @ {appointment.time}
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
            Gulzar Family Hospital, Chowk Azam
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form & Payment Method Selection */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* PAYMENT METHODS SELECTOR */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              1. Choose Payment Method / طریقہ انتخاب کریں
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* JazzCash Option */}
              <div
                onClick={() => setPaymentMethod('jazzcash')}
                className={`flex items-center justify-between p-4 bg-white rounded-xl cursor-pointer transition relative ${
                  paymentMethod === 'jazzcash'
                    ? 'border-2 border-teal-500 shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ED1C24] rounded-lg flex items-center justify-center text-white font-black text-xs italic shrink-0">
                    JC
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">JazzCash</p>
                    <p className="text-xs font-mono text-slate-500">0340-4777745</p>
                  </div>
                </div>

                {paymentMethod === 'jazzcash' ? (
                  <div className="w-6 h-6 bg-[#0D9488] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy('03404777745', 'JazzCash');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                  >
                    {copiedAccount === 'JazzCash' ? <Check className="w-4 h-4 text-[#0D9488]" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Easypaisa Option */}
              <div
                onClick={() => setPaymentMethod('easypaisa')}
                className={`flex items-center justify-between p-4 bg-white rounded-xl cursor-pointer transition relative ${
                  paymentMethod === 'easypaisa'
                    ? 'border-2 border-teal-500 shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#37B34A] rounded-lg flex items-center justify-center text-white font-black text-xs italic shrink-0">
                    EP
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Easypaisa</p>
                    <p className="text-xs font-mono text-slate-500">0340-4777745</p>
                  </div>
                </div>

                {paymentMethod === 'easypaisa' ? (
                  <div className="w-6 h-6 bg-[#0D9488] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy('03404777745', 'Easypaisa');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                  >
                    {copiedAccount === 'Easypaisa' ? <Check className="w-4 h-4 text-[#0D9488]" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Quick Step Guide */}
          <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-200">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              {isUr ? 'ادائیگی کا طریقہ کار:' : 'Payment Instructions:'}
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>
                {isUr
                  ? `اپنے ${paymentMethod === 'jazzcash' ? 'جاز کیش' : 'ایزی پیسہ'} ایپ سے 0340-4777745 پر PKR ${appointment.feePKR} منتقل کریں۔`
                  : `Transfer PKR ${appointment.feePKR} via ${paymentMethod} to account 0340-4777745.`}
              </li>
              <li>
                {isUr
                  ? 'موصول ہونے والے 12 ہندسوں کا Transaction ID (TRX ID) درج کریں۔'
                  : 'Enter the 12-digit Transaction ID (TRX ID).'}
              </li>
            </ol>
          </div>

          {/* INPUT FIELDS */}
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">
                2. Reference Details / ٹرانزیکشن نمبر (TRX ID) *
              </label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction ID / Reference Number"
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* SCREENSHOT UPLOAD */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">
                3. Proof of Payment / ادائیگی کی رسید
              </label>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                {screenshotPreview ? (
                  <div className="space-y-3 text-center">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot Preview"
                      className="max-h-48 rounded-xl mx-auto shadow-sm border border-slate-200"
                    />
                    <p className="text-xs text-[#0D9488] font-bold">
                      {isUr ? 'رسید منتخب ہو گئی ہے' : 'Screenshot attached!'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="text-3xl mb-1 text-slate-400">📸</div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">Upload Screenshot</p>
                    <p className="text-[10px] text-slate-400 italic">ادائیگی کی رسید اپ لوڈ کریں</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-base hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isUr ? 'ادائیگی جمع کی جا رہی ہے...' : 'Submitting Payment...'}</span>
                </>
              ) : (
                <>
                  <span>SUBMIT PAYMENT</span>
                  <span className="h-4 w-[1px] bg-slate-700"></span>
                  <span className="font-normal text-sm opacity-80">ادائیگی جمع کریں</span>
                </>
              )}
            </button>
          </div>

          {/* Merchant Gateway Integration Architectural Note */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowApiGatewaySettings(!showApiGatewaySettings)}
              className="text-xs font-bold text-slate-500 hover:text-[#0D9488] flex items-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>
                {showApiGatewaySettings
                  ? 'مہرچنٹ اے پی آئی کی ترتیب چھپائیں'
                  : '⚙️ Merchant Payment Gateway API Integration'}
              </span>
            </button>

            {showApiGatewaySettings && (
              <div className="mt-4 p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between text-teal-400 font-bold border-b border-slate-800 pb-2">
                  <span>Merchant Gateway / API Integration Architecture</span>
                  <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[10px]">Ready</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  For production automation, this system supports direct merchant payment gateway integration. JazzCash Merchant Payment Gateway API & Easypaisa Merchant Online Payment API verify transaction status in real-time without manual screenshot inspection.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Merchant ID / Business Account</label>
                    <input
                      type="text"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-1.5 rounded text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Production API Secret / Token</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-1.5 rounded text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
