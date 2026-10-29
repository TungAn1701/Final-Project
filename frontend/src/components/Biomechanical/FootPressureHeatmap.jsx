import React, { useState } from 'react';
import { X, Footprints, Activity, BarChart2, ChevronLeft, ChevronRight, Info } from 'lucide-react';

// Anatomical sensor definition according to 1-2-2-1 strategy
const SENSOR_META = [
  { id: 'p0', key: 'peakPressureP0', label: 'P0 - Gót Chân (Heel)', role: 'Giai đoạn tiếp đất (Heel strike)', cx: 100, cy: 300, r: 24 },
  { id: 'p4', key: 'peakPressureP4', label: 'P4 - Vòm Trong (Medial Arch)', role: 'Chẩn đoán bàn chân bẹt / vòm cao', cx: 68, cy: 200, r: 18 },
  { id: 'p5', key: 'peakPressureP5', label: 'P5 - Vòm Ngoài (Lateral Arch)', role: 'Chống lật cổ chân ngoài (Supination)', cx: 132, cy: 200, r: 18 },
  { id: 'p2', key: 'peakPressureP2', label: 'P2 - Đốt Bàn I (1st Metatarsal)', role: 'Truyền lực đẩy bàn chân trước trong', cx: 64, cy: 115, r: 20 },
  { id: 'p3', key: 'peakPressureP3', label: 'P3 - Đốt Bàn V (5th Metatarsal)', role: 'Ổn định thăng bằng bàn chân trước ngoài', cx: 136, cy: 125, r: 19 },
  { id: 'p1', key: 'peakPressureP1', label: 'P1 - Ngón Cái (Hallux)', role: 'Giai đoạn đẩy ngón rời đất (Toe-off)', cx: 72, cy: 40, r: 18 },
];

// Biomechanical pressure to color gradient mapping
const getPressureColor = (kPa) => {
  if (kPa <= 0) return { fill: '#e2e8f0', stroke: '#94a3b8', text: '#64748b', intensity: 0.1 };
  if (kPa < 50) return { fill: '#38bdf8', stroke: '#0284c7', text: '#0369a1', intensity: 0.35 };
  if (kPa < 120) return { fill: '#34d399', stroke: '#059669', text: '#047857', intensity: 0.6 };
  if (kPa < 220) return { fill: '#fbbf24', stroke: '#d97706', text: '#b45309', intensity: 0.85 };
  return { fill: '#f43f5e', stroke: '#e11d48', text: '#be123c', intensity: 1.0 };
};

export const FootPressureHeatmap = ({ isOpen, onClose, session, footsteps = [] }) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [hoveredSensor, setHoveredSensor] = useState(null);

  if (!isOpen) return null;

  // Selected footstep or fallback averages
  const hasSteps = footsteps && footsteps.length > 0;
  const currentStep = hasSteps ? footsteps[selectedStepIndex] : null;

  // Sensor pressure values (kPa)
  const pressures = {
    p0: currentStep ? currentStep.peakPressureP0 || 0 : 280.0,
    p1: currentStep ? currentStep.peakPressureP1 || 0 : 240.0,
    p2: currentStep ? currentStep.peakPressureP2 || 0 : 210.0,
    p3: currentStep ? currentStep.peakPressureP3 || 0 : 160.0,
    p4: currentStep ? currentStep.peakPressureP4 || 0 : 95.0, // High medial arch pressure indicates flatfoot
    p5: currentStep ? currentStep.peakPressureP5 || 0 : 70.0,
  };

  const totalPressure = Object.values(pressures).reduce((a, b) => a + b, 0);

  // Cavanagh & Rodgers Arch Index approximation: Midfoot (P4+P5) / Total
  const midfootPressure = pressures.p4 + pressures.p5;
  const archIndex = totalPressure > 0 ? (midfootPressure / totalPressure).toFixed(2) : '0.24';

  let archDiagnosis = {
    text: 'Vòm Bình Thường (Normal Arch)',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Tỷ lệ tải trọng giữa bàn chân trước, vòm và gót nằm trong ngưỡng cân bằng sinh học tiêu chuẩn.',
  };

  const aiVal = parseFloat(archIndex);
  if (aiVal > 0.26) {
    archDiagnosis = {
      text: 'Bàn Chân Bẹt (Flatfoot / Pes Planus)',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Áp lực tiếp xúc tại vòm trong (P4) tăng cao bất thường; khuyến nghị bổ sung đệm nâng vòm 15-20mm.',
    };
  } else if (aiVal < 0.18) {
    archDiagnosis = {
      text: 'Vòm Chân Cao (High Arch / Pes Cavus)',
      badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
      description: 'Vùng vòm chân chịu lực rất thấp, áp lực tập trung dồn vào gót chân và chỏm đốt bàn chân trước.',
    };
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight">Bản Đồ Áp Lực Dáng Đi FSR (Gait Heatmap 2D)</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 font-semibold border border-slate-700">
                  {session?.id || 'PHIÊN ĐO LÂM SÀNG'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chiến lược bố trí 6 cảm biến 1-2-2-1 & phân tích định lượng chỉ số vòm Cavanagh & Rodgers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Selector Ribbon if multiple steps available */}
        {hasSteps && footsteps.length > 1 && (
          <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2 font-medium text-slate-700">
              <span>Bước Chân Đo:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedStepIndex + 1} / {footsteps.length}
              </span>
              <span className="text-slate-400 font-mono">
                ({currentStep?.durationMs || 0} ms • {currentStep?.footSide === 'left' ? 'Chân Trái' : 'Chân Phải'})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                disabled={selectedStepIndex === 0}
                onClick={() => setSelectedStepIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={selectedStepIndex === footsteps.length - 1}
                onClick={() => setSelectedStepIndex((prev) => Math.min(footsteps.length - 1, prev + 1))}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: 2D Anatomical Foot Insole Visualizer */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Bình Diện Lót Giày (Right Foot Plantar View)
            </div>

            <div className="relative w-48 h-80 flex items-center justify-center">
              {/* Foot sole SVG contour */}
              <svg viewBox="0 0 200 360" className="w-full h-full drop-shadow-sm">
                <defs>
                  {/* Subtle insole outer boundary */}
                  <linearGradient id="insoleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>

                  {/* Hotspot radial gradient */}
                  {SENSOR_META.map((s) => {
                    const kPa = pressures[s.id] || 0;
                    const color = getPressureColor(kPa);
                    return (
                      <radialGradient key={`grad-${s.id}`} id={`grad-${s.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={color.fill} stopOpacity="0.9" />
                        <stop offset="60%" stopColor={color.fill} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={color.fill} stopOpacity="0.0" />
                      </radialGradient>
                    );
                  })}
                </defs>

                {/* Right Foot Biomechanical Outsole Contour */}
                <path
                  d="M 100 20
                     C 130 20, 150 45, 150 85
                     C 150 120, 145 150, 142 180
                     C 140 215, 136 250, 130 280
                     C 125 315, 115 340, 100 340
                     C 85 340, 75 315, 70 280
                     C 65 245, 58 210, 60 170
                     C 62 130, 52 90, 68 45
                     C 76 25, 90 20, 100 20 Z"
                  fill="url(#insoleGrad)"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Subtle Arch Inset Reference Curve */}
                <path
                  d="M 68 120 Q 82 200 70 280"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Sensor Hotspot Halos & Indicators */}
                {SENSOR_META.map((s) => {
                  const kPa = pressures[s.id] || 0;
                  const color = getPressureColor(kPa);
                  const isHovered = hoveredSensor === s.id;

                  return (
                    <g
                      key={s.id}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredSensor(s.id)}
                      onMouseLeave={() => setHoveredSensor(null)}
                    >
                      {/* Outer soft halo */}
                      <circle
                        cx={s.cx}
                        cy={s.cy}
                        r={s.r * (isHovered ? 1.6 : 1.35)}
                        fill={`url(#grad-${s.id})`}
                      />

                      {/* Hard sensor pad border */}
                      <circle
                        cx={s.cx}
                        cy={s.cy}
                        r={s.r * (isHovered ? 1.15 : 1.0)}
                        fill={color.fill}
                        stroke={isHovered ? '#0f172a' : color.stroke}
                        strokeWidth={isHovered ? 3 : 2}
                      />

                      {/* Text label inside pad */}
                      <text
                        x={s.cx}
                        y={s.cy + 4}
                        textAnchor="middle"
                        fontSize={isHovered ? "11" : "9.5"}
                        fontWeight="bold"
                        fill="#0f172a"
                      >
                        {Math.round(kPa)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Colorbar Scale Legend */}
            <div className="w-full mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                <span>0 kPa</span>
                <span>100 kPa</span>
                <span>200 kPa</span>
                <span>350+ kPa</span>
              </div>
              <div className="h-2 rounded-full w-full bg-gradient-to-r from-slate-200 via-sky-400 via-emerald-400 via-amber-400 to-rose-500" />
            </div>
          </div>

          {/* Right: Quantitative Biomechanical Data & Clinical Analysis */}
          <div className="md:col-span-7 space-y-4">
            {/* Cavanagh & Rodgers Arch Index Card */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Đánh Giá Chỉ Số Vòm (Cavanagh & Rodgers Arch Index)
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-bold font-mono text-slate-900">{archIndex}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${archDiagnosis.badgeColor}`}>
                      {archDiagnosis.text}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 text-slate-600">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                {archDiagnosis.description}
              </p>
            </div>

            {/* 6 Sensor Data Breakdown Table */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="w-4 h-4 mr-1 text-slate-700" />
                  Bảng Phân Bố Áp Lực 6 Điểm FSR (1-2-2-1)
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  Tổng áp lực: <span className="font-mono font-bold text-slate-800">{Math.round(totalPressure)} kPa</span>
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase">
                      <th className="py-2 px-3">Cảm Biến</th>
                      <th className="py-2 px-3">Vị Trí Giải Phẫu</th>
                      <th className="py-2 px-3 text-right">Áp Lực (kPa)</th>
                      <th className="py-2 px-3 text-right">Tỷ Trọng (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {SENSOR_META.map((s) => {
                      const kPa = pressures[s.id] || 0;
                      const percent = totalPressure > 0 ? ((kPa / totalPressure) * 100).toFixed(1) : '0.0';
                      const color = getPressureColor(kPa);
                      const isHovered = hoveredSensor === s.id;

                      return (
                        <tr
                          key={s.id}
                          onMouseEnter={() => setHoveredSensor(s.id)}
                          onMouseLeave={() => setHoveredSensor(null)}
                          className={`transition ${isHovered ? 'bg-teal-50/70' : 'hover:bg-slate-50'}`}
                        >
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 flex items-center">
                            <span
                              className="w-2.5 h-2.5 rounded-full mr-2"
                              style={{ backgroundColor: color.fill }}
                            />
                            {s.label.split(' - ')[0]}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            <div>{s.label.split(' - ')[1]}</div>
                            <div className="text-[10px] text-slate-400">{s.role}</div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                            {Math.round(kPa)} <span className="text-[10px] text-slate-400 font-normal">kPa</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {percent}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Prescriptive Recommendation Note */}
            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs text-slate-700 flex items-start space-x-2">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-teal-900">Đề xuất kỹ thuật viên CAD / In 3D:</span>{' '}
                {aiVal > 0.26
                  ? 'Kê toa lót giày TPU shore 85A kết hợp khối nâng vòm trong (medial arch wedge) 18mm để triệt tiêu tải trọng sập vòm P4.'
                  : aiVal < 0.18
                  ? 'Kê toa đệm giảm chấn gót P0 (Heel cushion) và đệm bàn chân trước EVA shore 40A.'
                  : 'Dáng đi cân bằng, phù hợp với mẫu lót giày hỗ trợ vận động tiêu chuẩn.'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition"
          >
            Đóng Xem Bản Đồ
          </button>
        </div>
      </div>
    </div>
  );
};
