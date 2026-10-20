import React, { useState } from 'react';
import { Appointment, Doctor, Language, HospitalEvent, HospitalInfoData, AdminUser, AdminPermission } from '../types';
import { useHospitalData } from '../context/HospitalDataContext';
import { AdminManagementTab } from './admin/AdminManagementTab';
import { AuditLogsTab } from './admin/AuditLogsTab';
import { ClinicalServicesTab } from './admin/ClinicalServicesTab';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  AlertCircle,
  Building2,
  Smartphone,
  Settings,
  Save,
  Loader2,
  UserCheck,
  UserX,
  Users,
  Plus,
  Trash2,
  Edit2,
  Gift,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Megaphone,
  LogOut,
  FileText,
  Lock,
} from 'lucide-react';

interface AdminDashboardProps {
  doctors: Doctor[];
  lang: Language;
  onUpdateDoctorSchedule?: (doctor: Doctor) => void;
  adminUser?: AdminUser | null;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  adminUser,
  onLogout,
}) => {
  const isUr = lang === 'ur';

  const {
    doctors,
    appointments,
    hospitalEvents,
    hospitalInfo,
    stats,
    isLiveConnected,
    isSyncing,
    refreshAll,
    verifyAppointment,
    refundAppointment,
    updateAppointmentStatus,
    updateDoctorSchedule,
    toggleDoctorLeave,
    createHospitalEvent,
    updateHospitalEvent,
    deleteHospitalEvent,
    pruneExpiredEvents,
    updateHospitalInfo,
  } = useHospitalData();

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('gfh_admin_token') || sessionStorage.getItem('gfh_admin_token') || ''
      : '';

  const isSuperAdmin = adminUser?.role === 'super_admin';
  const userPermissions: AdminPermission[] = adminUser?.permissions || [];
  const can = (permission: AdminPermission): boolean => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(permission);
  };

  const [activeTab, setActiveTab] = useState<
    'payments' | 'schedule' | 'services' | 'events' | 'patients' | 'announcements' | 'admins' | 'audit' | 'settings'
  >('payments');

  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Refund Modal State
  const [refundModalAppt, setRefundModalAppt] = useState<Appointment | null>(null);
  const [refundReason, setRefundReason] = useState<string>('Patient requested cancellation within policy window');
  const [isRefunding, setIsRefunding] = useState<boolean>(false);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    onlinePaymentEnabled: hospitalInfo.onlinePaymentEnabled ?? true,
    payAtHospitalEnabled: hospitalInfo.payAtHospitalEnabled ?? true,
    requireOtpVerification: hospitalInfo.requireOtpVerification ?? true,
    otpTestMode: hospitalInfo.otpTestMode ?? true,
    defaultConsultationFee: hospitalInfo.defaultConsultationFee ?? 1500,
  });
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Schedule Tab Selected Doctor
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const activeEditingDoc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const [editingDoctor, setEditingDoctor] = useState<Doctor>(activeEditingDoc);
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);
  const [leaveReasonInput, setLeaveReasonInput] = useState<string>(activeEditingDoc?.unavailabilityReason || '');

  // Keep editingDoctor synced if selectedDoctorId changes
  React.useEffect(() => {
    const doc = doctors.find((d) => d.id === selectedDoctorId);
    if (doc) {
      setEditingDoctor(doc);
      setLeaveReasonInput(doc.unavailabilityReason || '');
    }
  }, [selectedDoctorId, doctors]);

  // Hospital Events Modal / Form State
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({
    titleEn: '',
    titleUr: '',
    category: 'medical_camp' as HospitalEvent['category'],
    descriptionEn: '',
    descriptionUr: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    timeRangeEn: '10:00 AM - 02:00 PM',
    timeRangeUr: 'صبح ۱۰ بجے تا دوپہر ۲ بجے',
    locationEn: 'OPD Hall, Gulzar Family Hospital Chowk Azam',
    locationUr: 'او پی ڈی ہال، گلزار فیملی ہسپتال چوک اعظم لیہ',
    doctorInChargeEn: 'Dr. Nadir Hussain Dullu',
    doctorInChargeUr: 'ڈاکٹر نادر حسین ڈلو',
    isFree: true,
    registrationOpen: true,
    notesEn: '',
    notesUr: '',
  });

  // Announcements & Notices State
  const [noticesForm, setNoticesForm] = useState({
    emergencyNoticeEn: hospitalInfo.emergencyNoticeEn || '',
    emergencyNoticeUr: hospitalInfo.emergencyNoticeUr || '',
    activeAnnouncementEn: hospitalInfo.activeAnnouncementEn || '',
    activeAnnouncementUr: hospitalInfo.activeAnnouncementUr || '',
    phone: hospitalInfo.phone || '+92 340 4777745',
    whatsApp: hospitalInfo.whatsApp || '+92 340 4777745',
    googleMapsUrl: hospitalInfo.googleMapsUrl || 'https://share.google/nClgUpNiP0qDg6Dpe',
  });

  React.useEffect(() => {
    setNoticesForm({
      emergencyNoticeEn: hospitalInfo.emergencyNoticeEn || '',
      emergencyNoticeUr: hospitalInfo.emergencyNoticeUr || '',
      activeAnnouncementEn: hospitalInfo.activeAnnouncementEn || '',
      activeAnnouncementUr: hospitalInfo.activeAnnouncementUr || '',
      phone: hospitalInfo.phone || '+92 340 4777745',
      whatsApp: hospitalInfo.whatsApp || '+92 340 4777745',
      googleMapsUrl: hospitalInfo.googleMapsUrl || 'https://share.google/nClgUpNiP0qDg6Dpe',
    });
  }, [hospitalInfo]);

  // Payment Verification Handler
  const handleVerify = async (
    apptId: string,
    action: 'approve' | 'reject' | 'checkin' | 'complete' | 'cancel'
  ) => {
    const res = await verifyAppointment(apptId, action);
    if (!res.success) {
      alert(`Action failed: ${res.error}`);
    }
  };

  // Doctor Leave Toggle Handler
  const handleToggleLeave = async (doc: Doctor, targetAvailable: boolean) => {
    const reason = !targetAvailable
      ? leaveReasonInput.trim() || 'On Official Leave / Emergency'
      : undefined;

    const res = await toggleDoctorLeave(doc.id, targetAvailable, reason);
    if (res.success) {
      alert(
        targetAvailable
          ? `${doc.nameEn} is now marked as AVAILABLE.`
          : `${doc.nameEn} marked ON LEAVE. All slot bookings have been locked.`
      );
    } else {
      alert(`Failed to update leave status: ${res.error}`);
    }
  };

  // Doctor Schedule Save Handler
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchedule(true);
    const res = await updateDoctorSchedule(editingDoctor);
    setIsSavingSchedule(false);
    if (res.success) {
      alert(isUr ? 'ڈاکٹر کا شیڈول کامیابی سے محفوظ ہو گیا ہے۔' : 'Doctor schedule updated & synchronized across website!');
    } else {
      alert(`Failed to save schedule: ${res.error}`);
    }
  };

  // Event Modal Save Handler
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.titleEn || !eventFormData.startDate) {
      alert('Title and start date are required');
      return;
    }

    if (editingEventId) {
      const res = await updateHospitalEvent(editingEventId, eventFormData);
      if (res.success) {
        setShowEventModal(false);
        setEditingEventId(null);
      } else {
        alert(res.error);
      }
    } else {
      const res = await createHospitalEvent(eventFormData);
      if (res.success) {
        setShowEventModal(false);
      } else {
        alert(res.error);
      }
    }
  };

  // Open Edit Event Modal
  const openEditEvent = (ev: HospitalEvent) => {
    setEditingEventId(ev.id);
    setEventFormData({
      titleEn: ev.titleEn,
      titleUr: ev.titleUr,
      category: ev.category,
      descriptionEn: ev.descriptionEn,
      descriptionUr: ev.descriptionUr,
      startDate: ev.startDate,
      endDate: ev.endDate,
      timeRangeEn: ev.timeRangeEn || '',
      timeRangeUr: ev.timeRangeUr || '',
      locationEn: ev.locationEn,
      locationUr: ev.locationUr,
      doctorInChargeEn: ev.doctorInChargeEn || '',
      doctorInChargeUr: ev.doctorInChargeUr || '',
      isFree: ev.isFree,
      registrationOpen: ev.registrationOpen,
      notesEn: ev.notesEn || '',
      notesUr: ev.notesUr || '',
    });
    setShowEventModal(true);
  };

  const handlePruneExpired = async () => {
    const res = await pruneExpiredEvents();
    if (res.success) {
      alert(`Pruned ${res.removedCount} expired events from database.`);
    } else {
      alert(res.error);
    }
  };

  const handleSaveNotices = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateHospitalInfo(noticesForm);
    if (res.success) {
      alert('Emergency alerts & announcements updated! Live sync active.');
    } else {
      alert(res.error);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesQuery =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.whatsAppNumber.includes(searchQuery) ||
      (a.paymentReference && a.paymentReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.transactionId && a.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDoctor = selectedDoctorFilter === 'all' || a.doctorId === selectedDoctorFilter;
    const matchesDate = selectedDateFilter === 'all' || a.date === selectedDateFilter;

    let matchesPayment = true;
    if (selectedPaymentFilter === 'pay_at_hospital') {
      matchesPayment = a.bookingOption === 'pay_at_hospital' || a.paymentStatus === 'pay_at_hospital';
    } else if (selectedPaymentFilter === 'paid_online') {
      matchesPayment = a.paymentStatus === 'paid_online' || (a.bookingOption === 'pay_online' && a.status === 'confirmed');
    } else if (selectedPaymentFilter === 'pending_payment') {
      matchesPayment = a.paymentStatus === 'pending_payment' || a.status === 'pending_payment' || a.status === 'payment_submitted';
    } else if (selectedPaymentFilter === 'refunded') {
      matchesPayment = a.paymentStatus === 'refunded' || a.status === 'refunded';
    }

    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesQuery && matchesDoctor && matchesDate && matchesPayment && matchesStatus;
  });

  const payAtHospitalCount = appointments.filter(
    (a) => a.bookingOption === 'pay_at_hospital' || a.paymentStatus === 'pay_at_hospital'
  ).length;

  const paidOnlineCount = appointments.filter(
    (a) => a.paymentStatus === 'paid_online' || (a.bookingOption === 'pay_online' && a.status === 'confirmed')
  ).length;

  const totalOnlineRevenue = appointments
    .filter((a) => a.paymentStatus === 'paid_online' || (a.bookingOption === 'pay_online' && a.status === 'confirmed'))
    .reduce((sum, a) => sum + (a.feePKR || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Admin Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-[10px] font-bold border border-teal-500/30 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>{isUr ? 'مرکزی ایڈمن کنٹرول پینل' : 'CENTRAL DATABASE ADMIN CONSOLE'}</span>
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-emerald-400 font-normal">
              {isLiveConnected ? 'Live SSE Stream Connected' : 'Connecting...'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Gulzar Family Hospital Admin & Database Center
          </h2>
          <p className="text-xs text-slate-400 font-sans max-w-2xl">
            Single Source of Truth: Automated doctor schedules, live appointment availability, medical camp dates, expired date pruning, and AI chatbot knowledge grounding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {adminUser && (
            <div
              className={`border px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-xs ${
                isSuperAdmin
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-slate-800/90 border-slate-700 text-slate-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                  isSuperAdmin
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}
              >
                {isSuperAdmin ? <ShieldAlert className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>
              <div className="leading-tight text-left">
                <div
                  className={`text-[10px] uppercase font-bold flex items-center gap-1.5 ${
                    isSuperAdmin ? 'text-amber-400' : 'text-teal-400'
                  }`}
                >
                  <span>{isSuperAdmin ? 'Master Super Admin' : 'Hospital Staff Admin'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="font-mono text-slate-200 text-xs font-bold">{adminUser.email}</div>
                {!isSuperAdmin && (
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    {userPermissions.length} Active Permissions
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => refreshAll()}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : isUr ? 'تازہ کریں (Sync)' : 'Force Re-Sync'}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
              title="Sign out of Administrator Session"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{isUr ? 'لاگ آؤٹ' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Bookings</span>
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {appointments.length}
          </span>
          <p className="text-[11px] text-slate-500 font-medium">All OPD Patients</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">Pay at Hospital</span>
          <span className="text-2xl font-bold text-blue-700 font-mono">{payAtHospitalCount}</span>
          <p className="text-[11px] text-blue-600 font-medium">No Online Fee Required</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">Paid Online</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono">{paidOnlineCount}</span>
          <p className="text-[11px] text-emerald-600 font-medium">Verified Gateway / Trx</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider block">Online Revenue</span>
          <span className="text-2xl font-bold text-teal-800 font-mono">
            PKR {totalOnlineRevenue.toLocaleString()}
          </span>
          <p className="text-[11px] text-teal-700 font-bold">Total Gateway Inflow</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">Pending Review</span>
          <span className="text-2xl font-bold text-amber-600 font-mono">{stats.pending}</span>
          <p className="text-[11px] text-amber-700 font-medium">Awaiting Cashier Check</p>
        </div>
      </div>

      {/* TAB NAVIGATION (Role-Based Access Controlled) */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs sm:text-sm font-bold no-scrollbar">
        {can('appointments.view') && (
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'border-teal-700 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            💳 Appointments & Verification ({stats.pending})
          </button>
        )}

        {can('doctors.manage') && (
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-teal-700 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            👨‍⚕️ Doctors & Leave
          </button>
        )}

        {(can('services.manage') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'services'
                ? 'border-teal-700 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            🩺 Clinical Services
          </button>
        )}

        {(can('content.manage') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'events'
                ? 'border-teal-700 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            📅 Camps & Events ({hospitalEvents.length})
          </button>
        )}

        {can('patients.view') && (
          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'patients'
                ? 'border-teal-700 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            📋 Patient OPD Queue ({appointments.length})
          </button>
        )}

        {(can('content.manage') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'announcements'
                ? 'border-teal-700 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            📢 Emergency & Alerts
          </button>
        )}

        {/* Super Admin Exclusive Tabs */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admins'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-amber-800/80 hover:text-amber-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin Accounts & RBAC</span>
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-indigo-800/80 hover:text-indigo-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit Trail</span>
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-teal-700 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            ⚙️ Merchant APIs & Settings
          </button>
        )}
      </div>

      {/* TAB 1: PAYMENT VERIFICATION QUEUE */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, phone, TRX ID, or ID..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Multi-Filters: Doctor & Payment Option */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="all">👨‍⚕️ All Doctors</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameEn}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPaymentFilter}
                  onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="all">💳 All Payment Types</option>
                  <option value="pay_at_hospital">🏥 Pay at Hospital (No Online Fee)</option>
                  <option value="paid_online">✅ Paid Online (Gateway/Trx)</option>
                  <option value="pending_payment">⏳ Pending Payment</option>
                  <option value="refunded">↩️ Refunded</option>
                </select>
              </div>
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
              {['all', 'confirmed', 'payment_submitted', 'pending_payment', 'checked_in', 'completed', 'refunded', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'payment_submitted'
                    ? 'Pending Review'
                    : st === 'all'
                    ? 'All Statuses'
                    : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px]">
                <tr>
                  <th className="p-4">Appt ID & Date</th>
                  <th className="p-4">Patient & WhatsApp</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Booking Option & Payment</th>
                  <th className="p-4">TRX / Gateway</th>
                  <th className="p-4">Screenshot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No appointments found matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => {
                    const isPayAtHospital =
                      appt.bookingOption === 'pay_at_hospital' || appt.paymentStatus === 'pay_at_hospital';
                    const isPaidOnline =
                      appt.paymentStatus === 'paid_online' ||
                      (appt.bookingOption === 'pay_online' && appt.status === 'confirmed' && !isPayAtHospital);
                    const isRefunded = appt.paymentStatus === 'refunded' || appt.status === 'refunded';

                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <span className="font-mono font-black text-slate-900 block">{appt.id}</span>
                          <span className="text-[11px] text-slate-500">{appt.date} ({appt.time})</span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            {appt.patientType === 'followup' ? 'Follow-up' : 'New Patient'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{appt.patientName}</span>
                          <span className="text-[11px] font-mono text-teal-800">{appt.whatsAppNumber}</span>
                          {appt.visitReason && (
                            <p className="text-[10px] text-slate-500 italic truncate max-w-[140px]" title={appt.visitReason}>
                              "{appt.visitReason}"
                            </p>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-slate-800 block">{appt.doctorNameEn}</span>
                          <span className="text-[10px] text-slate-500">{appt.departmentEn}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-black text-slate-900 font-mono block">PKR {appt.feePKR}</span>
                          {isPayAtHospital ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md border border-blue-200 uppercase">
                              <Building2 className="w-2.5 h-2.5" />
                              Pay at Hospital
                            </span>
                          ) : isPaidOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200 uppercase">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Paid Online
                            </span>
                          ) : isRefunded ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md border border-rose-200 uppercase">
                              Refunded
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                              {appt.paymentMethod || 'Hospital Counter'}
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-mono text-xs">
                          {appt.transactionId || appt.paymentReference ? (
                            <div>
                              <span className="font-bold text-teal-900 block">
                                {appt.transactionId || appt.paymentReference}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {appt.paymentGateway || appt.paymentMethod || 'Gateway'}
                              </span>
                            </div>
                          ) : isPayAtHospital ? (
                            <span className="text-slate-500 text-[11px] italic">Cash at OPD</span>
                          ) : (
                            <span className="text-slate-400 font-normal">Not provided</span>
                          )}
                        </td>

                        <td className="p-4">
                          {appt.paymentScreenshotUrl ? (
                            <button
                              onClick={() => setSelectedScreenshotUrl(appt.paymentScreenshotUrl!)}
                              className="flex items-center gap-1 text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded border border-teal-200 font-bold text-[11px] cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              appt.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appt.status === 'payment_submitted'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : appt.status === 'checked_in'
                                ? 'bg-purple-100 text-purple-800'
                                : appt.status === 'completed'
                                ? 'bg-slate-200 text-slate-800'
                                : appt.status === 'refunded'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {appt.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          {appt.status === 'payment_submitted' && (
                            <>
                              <button
                                onClick={() => handleVerify(appt.id, 'approve')}
                                className="px-2.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerify(appt.id, 'reject')}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {appt.status === 'confirmed' && (
                            <button
                              onClick={() => handleVerify(appt.id, 'checkin')}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Check In
                            </button>
                          )}

                          {appt.status === 'checked_in' && (
                            <button
                              onClick={() => handleVerify(appt.id, 'complete')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Complete
                            </button>
                          )}

                          {/* REFUND BUTTON for online payments */}
                          {isPaidOnline && !isRefunded && (
                            <button
                              onClick={() => {
                                setRefundModalAppt(appt);
                                setRefundReason('Patient requested cancellation within policy window');
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer"
                              title="Process Online Payment Refund"
                            >
                              Refund
                            </button>
                          )}

                          {/* Switch to Pay at hospital if pending payment */}
                          {appt.status === 'pending_payment' && (
                            <button
                              onClick={async () => {
                                await updateAppointmentStatus(appt.id, 'confirmed', 'Switched by admin to Pay at Hospital');
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border rounded-lg text-xs font-bold cursor-pointer"
                              title="Switch to Pay at Hospital"
                            >
                              To Counter
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR AUTO-SCHEDULING & LEAVE MANAGEMENT */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Doctor Selection List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Select Doctor to Configure
            </h3>

            <div className="space-y-2">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                    selectedDoctorId === doc.id
                      ? 'border-teal-700 bg-teal-50/70 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.nameEn}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.nameEn}</h4>
                      <p className="text-xs text-teal-700">{doc.departmentEn}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      doc.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {doc.isAvailable ? 'Available' : 'On Leave'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule & Leave Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Leave & Availability Banner */}
            <div
              className={`p-6 rounded-3xl border-2 transition-all ${
                editingDoctor.isAvailable
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {editingDoctor.isAvailable ? (
                      <UserCheck className="w-6 h-6 text-emerald-700" />
                    ) : (
                      <UserX className="w-6 h-6 text-rose-700" />
                    )}
                    <h4 className="font-extrabold text-slate-900 text-lg">
                      {editingDoctor.nameEn}:{' '}
                      <span className={editingDoctor.isAvailable ? 'text-emerald-700' : 'text-rose-700'}>
                        {editingDoctor.isAvailable ? 'Currently Available' : 'On Leave / Unavailable'}
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {editingDoctor.isAvailable
                      ? 'Doctor is on duty. Slots are actively open for patient bookings.'
                      : `Slots are locked. Reason: ${editingDoctor.unavailabilityReason || 'Off-Duty'}`}
                  </p>
                </div>

                {editingDoctor.isAvailable ? (
                  <button
                    onClick={() => handleToggleLeave(editingDoctor, false)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    Mark Doctor ON LEAVE
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleLeave(editingDoctor, true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    Restore to AVAILABLE
                  </button>
                )}
              </div>

              {/* Leave Reason Input (shows if marking on leave) */}
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Leave / Unavailability Reason (Publicly displayed to patients & AI Chatbot):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leaveReasonInput}
                    onChange={(e) => setLeaveReasonInput(e.target.value)}
                    placeholder="e.g., On official leave for conference in Lahore until Tuesday"
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  />
                  <button
                    onClick={() => handleToggleLeave(editingDoctor, false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                  >
                    Update Reason
                  </button>
                </div>
              </div>
            </div>

            {/* Timings, Days & Fees Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Clinic Timings & Booking Rules: {editingDoctor.nameEn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defines OPD timings, break hours, working days, and slot intervals
                  </p>
                </div>
                <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                  {editingDoctor.departmentEn}
                </span>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Hospital Visit Fee (PKR)
                    </label>
                    <input
                      type="number"
                      value={editingDoctor.feePKR}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, feePKR: Number(e.target.value) })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Online Video Consultation Fee (PKR)
                    </label>
                    <input
                      type="number"
                      value={editingDoctor.onlineFeePKR}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, onlineFeePKR: Number(e.target.value) })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Clinic Start Time (e.g. 08:00 AM)
                    </label>
                    <input
                      type="text"
                      value={editingDoctor.startTime}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, startTime: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Clinic End Time (e.g. 08:00 PM)
                    </label>
                    <input
                      type="text"
                      value={editingDoctor.endTime}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, endTime: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Break Start Time (e.g. 02:00 PM)
                    </label>
                    <input
                      type="text"
                      value={editingDoctor.breakStartTime || ''}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, breakStartTime: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Break End Time (e.g. 04:00 PM)
                    </label>
                    <input
                      type="text"
                      value={editingDoctor.breakEndTime || ''}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, breakEndTime: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Slot Duration (Minutes)
                    </label>
                    <select
                      value={editingDoctor.slotDurationMinutes}
                      onChange={(e) =>
                        setEditingDoctor({
                          ...editingDoctor,
                          slotDurationMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    >
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={30}>30 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Max Patients Limit Per Day
                    </label>
                    <input
                      type="number"
                      value={editingDoctor.maxPatientsPerDay}
                      onChange={(e) =>
                        setEditingDoctor({
                          ...editingDoctor,
                          maxPatientsPerDay: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Working Days Checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Active Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ].map((day) => {
                      const isSelected = editingDoctor.workingDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => {
                            const newDays = isSelected
                              ? editingDoctor.workingDays.filter((d) => d !== day)
                              : [...editingDoctor.workingDays, day];
                            setEditingDoctor({ ...editingDoctor, workingDays: newDays });
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSelected
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingSchedule}
                    className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    {isSavingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save & Push Schedule to Live System</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOSPITAL DATES, MEDICAL CAMPS & EVENTS (WITH AUTO-PRUNING) */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Hospital Dates, Medical Camps & Health Programs
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Create and manage upcoming camps, specialist visiting schedules, and holiday OPD notices. Expired dates are automatically hidden from the public view and can be pruned with 1 click.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePruneExpired}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Prune Expired Dates</span>
              </button>

              <button
                onClick={() => {
                  setEditingEventId(null);
                  setEventFormData({
                    titleEn: '',
                    titleUr: '',
                    category: 'medical_camp',
                    descriptionEn: '',
                    descriptionUr: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    timeRangeEn: '10:00 AM - 02:00 PM',
                    timeRangeUr: 'صبح ۱۰ بجے تا دوپہر ۲ بجے',
                    locationEn: 'OPD Hall, Gulzar Family Hospital Chowk Azam',
                    locationUr: 'او پی ڈی ہال، گلزار فیملی ہسپتال چوک اعظم لیہ',
                    doctorInChargeEn: 'Dr. Nadir Hussain Dullu',
                    doctorInChargeUr: 'ڈاکٹر نادر حسین ڈلو',
                    isFree: true,
                    registrationOpen: true,
                    notesEn: '',
                    notesUr: '',
                  });
                  setShowEventModal(true);
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hospital Event / Camp</span>
              </button>
            </div>
          </div>

          {/* Events Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitalEvents.map((ev) => {
              const isPast = (ev.endDate || ev.startDate) < new Date().toISOString().split('T')[0];
              return (
                <div
                  key={ev.id}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm ${
                    isPast ? 'opacity-60 border-slate-300 bg-slate-50' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        {ev.category.replace('_', ' ')}
                      </span>
                      {isPast ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          EXPIRED / CONCLUDED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">{ev.titleEn}</h4>
                    <p className="text-xs font-medium text-slate-500 font-urdu">{ev.titleUr}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{ev.descriptionEn}</p>

                    <div className="text-xs text-slate-700 space-y-1 pt-2 border-t border-slate-100">
                      <div>
                        <strong>Dates:</strong> {ev.startDate} to {ev.endDate}
                      </div>
                      <div>
                        <strong>Hours:</strong> {ev.timeRangeEn}
                      </div>
                      <div>
                        <strong>Supervising Doctor:</strong> {ev.doctorInChargeEn}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openEditEvent(ev)}
                      className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete event "${ev.titleEn}"?`)) {
                          await deleteHospitalEvent(ev.id);
                        }
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PATIENT OPD QUEUE */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Hospital OPD Queue & Patient Check-in
              </h3>
              <p className="text-xs text-slate-500">
                Live appointments queue for token callings, consultations, and medical records
              </p>
            </div>
            <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
              {appointments.length} Total Registered
            </span>
          </div>

          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{appt.id}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appt.status === 'checked_in'
                          ? 'bg-purple-100 text-purple-800'
                          : appt.status === 'completed'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {appt.status.replace('_', ' ')}
                    </span>
                    {appt.bookingOption === 'pay_at_hospital' || appt.paymentStatus === 'pay_at_hospital' ? (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold uppercase border border-blue-200">
                        Pay at Hospital (Collect PKR {appt.feePKR})
                      </span>
                    ) : appt.paymentStatus === 'paid_online' ? (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold uppercase border border-emerald-200">
                        Paid Online (PKR {appt.feePKR})
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold uppercase">
                        Pending Payment
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">
                      {appt.patientType === 'followup' ? 'Follow-up' : 'New Patient'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">
                    {appt.patientName} {appt.age ? `(${appt.age} Yrs, ${appt.gender})` : ''}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Dr. {appt.doctorNameEn} • Slot: {appt.time} ({appt.date}) • {appt.whatsAppNumber}
                  </p>
                  {appt.visitReason && (
                    <p className="text-xs text-slate-500 italic mt-0.5">
                      Reason: "{appt.visitReason}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {appt.status !== 'checked_in' && appt.status !== 'completed' && (
                    <button
                      onClick={() => handleVerify(appt.id, 'checkin')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Mark Checked-in
                    </button>
                  )}
                  {appt.status !== 'completed' && (
                    <button
                      onClick={() => handleVerify(appt.id, 'complete')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EMERGENCY & LIVE ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-500" />
              <span>Live Emergency Notices & Hospital Announcements</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Broadcasts urgent emergency notices or holiday announcements to the header banner and grounds the AI chatbot in real-time.
            </p>
          </div>

          <form onSubmit={handleSaveNotices} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Emergency Notice (English)
                </label>
                <input
                  type="text"
                  value={noticesForm.emergencyNoticeEn}
                  onChange={(e) =>
                    setNoticesForm({ ...noticesForm, emergencyNoticeEn: e.target.value })
                  }
                  placeholder="e.g. 24/7 Emergency & Nursery Baby Incubator Active"
                  className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                  ایمرجنسی نوٹس (اردو)
                </label>
                <input
                  type="text"
                  value={noticesForm.emergencyNoticeUr}
                  onChange={(e) =>
                    setNoticesForm({ ...noticesForm, emergencyNoticeUr: e.target.value })
                  }
                  placeholder="مثلاً ۲۴ گھنٹے ایمرجنسی اور نوزائیدہ بچوں کے انکیوبیٹرز کھلے ہیں"
                  className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-semibold font-urdu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active General Announcement (English)
                </label>
                <input
                  type="text"
                  value={noticesForm.activeAnnouncementEn}
                  onChange={(e) =>
                    setNoticesForm({ ...noticesForm, activeAnnouncementEn: e.target.value })
                  }
                  placeholder="e.g. Free Pediatric Diabetes Screening Camp on Sunday"
                  className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                  ہسپتال عمومی اعلان (اردو)
                </label>
                <input
                  type="text"
                  value={noticesForm.activeAnnouncementUr}
                  onChange={(e) =>
                    setNoticesForm({ ...noticesForm, activeAnnouncementUr: e.target.value })
                  }
                  placeholder="مثلاً اتوار کو شوگر کا مفت معائنہ کیمپ او پی ڈی ہال میں ہوگا"
                  className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-semibold font-urdu"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Google Maps Share Link (گوگل میپ لنک)
                </label>
                <input
                  type="url"
                  value={noticesForm.googleMapsUrl}
                  onChange={(e) =>
                    setNoticesForm({ ...noticesForm, googleMapsUrl: e.target.value })
                  }
                  placeholder="https://share.google/nClgUpNiP0qDg6Dpe"
                  className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-semibold font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Updates Google Maps navigation link across the website, Header, Footer, and AI Medical Chatbot.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Save & Broadcast Alert
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: SYSTEM & MERCHANT GATEWAY SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* System-wide Booking & Payment Controls */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                <span>Dual Appointment & Payment System Controls</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure patient booking options, hospital-wide payment toggles, and mobile number OTP verification rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Option 1: Pay at Hospital</h4>
                    <p className="text-slate-500 text-[11px]">Allow patients to book without paying online (settle fee at hospital counter)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.payAtHospitalEnabled}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, payAtHospitalEnabled: e.target.checked })
                    }
                    className="w-5 h-5 rounded text-teal-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Option 2: Pay Online Gateway</h4>
                    <p className="text-slate-500 text-[11px]">Allow online payment via JazzCash, Easypaisa, or Debit/Credit Card</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.onlinePaymentEnabled}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, onlinePaymentEnabled: e.target.checked })
                    }
                    className="w-5 h-5 rounded text-teal-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Mobile OTP Verification</h4>
                    <p className="text-slate-500 text-[11px]">Require SMS/WhatsApp OTP code before confirming booking</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.requireOtpVerification}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, requireOtpVerification: e.target.checked })
                    }
                    className="w-5 h-5 rounded text-teal-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">OTP Simulation / Test Mode</h4>
                    <p className="text-slate-500 text-[11px]">Allows instant testing with default OTP code: <code className="font-bold text-teal-700">1234</code></p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.otpTestMode}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, otpTestMode: e.target.checked })
                    }
                    className="w-5 h-5 rounded text-teal-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">Default Consultation Fee (PKR)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={systemSettings.defaultConsultationFee}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, defaultConsultationFee: Number(e.target.value) })
                    }
                    className="w-48 p-2.5 bg-white border rounded-xl font-mono text-sm font-bold"
                  />
                  <span className="text-slate-500 text-xs">Used as fallback fee if doctor specific fee is not defined</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                disabled={isSavingSettings}
                onClick={async () => {
                  setIsSavingSettings(true);
                  const res = await updateHospitalInfo(systemSettings);
                  setIsSavingSettings(false);
                  if (res.success) {
                    alert('Hospital booking and payment settings updated successfully!');
                  } else {
                    alert(res.error || 'Failed to update settings.');
                  }
                }}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                {isSavingSettings ? 'Saving Settings...' : 'Save Booking Settings'}
              </button>
            </div>
          </div>

          {/* Merchant Payment Gateway Configuration */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-teal-400">
                Official Merchant Payment Gateway & WhatsApp API Architecture
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure production merchant credentials for automated JazzCash, Easypaisa, and WhatsApp Business API.
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
              <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>JazzCash Merchant API</span>
              </h4>
              <p className="text-slate-400 text-[11px]">
                Connects directly to JazzCash Merchant Portal for real-time payment IPN webhooks.
              </p>

              <div className="space-y-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">JazzCash Merchant ID</label>
                  <input
                    type="text"
                    defaultValue="03404777745_MERCHANT"
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Integrity Password / Key</label>
                  <input
                    type="password"
                    defaultValue="secret_integrity_key_8842"
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
              <h4 className="font-bold text-teal-400 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Easypaisa Merchant API</span>
              </h4>
              <p className="text-slate-400 text-[11px]">
                Connects to Telenor Easypaisa Merchant Online Payment Gateway API.
              </p>

              <div className="space-y-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Store ID / Merchant Key</label>
                  <input
                    type="text"
                    defaultValue="EP_STORE_03404777745"
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Hash Key Token</label>
                  <input
                    type="password"
                    defaultValue="easypaisa_hash_token_4777"
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB: CLINICAL SERVICES & SPECIALITIES */}
      {activeTab === 'services' && (
        <ClinicalServicesTab lang={lang} token={token} hasPermission={can('services.manage')} />
      )}

      {/* TAB: ADMIN ACCOUNTS & RBAC MANAGEMENT (Super Admin Only) */}
      {activeTab === 'admins' && isSuperAdmin && (
        <AdminManagementTab lang={lang} token={token} />
      )}

      {/* TAB: AUDIT TRAIL LOGS (Super Admin Only) */}
      {activeTab === 'audit' && isSuperAdmin && (
        <AuditLogsTab lang={lang} token={token} />
      )}

      {/* EVENT CREATE/EDIT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold text-lg"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg">
              {editingEventId ? 'Edit Hospital Event / Camp' : 'Add New Hospital Event / Camp'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.titleEn}
                    onChange={(e) => setEventFormData({ ...eventFormData, titleEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 font-urdu">عنوان (اردو)</label>
                  <input
                    type="text"
                    value={eventFormData.titleUr}
                    onChange={(e) => setEventFormData({ ...eventFormData, titleUr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-urdu"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        category: e.target.value as HospitalEvent['category'],
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="medical_camp">Free / Subsidized Medical Camp</option>
                    <option value="specialist_visit">Visiting Specialist OPD</option>
                    <option value="holiday">Public Holiday OPD Schedule</option>
                    <option value="vaccination_drive">Vaccination Drive</option>
                    <option value="health_program">General Health Program</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supervising Doctor</label>
                  <input
                    type="text"
                    value={eventFormData.doctorInChargeEn}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, doctorInChargeEn: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.startDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.endDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Range (e.g. 10 AM - 2 PM)</label>
                  <input
                    type="text"
                    value={eventFormData.timeRangeEn}
                    onChange={(e) => setEventFormData({ ...eventFormData, timeRangeEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={eventFormData.locationEn}
                    onChange={(e) => setEventFormData({ ...eventFormData, locationEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={eventFormData.descriptionEn}
                  onChange={(e) => setEventFormData({ ...eventFormData, descriptionEn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={eventFormData.isFree}
                    onChange={(e) => setEventFormData({ ...eventFormData, isFree: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>100% Free Checkup / Consultation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={eventFormData.registrationOpen}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, registrationOpen: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>Registration Open for Patients</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT INSPECTION MODAL */}
      {selectedScreenshotUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedScreenshotUrl(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 font-bold text-lg"
            >
              ✕
            </button>

            <h3 className="font-bold text-slate-900 text-base">Payment Screenshot Verification</h3>
            <div className="bg-slate-100 rounded-2xl p-2 border overflow-hidden">
              <img
                src={selectedScreenshotUrl}
                alt="Payment Receipt"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedScreenshotUrl(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundModalAppt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRefundModalAppt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Online Payment Refund
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Process Appointment Refund
              </h3>
              <p className="text-xs text-slate-500">
                Appt: <strong className="font-mono text-slate-800">{refundModalAppt.id}</strong> • Patient: <strong>{refundModalAppt.patientName}</strong>
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount to Refund:</span>
                <span className="font-mono font-bold text-rose-900">PKR {refundModalAppt.feePKR}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-bold text-slate-800">{refundModalAppt.paymentGateway || refundModalAppt.paymentMethod || 'Online'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{refundModalAppt.paymentReference || refundModalAppt.transactionId || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Refund & Cancellation Reason *
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund (e.g., patient cancelled, doctor unavailable)..."
                className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalAppt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                disabled={isRefunding}
                onClick={async () => {
                  if (!refundModalAppt) return;
                  setIsRefunding(true);
                  const res = await refundAppointment(refundModalAppt.id, refundReason);
                  setIsRefunding(false);
                  if (res.success) {
                    alert(`Refund successfully registered and processed for appointment ${refundModalAppt.id}.`);
                    setRefundModalAppt(null);
                  } else {
                    alert(`Refund failed: ${res.error}`);
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isRefunding ? 'Processing Refund...' : 'Confirm & Issue Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
