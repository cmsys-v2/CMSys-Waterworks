export type WaterType = 'RO Water' | 'Normal Water' | 'Well Water';

export type LocationType =
  | 'Accomodation - Officers'
  | 'Accomodation - Sailors'
  | 'Accomodation - Woman Sailors'
  | 'Accomodation - Civil Staff'
  | 'Hotel / Holiday Bungalow'
  | 'Industrial / Workshop'
  | 'Hospital / Medical';

export type RequestStatus = 'Pending' | 'Priority' | 'Assigned' | 'In-Transit' | 'Fulfilled' | 'Rejected';

export type UserRole = 'Master Admin' | 'Admin' | 'Viewer';

export interface ScheduleItem {
  id: string;
  pipelinePlace: string;
  waterType: WaterType;
  quantity: number; // in Liters
  locationName: string;
  approxTime: string; // HH:mm format
  status: 'Scheduled' | 'Delivered' | 'In-Transit' | 'Skipped';
  remarks?: string;
}

export interface BowserRegistryEntry {
  srNo: string; // e.g. SR-01, SR-02 ... SR-30
  vehicleNo: string; // Naha No (e.g. NAHA-01 ... NAHA-30)
  pin: string; // Predetermined PIN (e.g. 1001 ... 1030)
  capacity: number; // in Liters
  defaultTaName: string; // Transport Assistant name
  defaultTaNumber?: string; // TA Official Number
  defaultMeName: string; // Engineering Mechanic name
  defaultMeNumber?: string; // ME Official Number
}

export interface BowserDuty {
  id: string;
  srNo?: string;
  capacity: number; // in Liters
  vehicleNo: string; // Naha No
  taName: string; // Transport Assistant name
  taNumber: string; // TA Official Number
  taContract: string; // TA Phone / Contract info
  dutyMeName: string; // Engineering Mechanic name
  dutyMeNumber: string; // ME Official Number
  dutyMeContract: string; // ME Phone / Contract info
  dutyDate: string; // YYYY-MM-DD
  status: 'Active' | 'Completed' | 'Standby';
  schedule: ScheduleItem[];
  createdAt: string;
}

export interface LoadingLog {
  id: string;
  locationName: string;
  volumeLoaded: number; // Liters
  waterType: WaterType;
  timestamp: string; // Date & Time string
  isManualOverride: boolean;
  bowserVehicleNo: string;
  bowserPinVerified?: boolean;
  startTime?: string;
  stopTime?: string;
  durationSeconds?: number;
  pumpMode?: 'Loading' | 'Unloading' | 'Tank Empty' | 'Arrived Pump House' | 'Arrived Dockyard';
  operatorName?: string;
  gantryOperator?: string;
  remarks?: string;
  createdAt: string;
}

export interface PointOfContact {
  name: string;
  rank: string;
  phone: string;
  department: string;
}

export interface FutureSchedule {
  id: string;
  scheduledDate: string; // YYYY-MM-DD
  approxTime: string;
  expectedVolume: number; // Liters
  bowserVehicleNo: string;
  waterType: WaterType;
  status: 'Scheduled' | 'Confirmed' | 'Completed';
}

export interface BowserSupplyLog {
  id: string;
  date: string;
  bowserVehicleNo: string;
  waterType: WaterType;
  amountLoaded: number; // Liters
  locationName?: string;
  driverName?: string;
}

export interface WaterLocation {
  id: string;
  name: string;
  base: string; // e.g. SLNS Gemunu, Naval Dockyard East, Fleet Maintenance, SLNS Tissa
  category: 'RO' | 'Standard';
  locationType?: LocationType;
  tankCapacity: number; // Liters
  currentLevel: number; // Liters
  lastLoadedDate: string; // YYYY-MM-DD HH:mm
  lastLoadedAmount: number; // Liters
  monthlyAvgConsumption: number; // Liters / month
  consumingPeopleCount: number;
  benefactors: string[];
  pointOfContact: PointOfContact;
  coordinates?: {
    lat: number;
    lng: number;
  };
  futureSchedules: FutureSchedule[];
  supplyHistory: BowserSupplyLog[];
  isPriority: boolean;
  priorityReason?: string;
  createdAt: string;
}

export interface WaterRequest {
  id: string;
  locationId: string;
  locationName: string;
  base: string;
  category: 'RO' | 'Standard';
  waterType: WaterType;
  requiredVolume: number; // Liters
  urgency: 'Standard' | 'Urgent' | 'Emergency';
  isPriority: boolean;
  status: RequestStatus;
  requestedBy: string;
  contactPhone: string;
  requestedAt: string;
  remarks?: string;
}

export interface AdminUser {
  uid: string;
  username: string;
  name: string;
  role: UserRole;
  badgeNumber: string;
  password?: string;
}


// ========================================================
// 1. Structural Tank Geometry & Capacity
// ========================================================
export type TankFormFactor = 'CYLINDRICAL_VERTICAL' | 'CYLINDRICAL_HORIZONTAL' | 'RECTANGULAR_SUMP';

export type TankClassification = 
  | 'MAIN_PUMP_HOUSE'
  | 'OVERHEAD_TOWER'
  | 'VITAL_COMMAND_CHALET'
  | 'VITAL_WARDROOM'
  | 'VITAL_BASE_HOSPITAL'
  | 'PLASTIC_SHELL_SINTEC'
  | 'PLASTIC_SHELL_POLY';

export interface TankDimensions {
  formFactor: TankFormFactor;
  lengthMeters?: number;   // Rectangular
  widthMeters?: number;    // Rectangular
  diameterMeters?: number; // Cylindrical
  totalHeightMeters: number;
  usableHeightMeters: number;
  deadStorageLiters: number;
  calculatedCapacityLiters: number;
}

export interface DetailedStorageTank {
  id: string;
  name: string;
  code: string; // e.g., MPH-TK-01, OHT-01, CHALET-TK
  classification: TankClassification;
  waterType: 'RO' | 'STANDARD' | 'RAW_SURFACE';
  dimensions: TankDimensions;
  currentLevelMeters: number;
  currentVolumeLiters: number;
  fillPercentage: number;
  lowAlarmPercentage: number;
  criticalAlarmPercentage: number;
  locationArea: string;
  pocName?: string;
  pocPhone?: string;
  lastUpdated: string;
}

// ========================================================
// 2. Reservoir, Well Inlets & Rainfall Telemetry
// ========================================================
export interface WellIntakeLevel {
  wellId: string;
  wellName: string; // e.g., Well #1 Deep Inflow, Well #2 Radial Collector
  invertLevelMeters: number;
  waterColumnMeters: number;
  sluiceGateOpenPercentage: number;
  dischargeRateLps: number; // Liters per second
  operationalStatus: 'ACTIVE' | 'ISOLATED' | 'SILTED';
}

export interface RainfallRecord {
  id: string;
  recordedDate: string; // YYYY-MM-DD
  rainfallMm: number;
  catchmentRunoffEstLiters: number;
  recordedBy: string;
}

export interface MainReservoirProfile {
  reservoirName: string;
  grossCapacityLiters: number;
  deadStorageLiters: number;
  currentWaterLevelMeters: number;
  currentStorageLiters: number;
  freeboardMeters: number;
  wells: WellIntakeLevel[];
  rainfallRecords: RainfallRecord[];
  intakeLossRatePercentage: number;
}

// ========================================================
// 3. ND Anandamkulam Water Treatment Plant (WTP)
// ========================================================
export interface ChemicalInventoryItem {
  id: string;
  name: string; // PAC (Poly Aluminium Chloride), Chlorine Gas, Alum, Lime, Polymer
  physicalForm: 'LIQUID_LITERS' | 'DRY_KG' | 'CYLINDERS';
  currentStock: number;
  minimumThreshold: number;
  dailyAverageConsumption: number;
  runwayDays: number;
  reorderStatus: 'ADEQUATE' | 'REORDER_NOW' | 'CRITICAL';
}

export interface JarTestExecution {
  timestamp: string;
  rawWaterTurbidityNtu: number;
  rawWaterPh: number;
  waterTemperatureC: number;
  optimalDosePpm: number; // mg/L
  selectedCoagulant: 'PAC' | 'ALUM';
  settledTurbidityNtu: number;
  calculatedChemicalRequiredKg: number; // Computed against raw water intake volume
}

export interface DailyWTPTestReport {
  id: string;
  date: string;
  rawWaterInflowLiters: number;
  treatedWaterOutflowLiters: number;
  sludgeDischargeLiters: number;
  waterQuality: {
    rawTurbidityNtu: number;
    treatedTurbidityNtu: number;
    rawPh: number;
    treatedPh: number;
    residualChlorinePpm: number;
    totalDissolvedSolidsPpm: number;
    conductivityUsCm?: number;
    coliformBacteriologicalResult: 'SAFE_ZERO' | 'DETECTED_FAILED' | 'PENDING';
  };
  jarTest: JarTestExecution;
  chemicalsConsumed: {
    chemicalId: string;
    chemicalName: string;
    quantityUsed: number;
  }[];
  plantOverheadTanks: DetailedStorageTank[];
  plantTreatedStorageTanks: DetailedStorageTank[];
  dutyRoster: {
    shift: 'MORNING_WATCH' | 'EVENING_WATCH' | 'NIGHT_WATCH';
    shiftEngineerRating: string;
    pumpOperator: string;
    labAnalyst: string;
  }[];
  aiWaterQualityInsight?: {
    coagulantOptimizationAdvice: string;
    chlorineDosingAdjustment: string;
    filterBackwashRecommendation: string;
    anomalyDetected: boolean;
    confidenceScore: number;
  };
}
