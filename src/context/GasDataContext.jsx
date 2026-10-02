import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  INITIAL_LEVEL_CONFIG,
  INITIAL_PRESSURE_CONFIG,
  REALTIME_GAS_10_STEPS
} from '../data/mockData';

const GasDataContext = createContext(null);

export function GasDataProvider({ children }) {
  // Config states (Thresholds editable via modal in RealtimeMonitoringPage)
  const [levelConfig, setLevelConfig] = useState(INITIAL_LEVEL_CONFIG);
  const [pressureConfig, setPressureConfig] = useState(INITIAL_PRESSURE_CONFIG);

  // Realtime simulation state (transitions every 5 seconds)
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % REALTIME_GAS_10_STEPS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const currentStep = REALTIME_GAS_10_STEPS[stepIndex] || REALTIME_GAS_10_STEPS[0];
  const actualTankLevel = currentStep.actualTankLevel;
  const currentPressure = currentStep.tankPressure;
  const hourlyConsumption = currentStep.hourlyConsumption;

  /**
   * Generates chart trends and X-axis based on DatePicker filter mode:
   * 1. 'daily'   -> Sumbu X: Hours of the day (00:00, 02:00, ..., 22:00)
   * 2. 'monthly' -> Sumbu X: Days of the month (01, 02, ..., 30)
   * 3. 'yearly'  -> Sumbu X: 12 Months of the year (Jan, Feb, ..., Dec)
   */
  // Selected dashboard filter context (shared so Detail page knows what the user had selected on Dashboard)
  const [dashboardShift, setDashboardShift] = useState('Shift 1');
  const [dashboardDate, setDashboardDate] = useState(dayjs('2026-09-07'));
  const [dashboardFilterMode, setDashboardFilterMode] = useState('daily');

  /**
   * Unified computation engine for a single point in time (date + hour + minute + shift).
   * Guarantees 100% mathematical synchronization between Dashboard charts and Detail tables.
   */
  const computeGasPoint = (dateInput, hourNum, minuteNum = 0, shift = 'Shift 1') => {
    const dateObj = dayjs(dateInput);
    const isToday = dateObj.format('YYYY-MM-DD') === '2026-09-07' || dateObj.isSame(dayjs(), 'day');

    const shiftNum = shift?.includes('2') ? 2 : shift?.includes('3') ? 3 : 1;
    const shiftLevelFactor = shiftNum === 1 ? 1.0 : shiftNum === 2 ? 0.85 : 0.72;
    const shiftPressureFactor = shiftNum === 1 ? 1.0 : shiftNum === 2 ? 0.90 : 0.80;
    const shiftConsumptionFactor = shiftNum === 1 ? 1.0 : shiftNum === 2 ? 0.75 : 0.50;

    const liveConsumption = hourlyConsumption?.[hourlyConsumption.length - 1]?.consumption || 115;
    const timeFrac = hourNum + minuteNum / 60;
    const liveJitter = Math.sin(stepIndex + (timeFrac / 2) * 0.7) * 2;

    let levelVal, pressureVal, consumptionVal;

    if (isToday) {
      if (hourNum === 10 && minuteNum === 0) {
        // EXACT active realtime point
        levelVal = Math.round(actualTankLevel * shiftLevelFactor);
        pressureVal = Number((currentPressure * shiftPressureFactor).toFixed(1));
        consumptionVal = Math.min(150, Math.max(30, Math.round(liveConsumption * shiftConsumptionFactor)));
      } else if (timeFrac < 10) {
        const hoursAgo = (10 - timeFrac) / 2;
        const historicalOffset = hoursAgo * 260 + Math.sin((timeFrac / 2) * 1.5) * 80;
        levelVal = Math.min(
          levelConfig.tankMaxLevel,
          Math.round((actualTankLevel + historicalOffset) * shiftLevelFactor)
        );
        pressureVal = Number(
          Math.max(
            0.5,
            (currentPressure - hoursAgo * 0.3 + Math.cos((timeFrac / 2) * 1.2) * 0.25) * shiftPressureFactor
          ).toFixed(1)
        );
        const hcIdx = Math.min(hourlyConsumption.length - 1, Math.max(0, Math.floor(timeFrac)));
        const baseC = hourlyConsumption[hcIdx]?.consumption || (80 + Math.floor(timeFrac / 2) * 7);
        consumptionVal = Math.min(150, Math.max(25, Math.round(baseC * shiftConsumptionFactor + liveJitter)));
      } else {
        const hoursAhead = (timeFrac - 10) / 2;
        const futureDepletion = hoursAhead * 220 - Math.sin(hoursAhead * 1.4) * 90;
        levelVal = Math.max(
          200,
          Math.round((actualTankLevel - futureDepletion) * shiftLevelFactor)
        );
        pressureVal = Number(
          Math.max(
            0.5,
            (currentPressure + Math.sin(hoursAhead * 0.7) * 0.4) * shiftPressureFactor
          ).toFixed(1)
        );
        consumptionVal = Math.min(
          150,
          Math.max(
            25,
            Math.round((95 + Math.sin((timeFrac / 2) * 1.3) * 22) * shiftConsumptionFactor + liveJitter)
          )
        );
      }
    } else {
      const daySeed = (dateObj.unix() % 500) + Math.floor(timeFrac) * 17;
      const shiftPhase = (shiftNum - 1) * 2.1;
      const wave = Math.sin((timeFrac / 24) * Math.PI * 2 + shiftPhase);

      levelVal = Math.round(
        (7500 + wave * 1800 + ((daySeed * 37) % 600) - 300) * shiftLevelFactor
      );
      pressureVal = Number(
        ((9.5 + wave * 1.2 + ((daySeed * 13) % 15) / 10 - 0.7) * shiftPressureFactor).toFixed(1)
      );
      consumptionVal = Math.min(
        150,
        Math.max(
          25,
          Math.round((85 + wave * 30 + ((daySeed * 19) % 25) - 12) * shiftConsumptionFactor + liveJitter)
        )
      );
    }

    return {
      tankLevel: levelVal,
      tankPressure: pressureVal,
      consumption: consumptionVal
    };
  };

  /**
   * Generates chart trends and X-axis based on DatePicker filter mode and Shift:
   * 1. 'daily'   -> Sumbu X: Hours of the day (00:00, 02:00, ..., 22:00)
   * 2. 'monthly' -> Sumbu X: All days of the month (01, 02, ..., 30/31)
   * 3. 'yearly'  -> Sumbu X: 12 Months of the year (Jan, Feb, ..., Dec)
   */
  const getTrendsByFilter = (mode = 'daily', selectedDate = dayjs('2026-09-07'), shift = 'Shift 1') => {
    const dateObj = dayjs(selectedDate);
    const isToday = dateObj.format('YYYY-MM-DD') === '2026-09-07' || dateObj.isSame(dayjs(), 'day');

    const shiftNum = shift?.includes('2') ? 2 : shift?.includes('3') ? 3 : 1;
    const shiftLevelFactor = shiftNum === 1 ? 1.0 : shiftNum === 2 ? 0.85 : 0.72;
    const shiftPressureFactor = shiftNum === 1 ? 1.0 : shiftNum === 2 ? 0.90 : 0.80;
    const shiftConsumptionFactor = shiftNum === 1 ? 1.0 : shiftNum === 2 ? 0.75 : 0.50;

    // Realtime live values from the active step in GasDataContext
    const liveConsumption = hourlyConsumption?.[hourlyConsumption.length - 1]?.consumption || 115;

    // 1. DAILY MODE: Sumbu X adalah jam-jam dalam 1 hari
    if (mode === 'daily') {
      const hours = [
        '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
        '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
      ];

      return hours.map((hourStr) => {
        const hourNum = parseInt(hourStr.split(':')[0], 10);
        const point = computeGasPoint(dateObj, hourNum, 0, shift);

        return {
          label: hourStr,
          fullDate: `${dateObj.format('DD MMM YYYY')}, ${hourStr}`,
          tankLevel: point.tankLevel,
          tankPressure: point.tankPressure,
          consumption: point.consumption
        };
      });
    }

    // 2. MONTHLY MODE: Sumbu X adalah seluruh hari-hari dalam 1 bulan (01 s/d akhir bulan)
    if (mode === 'monthly') {
      const daysCount = dateObj.daysInMonth();
      const monthDays = [];

      for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
        const itemDate = dateObj.date(dayNum);
        const isSelectedDay = isToday && dayNum === 7;

        const daySeed = (itemDate.unix() % 700) + dayNum * (19 + shiftNum * 7) + (stepIndex % 5);
        const monthlyWave = Math.sin((dayNum / daysCount) * Math.PI * 4 + shiftNum);
        const liveJitter = Math.sin(stepIndex * 0.8 + dayNum * 0.6) * 3;

        let levelVal, pressureVal, consumptionVal;

        if (isSelectedDay) {
          levelVal = Math.round(actualTankLevel * shiftLevelFactor);
          pressureVal = Number((currentPressure * shiftPressureFactor).toFixed(1));
          consumptionVal = Math.min(150, Math.max(30, Math.round(liveConsumption * shiftConsumptionFactor)));
        } else {
          // Synchronized with realtime center scale
          levelVal = Math.round(
            (actualTankLevel + monthlyWave * 1200 + ((daySeed * 29) % 700) - 350) * shiftLevelFactor
          );
          levelVal = Math.max(400, Math.min(levelConfig.tankMaxLevel, levelVal));

          pressureVal = Number(
            (Math.max(0.5, (currentPressure + monthlyWave * 1.1 + ((daySeed * 17) % 15) / 10 - 0.7) * shiftPressureFactor)).toFixed(1)
          );

          consumptionVal = Math.min(
            150,
            Math.max(
              25,
              Math.round(
                (liveConsumption + monthlyWave * 22 + ((daySeed * 31) % 30) - 15 + liveJitter) * shiftConsumptionFactor
              )
            )
          );
        }

        monthDays.push({
          label: String(dayNum).padStart(2, '0'),
          fullDate: `${itemDate.format('DD MMM YYYY')}`,
          tankLevel: levelVal,
          tankPressure: pressureVal,
          consumption: consumptionVal
        });
      }

      return monthDays;
    }

    // 3. YEARLY MODE: Sumbu X adalah 12 bulan dalam 1 tahun (Jan s/d Dec)
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return monthNames.map((mName, mIdx) => {
      const isCurrentMonth = dateObj.year() === 2026 && mIdx === 8; // September 2026
      const yearSeed = dateObj.year() * 11 + mIdx * (31 + shiftNum * 13);
      const yearWave = Math.sin((mIdx / 12) * Math.PI * 2 + shiftNum);

      let levelVal, pressureVal, consumptionVal;

      if (isCurrentMonth) {
        levelVal = Math.round(actualTankLevel * shiftLevelFactor);
        pressureVal = Number((currentPressure * shiftPressureFactor).toFixed(1));
        consumptionVal = Math.min(150, Math.max(35, Math.round(liveConsumption * shiftConsumptionFactor)));
      } else {
        levelVal = Math.round(
          (actualTankLevel + yearWave * 1000 + ((yearSeed * 19) % 600) - 300) * shiftLevelFactor
        );
        levelVal = Math.max(500, Math.min(levelConfig.tankMaxLevel, levelVal));

        pressureVal = Number(
          (Math.max(0.5, (currentPressure + yearWave * 0.8 + ((yearSeed * 7) % 12) / 10 - 0.6) * shiftPressureFactor)).toFixed(1)
        );

        consumptionVal = Math.min(
          150,
          Math.max(
            30,
            Math.round(
              (liveConsumption + yearWave * 18 + ((yearSeed * 23) % 20) - 10) * shiftConsumptionFactor
            )
          )
        );
      }

      return {
        label: mName,
        fullDate: `${mName} ${dateObj.format('YYYY')}`,
        tankLevel: levelVal,
        tankPressure: pressureVal,
        consumption: consumptionVal
      };
    });
  };

  /**
   * Generates historical detail table records synchronized directly with the chart data.
   * Matches timestamps, shifts, and mathematical values computed by the chart engine.
   * @param {string} type - 'level' | 'pressure' | 'consumption'
   * @param {string} shift - 'Shift 1' | 'Shift 2' | 'Shift 3'
   * @param {Array<dayjs>|null} dateRange - [startDate, endDate]
   * @param {dayjs} baseDate - reference date (defaults to dashboardDate)
   */
  const getDetailRecords = (type = 'level', shift = 'Shift 1', dateRange = null, baseDate = dashboardDate) => {
    let startDay, endDay;
    if (dateRange && dateRange[0] && dateRange[1]) {
      startDay = dayjs(dateRange[0]).startOf('day');
      endDay = dayjs(dateRange[1]).startOf('day');
      if (startDay.isAfter(endDay)) {
        const temp = startDay;
        startDay = endDay;
        endDay = temp;
      }
    } else {
      endDay = dayjs(baseDate || '2026-09-07').startOf('day');
      startDay = endDay.subtract(5, 'day'); // 6 days total (e.g. 02/09 to 07/09)
    }

    const shiftNum = shift?.includes('2') ? 2 : shift?.includes('3') ? 3 : 1;
    const timeSlots = [];
    if (shiftNum === 1) {
      // Shift 1: 08:00 to 16:00 (17 records per day in 30-min steps)
      for (let h = 16; h >= 8; h--) {
        timeSlots.push({ h, m: 0 });
        if (h > 8) timeSlots.push({ h: h - 1, m: 30 });
      }
    } else if (shiftNum === 2) {
      // Shift 2: 16:00 to 24:00 (17 records per day in 30-min steps)
      timeSlots.push({ h: 23, m: 59 });
      for (let h = 23; h >= 16; h--) {
        if (h < 23) timeSlots.push({ h, m: 30 });
        timeSlots.push({ h, m: 0 });
      }
    } else {
      // Shift 3: 00:00 to 08:00 (17 records per day in 30-min steps)
      for (let h = 8; h >= 0; h--) {
        timeSlots.push({ h, m: 0 });
        if (h > 0) timeSlots.push({ h: h - 1, m: 30 });
      }
    }

    const records = [];
    let rowId = 1;

    let curr = endDay.clone();
    while (curr.isSame(startDay, 'day') || curr.isAfter(startDay, 'day')) {
      for (const slot of timeSlots) {
        const point = computeGasPoint(curr, slot.h, slot.m, shift);
        const timeStr = `${String(slot.h).padStart(2, '0')}:${String(slot.m).padStart(2, '0')}`;
        const timestamp = `${curr.format('DD/MM/YYYY')} ${timeStr}`;

        let val;
        if (type === 'level') {
          val = point.tankLevel;
        } else if (type === 'pressure') {
          val = point.tankPressure;
        } else {
          val = point.consumption;
        }

        records.push({
          id: rowId++,
          value: val,
          timestamp,
          rawDate: curr.hour(slot.h).minute(slot.m).valueOf()
        });
      }
      curr = curr.subtract(1, 'day');
    }

    return records;
  };

  const value = useMemo(() => ({
    levelConfig,
    setLevelConfig,
    pressureConfig,
    setPressureConfig,
    stepIndex,
    currentStep,
    actualTankLevel,
    currentPressure,
    hourlyConsumption,
    dashboardShift,
    setDashboardShift,
    dashboardDate,
    setDashboardDate,
    dashboardFilterMode,
    setDashboardFilterMode,
    computeGasPoint,
    getTrendsByFilter,
    getDetailRecords
  }), [
    levelConfig,
    pressureConfig,
    stepIndex,
    currentStep,
    actualTankLevel,
    currentPressure,
    hourlyConsumption,
    dashboardShift,
    dashboardDate,
    dashboardFilterMode
  ]);

  return (
    <GasDataContext.Provider value={value}>
      {children}
    </GasDataContext.Provider>
  );
}

export function useGasData() {
  const context = useContext(GasDataContext);
  if (!context) {
    throw new Error('useGasData must be used within a GasDataProvider');
  }
  return context;
}
