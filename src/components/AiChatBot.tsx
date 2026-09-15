import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Phone,
  Calendar,
  MapPin,
  MessageSquare,
  CreditCard,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  AlertCircle,
  Clock,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Language, HospitalInfoData } from '../types';

interface AiChatBotProps {
  hospitalInfo: HospitalInfoData;
  lang: Language;
  onOpenBooking?: (doctorName?: string) => void;
  onNavigateTab?: (tab: string) => void;
  isFloatingModal?: boolean;
  onCloseFloating?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiChatBot: React.FC<AiChatBotProps> = ({
  hospitalInfo,
  lang,
  onOpenBooking,
  onNavigateTab,
  isFloatingModal = false,
  onCloseFloating,
}) => {
  const isUr = lang === 'ur';

  const defaultWelcomeMessage: ChatMessage = {
    id: 'msg-welcome',
    role: 'assistant',
    text: isUr
      ? `سلام! میں **گلزار فیملی ہسپتال و چلڈرن سینٹر** کا رسمی AI اسسٹنٹ ہوں۔\n\nآپ مجھ سے **ڈاکٹرز کی فیس، وقت، بچوں کے امراض، چائلڈ سرجری، گائنی و لیبر روم، آن لائن اپائنٹمنٹ، یا JazzCash/Easypaisa ادائیگی** کے بارے میں کچھ بھی پوچھ سکتے ہیں۔\n\nآپ کی کیا مدد کر سکتا ہوں؟`
      : `Welcome to **Gulzar Family Hospital & Children Center** AI Healthcare Concierge!\n\nI can assist you with:\n- 👨‍⚕️ Specialist doctors, OPD timings & consultation fees\n- 📅 How to book appointments online\n- 💳 Payment verification via JazzCash & Easypaisa (0340-4777745)\n- 👶 Child health, NICU care, newborn advice & maternity services\n- 📍 Hospital location & emergency numbers\n\nHow may I help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = isUr
    ? [
        '👨‍⚕️ ڈاکٹرز اور فیس کی تفصیل',
        '📅 اپائنٹمنٹ کیسے بک کریں؟',
        '💳 JazzCash اور Easypaisa کا طریقہ',
        '👶 بچوں کے بخار میں کیا کریں؟',
        '📍 ہسپتال کا پتہ اور نقشہ',
        '📞 ایمرجنسی نمبرز',
      ]
    : [
        '👨‍⚕️ Doctors list & OPD fees',
        '📅 How to book an appointment?',
        '💳 JazzCash & Easypaisa payment info',
        '👶 Child fever & care tips',
        '📍 Hospital location & Google Maps',
        '📞 Emergency helpline details',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      // Build past message history for context
      const history = messages
        .filter((m) => m.id !== 'msg-welcome')
        .slice(-8)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error contacting chat endpoint:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: isUr
          ? `معذرت! اس وقت کنیکشن سست ہے۔ آپ ہم سے براہِ راست رابطہ کر سکتے ہیں:\n\n📞 **فون / واٹس ایپ:** +92 340 4777745\n📍 **پتہ:** فتح پور روڈ، نزد ZTBL، چوک اعظم، لیہ۔`
          : `I am having trouble connecting to the server at the moment.\n\nPlease call or WhatsApp us directly at **+92 340 4777745** for immediate assistance, or visit Gulzar Family Hospital on Fatehpur Road, Chowk Azam, Layyah.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (rawText: string) => {
    // Basic formatting: handle bold **text**, bullet points, and URLs
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Process bold markers
          const parts = line.split(/(\*\*.*?\*\*)/g);

          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            // Check for links
            if (part.includes('https://maps.app.goo.gl') || part.includes('share.google') || part.includes('maps.google.com')) {
              return (
                <a
                  key={pIdx}
                  href="https://share.google/nClgUpNiP0qDg6Dpe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 underline font-semibold hover:text-teal-900"
                >
                  {part}
                </a>
              );
            }
            return part;
          });

          if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-teal-600 font-bold shrink-0 mt-1">•</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          if (/^\d+\./.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-bold text-teal-700 shrink-0">{trimmed.split('.')[0]}.</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedLine}</p>;
        })}
      </div>
    );
  };

  const containerClasses = isFloatingModal
    ? `fixed bottom-4 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] ${
        isExpanded ? 'h-[90vh] sm:h-[650px]' : 'h-[520px] sm:h-[580px]'
      } bg-white rounded-2xl shadow-2xl border border-teal-100 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`
    : 'w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-teal-100 flex flex-col h-[700px] overflow-hidden my-6';

  return (
    <div className={containerClasses} dir={isUr ? 'rtl' : 'ltr'}>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-teal-600/60 border border-teal-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                {isUr ? 'گلزار اے آئی میڈیکل اسسٹنٹ' : 'Gulzar AI Healthcare Assistant'}
              </h3>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                24/7 AI
              </span>
            </div>
            <p className="text-[11px] text-teal-100/90 flex items-center gap-1 mt-0.5 font-sans">
              <span>{isUr ? 'گلزار فیملی ہسپتال و چلڈرن سینٹر' : 'Gulzar Family Hospital & Children Center'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isFloatingModal && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-teal-100 hover:text-white transition"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setMessages([defaultWelcomeMessage])}
            className="p-1.5 hover:bg-white/10 rounded-lg text-teal-100 hover:text-white transition"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isFloatingModal && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              className="p-1.5 hover:bg-white/10 rounded-lg text-teal-100 hover:text-white transition"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* QUICK EMERGENCY BANNER */}
      <div className="bg-amber-50 border-b border-amber-200/70 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-amber-900 shrink-0">
        <div className="flex items-center gap-1.5 font-medium">
          <HeartPulse className="w-3.5 h-3.5 text-red-600 shrink-0 animate-bounce" />
          <span>{isUr ? '24/7 ایمرجنسی و لیبر روم باہم دستیاب ہے' : '24/7 Emergency & NICU Available'}</span>
        </div>
        <a
          href="tel:+923404777745"
          className="font-bold text-teal-800 hover:underline flex items-center gap-1"
        >
          <Phone className="w-3 h-3 text-teal-700" />
          0340-4777745
        </a>
      </div>

      {/* MESSAGES THREAD */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-900 text-amber-300 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-teal-700 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
              }`}
            >
              {renderFormattedText(msg.text)}

              <div
                className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end ${
                  msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                <span>{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" />
                <span className="text-xs text-slate-500 font-medium ml-1.5">
                  {isUr ? 'گلزار اے آئی سوچ رہا ہے...' : 'Gulzar AI is analyzing...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTIONS CHIPS */}
      <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 px-1">
          {isUr ? 'فوری سوالات:' : 'Quick:'}
        </span>
        {quickPrompts.map((promptText, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSendMessage(promptText)}
            disabled={loading}
            className="text-xs px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-full border border-teal-200 font-medium transition shrink-0 active:scale-95 disabled:opacity-50"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* DIRECT ACTION BAR */}
      <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/60 flex items-center justify-around text-xs shrink-0 font-medium text-slate-700">
        {onOpenBooking && (
          <button
            onClick={() => onOpenBooking()}
            className="flex items-center gap-1 text-teal-800 hover:text-teal-950 hover:underline font-bold"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{isUr ? 'اپائنٹمنٹ بک کریں' : 'Book Appointment'}</span>
          </button>
        )}

        <a
          href="https://wa.me/923404777745"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 hover:underline font-bold"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isUr ? 'واٹس ایپ رابطہ' : 'WhatsApp Us'}</span>
        </a>

        <a
          href="https://share.google/nClgUpNiP0qDg6Dpe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-700 hover:text-slate-900 hover:underline font-bold"
        >
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>{isUr ? 'نقشہ دیکھیں' : 'Google Maps'}</span>
        </a>
      </div>

      {/* INPUT FIELD */}
      <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isUr
                ? 'اپنا سوال یا مسئلہ یہاں لکھیں (مثلاً: ڈاکٹر نادر کی فیس کتنی ہے؟)...'
                : 'Ask a question (e.g. Dr. Nadir timings, fee, child fever tips)...'
            }
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 bg-teal-800 hover:bg-teal-900 text-amber-300 rounded-xl font-bold transition shadow-xs disabled:opacity-40 shrink-0 flex items-center justify-center active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-1.5 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-teal-600" />
          <span>
            {isUr
              ? 'اے آئی معلومات عام طبی رہنمائی کے لیے ہیں۔ ایمرجنسی میں براہِ راست وزٹ کریں۔'
              : 'AI guidance is for general information. Visit emergency for acute symptoms.'}
          </span>
        </p>
      </div>
    </div>
  );
};
