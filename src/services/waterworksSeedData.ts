import {
  DetailedStorageTank,
  MainReservoirProfile,
  ChemicalInventoryItem,
  DailyWTPTestReport
} from '../types/waterDistribution';
import { calculateTankMetrics } from '../utils/tankCalculations';

// ========================================================
// 1. Initial Storage Tanks Dataset
// ========================================================
const tankDimensionsRaw = [
  {
    id: 'tank-mph-01',
    name: 'Main Pump House Tank 01 (Eastern Basin)',
    code: 'MPH-TK-01',
    classification: 'MAIN_PUMP_HOUSE' as const,
    waterType: 'STANDARD' as const,
    formFactor: 'RECTANGULAR_SUMP' as const,
    lengthMeters: 16.0,
    widthMeters: 10.0,
    totalHeightMeters: 4.8,
    usableHeightMeters: 4.2,
    deadStorageLiters: 15000,
    currentLevelMeters: 3.45,
    lowAlarmPercentage: 25,
    criticalAlarmPercentage: 15,
    locationArea: 'Dockyard Main Pump House Sump Complex',
    pocName: 'CPO (E) K.G. Somapala',
    pocPhone: '+94 77 345 8891'
  },
  {
    id: 'tank-mph-02',
    name: 'Main Pump House Tank 02 (Western Pure Sump)',
    code: 'MPH-TK-02',
    classification: 'MAIN_PUMP_HOUSE' as const,
    waterType: 'RO' as const,
    formFactor: 'RECTANGULAR_SUMP' as const,
    lengthMeters: 14.5,
    widthMeters: 10.0,
    totalHeightMeters: 4.5,
    usableHeightMeters: 4.0,
    deadStorageLiters: 12000,
    currentLevelMeters: 3.82,
    lowAlarmPercentage: 25,
    criticalAlarmPercentage: 15,
    locationArea: 'Dockyard Main Pump House Sump Complex',
    pocName: 'CPO (E) K.G. Somapala',
    pocPhone: '+94 77 345 8891'
  },
  {
    id: 'tank-oht-01',
    name: 'Anandamkulam Elevated Overhead Tower 01',
    code: 'OHT-01',
    classification: 'OVERHEAD_TOWER' as const,
    waterType: 'STANDARD' as const,
    formFactor: 'CYLINDRICAL_VERTICAL' as const,
    diameterMeters: 12.0,
    totalHeightMeters: 5.5,
    usableHeightMeters: 5.0,
    deadStorageLiters: 8000,
    currentLevelMeters: 4.15,
    lowAlarmPercentage: 30,
    criticalAlarmPercentage: 20,
    locationArea: 'Anandamkulam WTP High Ridge Staging (28m Elevation)',
    pocName: 'WO II (W) R.P. Dissanayake',
    pocPhone: '+94 71 882 1102'
  },
  {
    id: 'tank-oht-02',
    name: 'Naval Dockyard Central Gravity Tower 02',
    code: 'OHT-02',
    classification: 'OVERHEAD_TOWER' as const,
    waterType: 'STANDARD' as const,
    formFactor: 'CYLINDRICAL_VERTICAL' as const,
    diameterMeters: 10.0,
    totalHeightMeters: 6.0,
    usableHeightMeters: 5.4,
    deadStorageLiters: 7000,
    currentLevelMeters: 3.90,
    lowAlarmPercentage: 30,
    criticalAlarmPercentage: 15,
    locationArea: 'Dockyard Central Signal Station Hill',
    pocName: 'PO (W) M.N. Senanayake',
    pocPhone: '+94 77 441 9023'
  },
  {
    id: 'tank-chalet-01',
    name: "Area Commander's Flag Chalet Storage Tank",
    code: 'CHALET-TK',
    classification: 'VITAL_COMMAND_CHALET' as const,
    waterType: 'RO' as const,
    formFactor: 'CYLINDRICAL_VERTICAL' as const,
    diameterMeters: 3.2,
    totalHeightMeters: 3.2,
    usableHeightMeters: 3.0,
    deadStorageLiters: 500,
    currentLevelMeters: 2.65,
    lowAlarmPercentage: 40,
    criticalAlarmPercentage: 25,
    locationArea: "Eastern Command Chalet Residential Precinct",
    pocName: 'Flag Lieutenant G.T. Jayawardena',
    pocPhone: '+94 77 990 0112'
  },
  {
    id: 'tank-wardroom-01',
    name: 'Officers Wardroom Elevated Gravity Reservoir',
    code: 'WARDROOM-TK',
    classification: 'VITAL_WARDROOM' as const,
    waterType: 'RO' as const,
    formFactor: 'RECTANGULAR_SUMP' as const,
    lengthMeters: 6.0,
    widthMeters: 4.5,
    totalHeightMeters: 2.6,
    usableHeightMeters: 2.4,
    deadStorageLiters: 1000,
    currentLevelMeters: 1.85,
    lowAlarmPercentage: 35,
    criticalAlarmPercentage: 20,
    locationArea: 'Wardroom Senior Officers Mess Annex',
    pocName: 'Lt C. Wickramasinghe',
    pocPhone: '+94 71 987 6543'
  },
  {
    id: 'tank-hospital-01',
    name: 'Naval Base Hospital Critical Supply Reservoir',
    code: 'HOSPITAL-TK',
    classification: 'VITAL_BASE_HOSPITAL' as const,
    waterType: 'RO' as const,
    formFactor: 'RECTANGULAR_SUMP' as const,
    lengthMeters: 8.0,
    widthMeters: 5.5,
    totalHeightMeters: 3.2,
    usableHeightMeters: 3.0,
    deadStorageLiters: 2500,
    currentLevelMeters: 2.50,
    lowAlarmPercentage: 40,
    criticalAlarmPercentage: 25,
    locationArea: 'Base Hospital Trincomalee Intensive Care & Dialysis Wing',
    pocName: 'Surgeon Commander Dr. S. Rathnayake',
    pocPhone: '+94 77 220 5431'
  },
  {
    id: 'tank-poly-01',
    name: 'Jetty B Pier Heavy Dispenser (Poly Tank)',
    code: 'POLY-JETTY-01',
    classification: 'PLASTIC_SHELL_POLY' as const,
    waterType: 'STANDARD' as const,
    formFactor: 'CYLINDRICAL_VERTICAL' as const,
    diameterMeters: 1.85,
    totalHeightMeters: 2.2,
    usableHeightMeters: 2.0,
    deadStorageLiters: 50,
    currentLevelMeters: 1.45,
    lowAlarmPercentage: 25,
    criticalAlarmPercentage: 15,
    locationArea: 'Dockyard Jetty B Mooring Station',
    pocName: 'LS (B) H.M. Herath',
    pocPhone: '+94 77 114 6629'
  },
  {
    id: 'tank-sintec-01',
    name: 'Dockyard Marine Workshop Sintec 01',
    code: 'SINTEC-WKSH-01',
    classification: 'PLASTIC_SHELL_SINTEC' as const,
    waterType: 'STANDARD' as const,
    formFactor: 'CYLINDRICAL_VERTICAL' as const,
    diameterMeters: 1.55,
    totalHeightMeters: 1.9,
    usableHeightMeters: 1.75,
    deadStorageLiters: 40,
    currentLevelMeters: 1.30,
    lowAlarmPercentage: 25,
    criticalAlarmPercentage: 15,
    locationArea: 'Engineering Maintenance & Heavy Lathe Shop',
    pocName: 'PO (ME) D. Premasiri',
    pocPhone: '+94 71 445 7712'
  },
  {
    id: 'tank-sintec-02',
    name: 'Woman Sailors Quarters Drinking Sintec Unit',
    code: 'SINTEC-WSQ-02',
    classification: 'PLASTIC_SHELL_SINTEC' as const,
    waterType: 'RO' as const,
    formFactor: 'CYLINDRICAL_VERTICAL' as const,
    diameterMeters: 1.35,
    totalHeightMeters: 1.7,
    usableHeightMeters: 1.55,
    deadStorageLiters: 30,
    currentLevelMeters: 1.15,
    lowAlarmPercentage: 30,
    criticalAlarmPercentage: 15,
    locationArea: 'Naval Dockyard Female Living Block C',
    pocName: 'LS (WS) T. Samaranayake',
    pocPhone: '+94 77 662 3341'
  }
];

export const INITIAL_STORAGE_TANKS: DetailedStorageTank[] = tankDimensionsRaw.map(raw => {
  const metrics = calculateTankMetrics(
    {
      formFactor: raw.formFactor,
      lengthMeters: (raw as any).lengthMeters,
      widthMeters: (raw as any).widthMeters,
      diameterMeters: (raw as any).diameterMeters,
      totalHeightMeters: raw.totalHeightMeters,
      usableHeightMeters: raw.usableHeightMeters,
      deadStorageLiters: raw.deadStorageLiters
    },
    raw.currentLevelMeters
  );

  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    classification: raw.classification,
    waterType: raw.waterType,
    dimensions: {
      formFactor: raw.formFactor,
      lengthMeters: (raw as any).lengthMeters,
      widthMeters: (raw as any).widthMeters,
      diameterMeters: (raw as any).diameterMeters,
      totalHeightMeters: raw.totalHeightMeters,
      usableHeightMeters: raw.usableHeightMeters,
      deadStorageLiters: raw.deadStorageLiters,
      calculatedCapacityLiters: metrics.netCapacityLiters
    },
    currentLevelMeters: raw.currentLevelMeters,
    currentVolumeLiters: metrics.currentVolumeLiters,
    fillPercentage: metrics.fillPercentage,
    lowAlarmPercentage: raw.lowAlarmPercentage,
    criticalAlarmPercentage: raw.criticalAlarmPercentage,
    locationArea: raw.locationArea,
    pocName: raw.pocName,
    pocPhone: raw.pocPhone,
    lastUpdated: '2026-10-29 05:00'
  };
});

// ========================================================
// 2. Initial Main Reservoir & Wells Hydrology Profile
// ========================================================
export const INITIAL_MAIN_RESERVOIR: MainReservoirProfile = {
  reservoirName: 'ND Anandamkulam Main Raw Reservoir Basin',
  grossCapacityLiters: 45000000, // 45.0 Million Liters
  deadStorageLiters: 2500000,   // 2.5 Million Liters
  currentWaterLevelMeters: 6.85, // Current Level
  currentStorageLiters: 37200000, // ~82.6% Full
  freeboardMeters: 1.35,          // 8.2m Total Basin Crest - 6.85m Level
  intakeLossRatePercentage: 3.4,
  wells: [
    {
      wellId: 'well-01',
      wellName: 'Well #1 Deep Inflow Sump (Anandamkulam South)',
      invertLevelMeters: 1.2,
      waterColumnMeters: 5.65,
      sluiceGateOpenPercentage: 85,
      dischargeRateLps: 68.2,
      operationalStatus: 'ACTIVE'
    },
    {
      wellId: 'well-02',
      wellName: 'Well #2 Radial Collector (Central Basin Feeder)',
      invertLevelMeters: 1.8,
      waterColumnMeters: 5.05,
      sluiceGateOpenPercentage: 70,
      dischargeRateLps: 45.4,
      operationalStatus: 'ACTIVE'
    },
    {
      wellId: 'well-03',
      wellName: 'Well #3 Sump Intake (North Catchment Penstock)',
      invertLevelMeters: 2.1,
      waterColumnMeters: 4.75,
      sluiceGateOpenPercentage: 100,
      dischargeRateLps: 82.5,
      operationalStatus: 'ACTIVE'
    },
    {
      wellId: 'well-04',
      wellName: 'Well #4 Sub-surface Infiltration Gallery',
      invertLevelMeters: 2.5,
      waterColumnMeters: 3.15,
      sluiceGateOpenPercentage: 0,
      dischargeRateLps: 0.0,
      operationalStatus: 'SILTED'
    }
  ],
  rainfallRecords: [
    {
      id: 'rain-01',
      recordedDate: '2026-10-28',
      rainfallMm: 38.5,
      catchmentRunoffEstLiters: 4620000,
      recordedBy: 'PO (Met) D. Bandara'
    },
    {
      id: 'rain-02',
      recordedDate: '2026-10-27',
      rainfallMm: 22.0,
      catchmentRunoffEstLiters: 2640000,
      recordedBy: 'PO (Met) D. Bandara'
    },
    {
      id: 'rain-03',
      recordedDate: '2026-10-26',
      rainfallMm: 5.4,
      catchmentRunoffEstLiters: 648000,
      recordedBy: 'LS (Met) K. Kumara'
    },
    {
      id: 'rain-04',
      recordedDate: '2026-10-25',
      rainfallMm: 0.0,
      catchmentRunoffEstLiters: 0,
      recordedBy: 'LS (Met) K. Kumara'
    },
    {
      id: 'rain-05',
      recordedDate: '2026-10-24',
      rainfallMm: 14.2,
      catchmentRunoffEstLiters: 1704000,
      recordedBy: 'PO (Met) D. Bandara'
    }
  ]
};

// ========================================================
// 3. WTP Chemical Inventory
// ========================================================
export const INITIAL_CHEMICAL_INVENTORY: ChemicalInventoryItem[] = [
  {
    id: 'chem-pac-01',
    name: 'Poly Aluminium Chloride (PAC 10% Aqueous)',
    physicalForm: 'LIQUID_LITERS',
    currentStock: 4200,
    minimumThreshold: 1500,
    dailyAverageConsumption: 220,
    runwayDays: 19.1,
    reorderStatus: 'ADEQUATE'
  },
  {
    id: 'chem-cl2-01',
    name: 'Chlorine Gas Cylinders (68kg Pressurized Drums)',
    physicalForm: 'CYLINDERS',
    currentStock: 8,
    minimumThreshold: 4,
    dailyAverageConsumption: 0.35,
    runwayDays: 22.8,
    reorderStatus: 'ADEQUATE'
  },
  {
    id: 'chem-alum-01',
    name: 'Granular Aluminium Sulphate (Alum Standard)',
    physicalForm: 'DRY_KG',
    currentStock: 650,
    minimumThreshold: 500,
    dailyAverageConsumption: 48,
    runwayDays: 13.5,
    reorderStatus: 'REORDER_NOW'
  },
  {
    id: 'chem-lime-01',
    name: 'Hydrated Lime (Ca(OH)2 pH Stabilizer)',
    physicalForm: 'DRY_KG',
    currentStock: 240,
    minimumThreshold: 300,
    dailyAverageConsumption: 36,
    runwayDays: 6.7,
    reorderStatus: 'CRITICAL'
  },
  {
    id: 'chem-poly-01',
    name: 'Coagulant Aid Anionic Polymer (Flocculant)',
    physicalForm: 'DRY_KG',
    currentStock: 120,
    minimumThreshold: 40,
    dailyAverageConsumption: 2.5,
    runwayDays: 48.0,
    reorderStatus: 'ADEQUATE'
  }
];

// ========================================================
// 4. Initial WTP Daily Test Reports & Logs
// ========================================================
export const INITIAL_WTP_DAILY_REPORTS: DailyWTPTestReport[] = [
  {
    id: 'wtp-rep-2026-10-28',
    date: '2026-10-28',
    rawWaterInflowLiters: 1850000,
    treatedWaterOutflowLiters: 1780000,
    sludgeDischargeLiters: 70000,
    waterQuality: {
      rawTurbidityNtu: 18.5,
      treatedTurbidityNtu: 0.72,
      rawPh: 7.35,
      treatedPh: 7.15,
      residualChlorinePpm: 0.65,
      totalDissolvedSolidsPpm: 185.0,
      conductivityUsCm: 295.0,
      coliformBacteriologicalResult: 'SAFE_ZERO'
    },
    jarTest: {
      timestamp: '2026-10-28 08:30',
      rawWaterTurbidityNtu: 18.5,
      rawWaterPh: 7.35,
      waterTemperatureC: 28.5,
      optimalDosePpm: 24.0,
      selectedCoagulant: 'PAC',
      settledTurbidityNtu: 1.1,
      calculatedChemicalRequiredKg: 44.4
    },
    chemicalsConsumed: [
      { chemicalId: 'chem-pac-01', chemicalName: 'PAC 10%', quantityUsed: 220 },
      { chemicalId: 'chem-cl2-01', chemicalName: 'Chlorine Gas', quantityUsed: 22 },
      { chemicalId: 'chem-lime-01', chemicalName: 'Hydrated Lime', quantityUsed: 35 }
    ],
    plantOverheadTanks: [],
    plantTreatedStorageTanks: [],
    dutyRoster: [
      {
        shift: 'MORNING_WATCH',
        shiftEngineerRating: 'CPO (E) K.G. Somapala',
        pumpOperator: 'LS (ME) P. Kumara',
        labAnalyst: 'PO (Lab) S. Ranasinghe'
      },
      {
        shift: 'EVENING_WATCH',
        shiftEngineerRating: 'PO (E) N. Jayakody',
        pumpOperator: 'AB (ME) T. Wickrama',
        labAnalyst: 'LS (Lab) M. Perera'
      },
      {
        shift: 'NIGHT_WATCH',
        shiftEngineerRating: 'LS (E) C. Bandara',
        pumpOperator: 'AB (ME) G. Alwis',
        labAnalyst: 'LS (Lab) M. Perera'
      }
    ],
    aiWaterQualityInsight: {
      coagulantOptimizationAdvice:
        'Raw turbidity increased by 28% following 38.5mm rainfall. Coagulant floc formation verified at 24 ppm PAC. Recommended maintaining high clarifier sludge withdrawal.',
      chlorineDosingAdjustment:
        'Residual free chlorine stable at 0.65 ppm at clear water basin exit. Complies with SLS 614 standard.',
      filterBackwashRecommendation:
        'Sand filter differential head loss normal at 0.35 bar. Next backwash scheduled for 0200h routine.',
      anomalyDetected: false,
      confidenceScore: 94.5
    }
  },
  {
    id: 'wtp-rep-2026-10-27',
    date: '2026-10-27',
    rawWaterInflowLiters: 1920000,
    treatedWaterOutflowLiters: 1845000,
    sludgeDischargeLiters: 75000,
    waterQuality: {
      rawTurbidityNtu: 14.4,
      treatedTurbidityNtu: 0.68,
      rawPh: 7.42,
      treatedPh: 7.20,
      residualChlorinePpm: 0.70,
      totalDissolvedSolidsPpm: 178.0,
      conductivityUsCm: 288.0,
      coliformBacteriologicalResult: 'SAFE_ZERO'
    },
    jarTest: {
      timestamp: '2026-10-27 08:00',
      rawWaterTurbidityNtu: 14.4,
      rawWaterPh: 7.42,
      waterTemperatureC: 28.0,
      optimalDosePpm: 20.0,
      selectedCoagulant: 'PAC',
      settledTurbidityNtu: 0.95,
      calculatedChemicalRequiredKg: 38.4
    },
    chemicalsConsumed: [
      { chemicalId: 'chem-pac-01', chemicalName: 'PAC 10%', quantityUsed: 205 },
      { chemicalId: 'chem-cl2-01', chemicalName: 'Chlorine Gas', quantityUsed: 24 },
      { chemicalId: 'chem-lime-01', chemicalName: 'Hydrated Lime', quantityUsed: 30 }
    ],
    plantOverheadTanks: [],
    plantTreatedStorageTanks: [],
    dutyRoster: [
      {
        shift: 'MORNING_WATCH',
        shiftEngineerRating: 'CPO (E) K.G. Somapala',
        pumpOperator: 'LS (ME) P. Kumara',
        labAnalyst: 'PO (Lab) S. Ranasinghe'
      },
      {
        shift: 'EVENING_WATCH',
        shiftEngineerRating: 'PO (E) N. Jayakody',
        pumpOperator: 'AB (ME) T. Wickrama',
        labAnalyst: 'LS (Lab) M. Perera'
      },
      {
        shift: 'NIGHT_WATCH',
        shiftEngineerRating: 'LS (E) C. Bandara',
        pumpOperator: 'AB (ME) G. Alwis',
        labAnalyst: 'LS (Lab) M. Perera'
      }
    ],
    aiWaterQualityInsight: {
      coagulantOptimizationAdvice:
        'Optimal coagulation achieved with 20 ppm PAC. Clarifier supernatant clarity verified at 0.95 NTU.',
      chlorineDosingAdjustment:
        'Residual chlorine level meets naval dockyard requirements (0.70 ppm).',
      filterBackwashRecommendation: 'Routine backwash performed at 04:30. Head loss reset to 0.12 bar.',
      anomalyDetected: false,
      confidenceScore: 96.0
    }
  }
];
