import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import { sessionApi } from '../../api/sessionApi';
import { CustomerModal } from './CustomerModal';
import { FootPressureHeatmap } from '../../components/Biomechanical/FootPressureHeatmap';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Footprints,
  PlayCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  Radio,
  FileText
} from 'lucide-react';

const SAMPLE_SESSIONS = [
  {
    id: 'SESS-2026-001',
    customerId: 'CUST-8801',
    deviceMac: 'E4:65:B8:1A:2B:3C',
    activityType: 'walking',
    stepCount: 42,
    status: 'COMPLETED',
    notes: 'Đi bộ tự do 50m trên hành lang lâm sàng; áp lực FSR dồn nhiều về mép trong bàn chân.',
    startTime: '2026-10-26T09:15:00',
    endTime: '2026-10-26T09:22:00',
  },
  {
    id: 'SESS-2026-002',
    customerId: 'CUST-8801',
    deviceMac: 'E4:65:B8:1A:2B:3C',
    activityType: 'walking',
    stepCount: 65,
    status: 'COMPLETED',
    notes: 'Đo sau khi lắp đệm hỗ trợ vòm bàn chân độ 1 (Arch support wedge).',
    startTime: '2026-10-28T14:30:00',
    endTime: '2026-10-28T14:40:00',
  },
];

export const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isClinician } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Heatmap State
  const [activeHeatmapSession, setActiveHeatmapSession] = useState(null);
  const [activeFootsteps, setActiveFootsteps] = useState([]);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);

  // New Session Modal State
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    deviceMac: 'E4:65:B8:1A:2B:3C',
    activityType: 'walking',
    notes: 'Đo dáng đi lâm sàng định kỳ với lót giày FSR 6 cảm biến',
  });
  const [sessionCreating, setSessionCreating] = useState(false);

  // Fetch patient info and past sessions
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Customer
      let custData;
      try {
        custData = await customerApi.getCustomerById(id);
      } catch {
        // Fallback demo data
        custData = {
          id,
          fullName: 'Lê Hoàng Nam',
          phoneNumber: '0903 124 567',
          email: 'nam.le@example.com',
          age: 28,
          gender: 'male',
          shoeSizeEu: 42.0,
          weightKg: 74.0,
          heightCm: 175.0,
          address: 'Q. Cầu Giấy, Hà Nội',
          medicalNotes: 'Bàn chân bẹt độ II (Flexible Flatfoot); Đau vòm gan chân sau khi chạy bộ.',
          createdAt: '2026-10-24T08:30:00',
        };
      }
      setCustomer(custData);

      // 2. Fetch Sessions
      try {
        const sessData = await sessionApi.getCustomerSessions(id);
        if (Array.isArray(sessData) && sessData.length > 0) {
          setSessions(sessData);
        } else {
          setSessions(SAMPLE_SESSIONS);
        }
      } catch {
        setSessions(SAMPLE_SESSIONS);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenHeatmap = async (sess) => {
    setActiveHeatmapSession(sess);
    try {
      const steps = await sessionApi.getFootsteps(sess.id);
      setActiveFootsteps(Array.isArray(steps) && steps.length > 0 ? steps : []);
    } catch (err) {
      console.warn('Could not fetch footsteps from backend, using snapshot:', err);
      setActiveFootsteps([]);
    }
    setIsHeatmapOpen(true);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSessionCreating(true);
    try {
      const payload = {
        customerId: id,
        deviceMac: newSessionForm.deviceMac,
        activityType: newSessionForm.activityType,
        notes: newSessionForm.notes,
        status: 'RECORDING',
        startTime: new Date().toISOString(),
      };
      let created;
      try {
        created = await sessionApi.createSession(payload);
      } catch {
        created = {
          ...payload,
          id: `SESS-${Date.now().toString().slice(-6)}`,
          stepCount: 0,
        };
      }
      setSessions((prev) => [created, ...prev]);
      setIsNewSessionModalOpen(false);
    } finally {
      setSessionCreating(false);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await sessionApi.completeSession(sessionId);
    } catch {
      // Mock update
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'COMPLETED', endTime: new Date().toISOString() } : s))
    );
  };

  const handleDeleteCustomer = async () => {
    if (!isClinician) return;
    if (window.confirm(`Xác nhận xóa hồ sơ bệnh nhân "${customer?.fullName}"? Thao tác này không thể hoàn tác.`)) {
      try {
        await customerApi.deleteCustomer(id);
      } catch (err) {
        console.warn('Backend delete fallback:', err);
      }
      navigate('/patients');
    }
  };

  const calculateBmi = (weight, height) => {
    if (!weight || !height) return { bmi: '--', label: '' };
    const h = height / 100;
    const val = (weight / (h * h)).toFixed(1);
    const num = parseFloat(val);
    if (num < 18.5) return { bmi: val, label: 'Thiếu cân', color: 'text-sky-700 bg-sky-50' };
    if (num <= 24.9) return { bmi: val, label: 'Chuẩn', color: 'text-emerald-700 bg-emerald-50' };
    if (num <= 29.9) return { bmi: val, label: 'Thừa cân', color: 'text-amber-700 bg-amber-50' };
    return { bmi: val, label: 'Béo phì', color: 'text-rose-700 bg-rose-50' };
  };

  if (loading && !customer) {
    return <div className="p-8 text-center text-slate-500">Đang tải hồ sơ bệnh nhân...</div>;
  }

  const bmiInfo = calculateBmi(customer?.weightKg, customer?.heightCm);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Link
            to="/patients"
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-500 font-semibold uppercase">
                Mã BN: {customer?.id}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Hồ Sơ Y Tế Bàn Chân</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {customer?.fullName}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Delete Patient (Clinician only - completely hidden for Technician) */}
          {isClinician && (
            <button
              onClick={handleDeleteCustomer}
              className="inline-flex items-center px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-md hover:bg-rose-100 transition shadow-xs"
              title="Xóa hồ sơ bệnh nhân (Bác sĩ)"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              Xóa Bệnh Nhân
            </button>
          )}

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 transition shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            Sửa Hồ Sơ
          </button>

          <button
            onClick={() => setIsNewSessionModalOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition shadow-xs"
          >
            <PlayCircle className="w-4 h-4 mr-1.5 text-teal-400" />
            Bắt Đầu Phiên Đo Mới
          </button>
        </div>
      </div>

      {/* Patient Profile Card (Medical Header) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vitals & Demographics */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs md:col-span-2 space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Chỉ Số Sinh Trắc Học & Bàn Chân
              </h3>
              <p className="text-xs text-slate-500">Dữ liệu tham chiếu thiết kế lót giày chỉnh hình</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
              {customer?.gender === 'male' ? 'Nam' : 'Nữ'}, {customer?.age} tuổi
            </span>
          </div>

          {/* Anthropometric Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Cỡ Giày EU</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {customer?.shoeSizeEu}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Chiều Cao</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {customer?.heightCm} <span className="text-xs font-normal text-slate-500">cm</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Cân Nặng</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {customer?.weightKg} <span className="text-xs font-normal text-slate-500">kg</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Chỉ Số BMI</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-slate-900 font-mono">{bmiInfo.bmi}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${bmiInfo.color}`}>
                  {bmiInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono">{customer?.phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{customer?.email || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{customer?.address || 'Chưa có địa chỉ'}</span>
            </div>
          </div>
        </div>

        {/* Diagnosis & Medical Notes */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-slate-600" />
                Chẩn Đoán Lâm Sàng
              </h3>
            </div>
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-md p-3 text-xs text-slate-800 leading-relaxed font-sans">
              {customer?.medicalNotes || 'Chưa có ghi chú bệnh lý từ bác sĩ.'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Ngày mở hồ sơ:</span>
            <span className="font-mono">
              {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '26/10/2026'}
            </span>
          </div>
        </div>
      </div>

      {/* Gait Analysis Sessions History Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Footprints className="w-4 h-4 mr-2 text-slate-700" />
              Lịch Sử Các Phiên Đo Dáng Đi (Gait Sessions)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách các lần thu thập tín hiệu FSR 50Hz và tính toán phân bố áp lực
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700">
            {sessions.length} Phiên đo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Mã Phiên Đo</th>
                <th className="py-3 px-5">Thời Điểm Đo</th>
                <th className="py-3 px-5">Thiết Bị Cảm Biến</th>
                <th className="py-3 px-5">Hoạt Động</th>
                <th className="py-3 px-5">Số Bước (Steps)</th>
                <th className="py-3 px-5">Trạng Thái</th>
                <th className="py-3 px-5">Ghi Chú Buổi Đo</th>
                <th className="py-3 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Chưa có phiên đo nào cho bệnh nhân này. Nhấn "Bắt Đầu Phiên Đo Mới" để thu thập dữ liệu.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-mono font-semibold text-slate-900">{s.id}</td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <div>
                        {s.startTime
                          ? new Date(s.startTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '--:--'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.startTime ? new Date(s.startTime).toLocaleDateString('vi-VN') : '--'}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">
                      <span className="inline-flex items-center">
                        <Radio className="w-3 h-3 mr-1 text-slate-400" />
                        {s.deviceMac || 'BLE-DEFAULT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="capitalize text-slate-800 font-medium">
                        {s.activityType === 'walking'
                          ? 'Đi bộ (Walking)'
                          : s.activityType === 'running'
                          ? 'Chạy (Running)'
                          : s.activityType}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {s.stepCount || 0} bước
                    </td>
                    <td className="py-3.5 px-5">
                      {s.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1" /> Đang ghi nhận...
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate text-[11px]">
                      {s.notes || '--'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {s.status === 'RECORDING' ? (
                        <button
                          onClick={() => handleCompleteSession(s.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs transition"
                        >
                          Kết Thúc Đo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenHeatmap(s)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition"
                        >
                          Xem Bản Đồ FSR
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Gait Session */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Khởi Tạo Phiên Đo Dáng Đi Mới</h3>
                <p className="text-xs text-slate-500">Kết nối thiết bị lót giày thông minh FSR 6 điểm</p>
              </div>
              <button
                onClick={() => setIsNewSessionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Địa Chỉ MAC Thiết Bị Cảm Biến Lót Giày (BLE MAC)
                </label>
                <input
                  type="text"
                  value={newSessionForm.deviceMac}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, deviceMac: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded font-mono outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại Hoạt Động Đo</label>
                <select
                  value={newSessionForm.activityType}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, activityType: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded outline-hidden focus:ring-1 focus:ring-slate-900"
                >
                  <option value="walking">Đi bộ tự nhiên (Walking - 50Hz FSR Stream)</option>
                  <option value="running">Chạy bộ nhẹ (Jogging)</option>
                  <option value="static_standing">Đứng cân bằng tĩnh (Static Balance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Buổi Đo</label>
                <textarea
                  rows="3"
                  value={newSessionForm.notes}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded outline-hidden focus:ring-1 focus:ring-slate-900"
                  placeholder="Ghi chú điều kiện thử nghiệm..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-3.5 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={sessionCreating}
                  className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition"
                >
                  {sessionCreating ? 'Đang Tạo Phiên...' : 'Bắt Đầu Đo (Start Ingest)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customerToEdit={customer}
        onSaved={(updated) => setCustomer(updated)}
      />

      {/* 2D Foot Pressure Heatmap Modal */}
      <FootPressureHeatmap
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        session={activeHeatmapSession}
        footsteps={activeFootsteps}
      />
    </div>
  );
};
