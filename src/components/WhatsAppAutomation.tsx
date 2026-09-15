import React, { useState, useEffect } from 'react';
import { WhatsAppLog, Language, HospitalInfoData } from '../types';
import { MessageSquare, Send, CheckCheck, RefreshCw, Smartphone, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';

interface WhatsAppAutomationProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
}

export const WhatsAppAutomation: React.FC<WhatsAppAutomationProps> = ({
  hospitalInfo,
  lang,
}) => {
  const isUr = lang === 'ur';

  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string>('payment_confirmation');
  const [recipientPhone, setRecipientPhone] = useState<string>('+923001234567');
  const [recipientName, setRecipientName] = useState<string>('Ali Raza');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/whatsapp/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const templates = [
    {
      id: 'payment_confirmation',
      labelEn: 'Payment Confirmation (Official)',
      labelUr: 'پرداخت کی تصدیق (سرکاری)',
      en: `Dear [Patient Name],\n\nYour payment for Gulzar Family Hospital & Children Center has been received/verified.\n\nAppointment ID: [ID]\nDoctor: [Doctor Name]\nDate: [Date]\nTime: [Time]\nConsultation Type: [Hospital Visit / Online Consultation]\n\nAddress:\nFatehpur Road, In Front of ZTBL,\nChowk Azam, Layyah.\n\nFor assistance:\n+92 340 4777745\n\nThank you,\nGulzar Family Hospital & Children Center`,
      ur: `محترم [مریض کا نام]،\n\nGulzar Family Hospital & Children Center میں آپ کی ادائیگی موصول/تصدیق ہو گئی ہے۔\n\nاپائنٹمنٹ نمبر: [ID]\nڈاکٹر: [ڈاکٹر کا نام]\nتاریخ: [تاریخ]\nوقت: [وقت]\nنوعیت: [ہسپتال وزٹ / آن لائن کنسلٹیشن]\n\nپتہ:\nFatehpur Road، ZTBL کے سامنے،\nچوک اعظم، ضلع لیہ۔\n\nرابطہ:\n+92 340 4777745\n\nشکریہ\nGulzar Family Hospital & Children Center`,
    },
    {
      id: 'appointment_confirmation',
      labelEn: 'Appointment Confirmation',
      labelUr: 'اپائنٹمنٹ کی تصدیق',
      en: `Dear [Patient Name], your appointment request (ID: [ID]) for ${hospitalInfo.name} has been received. Please complete your payment via JazzCash or Easypaisa (0340-4777745) to lock your slot. Helpline: +92 340 4777745.`,
      ur: `محترم [مریض کا نام]، ${hospitalInfo.nameUr} میں آپ کی اپائنٹمنٹ کی درخواست موصول ہو گئی ہے۔ اپنی سیٹ کی تصدیق کے لیے جاز کیش یا ایزی پیسہ (0340-4777745) سے فیس ادا کریں۔ ہیلپ لائن: +92 340 4777745۔`,
    },
    {
      id: 'reminder_24h',
      labelEn: '24-Hour Reminder',
      labelUr: '24 گھنٹے پہلے یاد دہانی',
      en: `Reminder: Dear [Patient Name], you have a scheduled appointment tomorrow at Gulzar Family Hospital & Children Center with [Doctor Name]. Address: Fatehpur Road, In Front of ZTBL, Chowk Azam, Layyah. Phone: +92 340 4777745.`,
      ur: `یاد دہانی: محترم [مریض کا نام]، کل گلزار فیملی ہسپتال چوک اعظم میں [ڈاکٹر کا نام] کے ساتھ آپ کی اپائنٹمنٹ ہے۔ پتہ: فتح پور روڈ، زیڈ ٹی بی ایل کے سامنے، چوک اعظم۔ رابطہ: +92 340 4777745۔`,
    },
    {
      id: 'reminder_2h',
      labelEn: '2-Hour Reminder',
      labelUr: '2 گھنٹے پہلے فوری یاد دہانی',
      en: `Urgent Reminder: Dear [Patient Name], your appointment with [Doctor Name] is in 2 hours at Gulzar Family Hospital & Children Center. Please reach on time. Contact: +92 340 4777745.`,
      ur: `فوری یاد دہانی: محترم [مریض کا نام]، ۲ گھنٹے بعد گلزار فیملی ہسپتال چوک اعظم میں [ڈاکٹر کا نام] کے ساتھ آپ کی اپائنٹمنٹ ہے۔ براہ کرم وقت پر پہنچیں۔ رابطہ: +92 340 4777745۔`,
    },
    {
      id: 'cancellation',
      labelEn: 'Appointment Cancellation',
      labelUr: 'اپائنٹمنٹ کی منسوخی',
      en: `Dear [Patient Name], your appointment ID [ID] at Gulzar Family Hospital & Children Center has been cancelled. For queries or rescheduling, contact: +92 340 4777745.`,
      ur: `محترم [مریض کا نام]، گلزار فیملی ہسپتال چوک اعظم میں آپ کی اپائنٹمنٹ نمبر [ID] منسوخ کر دی گئی ہے۔ دوبارہ بکنگ کے لیے رابطہ کریں: +92 340 4777745۔`,
    },
    {
      id: 'rescheduling',
      labelEn: 'Appointment Rescheduling',
      labelUr: 'اپائنٹمنٹ تبدیل کرنے کی تصدیق',
      en: `Dear [Patient Name], your appointment ID [ID] has been rescheduled to [Date] at [Time] with [Doctor Name]. Gulzar Family Hospital & Children Center (+92 340 4777745).`,
      ur: `محترم [مریض کا نام]، آپ کی اپائنٹمنٹ نمبر [ID] تبدیل ہو کر [تاریخ] بوقت [وقت] برائے [ڈاکٹر کا نام] ہو گئی ہے۔ گلزار فیملی ہسپتال چوک اعظم (+92 340 4777745)۔`,
    },
    {
      id: 'doctor_unavailability',
      labelEn: 'Doctor Unavailability Notice',
      labelUr: 'ڈاکٹر غیر موجودگی اطلاع',
      en: `Notice: Dear [Patient Name], [Doctor Name] is unavailable today due to an emergency surgery. We are rescheduling your appointment. Helpline: +92 340 4777745. Gulzar Family Hospital.`,
      ur: `اطلاع: محترم [مریض کا نام]، ایمرجنسی سرجری کی وجہ سے [ڈاکٹر کا نام] آج دستیاب نہیں ہیں۔ ہم آپ کی اپائنٹمنٹ کا وقت تبدیل کر رہے ہیں۔ رابطہ: +92 340 4777745۔`,
    },
  ];

  const currentTpl = templates.find((t) => t.id === activeTemplate) || templates[0];

  const handleSendTestMessage = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/whatsapp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone,
          recipientName,
          templateType: activeTemplate,
          messageEn: currentTpl.en.replace('[Patient Name]', recipientName),
          messageUr: currentTpl.ur.replace('[مریض کا نام]', recipientName),
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
          <span>OFFICIAL WHATSAPP BUSINESS AUTOMATION (+92 340 4777745)</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-white">
          {isUr ? 'واٹس ایپ آٹومیشن اسٹوڈیو' : 'WhatsApp Automation & Notification Engine'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans">
          Automated bilingual messaging system for instant appointment confirmations, JazzCash / Easypaisa payment verification notices, 24h & 2h patient reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Template Selector & Previews */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              1. Select WhatsApp Message Template
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl.id)}
                  className={`p-3 rounded-xl text-xs font-bold text-left transition border cursor-pointer ${
                    activeTemplate === tpl.id
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>{isUr ? tpl.labelUr : tpl.labelEn}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Template English & Urdu Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* English Template */}
            <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 space-y-3 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">English Template</span>
                <button
                  onClick={() => handleCopyText(currentTpl.en, 1)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedIndex === 1 ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-300">
                {currentTpl.en}
              </pre>
            </div>

            {/* Urdu Template */}
            <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 space-y-3 relative text-right" dir="rtl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2" dir="ltr">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">اردو ٹیمپلیٹ</span>
                <button
                  onClick={() => handleCopyText(currentTpl.ur, 2)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedIndex === 2 ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <pre className="text-xs font-serif whitespace-pre-wrap leading-relaxed text-teal-200">
                {currentTpl.ur}
              </pre>
            </div>

          </div>
        </div>

        {/* Live Simulator Phone Screen */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              2. Test Message Trigger Simulator
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Patient Phone Number</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-[#0D9488]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Patient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <button
                onClick={handleSendTestMessage}
                disabled={isSending}
                className="w-full py-3.5 bg-[#0D9488] hover:bg-teal-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending Test Message...' : 'Trigger Simulated WhatsApp API Message'}</span>
              </button>

              <a
                href={`https://wa.me/923404777745?text=${encodeURIComponent(
                  currentTpl.en.replace('[Patient Name]', recipientName)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xs transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-teal-400" />
                <span>Open in Real WhatsApp App (+92 340 4777745)</span>
              </a>
            </div>
          </div>

          {/* Live Delivery Log Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Live Delivery Logs
              </h4>
              <button onClick={fetchLogs} className="text-[11px] text-[#0D9488] font-bold flex items-center gap-1 cursor-pointer">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-slate-900">{log.recipientPhone}</span>
                    <span className="text-[#0D9488] font-bold">{log.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 line-clamp-2">{log.messageEn}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
