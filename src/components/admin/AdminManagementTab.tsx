import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserPlus,
  KeyRound,
  Trash2,
  Lock,
  Mail,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';
import { AdminAccount, AdminPermission, AdminRole, Language } from '../../types';

interface AdminManagementTabProps {
  lang: Language;
  token: string;
}

const AVAILABLE_PERMISSIONS: { id: AdminPermission; labelEn: string; labelUr: string; descEn: string }[] = [
  {
    id: 'appointments.view',
    labelEn: 'View Appointments',
    labelUr: 'اپائنٹمنٹس دیکھیں',
    descEn: 'Access live appointments queue and search records',
  },
  {
    id: 'appointments.create',
    labelEn: 'Create Appointments',
    labelUr: 'نئی اپائنٹمنٹ بنائیں',
    descEn: 'Book walk-in or manual patient consultations',
  },
  {
    id: 'appointments.edit',
    labelEn: 'Edit / Confirm Status',
    labelUr: 'اسٹیٹس اپ ڈیٹ کریں',
    descEn: 'Approve payments, check-in patients, mark completed',
  },
  {
    id: 'appointments.cancel',
    labelEn: 'Cancel & Refund',
    labelUr: 'منسوخی اور ری فنڈ',
    descEn: 'Process cancellation and refund patient fees',
  },
  {
    id: 'patients.view',
    labelEn: 'View Patient History',
    labelUr: 'مریض کی تفصیلات',
    descEn: 'Access patient previous visits and demographic logs',
  },
  {
    id: 'doctors.manage',
    labelEn: 'Manage Doctors Schedule',
    labelUr: 'ڈاکٹرز کا شیڈول',
    descEn: 'Edit OPD timings, toggle on-leave status',
  },
  {
    id: 'content.manage',
    labelEn: 'Manage Camps & News',
    labelUr: 'طبی کیمپس اور اعلانات',
    descEn: 'Publish upcoming free medical camps and announcements',
  },
  {
    id: 'services.manage',
    labelEn: 'Manage Clinical Services',
    labelUr: 'طبی خدمات کی دیکھ بھال',
    descEn: 'Add and update maternity, pediatric and diagnostic services',
  },
  {
    id: 'reports.view',
    labelEn: 'Financial Reports',
    labelUr: 'مالیاتی رپورٹس',
    descEn: 'Inspect daily revenue, JazzCash and Easypaisa collections',
  },
];

export const AdminManagementTab: React.FC<AdminManagementTabProps> = ({ lang, token }) => {
  const isUr = lang === 'ur';

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'admin' as AdminRole,
    permissions: [
      'appointments.view',
      'appointments.create',
      'appointments.edit',
      'appointments.cancel',
      'patients.view',
      'reports.view',
    ] as AdminPermission[],
  });

  const [newPassword, setNewPassword] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/accounts', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmins(data.admins || []);
      } else {
        setErrorMessage(data.error || 'Failed to fetch administrator accounts.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while connecting to administrative backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'admin',
      permissions: [
        'appointments.view',
        'appointments.create',
        'appointments.edit',
        'appointments.cancel',
        'patients.view',
        'reports.view',
      ],
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      password: '',
      role: admin.role,
      permissions: admin.permissions || [],
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditModalOpen(true);
  };

  const handleOpenResetPassword = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResetPassModalOpen(true);
  };

  const togglePermissionInForm = (permId: AdminPermission) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      const updated = exists
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: updated };
    });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setErrorMessage(isUr ? 'براہ کرم تمام خانے پر کریں۔' : 'All fields are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isUr
            ? `ایڈمن ${formData.name} کامیابی سے رجسٹر ہو گیا!`
            : `Administrator ${formData.name} created successfully.`
        );
        setIsAddModalOpen(false);
        fetchAdmins();
      } else {
        setErrorMessage(data.error || 'Failed to create administrator account.');
      }
    } catch (err) {
      setErrorMessage('Network connection error.');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/accounts/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          role: formData.role,
          permissions: formData.permissions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isUr
            ? `ایڈمن ${formData.name} کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں!`
            : `Administrator ${formData.name} updated successfully.`
        );
        setIsEditModalOpen(false);
        fetchAdmins();
      } else {
        setErrorMessage(data.error || 'Failed to update administrator account.');
      }
    } catch (err) {
      setErrorMessage('Network connection error.');
    }
  };

  const handleToggleStatus = async (admin: AdminAccount) => {
    const nextStatus = admin.status === 'active' ? 'disabled' : 'active';
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/accounts/${admin.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isUr
            ? `ایڈمن کا اسٹیٹس اب ${nextStatus === 'active' ? 'ایکٹو' : 'معطل'} ہے۔`
            : `Administrator account is now ${nextStatus}.`
        );
        fetchAdmins();
      } else {
        setErrorMessage(data.error || 'Failed to change account status.');
      }
    } catch (err) {
      setErrorMessage('Network connection error.');
    }
  };

  const handleDeleteAdmin = async (admin: AdminAccount) => {
    if (admin.id === 'sa-master' || admin.email.toLowerCase() === 'nh979681@gmail.com') {
      alert(isUr ? 'ماسٹر سپر ایڈمن اکاؤنٹ کو ختم نہیں کیا جا سکتا!' : 'Master Super Admin cannot be deleted.');
      return;
    }

    const confirmMsg = isUr
      ? `کیا آپ واقعی ${admin.name} کا اکاؤنٹ مستقل طور پر ختم کرنا چاہتے ہیں؟`
      : `Are you sure you want to permanently remove ${admin.name}? This action cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/accounts/${admin.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isUr
            ? 'ایڈمنسٹریٹر اکاؤنٹ کامیابی سے ختم کر دیا گیا۔'
            : 'Administrator account permanently removed.'
        );
        fetchAdmins();
      } else {
        setErrorMessage(data.error || 'Failed to remove administrator account.');
      }
    } catch (err) {
      setErrorMessage('Network connection error.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage(isUr ? 'پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے۔' : 'Password must be at least 6 characters long.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/accounts/${selectedAdmin.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isUr
            ? `ایڈمن ${selectedAdmin.name} کا پاس ورڈ کامیابی سے تبدیل ہو گیا!`
            : `Password reset successfully for ${selectedAdmin.name}. All existing sessions revoked.`
        );
        setIsResetPassModalOpen(false);
      } else {
        setErrorMessage(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setErrorMessage('Network connection error.');
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.mobile.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Super Admin Exclusivity */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/70 border border-teal-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isUr ? 'سپر ایڈمن کنٹرول' : 'Super Admin Authority Only'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {isUr ? 'ہسپتال ایڈمنسٹریٹر اکاؤنٹس اور اختیارات کی تقسیم' : 'Hospital Administrator Accounts & Granular RBAC'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {isUr
              ? 'صرف سپر ایڈمن نئے ایڈمنز بنا سکتے ہیں، ان کے اختیارات مقرر کر سکتے ہیں اور کسی بھی مشکوک صورت میں اکاؤنٹ معطل کر سکتے ہیں۔'
              : 'Create staff administrators with tailored granular permissions. Master Super Admin is permanently protected.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950/50 transition shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isUr ? 'نیا ایڈمن اکاؤنٹ بنائیں' : 'Create Administrator'}</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Refresh Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isUr ? 'نام، ای میل یا موبائل نمبر سے تلاش کریں...' : 'Search by name, email or mobile...'}
            className="w-full ps-9 pe-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-end">
          <span>
            {isUr ? `کل اکاؤنٹس: ${admins.length}` : `Total Registered Accounts: ${admins.length}`}
          </span>
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admins Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 text-start">{isUr ? 'ایڈمن تفصیلات' : 'Administrator'}</th>
                <th className="py-3.5 px-4 text-start">{isUr ? 'عہدہ اور رول' : 'Role'}</th>
                <th className="py-3.5 px-4 text-start">{isUr ? 'اسٹیٹس' : 'Status'}</th>
                <th className="py-3.5 px-4 text-start">{isUr ? 'اختیارات (Permissions)' : 'Permissions'}</th>
                <th className="py-3.5 px-4 text-start">{isUr ? 'آخری لاگ ان' : 'Last Login'}</th>
                <th className="py-3.5 px-4 text-end">{isUr ? 'ایکشنز' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    {loading ? (isUr ? 'لوڈ ہو رہا ہے...' : 'Loading administrator accounts...') : (isUr ? 'کوئی اکاؤنٹ نہیں ملا' : 'No administrator accounts match the query.')}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isMaster = admin.id === 'sa-master' || admin.email.toLowerCase() === 'nh979681@gmail.com';
                  const isSuper = admin.role === 'super_admin';

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                              isSuper
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                          >
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{admin.name}</span>
                              {isMaster && (
                                <span className="px-1.5 py-0.5 rounded-sm bg-amber-500 text-slate-950 font-black text-[9px] uppercase">
                                  Master Root
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                              <span>{admin.email}</span>
                              <span>•</span>
                              <span>{admin.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px]">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Super Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]">
                            <User className="w-3 h-3 text-teal-600" />
                            <span>Staff Admin</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {admin.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Permissions Chips */}
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-200">
                            ★ Full Hospital System Authority ({AVAILABLE_PERMISSIONS.length + 5} Permissions)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(admin.permissions || []).slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-mono"
                              >
                                {p.replace('.', ' ')}
                              </span>
                            ))}
                            {(admin.permissions || []).length > 3 && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-[10px] text-teal-700 font-bold">
                                +{(admin.permissions || []).length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never logged in'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="inline-flex items-center gap-1">
                          {/* Edit permissions */}
                          <button
                            onClick={() => handleOpenEdit(admin)}
                            disabled={isMaster}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Edit Permissions"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>

                          {/* Reset password */}
                          <button
                            onClick={() => handleOpenResetPassword(admin)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Disabled */}
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            disabled={isMaster}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={admin.status === 'active' ? 'Disable Account' : 'Activate Account'}
                          >
                            {admin.status === 'active' ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            disabled={isMaster}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isUr ? 'نیا ایڈمنسٹریٹر رجسٹر کریں' : 'Register New Hospital Administrator'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isUr ? 'اسٹاف ممبر کے لیے اختیارات مقرر کریں' : 'Assign role, login credentials & specific permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUr ? 'پورا نام' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sara Ahmed"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUr ? 'ای میل ایڈریس' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sara@gulzarhospital.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUr ? 'موبائل نمبر (WhatsApp)' : 'Mobile Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUr ? 'سیکیور پاس ورڈ' : 'Initial Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isUr ? 'ایڈمن کی قسم (Role)' : 'Role Tier'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2.5 ${
                      formData.role === 'admin'
                        ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={() => setFormData({ ...formData, role: 'admin' })}
                      className="text-teal-600"
                    />
                    <div>
                      <div>Hospital Admin</div>
                      <div className="text-[10px] text-slate-400 font-normal">Standard Staff Operations</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2.5 ${
                      formData.role === 'super_admin'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="super_admin"
                      checked={formData.role === 'super_admin'}
                      onChange={() => setFormData({ ...formData, role: 'super_admin' })}
                      className="text-amber-600"
                    />
                    <div>
                      <div>Super Admin</div>
                      <div className="text-[10px] text-slate-400 font-normal">Full System Authority</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              {formData.role === 'admin' && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">
                      {isUr ? 'تفصیلی اختیارات (Granular Permissions)' : 'Granular Permissions Authorization'}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
                        })
                      }
                      className="text-[11px] text-teal-600 hover:underline cursor-pointer"
                    >
                      {isUr ? 'سب منتخب کریں' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const checked = formData.permissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer text-xs hover:border-teal-300"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermissionInForm(perm.id)}
                            className="mt-0.5 rounded text-teal-600"
                          />
                          <div>
                            <div className="font-semibold text-slate-800 text-[11px]">
                              {isUr ? perm.labelUr : perm.labelEn}
                            </div>
                            <div className="text-[9px] text-slate-500 leading-tight">
                              {perm.descEn}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isUr ? 'اکاؤنٹ بنائیں' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {isEditModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {isUr ? `اختیارات میں ترمیم: ${selectedAdmin.name}` : `Edit Permissions: ${selectedAdmin.name}`}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">{selectedAdmin.email}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUr ? 'نام' : 'Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUr ? 'موبائل نمبر' : 'Mobile'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isUr ? 'تفصیلی اختیارات (Granular Permissions)' : 'Assigned Permissions'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-56 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const checked = formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer text-xs hover:border-teal-300"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermissionInForm(perm.id)}
                          className="mt-0.5 rounded text-teal-600"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">
                            {isUr ? perm.labelUr : perm.labelEn}
                          </div>
                          <div className="text-[9px] text-slate-500 leading-tight">
                            {perm.descEn}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isUr ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPassModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {isUr ? 'پاس ورڈ ری سیٹ کریں' : 'Reset Administrator Password'}
                </h4>
              </div>
              <button
                onClick={() => setIsResetPassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {isUr
                ? `آپ ${selectedAdmin.name} کے لیے نیا پاس ورڈ مقرر کر رہے ہیں۔ اس ایڈمنسٹریٹر کے تمام پرانے سیشنز ختم ہو جائیں گے۔`
                : `Setting a new password for ${selectedAdmin.name} (${selectedAdmin.email}). Any existing login sessions will be immediately invalidated.`}
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUr ? 'نیا پاس ورڈ' : 'New Secure Password'}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isUr ? 'پاس ورڈ تبدیل کریں' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
