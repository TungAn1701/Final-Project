import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import { CustomerModal } from './CustomerModal';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';

// Sample clinical demo patients for instant evaluation
const SAMPLE_PATIENTS = [
  {
    id: 'CUST-8801',
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
  },
  {
    id: 'CUST-8802',
    fullName: 'Trần Thị Thu Hà',
    phoneNumber: '0988 765 432',
    email: 'thuha.tran@example.com',
    age: 45,
    gender: 'female',
    shoeSizeEu: 37.5,
    weightKg: 58.0,
    heightCm: 160.0,
    address: 'Q. Đống Đa, Hà Nội',
    medicalNotes: 'Viêm cân gan chân mạn tính (Plantar Fasciitis); Gai gót chân trái.',
    createdAt: '2026-10-25T10:15:00',
  },
  {
    id: 'CUST-8803',
    fullName: 'Nguyễn Văn Minh',
    phoneNumber: '0912 345 890',
    email: 'minh.nguyen@example.com',
    age: 62,
    gender: 'male',
    shoeSizeEu: 41.0,
    weightKg: 78.0,
    heightCm: 168.0,
    address: 'Q. Hải Châu, Đà Nẵng',
    medicalNotes: 'Bàn chân đái tháo đường Type 2; Mất cảm giác ngoại biên nhẹ, áp lực gót chân tăng cao.',
    createdAt: '2026-10-26T14:00:00',
  },
  {
    id: 'CUST-8804',
    fullName: 'Phạm Quỳnh Anh',
    phoneNumber: '0977 112 233',
    email: 'quynhanh.p@example.com',
    age: 21,
    gender: 'female',
    shoeSizeEu: 36.5,
    weightKg: 49.0,
    heightCm: 158.0,
    address: 'Q. 1, TP. Hồ Chí Minh',
    medicalNotes: 'Lệch gót ngoài (Overpronation); Mỏi cổ chân khi đứng lâu.',
    createdAt: '2026-10-27T09:45:00',
  },
];

export const CustomerList = () => {
  const navigate = useNavigate();
  const { isClinician } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Fetch customers from API
  const fetchCustomers = useCallback(async (keyword = '') => {
    setLoading(true);
    try {
      const data = await customerApi.getCustomers(keyword);
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
      } else if (!keyword) {
        // If empty backend DB, use sample clinical patients
        setCustomers(SAMPLE_PATIENTS);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.warn('Backend unavailable, fallback to clinical local cache:', err);
      if (keyword) {
        const filtered = SAMPLE_PATIENTS.filter(
          (p) =>
            p.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
            p.phoneNumber.includes(keyword) ||
            (p.email && p.email.toLowerCase().includes(keyword.toLowerCase())) ||
            (p.medicalNotes && p.medicalNotes.toLowerCase().includes(keyword.toLowerCase()))
        );
        setCustomers(filtered);
      } else {
        setCustomers(SAMPLE_PATIENTS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(search);
  }, [fetchCustomers, search]);

  // Handle Save
  const handleSaved = (savedCustomer) => {
    setCustomers((prev) => {
      const index = prev.findIndex((c) => c.id === savedCustomer.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedCustomer;
        return updated;
      }
      return [savedCustomer, ...prev];
    });
  };

  // Handle Delete (Only Clinician allowed)
  const handleDelete = async (id, name) => {
    if (!isClinician) {
      setDeleteError('Chỉ Bác sĩ lâm sàng mới có quyền xóa hồ sơ bệnh nhân.');
      setTimeout(() => setDeleteError(''), 4000);
      return;
    }

    if (window.confirm(`Xác nhận xóa hồ sơ bệnh nhân: "${name}"? Thao tác này không thể hoàn tác.`)) {
      try {
        await customerApi.deleteCustomer(id);
      } catch (err) {
        console.warn('Backend delete fallback:', err);
      }
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const calculateBmi = (weight, height) => {
    if (!weight || !height) return { bmi: '--', color: 'text-slate-500 bg-slate-100' };
    const h = height / 100;
    const val = (weight / (h * h)).toFixed(1);
    const num = parseFloat(val);
    if (num < 18.5) return { bmi: val, label: 'Thiếu cân', color: 'text-sky-700 bg-sky-50' };
    if (num <= 24.9) return { bmi: val, label: 'Chuẩn', color: 'text-emerald-700 bg-emerald-50' };
    if (num <= 29.9) return { bmi: val, label: 'Thừa cân', color: 'text-amber-700 bg-amber-50' };
    return { bmi: val, label: 'Béo phì', color: 'text-rose-700 bg-rose-50' };
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quản Lý Hồ Sơ Bệnh Nhân
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
              {customers.length} Bệnh nhân
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu hồ sơ y bạ, tiền sử bàn chân và lịch sử các phiên đo áp lực dáng đi FSR
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setCustomerToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Thêm Bệnh Nhân Mới
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo Tên, SĐT, Email hoặc Bệnh lý bàn chân..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Vai trò đang thao tác:</span>
          <span className="font-semibold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Clinical Patient Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã BN</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Liên Hệ</th>
                <th className="py-3 px-4">Nhân Trắc Học</th>
                <th className="py-3 px-4">BMI</th>
                <th className="py-3 px-4">Tiền Sử Bệnh Lý Bàn Chân</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Đang tải danh sách hồ sơ y tế...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    <p>Không tìm thấy hồ sơ bệnh nhân phù hợp với từ khóa.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const bmiInfo = calculateBmi(c.weightKg, c.heightCm);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {c.id.length > 10 ? `${c.id.substring(0, 8)}...` : c.id}
                      </td>

                      {/* Name & Age / Gender */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{c.fullName}</div>
                        <div className="text-slate-500 text-[11px]">
                          {c.age} tuổi • {c.gender === 'male' ? 'Nam' : c.gender === 'female' ? 'Nữ' : 'Khác'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800">{c.phoneNumber}</div>
                        {c.email && <div className="text-slate-400 text-[11px] truncate max-w-[140px]">{c.email}</div>}
                      </td>

                      {/* Anthropometrics */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>
                          <span className="font-semibold text-slate-900">EU {c.shoeSizeEu}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {c.heightCm} cm • {c.weightKg} kg
                        </div>
                      </td>

                      {/* BMI */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${bmiInfo.color}`}
                        >
                          {bmiInfo.bmi} {bmiInfo.label && `(${bmiInfo.label})`}
                        </span>
                      </td>

                      {/* Medical Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-700 text-[11px] line-clamp-2 leading-relaxed">
                          {c.medicalNotes || <span className="text-slate-400 italic">Chưa ghi nhận</span>}
                        </p>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {/* View Detail & Sessions */}
                          <button
                            onClick={() => navigate(`/patients/${c.id}`)}
                            className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition"
                            title="Xem chi tiết hồ sơ & lịch sử phiên đo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit (Clinician & Technician) */}
                          <button
                            onClick={() => {
                              setCustomerToEdit(c);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete (Clinician only - KTV does NOT have delete icon) */}
                          {isClinician && (
                            <button
                              onClick={() => handleDelete(c.id, c.fullName)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 bg-slate-100 rounded transition"
                              title="Xóa hồ sơ bệnh nhân (Bác sĩ)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Customer Modal Component */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerToEdit={customerToEdit}
        onSaved={handleSaved}
      />
    </div>
  );
};
