export interface PumpTelemetry {
  pumpId: string;
  name: string; // e.g., "Well Pump #01 (Submersible)", "High Lift Pump #02"
  location: string;
  ratedCapacityLph: number;
  motorRatingKw: number;
  status: 'RUNNING' | 'STANDBY' | 'TRIPPED' | 'MAINTENANCE';
  runHoursToday: number;
  totalRunHours: number;
  currentAmps: number;
  ratedAmps: number;
  bearingVibrationMmS: number; // Condition monitoring
  windingTempCelsius: number;
  lastServicedDate: string;
  nextServiceDueHours: number;
}

export interface WellTreatmentLog {
  id: string;
  timestamp: string;
  rawWaterPumpedLiters: number;
  treatedWaterYieldLiters: number;
  backwashLossLiters: number;
  treatmentChemicals: {
    alumOrPacKg: number;
    limeKg: number;
    chlorineKg: number;
  };
  waterQuality: {
    turbidityNtu: number;       // SLS 614 standard: < 2.0 NTU
    ph: number;                 // Standard: 6.5 - 8.5
    ironMgL: number;            // Ground water parameter: < 0.3 mg/L
    totalHardnessMgL: number;   // As CaCO3: < 250 mg/L
    residualChlorinePpm: number;// 0.2 - 0.5 ppm
    ecoliColiform: 'PASS_NIL' | 'FAIL_DETECTED';
  };
  analystBadge: string;
  remarks: string;
}

export interface InternalPremisesBilling {
  id: string;
  premisesCode: string; // Messes, Workshops, Hospital, Ship berths
  premisesName: string;
  meterNumber: string;
  billingMonth: string; // YYYY-MM
  previousReadingUnits: number; // 1 unit = 1,000 Liters (1 m³)
  currentReadingUnits: number;
  consumedUnits: number;
  internalAccountingRatePerUnit: number;
  totalComputedCostLkr: number;
}
