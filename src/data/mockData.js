// ==========================================
// ASTEMO - GAS MONITORING MOCK DATA
// ==========================================

export const INITIAL_USERS = [
  {
    id: 1,
    idCard: 'AST-SA-001',
    name: 'Affan Astemo',
    username: 'affan_astemo',
    role: 'Superadmin',
    password: 'password123',
    datetime: '06/09/2026 12:00'
  },
  {
    id: 2,
    idCard: 'AST-AD-002',
    name: 'Kevin Pratama',
    username: 'kevin_astemo',
    role: 'Admin',
    password: 'password123',
    datetime: '06/09/2026 12:00'
  },
  {
    id: 3,
    idCard: 'AST-OP-003',
    name: 'Suep Suryadi',
    username: 'suep_astemo',
    role: 'Operator',
    password: 'password123',
    datetime: '07/09/2026 09:00'
  }
];

export const INITIAL_ROLES = [
  {
    id: 1,
    role: 'Superadmin',
    menus: [
      'Realtime Monitoring',
      'Dashboard',
      'Master Data'
    ],
    permissions: [
      'Create, Read, Update, Delete',
      'Create, Read, Update, Delete',
      'Create, Read, Update, Delete'
    ],
    datetime: '06/09/2026 12:00'
  },
  {
    id: 2,
    role: 'Admin',
    menus: [
      'Realtime Monitoring',
      'Dashboard',
      'Master Data'
    ],
    permissions: [
      'Create, Read, Update, Delete',
      'Create, Read, Update, Delete',
      'Create, Read, Update, Delete'
    ],
    datetime: '06/09/2026 12:00'
  },
  {
    id: 3,
    role: 'Operator',
    menus: ['Realtime Monitoring', 'Dashboard'],
    permissions: ['Read', 'Read'],
    datetime: '07/09/2026 09:00'
  }
];

// ==========================================
// REALTIME GAS MONITORING SPECS & THRESHOLDS
// ==========================================
export const INITIAL_GAS_CONFIG = {
  tankMaxLevel: 12000,
  actualTankLevel: 7200,
  tankUnit: 'Nm²',
  tankPressure: 8,
  maxPressure: 20,
  pressureUnit: 'bar',
  pressureStatus: 'Normal', // Normal, Warning, High
  normalThreshold: 5000,
  warningThreshold: 2000,
  criticalThreshold: 500
};

export const INITIAL_PRESSURE_CONFIG = {
  tankPressure: 8.0,
  maxPressure: 20,
  pressureUnit: 'bar',
  normalThreshold: 10,
  warningThreshold: 15
};

export const INITIAL_LEVEL_CONFIG = {
  tankMaxLevel: 12000,
  actualTankLevel: 7200,
  tankUnit: 'Nm²',
  normalThreshold: 5000,
  warningThreshold: 2000,
  criticalThreshold: 500
};

export const REALTIME_GAS_10_STEPS = [
  {
    step: 1,
    actualTankLevel: 7200,
    tankPressure: 8.0,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 100 },
      { time: '07:00', consumption: 55 },
      { time: '08:00', consumption: 70 },
      { time: '09:00', consumption: 65 },
      { time: '10:00', consumption: 135 }
    ]
  },
  {
    step: 2,
    actualTankLevel: 6850,
    tankPressure: 9.2,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 100 },
      { time: '07:00', consumption: 55 },
      { time: '08:00', consumption: 70 },
      { time: '09:00', consumption: 75 },
      { time: '10:00', consumption: 120 }
    ]
  },
  {
    step: 3,
    actualTankLevel: 5400,
    tankPressure: 10.8,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 105 },
      { time: '07:00', consumption: 65 },
      { time: '08:00', consumption: 78 },
      { time: '09:00', consumption: 85 },
      { time: '10:00', consumption: 115 }
    ]
  },
  {
    step: 4,
    actualTankLevel: 4500,
    tankPressure: 12.4,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 110 },
      { time: '07:00', consumption: 75 },
      { time: '08:00', consumption: 88 },
      { time: '09:00', consumption: 95 },
      { time: '10:00', consumption: 128 }
    ]
  },
  {
    step: 5,
    actualTankLevel: 3600,
    tankPressure: 14.2,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 115 },
      { time: '07:00', consumption: 85 },
      { time: '08:00', consumption: 98 },
      { time: '09:00', consumption: 110 },
      { time: '10:00', consumption: 142 }
    ]
  },
  {
    step: 6,
    actualTankLevel: 2300,
    tankPressure: 16.6,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 120 },
      { time: '07:00', consumption: 92 },
      { time: '08:00', consumption: 108 },
      { time: '09:00', consumption: 125 },
      { time: '10:00', consumption: 150 }
    ]
  },
  {
    step: 7,
    actualTankLevel: 1650,
    tankPressure: 17.5,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 125 },
      { time: '07:00', consumption: 98 },
      { time: '08:00', consumption: 115 },
      { time: '09:00', consumption: 135 },
      { time: '10:00', consumption: 148 }
    ]
  },
  {
    step: 8,
    actualTankLevel: 1150,
    tankPressure: 13.0,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 110 },
      { time: '07:00', consumption: 80 },
      { time: '08:00', consumption: 90 },
      { time: '09:00', consumption: 100 },
      { time: '10:00', consumption: 125 }
    ]
  },
  {
    step: 9,
    actualTankLevel: 3600,
    tankPressure: 9.6,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 100 },
      { time: '07:00', consumption: 65 },
      { time: '08:00', consumption: 72 },
      { time: '09:00', consumption: 80 },
      { time: '10:00', consumption: 115 }
    ]
  },
  {
    step: 10,
    actualTankLevel: 8200,
    tankPressure: 7.6,
    hourlyConsumption: [
      { time: '01:00', consumption: 140 },
      { time: '02:00', consumption: 110 },
      { time: '03:00', consumption: 140 },
      { time: '04:00', consumption: 110 },
      { time: '05:00', consumption: 140 },
      { time: '06:00', consumption: 95 },
      { time: '07:00', consumption: 55 },
      { time: '08:00', consumption: 65 },
      { time: '09:00', consumption: 68 },
      { time: '10:00', consumption: 130 }
    ]
  }
];

// Historical Data for Detail Tables
export const INITIAL_TANK_LEVEL_DETAILS = [
  { id: 1, value: 12000, timestamp: '06/09/2026 12:00' },
  { id: 2, value: 11500, timestamp: '06/09/2026 12:00' },
  { id: 3, value: 10622, timestamp: '06/09/2026 12:00' },
  { id: 4, value: 970, timestamp: '06/09/2026 12:00' },
  { id: 5, value: 900, timestamp: '06/09/2026 12:00' },
  { id: 6, value: 846, timestamp: '06/09/2026 12:00' },
  { id: 7, value: 802, timestamp: '06/09/2026 12:00' },
  { id: 8, value: 790, timestamp: '06/09/2026 12:00' },
  { id: 9, value: 720, timestamp: '06/09/2026 12:00' },
  { id: 10, value: 600, timestamp: '06/09/2026 12:00' },
  { id: 11, value: 580, timestamp: '06/09/2026 11:30' },
  { id: 12, value: 560, timestamp: '06/09/2026 11:00' },
  { id: 13, value: 540, timestamp: '06/09/2026 10:30' },
  { id: 14, value: 520, timestamp: '06/09/2026 10:00' },
  { id: 15, value: 500, timestamp: '06/09/2026 09:30' },
  { id: 16, value: 490, timestamp: '06/09/2026 09:00' },
  { id: 17, value: 470, timestamp: '06/09/2026 08:30' },
  { id: 18, value: 450, timestamp: '06/09/2026 08:00' },
  { id: 19, value: 430, timestamp: '06/09/2026 07:30' },
  { id: 20, value: 410, timestamp: '06/09/2026 07:00' }
];

export const INITIAL_TANK_PRESSURE_DETAILS = [
  { id: 1, value: 8, timestamp: '06/09/2026 12:00' },
  { id: 2, value: 8.5, timestamp: '06/09/2026 11:30' },
  { id: 3, value: 9.0, timestamp: '06/09/2026 11:00' },
  { id: 4, value: 8.2, timestamp: '06/09/2026 10:30' },
  { id: 5, value: 7.8, timestamp: '06/09/2026 10:00' },
  { id: 6, value: 8.0, timestamp: '06/09/2026 09:30' },
  { id: 7, value: 8.4, timestamp: '06/09/2026 09:00' },
  { id: 8, value: 9.1, timestamp: '06/09/2026 08:30' },
  { id: 9, value: 8.7, timestamp: '06/09/2026 08:00' },
  { id: 10, value: 8.0, timestamp: '06/09/2026 07:30' },
  { id: 11, value: 7.5, timestamp: '06/09/2026 07:00' },
  { id: 12, value: 7.9, timestamp: '06/09/2026 06:30' }
];

export const INITIAL_TANK_CONSUMPTION_DETAILS = [
  { id: 1, value: 140, timestamp: '06/09/2026 10:00' },
  { id: 2, value: 65, timestamp: '06/09/2026 09:00' },
  { id: 3, value: 70, timestamp: '06/09/2026 08:00' },
  { id: 4, value: 55, timestamp: '06/09/2026 07:00' },
  { id: 5, value: 100, timestamp: '06/09/2026 06:00' },
  { id: 6, value: 140, timestamp: '06/09/2026 05:00' },
  { id: 7, value: 110, timestamp: '06/09/2026 04:00' },
  { id: 8, value: 140, timestamp: '06/09/2026 03:00' },
  { id: 9, value: 110, timestamp: '06/09/2026 02:00' },
  { id: 10, value: 140, timestamp: '06/09/2026 01:00' }
];

// ==========================================
// MASTER DATA (GAS MONITORING)
// ==========================================
export const INITIAL_SHIFTS = [
  { id: 1, shift: 'Shift 1', startTime: '08:00', endTime: '16:00', datetime: '06/09/2026 12:00' },
  { id: 2, shift: 'Shift 2', startTime: '16:00', endTime: '24:00', datetime: '06/09/2026 12:00' },
  { id: 3, shift: 'Shift 3', startTime: '24:00', endTime: '08:00', datetime: '06/09/2026 12:00' }
];

export const INITIAL_PARAMETERS = [
  { id: 1, parameter: 'Gas Level', unit: 'Nm²', datetime: '06/09/2026 12:00' },
  { id: 2, parameter: 'Gas Pressure', unit: 'bar', datetime: '06/09/2026 12:00' },
  { id: 3, parameter: 'Gas Consumption', unit: 'Nm³/h', datetime: '06/09/2026 12:00' }
];
