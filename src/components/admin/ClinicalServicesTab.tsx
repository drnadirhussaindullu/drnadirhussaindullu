import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Baby,
  Stethoscope,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { HospitalClinicalService, Language } from '../../types';

interface ClinicalServicesTabProps {
  lang: Language;
  token: string;
  hasPermission: boolean;
}

export const ClinicalServicesTab: React.FC<ClinicalServicesTabProps> = ({
  lang,
  token,
  hasPermission,
}) => {
  const isUr = lang === 'ur';

  const [services, setServices] = useState<HospitalClinicalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameUr: '',
    department: 'Pediatrics & Neonatology',
    descriptionEn: '',
    descriptionUr: '',
    isEmergencyAvailable: false,
    startingFeePKR: 1500,
    isActive: true,
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nameEn: '',
      nameUr: '',
      department: 'Pediatrics & Neonatology',
      descriptionEn: '',
      descriptionUr: '',
      isEmergencyAvailable: false,
      startingFeePKR: 1500,
      isActive: true,
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: HospitalClinicalService) => {
    setEditingId(srv.id);
    setFormData({
      nameEn: srv.nameEn,
      nameUr: srv.nameUr,
      department: srv.department,
      descriptionEn: srv.descriptionEn,
      descriptionUr: srv.descriptionUr,
      isEmergencyAvailable: srv.isEmergencyAvailable,
      startingFeePKR: srv.startingFeePKR,
      isActive: srv.isActive,
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const url = editingId ? `/api/services/${editingId}` : '/api/services';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
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
            ? 'طبی سروس کامیابی سے محفوظ ہو گئی!'
            : 'Clinical service saved successfully.'
        );
        setIsModalOpen(false);
        fetchServices();
      } else {
        setErrorMessage(data.error || 'Failed to save clinical service.');
      }
    } catch (err) {
      setErrorMessage('Network connection error.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(isUr ? `کیا آپ واقعی "${name}" کو حذف کرنا چاہتے ہیں؟` : `Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(isUr ? 'سروس کامیابی سے حذف کر دی گئی' : 'Service deleted successfully.');
        fetchServices();
      } else {
        setErrorMessage(data.error || 'Failed to delete service.');
      }
    } catch (err) {
      setErrorMessage('Network error.');
    }
  };

  const filtered = services.filter(
    (s) =>
      s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      s.nameUr.includes(search) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 border border-teal-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-400/10 border border-teal-400/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{isUr ? 'طبی شعبہ جات اور خدمات' : 'Hospital Clinical Care & Services'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {isUr ? 'گلزار فیملی ہسپتال کی کلینیکل سروسز کیٹلاگ' : 'Clinical Specialities & Services Directory'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {isUr
              ? 'زچگی، بچوں کا وارڈ، نرسری این آئی سی یو، فیملی میڈیسن، دمہ اور الرجی کلینک کی تفصیلات منظم کریں۔'
              : 'Configure official clinical departments, emergency 24/7 availability, and consultation starting fees.'}
          </p>
        </div>

        {hasPermission && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950/50 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUr ? 'نئی سروس شامل کریں' : 'Add Clinical Service'}</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isUr ? 'سروس کا نام یا شعبہ تلاش کریں...' : 'Search services or department...'}
            className="w-full ps-9 pe-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-hidden"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          {isUr ? `کل سروسز: ${services.length}` : `Total Services: ${services.length}`}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                  {srv.department}
                </span>

                {srv.isEmergencyAvailable && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-black uppercase">
                    24/7 Emergency
                  </span>
                )}
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{isUr ? srv.nameUr : srv.nameEn}</h4>
              <div className="text-xs text-slate-500 font-medium mb-3">
                {isUr ? srv.nameEn : srv.nameUr}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {isUr ? srv.descriptionUr : srv.descriptionEn}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{isUr ? 'مشاورت فیس' : 'Starting From'}</span>
                <span className="text-xs font-black text-teal-700 font-mono">
                  PKR {srv.startingFeePKR.toLocaleString()}
                </span>
              </div>

              {hasPermission && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(srv)}
                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(srv.id, srv.nameEn)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-slate-900 text-sm">
                {editingId
                  ? (isUr ? 'سروس میں ترمیم کریں' : 'Edit Clinical Service')
                  : (isUr ? 'نئی کلینیکل سروس شامل کریں' : 'Add New Clinical Service')}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Neonatal Intensive Care"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام (اردو)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameUr}
                    onChange={(e) => setFormData({ ...formData, nameUr: e.target.value })}
                    placeholder="مثلاً: نوزائیدہ بچوں کا این آئی سی یو"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden bg-white"
                >
                  <option value="Pediatrics & Neonatology">Pediatrics & Neonatology (بچوں اور نومولود کا وارڈ)</option>
                  <option value="Maternity & Gynecology">Maternity & Gynecology (زچگی اور زنانہ امراض)</option>
                  <option value="General & Family Medicine">General & Family Medicine (فیملی میڈیسن)</option>
                  <option value="Respiratory & Allergy Clinic">Respiratory & Allergy Clinic (دمہ اور الرجی)</option>
                  <option value="Emergency & Trauma 24/7">Emergency & Trauma 24/7 (ایمرجنسی وارڈ)</option>
                  <option value="Diagnostic Laboratory">Diagnostic Laboratory (لیبارٹری ٹیسٹ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Clinical scope, specialist coverage..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تفصیل (اردو)
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.descriptionUr}
                  onChange={(e) => setFormData({ ...formData, descriptionUr: e.target.value })}
                  placeholder="کلینیکل سہولیات اور ماہرین کی دستیابی..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Starting Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    required
                    value={formData.startingFeePKR}
                    onChange={(e) => setFormData({ ...formData, startingFeePKR: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-hidden font-mono"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mb-2.5">
                    <input
                      type="checkbox"
                      checked={formData.isEmergencyAvailable}
                      onChange={(e) => setFormData({ ...formData, isEmergencyAvailable: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>24/7 Emergency Available</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
