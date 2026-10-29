import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Plus } from 'lucide-react';
import { customerApi } from '../../api/customerApi';

const COMMON_CONDITIONS = [
  'Bàn chân bẹt (Flat Foot)',
  'Viêm cân gan chân (Plantar Fasciitis)',
  'Lệch gót ngoài (Overpronation)',
  'Lệch gót trong (Supination)',
  'Gai xương gót chân (Heel Spur)',
  'Bàn chân đái tháo đường (Diabetic Foot)',
  'Đau khớp gối do lệch trục bàn chân',
];

export const CustomerModal = ({ isOpen, onClose, customerToEdit, onSaved }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    age: 30,
    gender: 'male',
    shoeSizeEu: 41.0,
    weightKg: 68.0,
    heightCm: 172.0,
    address: '',
    medicalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        fullName: customerToEdit.fullName || '',
        phoneNumber: customerToEdit.phoneNumber || '',
        email: customerToEdit.email || '',
        age: customerToEdit.age || 30,
        gender: customerToEdit.gender || 'male',
        shoeSizeEu: customerToEdit.shoeSizeEu || 41.0,
        weightKg: customerToEdit.weightKg || 68.0,
        heightCm: customerToEdit.heightCm || 172.0,
        address: customerToEdit.address || '',
        medicalNotes: customerToEdit.medicalNotes || '',
      });
    } else {
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        age: 30,
        gender: 'male',
        shoeSizeEu: 41.0,
        weightKg: 68.0,
        heightCm: 172.0,
        address: '',
        medicalNotes: '',
      });
    }
    setError('');
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  // Calculate live BMI
  const heightM = (formData.heightCm || 170) / 100;
  const bmi = (formData.weightKg / (heightM * heightM)).toFixed(1);

  const getBmiLabel = (val) => {
    const num = parseFloat(val);
    if (num < 18.5) return { text: 'Thiếu cân', color: 'text-sky-600 bg-sky-50' };
    if (num <= 24.9) return { text: 'Bình thường', color: 'text-emerald-600 bg-emerald-50' };
    if (num <= 29.9) return { text: 'Thừa cân', color: 'text-amber-600 bg-amber-50' };
    return { text: 'Béo phì', color: 'text-rose-600 bg-rose-50' };
  };

  const handleAddCondition = (condition) => {
    if (!formData.medicalNotes.includes(condition)) {
      setFormData((prev) => ({
        ...prev,
        medicalNotes: prev.medicalNotes
          ? `${prev.medicalNotes}; ${condition}`
          : condition,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Họ và tên bệnh nhân không được để trống.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Số điện thoại liên hệ là bắt buộc.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let saved;
      if (customerToEdit && customerToEdit.id) {
        saved = await customerApi.updateCustomer(customerToEdit.id, formData);
      } else {
        saved = await customerApi.createCustomer(formData);
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu bệnh nhân:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể kết nối đến cơ sở dữ liệu y tế. Vui lòng kiểm tra lại máy chủ Backend.';
      setError(`Không thể lưu hồ sơ bệnh nhân: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {customerToEdit ? 'Chỉnh Sửa Hồ Sơ Bệnh Nhân' : 'Tạo Mới Hồ Sơ Bệnh Nhân'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thông tin nhân khẩu học và nhân trắc học bàn chân
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Name and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và Tên Bệnh Nhân <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số Điện Thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="0912 345 678"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Row 2: Email, Age, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tuổi</label>
              <input
                type="number"
                min="5"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Row 3: Anthropometrics (Shoe Size EU, Weight kg, Height cm, Live BMI) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Thông Số Nhân Trắc Học & Bàn Chân
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cỡ Giày EU
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="32"
                  max="48"
                  value={formData.shoeSizeEu}
                  onChange={(e) =>
                    setFormData({ ...formData, shoeSizeEu: parseFloat(e.target.value) || 40 })
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chiều Cao (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="100"
                  max="230"
                  value={formData.heightCm}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 170 })
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cân Nặng (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="200"
                  value={formData.weightKg}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 65 })
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chỉ Số BMI
                </label>
                <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-sm font-bold text-slate-900">
                  <span>{bmi}</span>
                  <span
                    className={`text-[10px] px-1 py-0.5 rounded font-medium ${getBmiLabel(bmi).color}`}
                  >
                    {getBmiLabel(bmi).text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Địa Chỉ</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Số nhà, đường, quận, thành phố"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
            />
          </div>

          {/* Row 5: Medical Notes & Fast Condition Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiền Sử Bệnh Lý & Triệu Chứng Bàn Chân
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleAddCondition(cond)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center transition"
                >
                  <Plus className="w-3 h-3 mr-1 text-slate-500" />
                  {cond}
                </button>
              ))}
            </div>
            <textarea
              rows="3"
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              placeholder="Ghi chú lâm sàng, triệu chứng đau khi đi bộ, kết quả chụp X-quang hoặc chỉ định vòm lót..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition disabled:opacity-50 shadow-xs"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Đang Lưu...' : customerToEdit ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
