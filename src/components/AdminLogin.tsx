import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Hospital,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { Language, AdminUser } from '../types';

interface AdminLoginProps {
  lang: Language;
  onLoginSuccess: (admin: AdminUser, token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  lang,
  onLoginSuccess,
  onCancel,
}) => {
  const isUr = lang === 'ur';

  const [email, setEmail] = useState('nh979681@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage(isUr ? 'براہ کرم اپنا ایڈمن ای میل درج کریں۔' : 'Please enter your admin email address.');
      return;
    }
    if (!password) {
      setErrorMessage(isUr ? 'براہ کرم اپنا پاس ورڈ درج کریں۔' : 'Please enter your administrator password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token && data.admin) {
        if (rememberMe) {
          localStorage.setItem('gfh_admin_token', data.token);
          localStorage.setItem('gfh_admin_user', JSON.stringify(data.admin));
        } else {
          sessionStorage.setItem('gfh_admin_token', data.token);
          sessionStorage.setItem('gfh_admin_user', JSON.stringify(data.admin));
        }

        onLoginSuccess(data.admin, data.token);
      } else {
        setErrorMessage(
          data.error ||
            (isUr
              ? 'غلط ای میل یا پاس ورڈ! صرف مجاز ایڈمنسٹریٹر کو رسائی حاصل ہے۔'
              : 'Invalid email or password. Access is restricted to authorized hospital administrators.')
        );
      }
    } catch {
      setErrorMessage(
        isUr
          ? 'سرور سے رابطہ قائم نہیں ہو سکا۔ دوبارہ کوشش کریں۔'
          : 'Failed to connect to the authentication server. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('nh979681@gmail.com');
    setPassword('fazal381381');
    setErrorMessage(null);
  };

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-radial from-slate-900 via-slate-950 to-black text-slate-100"
      dir={isUr ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-950/50 relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-teal-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Back navigation */}
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition mb-6 cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${isUr ? 'rotate-180' : ''}`} />
          <span>{isUr ? 'واپس ہسپتال ہوم پیج' : 'Return to Hospital Website'}</span>
        </button>

        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-slate-900 border-2 border-teal-400/40 text-white mb-4 shadow-lg shadow-teal-900/40">
            <Shield className="w-8 h-8 text-amber-300" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
            <span>{isUr ? 'مجاز ایڈمن کنٹرول' : 'Executive Admin Control'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isUr ? 'گلزار فیملی ہسپتال ایڈمن لاگ ان' : 'Hospital Management Login'}
          </h2>

          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isUr
              ? 'ڈاکٹرز کے شیڈول، فیس تصدیق، اور ہسپتال ڈیٹا کی دیکھ بھال کے لیے مجاز لاگ ان'
              : 'Sign in to access real-time appointment control, doctor schedules & live database management.'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{isUr ? 'ایڈمن ای میل ایڈریس' : 'Administrator Email ID'}</span>
              <span className="text-[10px] text-teal-400 font-mono">nh979681@gmail.com</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-500">
                <Mail className="w-4 h-4 text-teal-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nh979681@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 text-white text-xs rounded-xl ps-10 pe-4 py-3 placeholder:text-slate-600 transition font-mono outline-hidden"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                {isUr ? 'ایڈمن پاس ورڈ' : 'Admin Security Password'}
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-500">
                <Lock className="w-4 h-4 text-teal-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 text-white text-xs rounded-xl ps-10 pe-11 py-3 placeholder:text-slate-600 transition font-mono outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-slate-400 hover:text-teal-400 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Quick Fill */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500/20"
              />
              <span>{isUr ? 'اس ڈیوائس پر لاگ ان رکھیں' : 'Remember login session'}</span>
            </label>

            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
              title="Quick fill registered credentials"
            >
              <KeyRound className="w-3 h-3" />
              <span>{isUr ? 'کریڈینشلز درج کریں' : 'Quick Fill'}</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-teal-900/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4 text-amber-300" />
                <span>{isUr ? 'ایڈمن پورٹل میں لاگ ان کریں' : 'Authenticate & Enter Dashboard'}</span>
              </>
            )}
          </button>
        </form>

        {/* Security Credentials Footer Card */}
        <div className="mt-8 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-1.5">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isUr ? 'رجسٹرڈ ایڈمن کریڈینشلز' : 'Configured Admin Access'}</span>
            </span>
            <span className="text-[10px] text-teal-400 font-mono">256-Bit SSL</span>
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] pt-0.5">
            <span className="text-slate-500">Email:</span>
            <span className="text-teal-300 font-bold">nh979681@gmail.com</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-500">Password:</span>
            <span className="text-amber-300 font-bold tracking-widest">••••••••</span>
          </div>
        </div>
      </div>
    </div>
  );
};
