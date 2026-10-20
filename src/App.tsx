import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, Language, AdminUser } from './types';
import { HospitalDataProvider, useHospitalData } from './context/HospitalDataContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DoctorsList } from './components/DoctorsList';
import { BookingWizard } from './components/BookingWizard';
import { PaymentScreen } from './components/PaymentScreen';
import { PatientPortal } from './components/PatientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { WhatsAppAutomation } from './components/WhatsAppAutomation';
import { HospitalInfo } from './components/HospitalInfo';
import { FaqSection } from './components/FaqSection';
import { FutureGallery } from './components/FutureGallery';
import { AiChatBot } from './components/AiChatBot';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { HospitalEventsSection } from './components/HospitalEventsSection';
import { AboutUs } from './components/AboutUs';
import { CheckCircle2, Sparkles, X, Bot } from 'lucide-react';

function AppContent() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [currentPaymentAppointment, setCurrentPaymentAppointment] = useState<Appointment | null>(null);
  const [recentlyConfirmedAppointment, setRecentlyConfirmedAppointment] = useState<Appointment | null>(null);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Admin authentication state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('gfh_admin_user') || sessionStorage.getItem('gfh_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('gfh_admin_token') || sessionStorage.getItem('gfh_admin_token') || null;
  });

  // Verify stored session on startup
  useEffect(() => {
    const token = localStorage.getItem('gfh_admin_token') || sessionStorage.getItem('gfh_admin_token');
    const storedUser = localStorage.getItem('gfh_admin_user') || sessionStorage.getItem('gfh_admin_user');

    if (token) {
      fetch('/api/admin/session', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) return { valid: false };
          return res.json().catch(() => ({ valid: false }));
        })
        .then((data) => {
          if (data?.valid && data?.admin) {
            setAdminUser(data.admin);
          } else if (token.startsWith('gfh_adm_live_') && storedUser) {
            try {
              setAdminUser(JSON.parse(storedUser));
            } catch {}
          } else {
            localStorage.removeItem('gfh_admin_token');
            localStorage.removeItem('gfh_admin_user');
            sessionStorage.removeItem('gfh_admin_token');
            sessionStorage.removeItem('gfh_admin_user');
            setAdminUser(null);
            setAdminToken(null);
          }
        })
        .catch(() => {
          // If network fetch fails on startup, maintain current stored session
          if (storedUser) {
            try {
              setAdminUser(JSON.parse(storedUser));
            } catch {}
          }
        });
    }
  }, []);

  const handleAdminLoginSuccess = (admin: AdminUser, token: string) => {
    setAdminUser(admin);
    setAdminToken(token);
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem('gfh_admin_token');
    localStorage.removeItem('gfh_admin_user');
    sessionStorage.removeItem('gfh_admin_token');
    sessionStorage.removeItem('gfh_admin_user');
    setAdminUser(null);
    setAdminToken(null);
    setActiveTab('home');
  };

  // Consume live hospital central database context
  const {
    doctors,
    hospitalEvents,
    hospitalInfo,
    isLiveConnected,
  } = useHospitalData();

  const handleOpenBooking = (doctor?: Doctor | string) => {
    if (typeof doctor === 'string') {
      const matched = doctors.find((d) => d.nameEn.toLowerCase().includes(doctor.toLowerCase()));
      setSelectedDoctorForBooking(matched || null);
    } else if (doctor) {
      setSelectedDoctorForBooking(doctor);
    } else {
      setSelectedDoctorForBooking(null);
    }
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPayment = (appt?: Appointment) => {
    if (appt) {
      setCurrentPaymentAppointment(appt);
    }
    setActiveTab('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (newAppt: Appointment) => {
    setRecentlyConfirmedAppointment(newAppt);
    setCurrentPaymentAppointment(newAppt);
    // If the patient explicitly chose Pay at Hospital or payment is already completed online,
    // do NOT redirect them to the payment gateway screen.
    if (newAppt.bookingOption === 'pay_at_hospital' || newAppt.paymentStatus === 'paid_online' || newAppt.paymentStatus === 'pay_at_hospital') {
      // Keep on the wizard's on-screen confirmation or user can go to patient portal
      // We don't force them to the payment screen
    } else if (newAppt.status === 'pending_payment') {
      // Option 2 pending payment can navigate to payment screen if needed
      setActiveTab('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePaymentSubmitted = (updatedAppt: Appointment) => {
    setRecentlyConfirmedAppointment(updatedAppt);
    setCurrentPaymentAppointment(updatedAppt);
    setActiveTab('patient_portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isUr = lang === 'ur';

  return (
    <div
      className={`min-h-screen bg-[#F0F7FC] text-slate-900 font-sans flex flex-col selection:bg-teal-600 selection:text-white ${
        isUr ? 'font-sans' : ''
      }`}
      dir={isUr ? 'rtl' : 'ltr'}
    >
      {/* Header Bar with Live Database Status & Emergency Notice */}
      <Header
        hospitalInfo={hospitalInfo}
        lang={lang}
        setLang={setLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
        onOpenPayment={() => handleOpenPayment()}
        isLiveConnected={isLiveConnected}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      {/* Confirmation Banner if recently booked */}
      {recentlyConfirmedAppointment && (
        <div className="bg-emerald-900 text-white p-4 shadow-lg border-b border-emerald-700">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base">
                  {isUr
                    ? `اپائنٹمنٹ بحق ${recentlyConfirmedAppointment.patientName} (${recentlyConfirmedAppointment.id}) جمع ہو گئی ہے!`
                    : `Appointment for ${recentlyConfirmedAppointment.patientName} (${recentlyConfirmedAppointment.id}) submitted!`}
                </h4>
                <p className="text-xs text-emerald-200">
                  {isUr
                    ? 'خودکار واٹس ایپ اطلاع بھیج دی گئی ہے۔ ہسپتال ایڈمن جلد تصدیق کرے گا۔'
                    : 'Automated WhatsApp confirmation sent. Hospital admin will verify payment.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setRecentlyConfirmedAppointment(null)}
              className="text-slate-300 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Body Router View */}
      <main className="flex-1">
        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <Hero
              hospitalInfo={hospitalInfo}
              lang={lang}
              onOpenBooking={() => handleOpenBooking()}
              onOpenPayment={() => handleOpenPayment()}
              onNavigateDoctors={() => setActiveTab('doctors')}
              onNavigateAbout={() => setActiveTab('about')}
            />

            {/* Live Hospital Dates & Medical Camps Section */}
            <HospitalEventsSection
              events={hospitalEvents}
              lang={lang}
              onOpenBooking={(docName) => handleOpenBooking(docName)}
              isLiveConnected={isLiveConnected}
            />

            {/* Doctors Directory with Live Leaves & Detailed Profile Modals */}
            <DoctorsList
              doctors={doctors}
              lang={lang}
              onSelectDoctorToBook={(doc) => handleOpenBooking(doc)}
              hospitalInfo={hospitalInfo}
            />

            <FutureGallery
              hospitalInfo={hospitalInfo}
              lang={lang}
              onOpenBooking={() => handleOpenBooking()}
            />

            <HospitalInfo
              hospitalInfo={hospitalInfo}
              lang={lang}
            />

            <FaqSection
              hospitalInfo={hospitalInfo}
              lang={lang}
              onOpenBooking={() => handleOpenBooking()}
            />
          </div>
        )}

        {/* ABOUT US VIEW */}
        {activeTab === 'about' && (
          <AboutUs
            hospitalInfo={hospitalInfo}
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
            onNavigateDoctors={() => setActiveTab('doctors')}
            onNavigateContact={() => setActiveTab('hospital_info')}
          />
        )}

        {/* DEDICATED HOSPITAL DATES & CAMPS TAB */}
        {activeTab === 'events' && (
          <div className="py-8">
            <HospitalEventsSection
              events={hospitalEvents}
              lang={lang}
              onOpenBooking={(docName) => handleOpenBooking(docName)}
              isLiveConnected={isLiveConnected}
            />
          </div>
        )}

        {/* DOCTORS VIEW */}
        {activeTab === 'doctors' && (
          <DoctorsList
            doctors={doctors}
            lang={lang}
            onSelectDoctorToBook={(doc) => handleOpenBooking(doc)}
            hospitalInfo={hospitalInfo}
          />
        )}

        {/* BOOKING WIZARD VIEW */}
        {activeTab === 'booking' && (
          <BookingWizard
            doctors={doctors}
            selectedDoctor={selectedDoctorForBooking}
            lang={lang}
            onBookingSuccess={handleBookingSuccess}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {/* PAYMENT VIEW */}
        {activeTab === 'payment' && (
          <PaymentScreen
            appointment={currentPaymentAppointment}
            hospitalInfo={hospitalInfo}
            lang={lang}
            onPaymentSubmitted={handlePaymentSubmitted}
            onBackToPortal={() => setActiveTab('patient_portal')}
          />
        )}

        {/* PATIENT PORTAL VIEW */}
        {activeTab === 'patient_portal' && (
          <PatientPortal
            hospitalInfo={hospitalInfo}
            lang={lang}
            onPayNow={(appt) => handleOpenPayment(appt)}
          />
        )}

        {/* WHATSAPP AUTOMATION STUDIO */}
        {activeTab === 'whatsapp_auto' && (
          <WhatsAppAutomation
            hospitalInfo={hospitalInfo}
            lang={lang}
          />
        )}

        {/* HOSPITAL INFO & MAP VIEW */}
        {activeTab === 'hospital_info' && (
          <HospitalInfo
            hospitalInfo={hospitalInfo}
            lang={lang}
          />
        )}

        {/* QUESTIONS & ANSWERS (FAQ) VIEW */}
        {activeTab === 'faq' && (
          <FaqSection
            hospitalInfo={hospitalInfo}
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {/* FUTURE HOSPITAL GALLERY VIEW */}
        {activeTab === 'future_gallery' && (
          <FutureGallery
            hospitalInfo={hospitalInfo}
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {/* ADMIN DASHBOARD VIEW PROTECTED WITH AUTHENTICATION */}
        {activeTab === 'admin' && (
          adminUser ? (
            <AdminDashboard
              doctors={doctors}
              lang={lang}
              adminUser={adminUser}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminLogin
              lang={lang}
              onLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => setActiveTab('home')}
            />
          )
        )}

        {/* AI CHAT BOT FULL TAB VIEW */}
        {activeTab === 'ai_chat' && (
          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {lang === 'ur' ? 'مصنوعی ذہانت طبی معاون' : 'AI Powered Medical Assistant'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {lang === 'ur' ? 'گلزار فیملی ہسپتال اے آئی چاٹ' : 'Gulzar Family Hospital AI Concierge'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
                {lang === 'ur'
                  ? 'ڈاکٹرز کی فیس، اوقاتِ کار، بچوں کی دیکھ بھال، اور آن لائن اپائنٹمنٹ کے بارے میں 24 گھنٹے سوالات پوچھیں۔'
                  : 'Get instant 24/7 answers grounded in live hospital database records.'}
              </p>
            </div>

            <AiChatBot
              hospitalInfo={hospitalInfo}
              lang={lang}
              onOpenBooking={(docName) => handleOpenBooking(docName)}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          </div>
        )}
      </main>

      {/* FLOATING AI CHAT BOT TRIGGER BUTTON & MODAL */}
      {isFloatingChatOpen && (
        <AiChatBot
          hospitalInfo={hospitalInfo}
          lang={lang}
          isFloatingModal={true}
          onCloseFloating={() => setIsFloatingChatOpen(false)}
          onOpenBooking={(docName) => {
            setIsFloatingChatOpen(false);
            handleOpenBooking(docName);
          }}
          onNavigateTab={(t) => {
            setIsFloatingChatOpen(false);
            setActiveTab(t);
          }}
        />
      )}

      {/* FLOATING ACTION BUBBLE */}
      {!isFloatingChatOpen && activeTab !== 'ai_chat' && (
        <button
          onClick={() => setIsFloatingChatOpen(true)}
          className="fixed bottom-20 lg:bottom-8 right-4 sm:right-6 z-40 bg-gradient-to-r from-teal-800 to-slate-900 text-amber-300 p-3 sm:p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-teal-300/40 group cursor-pointer"
          title="Open AI Healthcare Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1 text-white">
            {lang === 'ur' ? 'اے آئی اسسٹنٹ' : 'AI Healthcare Chat'}
          </span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin [animation-duration:3s]" />
        </button>
      )}

      {/* Mobile Fixed Navigation */}
      <MobileNav
        lang={lang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
        onOpenPayment={() => handleOpenPayment()}
      />

      {/* Footer */}
      <Footer
        hospitalInfo={hospitalInfo}
        lang={lang}
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
        onOpenPayment={() => handleOpenPayment()}
      />
    </div>
  );
}

export default function App() {
  return (
    <HospitalDataProvider>
      <AppContent />
    </HospitalDataProvider>
  );
}
