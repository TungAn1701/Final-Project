import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  Footprints,
  Layers,
  Calendar,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const MyProfile = () => {
  const { user } = useAuth();

  const profile = {
    id: user?.customerId || 'CUST-8801',
    fullName: user?.displayName?.replace('Bệnh nhân: ', '') || 'Lê Hoàng Nam',
    shoeSizeEu: 42.0,
    weightKg: 74.0,
    heightCm: 175.0,
    medicalNotes: 'Bàn chân bẹt độ II (Flexible Flatfoot); Đau mỏi vòm gan chân sau khi đi bộ trên 30 phút.',
  };

  const sessions = [
    {
      id: 'SESS-2026-001',
      date: '26/10/2026 09:15',
      activity: 'Đi bộ tự do (50Hz FSR)',
      steps: 42,
      result: 'Vòm bàn chân sập nhẹ, áp lực gót 65 kPa',
      status: 'Đã phân tích',
    },
    {
      id: 'SESS-2026-002',
      date: '28/10/2026 14:30',
      activity: 'Kiểm tra lót chỉnh hình mẫu 1',
      steps: 65,
      result: 'Áp lực phân bố đều, vòm chân được nâng 18mm',
      status: 'Đã hiệu chuẩn',
    },
  ];

  const heightM = (profile.heightCm || 175) / 100;
  const bmi = (profile.weightKg / (heightM * heightM)).toFixed(1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Patient Welcome Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-slate-800 rounded text-teal-400 text-xs font-semibold mb-2">
            <UserCheck className="w-4 h-4 mr-1" /> Cổng Thông Tin Dành Cho Bệnh Nhân
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Xin chào, {profile.fullName}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Mã bệnh nhân: <span className="font-mono text-white font-bold">{profile.id}</span> • Theo dõi sức khỏe bàn chân & tiến độ điều chỉnh lót giày
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[11px] text-slate-400">Trạng Thái Hồ Sơ</div>
            <div className="font-semibold text-white">Đã Xác Thực Y Tế</div>
          </div>
        </div>
      </div>

      {/* Patient Biometric & Foot Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Cỡ Giày Chuẩn EU</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
            {profile.shoeSizeEu}
          </span>
          <span className="text-[11px] text-slate-400">Độ dài bàn chân ~ 26.5 cm</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Chiều Cao & Cân Nặng</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
            {profile.heightCm} <span className="text-sm font-normal text-slate-500">cm</span> / {profile.weightKg} <span className="text-sm font-normal text-slate-500">kg</span>
          </span>
          <span className="text-[11px] text-slate-400">Tải trọng nén dáng đi</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Chỉ Số Thể Trọng BMI</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono mt-1 block">
            {bmi}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">Mức cân đối chuẩn y khoa</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Tình Trạng Bàn Chân</span>
          <span className="text-sm font-bold text-slate-900 mt-2 block leading-tight">
            Bàn chân bẹt độ II
          </span>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Cần nâng vòm medial</span>
        </div>
      </div>

      {/* Recommended Orthotic Insole Specification */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Chỉ Định Cấu Hình Lót Giày Y Tế Cá Nhân Hóa (Doctor's Prescription)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
            Phù Hợp Với Dáng Đi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Độ Cao Vòm Lót (Arch Support)</span>
            <span className="text-lg font-bold text-indigo-700 font-mono">18.5 mm</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Hỗ trợ nâng vòm gan chân giữa, phân bổ đều áp lực sang phần gót và xương ngón chân.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Độ Cứng Vật Liệu (Insole Hardness)</span>
            <span className="text-lg font-bold text-slate-800 font-mono">TPU Shore 92A</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Độ đàn hồi cơ học chịu lực tối ưu cho bệnh nhân có cân nặng 74kg khi đi bộ hàng ngày.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Đệm Giảm Chấn Gót (Heel Cup)</span>
            <span className="text-lg font-bold text-slate-800 font-mono">PORON® 4mm</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Hấp thụ 90% lực phản hồi mặt đất, giảm sốc truyền lên khớp gối và cột sống thắt lưng.
            </p>
          </div>
        </div>
      </div>

      {/* Gait Session Progress Timeline */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Footprints className="w-4 h-4 mr-2 text-slate-700" />
            Lịch Sử Kiểm Tra Dáng Đi Định Kỳ
          </h3>
          <span className="text-xs text-slate-500">Được đo bởi Bác sĩ tại phòng khám</span>
        </div>

        <div className="divide-y divide-slate-200 text-xs">
          {sessions.map((s) => (
            <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900">{s.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> {s.date}
                  </span>
                </div>
                <div className="font-medium text-slate-800">{s.activity} ({s.steps} bước đo)</div>
                <div className="text-[11px] text-slate-500">{s.result}</div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
