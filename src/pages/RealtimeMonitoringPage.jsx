import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings, X } from 'lucide-react';
import gasTankImg from '../assets/gas_tank.png';
import ModalPortal from '../components/ModalPortal';
import Toast from '../components/Toast';
import { useGasData } from '../context/GasDataContext';

export default function RealtimeMonitoringPage() {
  // Shared Realtime & Threshold Configurations from GasDataContext
  const {
    levelConfig,
    setLevelConfig,
    pressureConfig,
    setPressureConfig,
    actualTankLevel,
    currentPressure,
    hourlyConsumption: hourlyData
  } = useGasData();

  // Consumption bar chart hover & mouse tracking (matches DashboardBarChart tooltip)
  const chartContainerRef = useRef(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleChartMouseMove = (e) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const isNearRightEdge = chartContainerRef.current && mousePos.x > chartContainerRef.current.offsetWidth - 160;

  // Modals state
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showPressureModal, setShowPressureModal] = useState(false);

  // Form states for Level
  const [normalLevel, setNormalLevel] = useState(levelConfig.normalThreshold);
  const [warningLevel, setWarningLevel] = useState(levelConfig.warningThreshold);
  const [criticalLevel, setCriticalLevel] = useState(levelConfig.criticalThreshold);

  // Form states for Pressure
  const [normalPressure, setNormalPressure] = useState(pressureConfig.normalThreshold);
  const [warningPressure, setWarningPressure] = useState(pressureConfig.warningThreshold);
  const [maxPressureVal, setMaxPressureVal] = useState(pressureConfig.maxPressure);

  const [toast, setToast] = useState(null);

  // Level bar percentage calculation (100% when full at 12000 Nm², decreases smoothly as volume drops)
  const tankPercent = Math.min(
    100,
    Math.max(0, Math.round((actualTankLevel / levelConfig.tankMaxLevel) * 100))
  );

  // Actual Tank Level Card color theme: green (Normal), yellow (Warning), red (Critical)
  const actualTankCardTheme = useMemo(() => {
    if (actualTankLevel >= levelConfig.normalThreshold) {
      return {
        bg: 'bg-[#EAF8F1]',
        border: 'border-[#A7F3D0]',
        text: 'text-[#00A854]',
        fluidColor: '#9CD0FF'
      };
    }
    if (actualTankLevel >= levelConfig.warningThreshold) {
      return {
        bg: 'bg-[#FEF9C3]',
        border: 'border-[#FACC15]',
        text: 'text-[#CA8A04]',
        fluidColor: '#FACC15'
      };
    }
    return {
      bg: 'bg-[#FEE2E2]',
      border: 'border-[#F87171]',
      text: 'text-[#DC2626]',
      fluidColor: '#EF4444'
    };
  }, [actualTankLevel, levelConfig]);

  // Dynamic SVG Gauge Arc calculation based on pressure thresholds
  const gaugeArcs = useMemo(() => {
    const maxP = pressureConfig.maxPressure || 20;
    const normP = Math.max(0, Math.min(maxP, pressureConfig.normalThreshold));
    const warnP = Math.max(normP, Math.min(maxP, pressureConfig.warningThreshold));

    const cx = 290;
    const cy = 198;
    const r = 168;

    const getCoord = (p, radius = r) => {
      const clamped = Math.max(0, Math.min(maxP, p));
      const deg = 180 - (clamped / maxP) * 180;
      const rad = (deg * Math.PI) / 180;
      return {
        x: Number((cx + radius * Math.cos(rad)).toFixed(1)),
        y: Number((cy - radius * Math.sin(rad)).toFixed(1))
      };
    };

    // Arc 1: Green 0 -> normP
    const start1 = getCoord(0);
    const end1 = getCoord(normP);
    const arc1Path = `M ${start1.x} ${start1.y} A 168 168 0 0 1 ${end1.x} ${end1.y}`;

    // Arc 2: Yellow normP -> warnP
    const start2 = getCoord(normP);
    const end2 = getCoord(warnP);
    const arc2Path = `M ${start2.x} ${start2.y} A 168 168 0 0 1 ${end2.x} ${end2.y}`;

    // Arc 3: Red warnP -> maxP
    const start3 = getCoord(warnP);
    const end3 = getCoord(maxP);
    const arc3Path = `M ${start3.x} ${start3.y} A 168 168 0 0 1 ${end3.x} ${end3.y}`;

    // Label coordinates for thresholds (reduced gap with chart)
    const normLabelCoord = getCoord(normP, 183);
    const warnLabelCoord = getCoord(warnP, 183);

    return {
      arc1Path,
      arc2Path,
      arc3Path,
      normP,
      warnP,
      maxP,
      normLabelCoord,
      warnLabelCoord
    };
  }, [pressureConfig]);

  // Dynamic tick marks on the INSIDE of the arc, generated directly by the edited thresholds & maxPressure
  const gaugeTicks = useMemo(() => {
    const maxP = gaugeArcs.maxP || 20;
    const normP = gaugeArcs.normP;
    const warnP = gaugeArcs.warnP;

    // Step calculation: 1 bar per tick for up to 80 bar (crisp and detailed)
    // 2 bar per tick up to 140 bar, etc.
    let step = 1;
    if (maxP > 140) {
      step = 5;
    } else if (maxP > 80) {
      step = 2;
    }

    const ticks = [];
    const cx = 290;
    const cy = 198;
    const outerR = 156;
    const innerR = 142;

    for (let val = step; val <= maxP; val += step) {
      const ratio = val / maxP;
      const deg = 180 - ratio * 180;
      const rad = (deg * Math.PI) / 180;

      const x1 = Number((cx + innerR * Math.cos(rad)).toFixed(1));
      const y1 = Number((cy - innerR * Math.sin(rad)).toFixed(1));
      const x2 = Number((cx + outerR * Math.cos(rad)).toFixed(1));
      const y2 = Number((cy - outerR * Math.sin(rad)).toFixed(1));

      // Color based on threshold zones: Green (Normal), Yellow (Warning), Red (High)
      let strokeColor = '#00A854';
      if (val > normP && val <= warnP) {
        strokeColor = '#FFC30F';
      } else if (val > warnP) {
        strokeColor = '#F04438';
      }

      ticks.push({ val, x1, y1, x2, y2, strokeColor });
    }

    // Adaptive stroke width so ticks always look sharp and never crowded
    const strokeWidth = ticks.length > 50 ? '1' : ticks.length > 30 ? '1' : '1';

    return {
      ticks,
      strokeWidth
    };
  }, [gaugeArcs]);

  // Modal open handlers
  const handleOpenLevelModal = () => {
    setNormalLevel(levelConfig.normalThreshold);
    setWarningLevel(levelConfig.warningThreshold);
    setCriticalLevel(levelConfig.criticalThreshold);
    setShowLevelModal(true);
  };

  const handleSaveLevelModal = (e) => {
    e.preventDefault();
    const n = Number(normalLevel);
    const w = Number(warningLevel);
    const c = Number(criticalLevel);

    if (w >= n || c >= w) {
      setToast({
        type: 'error',
        title: 'Invalid Thresholds',
        message: 'Must follow: Normal > Warning > Critical'
      });
      return;
    }

    setLevelConfig((prev) => ({
      ...prev,
      normalThreshold: n,
      warningThreshold: w,
      criticalThreshold: c
    }));
    setShowLevelModal(false);
    setToast({
      type: 'success',
      title: 'Level Thresholds Updated',
      message: 'Tank level thresholds saved successfully.'
    });
  };

  const handleOpenPressureModal = () => {
    setNormalPressure(pressureConfig.normalThreshold);
    setWarningPressure(pressureConfig.warningThreshold);
    setMaxPressureVal(pressureConfig.maxPressure);
    setShowPressureModal(true);
  };

  const handleSavePressureModal = (e) => {
    e.preventDefault();
    const n = Number(normalPressure);
    const w = Number(warningPressure);
    const m = Number(maxPressureVal);

    if (n <= 0 || w <= n || m <= w) {
      setToast({
        type: 'error',
        title: 'Invalid Thresholds',
        message: 'Must follow: 0 < Normal < Warning < Max Pressure'
      });
      return;
    }

    setPressureConfig({
      maxPressure: m,
      normalThreshold: n,
      warningThreshold: w,
      pressureUnit: 'bar'
    });
    setShowPressureModal(false);
    setToast({
      type: 'success',
      title: 'Pressure Thresholds Updated',
      message: 'Pressure gauge area chart zones updated successfully.'
    });
  };

  // Needle angle for gauge: 0 bar = -90deg (pointing left), maxPressure = +90deg (pointing right)
  const clampedPressure = Math.max(0, Math.min(gaugeArcs.maxP, currentPressure));
  const pressureAngle = -90 + (clampedPressure / gaugeArcs.maxP) * 180;

  // Max value for consumption bar chart scaling
  const maxConsumption = 150;

  return (
    <>
      <div className="h-full flex flex-col gap-4 justify-between min-h-0 select-none">
        {/* Top Header Card */}
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#1E232F]">Realtime Monitoring</h1>
            <p className="text-xs text-gray-500 mt-0.5">Monitoring actual gas parameter</p>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column: Gas Tank Level (Tall Card) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E4E7EC] p-4 shadow-sm flex flex-col justify-between h-full min-h-[500px] lg:min-h-[540px] overflow-hidden gap-4">
            {/* Card Header */}
            <div className="flex items-start justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1E232F] leading-tight">Gas Tank Level</h3>
                <p className="text-xs text-gray-400 mt-0.5">Gas tank level monitoring</p>
              </div>
              <button
                onClick={handleOpenLevelModal}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                title="Edit Gas Tank Level Thresholds"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Tank Graphic Area with fluid level column matching Figma */}
            <div className="flex-1 min-h-[340px] lg:min-h-[380px] flex items-center justify-center relative select-none py-1">
              <div className="relative h-full w-auto max-h-[540px] 2xl:max-h-[600px] aspect-[531/1156] flex items-center justify-center">
                {/* 3D Gas Tank image from Figma */}
                <img
                  src={gasTankImg}
                  alt="Gas Tank"
                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                />

                {/* Overlaid Gas Level Column matching Figma cutaway */}
                <div
                  className="absolute left-[47.5%] top-[22.2%] w-[34%] h-[56.8%] bg-white rounded-[6px] sm:rounded-[6px] overflow-hidden flex flex-col justify-end"
                  title={`Actual Level: ${actualTankLevel.toLocaleString('id-ID')} Nm² (${tankPercent}%)`}
                >
                  <div
                    className="w-full transition-all duration-700 ease-out"
                    style={{ height: `${tankPercent}%`, backgroundColor: actualTankCardTheme.fluidColor }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards at Bottom */}
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              {/* Max Level Card */}
              <div className="bg-white border border-[#E4E7EC] rounded-xl p-3.5 text-center shadow-xs flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-medium">Tank Max Level</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1E232F] mt-1 tracking-tight">
                  {levelConfig.tankMaxLevel.toLocaleString('id-ID')}{' '}
                  <span className="text-sm font-semibold text-gray-700">Nm²</span>
                </p>
              </div>

              {/* Actual Level Card */}
              <div
                className={`${actualTankCardTheme.bg} border ${actualTankCardTheme.border} rounded-xl p-3.5 text-center shadow-xs flex flex-col justify-center transition-colors duration-500`}
              >
                <p className={`text-xs ${actualTankCardTheme.text} font-semibold transition-colors duration-500`}>
                  Actual Tank Level
                </p>
                <p className={`text-2xl sm:text-3xl font-extrabold ${actualTankCardTheme.text} mt-1 tracking-tight transition-colors duration-500`}>
                  {actualTankLevel.toLocaleString('id-ID')}{' '}
                  <span className={`text-sm font-semibold ${actualTankCardTheme.text}`}>Nm²</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Gas Tank Pressure (Top) & Gas Tank Consumption (Bottom) */}
          <div className="lg:col-span-7 flex flex-col gap-4 justify-between h-full min-h-0 overflow-hidden">
            {/* Card 1: Gas Tank Pressure */}
            <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 shadow-sm flex-1 min-h-[290px] lg:min-h-[320px] flex flex-col justify-between overflow-hidden gap-4">
              {/* 1. Header */}
              <div className="flex items-start justify-between flex-shrink-0">
                <div>
                  <h3 className="text-base font-bold text-[#1E232F] leading-tight">Gas Tank Pressure</h3>
                  <p className="text-xs text-gray-400 mt-0.5">This is a long chart description</p>
                </div>
                <button
                  onClick={handleOpenPressureModal}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  title="Edit Gas Tank Pressure Thresholds"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* 2. Chart (Speedometer Gauge with DYNAMIC AREA ZONES & AUTHENTIC NEEDLE) */}
              <div className="flex-1 min-h-0 flex items-center justify-center select-none overflow-hidden py-1">
                <svg
                  viewBox="0 0 580 216"
                  className="w-full h-full max-h-full max-w-[640px] lg:max-w-[720px] xl:max-w-[760px] object-contain"
                >
                  {/* Dynamic Threshold Ticks on the INSIDE of the arc, generated by edited thresholds */}
                  {gaugeTicks.ticks.map(({ val, x1, y1, x2, y2, strokeColor }) => (
                    <line
                      key={`tick-${val}-${gaugeArcs.maxP}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth={gaugeTicks.strokeWidth}
                      strokeLinecap="round"
                      className="transition-colors duration-500"
                    />
                  ))}

                  {/* DYNAMIC ARC 1: Green Normal Zone (0 to normalThreshold bar) */}
                  <path
                    d={gaugeArcs.arc1Path}
                    fill="none"
                    stroke="#00A854"
                    strokeWidth="18"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />

                  {/* DYNAMIC ARC 2: Yellow Warning Zone (normalThreshold to warningThreshold bar) */}
                  <path
                    d={gaugeArcs.arc2Path}
                    fill="none"
                    stroke="#FFC30F"
                    strokeWidth="18"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />

                  {/* DYNAMIC ARC 3: Red High Zone (warningThreshold to maxPressure bar) */}
                  <path
                    d={gaugeArcs.arc3Path}
                    fill="none"
                    stroke="#F04438"
                    strokeWidth="18"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />

                  {/* Authentic Gauge Needle (smaller & slimmer, rendered UNDER the value box: jarum dibawah value) */}
                  <g
                    transform={`translate(290, 198) rotate(${pressureAngle})`}
                    style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)' }}
                  >
                    {/* Slimmer & Shorter Needle Blade */}
                    <path
                      d="M -1.6 0 L -0.7 -114 L 0 -120 L 0.7 -114 L 1.6 0 Z"
                      fill="#475467"
                    />
                  </g>

                  {/* Dynamic Number labels on gauge - tight gap with chart */}
                  <text x="103" y="202" className="text-[13px] fill-[#475467] font-semibold" textAnchor="end">0</text>
                  <text
                    x={gaugeArcs.normLabelCoord.x}
                    y={gaugeArcs.normLabelCoord.y}
                    className="text-[13px] fill-[#475467] font-semibold transition-all duration-500"
                    textAnchor="middle"
                  >
                    {gaugeArcs.normP}
                  </text>
                  <text
                    x={gaugeArcs.warnLabelCoord.x}
                    y={gaugeArcs.warnLabelCoord.y}
                    className="text-[13px] fill-[#475467] font-semibold transition-all duration-500"
                    textAnchor="middle"
                  >
                    {gaugeArcs.warnP}
                  </text>
                  <text x="477" y="202" className="text-[13px] fill-[#475467] font-semibold" textAnchor="start">{gaugeArcs.maxP}</text>

                  {/* Value Box with White Background (rendered ON TOP OF needle to mask pivot) */}
                  <rect
                    x="232"
                    y="174"
                    width="116"
                    height="44"
                    rx="14"
                    fill="#FFFFFF"
                  />
                  <text
                    x="290"
                    y="198"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[25px] font-extrabold fill-[#1E232F] tracking-tight select-none"
                  >
                    {currentPressure} bar
                  </text>
                </svg>
              </div>

              {/* 3. Legend */}
              <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-600 flex-shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A854]" />
                  <span>Normal (0 - {gaugeArcs.normP} bar)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                  <span>Warning ({gaugeArcs.normP} - {gaugeArcs.warnP} bar)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span>High (&gt;{gaugeArcs.warnP} bar)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Gas Tank Consumption (Fixed to 320px matching design) */}
            <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 shadow-sm flex-1 min-h-[290px] lg:min-h-[320px] flex flex-col justify-between overflow-hidden gap-3">
              <div className="flex items-start justify-between flex-shrink-0">
                <div>
                  <h3 className="text-base font-bold text-[#1E232F] leading-tight">Gas Tank Consumption</h3>
                  <p className="text-xs text-gray-400 mt-0.5">This is a long chart description</p>
                </div>
              </div>

              {/* Hourly Consumption Bar Chart */}
              <div className="flex-1 min-h-0 flex flex-col justify-end select-none">
                <div className="flex items-stretch flex-1 min-h-[140px] lg:min-h-[160px]">
                  <div className="w-7 shrink-0 flex flex-col justify-between items-end pr-2 text-[11px] text-gray-400 font-medium select-none pointer-events-none py-0">
                    <span className="leading-none -translate-y-1/2">150</span>
                    <span className="leading-none">100</span>
                    <span className="leading-none">50</span>
                    <span className="leading-none">25</span>
                    <span className="leading-none translate-y-1/2">0</span>
                  </div>

                  <div
                    ref={chartContainerRef}
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                    className="flex-1 relative min-w-0 border-b border-gray-200"
                  >
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="w-full h-[1px] bg-gray-100" />
                      <div className="w-full h-[1px] bg-gray-100" />
                      <div className="w-full h-[1px] bg-gray-100" />
                      <div className="w-full h-[1px] bg-gray-100" />
                      <div className="w-full h-[1px] bg-transparent" />
                    </div>

                    <div className="relative z-10 w-full h-full flex items-end gap-2 sm:gap-3.5 lg:gap-4.5 px-1 sm:px-2">
                      {hourlyData.map((item, idx) => {
                        const heightPercent = Math.round((item.consumption / maxConsumption) * 100);
                        const isHovered = hoveredBarIdx === idx;
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredBarIdx(idx)}
                            className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer relative"
                          >
                            <div
                              className={`w-full max-w-[46px] sm:max-w-[54px] lg:max-w-[60px] rounded-t-[4px] transition-all duration-300 ease-out ${
                                isHovered ? 'bg-[#1E88E5]' : 'bg-[#2196F3]'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Interactive Tooltip matching Dashboard Consumption Bar Chart */}
                    {hoveredBarIdx !== null && hourlyData[hoveredBarIdx] && (
                      <div
                        className="absolute z-30 pointer-events-none transition-all duration-75 ease-out"
                        style={{
                          left: `${mousePos.x}px`,
                          top: `${Math.max(40, Math.min((chartContainerRef.current?.offsetHeight || 160) - 40, mousePos.y))}px`,
                          transform: isNearRightEdge
                            ? 'translate(calc(-100% - 14px), -50%)'
                            : 'translate(14px, -50%)'
                        }}
                      >
                        <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 p-2.5 min-w-[140px] select-none">
                          {/* Triangular pointer notch pointing towards cursor */}
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rotate-45 border-gray-100 ${
                              isNearRightEdge ? '-right-1.5 border-r border-t' : '-left-1.5 border-l border-b'
                            }`}
                          />

                          {/* Tooltip Header Title */}
                          <div className="text-[11px] font-bold text-[#1E232F] text-center pb-1.5 border-b border-gray-100 tracking-tight">
                            07 Sep 2026, {hourlyData[hoveredBarIdx].time}
                          </div>

                          {/* Tooltip Row */}
                          <div className="pt-1.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#2196F3] shrink-0" />
                              <span className="text-gray-600 font-medium">Consumption</span>
                            </div>
                            <span className="font-bold text-[#1E232F]">
                              {hourlyData[hoveredBarIdx].consumption} Nm³/h
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center w-full pt-2">
                  <div className="w-7 shrink-0 pr-2" />
                  <div className="flex-1 flex items-center gap-2 sm:gap-3.5 lg:gap-4.5 px-1 sm:px-2 text-[11px] text-gray-500 font-medium select-none">
                    {hourlyData.map((item, idx) => (
                      <span key={idx} className="flex-1 text-center truncate">
                        {item.time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600 flex-shrink-0 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2196F3]" />
                <span>Consumption (Nm³/h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Gas Tank Level Modal */}
      <ModalPortal isOpen={showLevelModal} onClose={() => setShowLevelModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Edit Gas Tank Level</h3>
              <p className="text-xs text-gray-400 mt-0.5">This field is for desc terms of service</p>
            </div>
            <button
              onClick={() => setShowLevelModal(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveLevelModal} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Normal Pressure Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={normalLevel}
                  onChange={(e) => setNormalLevel(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-medium text-gray-800"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  Nm²
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Enter a number between 0 and 9</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Warning Pressure Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={warningLevel}
                  onChange={(e) => setWarningLevel(e.target.value)}
                  placeholder="2000"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-medium text-gray-800"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  Nm²
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Enter a number between 0 and 9</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Critical Pressure Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={criticalLevel}
                  onChange={(e) => setCriticalLevel(e.target.value)}
                  placeholder="500"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-medium text-gray-800"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  Nm²
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Enter a number between 0 and 9</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Edit Gas Tank Pressure Modal */}
      <ModalPortal isOpen={showPressureModal} onClose={() => setShowPressureModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Edit Gas Tank Pressure</h3>
              <p className="text-xs text-gray-400 mt-0.5">This field is for desc terms of service</p>
            </div>
            <button
              onClick={() => setShowPressureModal(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSavePressureModal} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Normal Pressure Threshold (bar)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={normalPressure}
                  onChange={(e) => setNormalPressure(e.target.value)}
                  placeholder="10"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-medium text-gray-800"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  bar
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Normal Green arc area spans from 0 to this value</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Warning Pressure Threshold (bar)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={warningPressure}
                  onChange={(e) => setWarningPressure(e.target.value)}
                  placeholder="15"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-medium text-gray-800"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  bar
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Warning Yellow arc area spans from Normal to this value</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Max Pressure (bar)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={maxPressureVal}
                  onChange={(e) => setMaxPressureVal(e.target.value)}
                  placeholder="20"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-medium text-gray-800"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  bar
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">High Red arc area spans from Warning to this maximum value</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowPressureModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
