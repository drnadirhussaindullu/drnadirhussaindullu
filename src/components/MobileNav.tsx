import React from 'react';
import { Home, UserCheck, Calendar, CreditCard, Bot, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface MobileNavProps {
  lang: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenPayment: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  lang,
  activeTab,
  setActiveTab,
  onOpenBooking,
  onOpenPayment,
}) => {
  const isUr = lang === 'ur';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 lg:hidden px-2 py-2">
      <div className="grid grid-cols-5 items-center text-center text-[10px] font-bold text-slate-400">
        
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'home' ? 'text-teal-400 font-bold' : 'hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{isUr ? 'ہوم' : 'Home'}</span>
        </button>

        {/* Doctors */}
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'doctors' ? 'text-teal-400 font-bold' : 'hover:text-white'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span>{isUr ? 'ڈاکٹرز' : 'Doctors'}</span>
        </button>

        {/* BOOK APPOINTMENT (HIGHLY VISIBLE CENTER CTA) */}
        <button
          onClick={onOpenBooking}
          className="flex flex-col items-center -mt-5 py-2 px-1 bg-[#0D9488] hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xs scale-105 active:scale-95 transition cursor-pointer"
        >
          <Calendar className="w-6 h-6 mb-0.5 text-white" />
          <span className="text-[9px] uppercase leading-none font-bold tracking-wider">{isUr ? 'اپائنٹمنٹ' : 'Booking'}</span>
        </button>

        {/* AI Chat */}
        <button
          onClick={() => setActiveTab('ai_chat')}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'ai_chat' ? 'text-amber-300 font-bold' : 'text-teal-300 hover:text-white'
          }`}
        >
          <div className="relative">
            <Bot className="w-5 h-5 mb-0.5 text-amber-300" />
            <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1 animate-ping" />
          </div>
          <span>{isUr ? 'اے آئی' : 'AI Chat'}</span>
        </button>

        {/* Payment */}
        <button
          onClick={onOpenPayment}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'payment' ? 'text-teal-400 font-bold' : 'hover:text-white'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span>{isUr ? 'ادائیگی' : 'Payment'}</span>
        </button>

      </div>
    </div>
  );
};
