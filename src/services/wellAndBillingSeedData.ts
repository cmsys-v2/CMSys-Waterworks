import { PumpTelemetry, WellTreatmentLog, InternalPremisesBilling } from '../types/wellWaterTreatment';
import { NonNavalConsumer, CommercialWaterBill, ConsumerPaymentReceipt } from '../types/commercialBilling';
import { computeCommercialBill } from './tariffEngine';

// ========================================================
// 1. Initial Pump Telemetry & Motor Condition
// ========================================================
export const INITIAL_PUMP_TELEMETRY: PumpTelemetry[] = [
  {
    pumpId: 'PUMP-W01',
    name: 'Well Pump #01 (Submersible Deep Intake)',
    location: 'Anandamkulam South Deep Inflow Sump',
    ratedCapacityLph: 65000,
    motorRatingKw: 18.5,
    status: 'RUNNING',
    runHoursToday: 6.8,
    totalRunHours: 3420,
    currentAmps: 34.2,
    ratedAmps: 36.0,
    bearingVibrationMmS: 2.1,
    windingTempCelsius: 58.4,
    lastServicedDate: '2026-09-15',
    nextServiceDueHours: 580
  },
  {
    pumpId: 'PUMP-W02',
    name: 'Well Pump #02 (Submersible Radial Collector)',
    location: 'Anandamkulam Central Basin Radial Sump',
    ratedCapacityLph: 45000,
    motorRatingKw: 15.0,
    status: 'RUNNING',
    runHoursToday: 6.2,
    totalRunHours: 4180,
    currentAmps: 28.5,
    ratedAmps: 30.0,
    bearingVibrationMmS: 2.4,
    windingTempCelsius: 61.2,
    lastServicedDate: '2026-08-20',
    nextServiceDueHours: 320
  },
  {
    pumpId: 'PUMP-HL01',
    name: 'High Lift Delivery Pump #01 (Centrifugal)',
    location: 'Main Pump House Gantry Bay A',
    ratedCapacityLph: 90000,
    motorRatingKw: 30.0,
    status: 'RUNNING',
    runHoursToday: 7.5,
    totalRunHours: 5210,
    currentAmps: 54.0,
    ratedAmps: 58.0,
    bearingVibrationMmS: 3.1,
    windingTempCelsius: 64.8,
    lastServicedDate: '2026-09-02',
    nextServiceDueHours: 790
  },
  {
    pumpId: 'PUMP-HL02',
    name: 'High Lift Delivery Pump #02 (Centrifugal Standby)',
    location: 'Main Pump House Gantry Bay B',
    ratedCapacityLph: 90000,
    motorRatingKw: 30.0,
    status: 'STANDBY',
    runHoursToday: 0.0,
    totalRunHours: 4890,
    currentAmps: 0.0,
    ratedAmps: 58.0,
    bearingVibrationMmS: 0.0,
    windingTempCelsius: 29.0,
    lastServicedDate: '2026-09-22',
    nextServiceDueHours: 1110
  },
  {
    pumpId: 'PUMP-BW01',
    name: 'Dual-Media Filter Backwash & Scour Pump',
    location: 'WTP Rapid Sand Filter Gallery',
    ratedCapacityLph: 120000,
    motorRatingKw: 37.0,
    status: 'STANDBY',
    runHoursToday: 0.75,
    totalRunHours: 1850,
    currentAmps: 0.0,
    ratedAmps: 72.0,
    bearingVibrationMmS: 0.0,
    windingTempCelsius: 32.0,
    lastServicedDate: '2026-10-05',
    nextServiceDueHours: 1150
  },
  {
    pumpId: 'PUMP-TRIP01',
    name: 'Raw Sump Sludge Desludging Pump #03',
    location: 'Clarifier Sludge Pit #2',
    ratedCapacityLph: 35000,
    motorRatingKw: 11.0,
    status: 'TRIPPED',
    runHoursToday: 1.2,
    totalRunHours: 6100,
    currentAmps: 26.5,
    ratedAmps: 22.0, // Overcurrent trip condition (>15%)
    bearingVibrationMmS: 6.8, // Excessive vibration
    windingTempCelsius: 82.5, // High winding temperature
    lastServicedDate: '2026-07-10',
    nextServiceDueHours: 0
  }
];

// ========================================================
// 2. Initial Well Water Treatment Logs
// ========================================================
export const INITIAL_WELL_TREATMENT_LOGS: WellTreatmentLog[] = [
  {
    id: 'WTL-2026-10-28',
    timestamp: '2026-10-28 16:00',
    rawWaterPumpedLiters: 1850000,
    treatedWaterYieldLiters: 1775000,
    backwashLossLiters: 75000,
    treatmentChemicals: {
      alumOrPacKg: 44.4,
      limeKg: 35.0,
      chlorineKg: 22.0
    },
    waterQuality: {
      turbidityNtu: 0.72,
      ph: 7.15,
      ironMgL: 0.08,           // SLS standard < 0.3 mg/L
      totalHardnessMgL: 145.0, // SLS standard < 250 mg/L
      residualChlorinePpm: 0.65,
      ecoliColiform: 'PASS_NIL'
    },
    analystBadge: 'PO (Lab) S. Ranasinghe',
    remarks: 'Turbidity stabilized below 1.0 NTU after coagulant trim. Iron precipitation complete in aeration cascade.'
  },
  {
    id: 'WTL-2026-10-27',
    timestamp: '2026-10-27 16:00',
    rawWaterPumpedLiters: 1920000,
    treatedWaterYieldLiters: 1845000,
    backwashLossLiters: 75000,
    treatmentChemicals: {
      alumOrPacKg: 38.4,
      limeKg: 30.0,
      chlorineKg: 24.0
    },
    waterQuality: {
      turbidityNtu: 0.68,
      ph: 7.20,
      ironMgL: 0.12,
      totalHardnessMgL: 152.0,
      residualChlorinePpm: 0.70,
      ecoliColiform: 'PASS_NIL'
    },
    analystBadge: 'PO (Lab) S. Ranasinghe',
    remarks: 'Filter backwash cycle performed at 04:30. Zero coliform confirmed on 24h membrane filter incubation.'
  }
];

// ========================================================
// 3. Initial Internal Dockyard Premises Billing
// ========================================================
export const INITIAL_INTERNAL_BILLING: InternalPremisesBilling[] = [
  {
    id: 'INB-2026-10-01',
    premisesCode: 'OFFICERS-MESS',
    premisesName: 'Officers Wardroom & Residential Quarters',
    meterNumber: 'INT-MTR-01',
    billingMonth: '2026-10',
    previousReadingUnits: 4210,
    currentReadingUnits: 4325,
    consumedUnits: 115, // 115 m³ = 115,000 Liters
    internalAccountingRatePerUnit: 65.0, // Internal subsidized transfer cost
    totalComputedCostLkr: 7475.0
  },
  {
    id: 'INB-2026-10-02',
    premisesCode: 'SAILORS-GALLEY',
    premisesName: 'Main Sailors Galley & Messing Facility',
    meterNumber: 'INT-MTR-02',
    billingMonth: '2026-10',
    previousReadingUnits: 7850,
    currentReadingUnits: 8120,
    consumedUnits: 270,
    internalAccountingRatePerUnit: 65.0,
    totalComputedCostLkr: 17550.0
  },
  {
    id: 'INB-2026-10-03',
    premisesCode: 'FLEET-WORKSHOP',
    premisesName: 'Naval Dockyard Marine Engineering Workshops',
    meterNumber: 'INT-MTR-03',
    billingMonth: '2026-10',
    previousReadingUnits: 3410,
    currentReadingUnits: 3580,
    consumedUnits: 170,
    internalAccountingRatePerUnit: 75.0,
    totalComputedCostLkr: 12750.0
  },
  {
    id: 'INB-2026-10-04',
    premisesCode: 'BASE-HOSPITAL',
    premisesName: 'Naval Base Hospital Complex & Ward W',
    meterNumber: 'INT-MTR-04',
    billingMonth: '2026-10',
    previousReadingUnits: 2950,
    currentReadingUnits: 3110,
    consumedUnits: 160,
    internalAccountingRatePerUnit: 65.0,
    totalComputedCostLkr: 10400.0
  },
  {
    id: 'INB-2026-10-05',
    premisesCode: 'JETTY-BERTH-B',
    premisesName: 'Jetty B Pier Heavy Ship Supply Dispenser',
    meterNumber: 'INT-MTR-05',
    billingMonth: '2026-10',
    previousReadingUnits: 11200,
    currentReadingUnits: 11650,
    consumedUnits: 450,
    internalAccountingRatePerUnit: 85.0,
    totalComputedCostLkr: 38250.0
  }
];

// ========================================================
// 4. Initial Non-Naval Commercial Clients (Hub B)
// ========================================================
export const INITIAL_NON_NAVAL_CONSUMERS: NonNavalConsumer[] = [
  {
    accountNumber: 'NNC-2024-001',
    consumerName: 'Colombo Dockyard PLC (Marine Repair Division)',
    companyOrOrg: 'Colombo Dockyard PLC',
    category: 'COMMERCIAL_PRIVATE',
    contactPerson: 'Eng. H.K. Dissanayake',
    contactPhone: '+94 77 450 1199',
    email: 'trinco.repairs@cdl.lk',
    connectionLocation: 'Dockyard Drydock Facility Bay #3',
    meterSerial: 'MTR-CDL-091',
    initialReadingUnits: 1250,
    activeStatus: 'ACTIVE',
    currentArrearsLkr: 18400.0,
    advanceDepositLkr: 75000.0
  },
  {
    accountNumber: 'NNC-2024-002',
    consumerName: 'Sri Lanka Ports Authority (SLPA) Pilot Station',
    companyOrOrg: 'Sri Lanka Ports Authority',
    category: 'PORT_AUTHORITY_SLPA',
    contactPerson: 'Harbour Pilot Capt. R. Wickrama',
    contactPhone: '+94 71 883 4521',
    email: 'pilotstation.trinco@slpa.lk',
    connectionLocation: 'Dockyard North Pier Signal Tower Annex',
    meterSerial: 'MTR-SLPA-044',
    initialReadingUnits: 2180,
    activeStatus: 'ACTIVE',
    currentArrearsLkr: 0.0,
    advanceDepositLkr: 50000.0
  },
  {
    accountNumber: 'NNC-2024-003',
    consumerName: 'Prima Ceylon Logistics Berthing Canteen',
    companyOrOrg: 'Prima Ceylon Limited',
    category: 'CONTRACTOR_AGENCY',
    contactPerson: 'Mr. Sunil Jayatissa',
    contactPhone: '+94 77 662 0014',
    email: 'canteen.admin@prima.com.lk',
    connectionLocation: 'China Bay Causeway Gate #2',
    meterSerial: 'MTR-PRIMA-102',
    initialReadingUnits: 840,
    activeStatus: 'ACTIVE',
    currentArrearsLkr: 4200.0,
    advanceDepositLkr: 30000.0
  },
  {
    accountNumber: 'NNC-2024-004',
    consumerName: 'MV Serendib Pearl (Civilian Feeder Vessel)',
    companyOrOrg: 'Lanka Maritime Shipping Services',
    category: 'SHIPPING_VESSEL_CIVILIAN',
    contactPerson: 'Chief Officer M. Fernando',
    contactPhone: '+94 77 912 3456',
    email: 'agents@lankaship.com',
    connectionLocation: 'Ashroff Jetty Commercial Bunkering Riser',
    meterSerial: 'MTR-VESSEL-88',
    initialReadingUnits: 410,
    activeStatus: 'ACTIVE',
    currentArrearsLkr: 0.0,
    advanceDepositLkr: 120000.0
  },
  {
    accountNumber: 'NNC-2024-005',
    consumerName: 'Sri Lanka Telecom Sub-Station Annex',
    companyOrOrg: 'SLT Mobitel',
    category: 'INSTITUTIONAL',
    contactPerson: 'Regional Manager K. Alwis',
    contactPhone: '+94 71 556 7890',
    email: 'trinco.ops@slt.com.lk',
    connectionLocation: 'Naval Base Perimeter Gate 4',
    meterSerial: 'MTR-SLT-015',
    initialReadingUnits: 530,
    activeStatus: 'ACTIVE',
    currentArrearsLkr: 0.0,
    advanceDepositLkr: 25000.0
  }
];

// ========================================================
// 5. Initial Commercial Bills (Invoices)
// ========================================================
export const INITIAL_COMMERCIAL_BILLS: CommercialWaterBill[] = [
  {
    billNumber: 'INV-2024-10-001',
    accountNumber: 'NNC-2024-001',
    billingPeriod: '2024-10',
    billDate: '2026-10-01',
    dueDate: '2026-10-25',
    previousMeterReading: 1250,
    currentMeterReading: 1395,
    totalUnitsConsumed: 145, // 145 m³
    volumetricChargeLkr: 22100.0,
    fixedServiceChargeLkr: 3200.0,
    vatOrSurchargeLkr: 0.0,
    broughtForwardArrearsLkr: 18400.0,
    totalPayableLkr: 43700.0,
    paymentStatus: 'UNPAID',
    amountPaidLkr: 0.0
  },
  {
    billNumber: 'INV-2024-10-002',
    accountNumber: 'NNC-2024-002',
    billingPeriod: '2024-10',
    billDate: '2026-10-01',
    dueDate: '2026-10-25',
    previousMeterReading: 2180,
    currentMeterReading: 2265,
    totalUnitsConsumed: 85, // 85 m³
    volumetricChargeLkr: 14025.0,
    fixedServiceChargeLkr: 2500.0,
    vatOrSurchargeLkr: 0.0,
    broughtForwardArrearsLkr: 0.0,
    totalPayableLkr: 16525.0,
    paymentStatus: 'PAID',
    amountPaidLkr: 16525.0,
    paidDate: '2026-10-18',
    receiptNumber: 'RCP-2024-10-008',
    paymentMode: 'BANK_TRANSFER'
  },
  {
    billNumber: 'INV-2024-10-003',
    accountNumber: 'NNC-2024-003',
    billingPeriod: '2024-10',
    billDate: '2026-10-01',
    dueDate: '2026-10-25',
    previousMeterReading: 840,
    currentMeterReading: 878,
    totalUnitsConsumed: 38, // 38 m³
    volumetricChargeLkr: 4440.0,
    fixedServiceChargeLkr: 1000.0,
    vatOrSurchargeLkr: 0.0,
    broughtForwardArrearsLkr: 4200.0,
    totalPayableLkr: 9640.0,
    paymentStatus: 'OVERDUE',
    amountPaidLkr: 0.0
  },
  {
    billNumber: 'INV-2024-10-004',
    accountNumber: 'NNC-2024-004',
    billingPeriod: '2024-10',
    billDate: '2026-10-15',
    dueDate: '2026-10-30',
    previousMeterReading: 410,
    currentMeterReading: 590,
    totalUnitsConsumed: 180, // 180 m³ bunkering
    volumetricChargeLkr: 75600.0,
    fixedServiceChargeLkr: 5000.0,
    vatOrSurchargeLkr: 0.0,
    broughtForwardArrearsLkr: 0.0,
    totalPayableLkr: 80600.0,
    paymentStatus: 'PAID',
    amountPaidLkr: 80600.0,
    paidDate: '2026-10-16',
    receiptNumber: 'RCP-2024-10-002',
    paymentMode: 'CHEQUE'
  }
];

// ========================================================
// 6. Initial Payment Receipts
// ========================================================
export const INITIAL_PAYMENT_RECEIPTS: ConsumerPaymentReceipt[] = [
  {
    receiptId: 'RCP-2024-10-002',
    billNumber: 'INV-2024-10-004',
    accountNumber: 'NNC-2024-004',
    paymentDate: '2026-10-16',
    amountReceivedLkr: 80600.0,
    paymentMethod: 'CHEQUE',
    referenceNo: 'BOC Chq #782109',
    receivedByBadge: 'CPO (S) K. Perera (Revenue)',
    balanceArrearsLkr: 0.0
  },
  {
    receiptId: 'RCP-2024-10-008',
    billNumber: 'INV-2024-10-002',
    accountNumber: 'NNC-2024-002',
    paymentDate: '2026-10-18',
    amountReceivedLkr: 16525.0,
    paymentMethod: 'BANK_TRANSFER',
    referenceNo: 'SLPA/REV/TX-88219',
    receivedByBadge: 'CPO (S) K. Perera (Revenue)',
    balanceArrearsLkr: 0.0
  }
];
