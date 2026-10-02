import React, { useState, useMemo } from 'react';
import { RotateCcw, CircleMinus, CirclePlus } from 'lucide-react';
import dayjs from 'dayjs';
import CustomDropdown from '../components/CustomDropdown';
import CustomDatePickerModal from '../components/CustomDatePickerModal';
import DashboardLineChart from '../components/DashboardLineChart';
import DashboardBarChart from '../components/DashboardBarChart';
import { useGasData } from '../context/GasDataContext';
import { INITIAL_SHIFTS } from '../data/mockData';

export default function DashboardPage({ onNavigateToDetail }) {
  // Independent Zoom levels for each chart (default 1 = 100% width, min 1, max 2.5)
  const [levelZoom, setLevelZoom] = useState(1);
  const [pressureZoom, setPressureZoom] = useState(1);
  const [consumptionZoom, setConsumptionZoom] = useState(1);

  // Consume shared realtime, threshold, and filter parameters
  const {
    levelConfig,
    pressureConfig,
    getTrendsByFilter,
    stepIndex,
    dashboardShift: selectedShift,
    setDashboardShift: setSelectedShift,
    dashboardDate: selectedDate,
    setDashboardDate: setSelectedDate,
    dashboardFilterMode: filterMode,
    setDashboardFilterMode: setFilterMode
  } = useGasData();

  // Retrieve data points dynamically based on Daily, Monthly, or Yearly filter and Shift
  const chartTrends = useMemo(() => {
    return getTrendsByFilter(filterMode, selectedDate, selectedShift);
  }, [getTrendsByFilter, filterMode, selectedDate, selectedShift, stepIndex]);

  const shiftOptions = INITIAL_SHIFTS.map((s) => ({
    label: s.shift,
    value: s.shift
  }));

  // Zoom handlers for Tank Level Chart
  const handleResetLevelZoom = () => setLevelZoom(1);
  const handleZoomOutLevel = () => setLevelZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))));
  const handleZoomInLevel = () => setLevelZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))));

  // Zoom handlers for Tank Pressure Chart
  const handleResetPressureZoom = () => setPressureZoom(1);
  const handleZoomOutPressure = () => setPressureZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))));
  const handleZoomInPressure = () => setPressureZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))));

  // Zoom handlers for Consumption Bar Chart
  const handleResetConsumptionZoom = () => setConsumptionZoom(1);
  const handleZoomOutConsumption = () => setConsumptionZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))));
  const handleZoomInConsumption = () => setConsumptionZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))));

  // Dynamic Y-axis labels for Tank Pressure with complete steps without gaps
  const maxP = pressureConfig.maxPressure || 20;
  const pressureYLabels = [
    String(maxP),
    String(Math.round(maxP * 0.75)),
    String(Math.round(maxP * 0.5)),
    String(Math.round(maxP * 0.25)),
    '0'
  ];

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-4 min-h-0 select-none">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] px-4 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1E232F]">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Visualize actual gas monitoring</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Shift Select - Height 38px */}
          <div className="w-28 sm:w-32">
            <CustomDropdown
              value={selectedShift}
              onChange={(val) => setSelectedShift(val)}
              options={shiftOptions}
              placeholder="Shift 1"
            />
          </div>

          {/* Custom DatePicker with Daily, Monthly, Yearly modes (Image 2) */}
          <CustomDatePickerModal
            selectedMode={filterMode}
            selectedDate={selectedDate}
            onChangeMode={(mode) => setFilterMode(mode)}
            onChangeDate={(date) => setSelectedDate(date)}
          />
        </div>
      </div>

      {/* Row 1: Tank Level & Tank Pressure Cards with 16px gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 items-stretch">
        {/* Card 1: Tank Level */}
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-3.5 sm:p-4 shadow-sm flex flex-col overflow-hidden h-full min-h-0">
          {/* 1. Header with Zoom and Detail Controls */}
          <div className="flex items-start justify-between flex-shrink-0 mb-1">
            <div>
              <h3 className="text-base font-bold text-[#1E232F] leading-tight">Tank Level</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {filterMode === 'daily'
                  ? 'Hourly gas volume for selected day'
                  : filterMode === 'monthly'
                  ? 'Daily gas volume for selected month'
                  : 'Monthly gas volume for selected year'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetLevelZoom}
                className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={handleZoomOutLevel}
                className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <CircleMinus className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={handleZoomInLevel}
                className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <CirclePlus className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => onNavigateToDetail?.('tank-level')}
                className="h-[34px] px-4 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs ml-1 cursor-pointer flex items-center"
              >
                Detail
              </button>
            </div>
          </div>

          {/* 2. Interactive Canvas Line Chart filling vertical space */}
          <div className="flex-1 min-h-0 relative w-full h-full my-0.5">
            <DashboardLineChart
              data={chartTrends}
              valueKey="tankLevel"
              labelKey="label"
              fullDateKey="fullDate"
              minY={0}
              maxY={levelConfig.tankMaxLevel || 12000}
              yAxisLabels={['12000', '10000', '8000', '6000', '4000', '2000', '0']}
              warningValue={levelConfig.normalThreshold}
              criticalValue={levelConfig.warningThreshold}
              lineColor="#00A854"
              unit="Nm²"
              zoomLevel={levelZoom}
              valueLabel="Value"
            />
          </div>

          {/* 3. Legend */}
          <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-600 flex-shrink-0 mt-1 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A854]" />
              <span>Value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC30F]" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F04438]" />
              <span>Critical</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tank Pressure */}
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-3.5 sm:p-4 shadow-sm flex flex-col overflow-hidden h-full min-h-0">
          {/* 1. Header with Zoom and Detail Controls */}
          <div className="flex items-start justify-between flex-shrink-0 mb-1">
            <div>
              <h3 className="text-base font-bold text-[#1E232F] leading-tight">Tank Pressure</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {filterMode === 'daily'
                  ? 'Hourly gas pressure for selected day'
                  : filterMode === 'monthly'
                  ? 'Daily gas pressure for selected month'
                  : 'Monthly gas pressure for selected year'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetPressureZoom}
                className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={handleZoomOutPressure}
                className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <CircleMinus className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={handleZoomInPressure}
                className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <CirclePlus className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => onNavigateToDetail?.('tank-pressure')}
                className="h-[34px] px-4 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs ml-1 cursor-pointer flex items-center"
              >
                Detail
              </button>
            </div>
          </div>

          {/* 2. Interactive Canvas Line Chart filling vertical space */}
          <div className="flex-1 min-h-0 relative w-full h-full my-0.5">
            <DashboardLineChart
              data={chartTrends}
              valueKey="tankPressure"
              labelKey="label"
              fullDateKey="fullDate"
              minY={0}
              maxY={maxP}
              yAxisLabels={pressureYLabels}
              warningValue={pressureConfig.normalThreshold}
              criticalValue={pressureConfig.warningThreshold}
              lineColor="#2196F3"
              unit="bar"
              zoomLevel={pressureZoom}
              valueLabel="Value"
            />
          </div>

          {/* 3. Legend */}
          <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-600 flex-shrink-0 mt-1 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2196F3]" />
              <span>Value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC30F]" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F04438]" />
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Gas Tank Consumption (Full Width Card) */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] p-3.5 sm:p-4 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
        {/* 1. Header with Zoom and Detail Controls */}
        <div className="flex items-start justify-between flex-shrink-0 mb-1">
          <div>
            <h3 className="text-base font-bold text-[#1E232F] leading-tight">Gas Tank Consumption</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {filterMode === 'daily'
                ? 'Hourly consumption rate for selected day'
                : filterMode === 'monthly'
                ? 'Daily consumption breakdown for selected month'
                : 'Monthly consumption volume for selected year'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetConsumptionZoom}
              className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={handleZoomOutConsumption}
              className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <CircleMinus className="w-4 h-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={handleZoomInConsumption}
              className="p-1.5 text-[#475467] hover:text-[#1E232F] hover:bg-gray-100 rounded-md active:scale-90 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <CirclePlus className="w-4 h-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => onNavigateToDetail?.('tank-consumption')}
              className="h-[34px] px-4 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs ml-1 cursor-pointer flex items-center"
            >
              Detail
            </button>
          </div>
        </div>

        {/* 2. Interactive Canvas Bar Chart with Sumbu X positioned inside line frame */}
        <div className="flex-1 min-h-0 relative w-full h-full my-0.5">
          <DashboardBarChart
            data={chartTrends}
            valueKey="consumption"
            labelKey="label"
            fullDateKey="fullDate"
            maxY={150}
            yAxisLabels={['150', '125', '100', '75', '50', '25', '0']}
            barColor="#2196F3"
            hoverBarColor="#1E88E5"
            unit="Nm³"
            zoomLevel={consumptionZoom}
          />
        </div>

        {/* 3. Legend */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600 flex-shrink-0 mt-1 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2196F3]" />
          <span>Consumption</span>
        </div>
      </div>
    </div>
  );
}
