import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WaterLocation,
  BowserDuty,
  LoadingLog,
  WaterRequest,
  BowserRegistryEntry,
  DetailedStorageTank,
  MainReservoirProfile,
  ChemicalInventoryItem,
  DailyWTPTestReport,
  WellIntakeLevel,
  RainfallRecord
} from '../types/waterDistribution';
import {
  PumpTelemetry,
  WellTreatmentLog,
  InternalPremisesBilling
} from '../types/wellWaterTreatment';
import {
  NonNavalConsumer,
  CommercialWaterBill,
  ConsumerPaymentReceipt
} from '../types/commercialBilling';
import {
  SEED_RO_LOCATIONS,
  SEED_STANDARD_LOCATIONS,
  SEED_BOWSER_DUTIES,
  SEED_LOADING_LOGS,
  SEED_WATER_REQUESTS
} from '../services/seedData';
import { PUBLISHED_BOWSER_REGISTRY } from '../services/bowserPinRegistry';
import {
  INITIAL_STORAGE_TANKS,
  INITIAL_MAIN_RESERVOIR,
  INITIAL_CHEMICAL_INVENTORY,
  INITIAL_WTP_DAILY_REPORTS
} from '../services/waterworksSeedData';
import {
  INITIAL_PUMP_TELEMETRY,
  INITIAL_WELL_TREATMENT_LOGS,
  INITIAL_INTERNAL_BILLING,
  INITIAL_NON_NAVAL_CONSUMERS,
  INITIAL_COMMERCIAL_BILLS,
  INITIAL_PAYMENT_RECEIPTS
} from '../services/wellAndBillingSeedData';
import { calculateWellDischargeLps, calculateCatchmentRunoffLiters } from '../utils/tankCalculations';

interface DataContextType {
  // Existing Distribution & Bowser Entities
  roLocations: WaterLocation[];
  standardLocations: WaterLocation[];
  allLocations: WaterLocation[];
  bowserDuties: BowserDuty[];
  bowserRegistry: BowserRegistryEntry[];
  loadingLogs: LoadingLog[];
  requests: WaterRequest[];
  priorityLocations: WaterLocation[];
  selectedLocation: WaterLocation | null;
  setSelectedLocation: (loc: WaterLocation | null) => void;
  addLoadingLog: (log: Omit<LoadingLog, 'id' | 'createdAt'>) => void;
  addLocation: (loc: Omit<WaterLocation, 'id' | 'currentLevel' | 'lastLoadedDate' | 'lastLoadedAmount' | 'futureSchedules' | 'supplyHistory' | 'isPriority' | 'createdAt'>) => void;
  updateLocation: (updated: WaterLocation) => void;
  deleteLocation: (id: string) => void;
  addBowserDuty: (duty: Omit<BowserDuty, 'id' | 'createdAt'>) => void;
  updateBowserDuty: (updated: BowserDuty) => void;
  deleteBowser: (vehicleNo: string) => void;
  addBowserRegistryEntry: (entry: BowserRegistryEntry) => void;
  updateBowserRegistryEntry: (updated: BowserRegistryEntry) => void;
  togglePriorityLocation: (locationId: string, reason?: string) => void;
  createWaterRequest: (req: Omit<WaterRequest, 'id' | 'status' | 'requestedAt'>) => void;
  addRequest: (req: Omit<WaterRequest, 'id' | 'status' | 'requestedAt'>) => void;
  updateRequestStatus: (requestId: string, status: WaterRequest['status']) => void;
  quickFillLocation: (locationId: string, amount: number, bowserNo: string, waterType: any) => void;
  bulkImportLocations: (imported: WaterLocation[]) => void;
  bulkImportBowsers: (imported: BowserRegistryEntry[]) => void;

  // Detailed Storage Tanks Matrix
  storageTanks: DetailedStorageTank[];
  addStorageTank: (tank: DetailedStorageTank) => void;
  updateStorageTank: (tank: DetailedStorageTank) => void;
  deleteStorageTank: (id: string) => void;
  setTankCurrentLevel: (id: string, levelMeters: number) => void;

  // Main Reservoir & Inflow Wells Telemetry
  reservoirProfile: MainReservoirProfile;
  updateReservoirProfile: (profile: MainReservoirProfile) => void;
  updateWellGate: (wellId: string, gatePercentage: number, status?: WellIntakeLevel['operationalStatus']) => void;
  addRainfallRecord: (record: Omit<RainfallRecord, 'id'>) => void;

  // WTP Chemical Stocks & Daily Lab Reports
  chemicalInventory: ChemicalInventoryItem[];
  updateChemicalStock: (chemicalId: string, newStock: number) => void;
  wtpReports: DailyWTPTestReport[];
  addWTPReport: (report: DailyWTPTestReport) => void;

  // HUB A: Well Water Treatment & Electromechanical Pumps
  pumpsTelemetry: PumpTelemetry[];
  updatePumpStatus: (pumpId: string, status: PumpTelemetry['status']) => void;
  wellTreatmentLogs: WellTreatmentLog[];
  addWellTreatmentLog: (log: WellTreatmentLog) => void;
  internalBillingRecords: InternalPremisesBilling[];
  addInternalBillingRecord: (record: InternalPremisesBilling) => void;

  // HUB B: Commercial & Non-Naval Consumer Billing
  nonNavalConsumers: NonNavalConsumer[];
  addNonNavalConsumer: (consumer: NonNavalConsumer) => void;
  updateNonNavalConsumer: (consumer: NonNavalConsumer) => void;
  commercialBills: CommercialWaterBill[];
  createCommercialBill: (bill: CommercialWaterBill) => void;
  paymentReceipts: ConsumerPaymentReceipt[];
  recordBillPayment: (receipt: ConsumerPaymentReceipt) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Existing Distribution State
  const [roLocations, setRoLocations] = useState<WaterLocation[]>(() => {
    const saved = localStorage.getItem('cced_locations_ro');
    return saved ? JSON.parse(saved) : SEED_RO_LOCATIONS;
  });

  const [standardLocations, setStandardLocations] = useState<WaterLocation[]>(() => {
    const saved = localStorage.getItem('cced_locations_std');
    return saved ? JSON.parse(saved) : SEED_STANDARD_LOCATIONS;
  });

  const [bowserDuties, setBowserDuties] = useState<BowserDuty[]>(() => {
    const saved = localStorage.getItem('cced_bowser_duties');
    return saved ? JSON.parse(saved) : SEED_BOWSER_DUTIES;
  });

  const [bowserRegistry, setBowserRegistry] = useState<BowserRegistryEntry[]>(() => {
    const saved = localStorage.getItem('cced_bowser_registry_custom');
    return saved ? JSON.parse(saved) : PUBLISHED_BOWSER_REGISTRY;
  });

  const [loadingLogs, setLoadingLogs] = useState<LoadingLog[]>(() => {
    const saved = localStorage.getItem('cced_loading_logs');
    return saved ? JSON.parse(saved) : SEED_LOADING_LOGS;
  });

  const [requests, setRequests] = useState<WaterRequest[]>(() => {
    const saved = localStorage.getItem('cced_water_requests');
    return saved ? JSON.parse(saved) : SEED_WATER_REQUESTS;
  });

  const [selectedLocation, setSelectedLocation] = useState<WaterLocation | null>(null);

  // Storage Tanks Matrix State
  const [storageTanks, setStorageTanks] = useState<DetailedStorageTank[]>(() => {
    const saved = localStorage.getItem('cced_storage_tanks');
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_TANKS;
  });

  // Main Reservoir State
  const [reservoirProfile, setReservoirProfile] = useState<MainReservoirProfile>(() => {
    const saved = localStorage.getItem('cced_main_reservoir');
    return saved ? JSON.parse(saved) : INITIAL_MAIN_RESERVOIR;
  });

  // Chemical Inventory State
  const [chemicalInventory, setChemicalInventory] = useState<ChemicalInventoryItem[]>(() => {
    const saved = localStorage.getItem('cced_chemical_inventory');
    return saved ? JSON.parse(saved) : INITIAL_CHEMICAL_INVENTORY;
  });

  // Daily WTP Reports State
  const [wtpReports, setWtpReports] = useState<DailyWTPTestReport[]>(() => {
    const saved = localStorage.getItem('cced_wtp_reports');
    return saved ? JSON.parse(saved) : INITIAL_WTP_DAILY_REPORTS;
  });

  // HUB A: Well Water Plant & Pumps State
  const [pumpsTelemetry, setPumpsTelemetry] = useState<PumpTelemetry[]>(() => {
    const saved = localStorage.getItem('cced_pumps_telemetry');
    return saved ? JSON.parse(saved) : INITIAL_PUMP_TELEMETRY;
  });

  const [wellTreatmentLogs, setWellTreatmentLogs] = useState<WellTreatmentLog[]>(() => {
    const saved = localStorage.getItem('cced_well_treatment_logs');
    return saved ? JSON.parse(saved) : INITIAL_WELL_TREATMENT_LOGS;
  });

  const [internalBillingRecords, setInternalBillingRecords] = useState<InternalPremisesBilling[]>(() => {
    const saved = localStorage.getItem('cced_internal_billing');
    return saved ? JSON.parse(saved) : INITIAL_INTERNAL_BILLING;
  });

  // HUB B: Commercial Consumers & Billing State
  const [nonNavalConsumers, setNonNavalConsumers] = useState<NonNavalConsumer[]>(() => {
    const saved = localStorage.getItem('cced_non_naval_consumers');
    return saved ? JSON.parse(saved) : INITIAL_NON_NAVAL_CONSUMERS;
  });

  const [commercialBills, setCommercialBills] = useState<CommercialWaterBill[]>(() => {
    const saved = localStorage.getItem('cced_commercial_bills');
    return saved ? JSON.parse(saved) : INITIAL_COMMERCIAL_BILLS;
  });

  const [paymentReceipts, setPaymentReceipts] = useState<ConsumerPaymentReceipt[]>(() => {
    const saved = localStorage.getItem('cced_payment_receipts');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_RECEIPTS;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('cced_locations_ro', JSON.stringify(roLocations));
  }, [roLocations]);

  useEffect(() => {
    localStorage.setItem('cced_locations_std', JSON.stringify(standardLocations));
  }, [standardLocations]);

  useEffect(() => {
    localStorage.setItem('cced_bowser_duties', JSON.stringify(bowserDuties));
  }, [bowserDuties]);

  useEffect(() => {
    localStorage.setItem('cced_bowser_registry_custom', JSON.stringify(bowserRegistry));
  }, [bowserRegistry]);

  useEffect(() => {
    localStorage.setItem('cced_loading_logs', JSON.stringify(loadingLogs));
  }, [loadingLogs]);

  useEffect(() => {
    localStorage.setItem('cced_water_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('cced_storage_tanks', JSON.stringify(storageTanks));
  }, [storageTanks]);

  useEffect(() => {
    localStorage.setItem('cced_main_reservoir', JSON.stringify(reservoirProfile));
  }, [reservoirProfile]);

  useEffect(() => {
    localStorage.setItem('cced_chemical_inventory', JSON.stringify(chemicalInventory));
  }, [chemicalInventory]);

  useEffect(() => {
    localStorage.setItem('cced_wtp_reports', JSON.stringify(wtpReports));
  }, [wtpReports]);

  useEffect(() => {
    localStorage.setItem('cced_pumps_telemetry', JSON.stringify(pumpsTelemetry));
  }, [pumpsTelemetry]);

  useEffect(() => {
    localStorage.setItem('cced_well_treatment_logs', JSON.stringify(wellTreatmentLogs));
  }, [wellTreatmentLogs]);

  useEffect(() => {
    localStorage.setItem('cced_internal_billing', JSON.stringify(internalBillingRecords));
  }, [internalBillingRecords]);

  useEffect(() => {
    localStorage.setItem('cced_non_naval_consumers', JSON.stringify(nonNavalConsumers));
  }, [nonNavalConsumers]);

  useEffect(() => {
    localStorage.setItem('cced_commercial_bills', JSON.stringify(commercialBills));
  }, [commercialBills]);

  useEffect(() => {
    localStorage.setItem('cced_payment_receipts', JSON.stringify(paymentReceipts));
  }, [paymentReceipts]);

  const allLocations = [...roLocations, ...standardLocations];
  const priorityLocations = allLocations.filter(l => l.isPriority);

  // Existing Bowsers & Locations CRUD
  const addLoadingLog = (logData: Omit<LoadingLog, 'id' | 'createdAt'>) => {
    const newLog: LoadingLog = {
      ...logData,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLoadingLogs(prev => [newLog, ...prev]);

    const target = allLocations.find(l => l.name.toLowerCase() === logData.locationName.toLowerCase());
    if (target) {
      const newLevel = Math.min(target.tankCapacity, target.currentLevel + logData.volumeLoaded);
      const updated: WaterLocation = {
        ...target,
        currentLevel: newLevel,
        lastLoadedDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
        lastLoadedAmount: logData.volumeLoaded,
        supplyHistory: [
          {
            id: `sup-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            bowserVehicleNo: logData.bowserVehicleNo,
            waterType: logData.waterType,
            amountLoaded: logData.volumeLoaded,
            locationName: target.name
          },
          ...target.supplyHistory
        ]
      };
      updateLocation(updated);
    }
  };

  const addLocation = (locData: Omit<WaterLocation, 'id' | 'currentLevel' | 'lastLoadedDate' | 'lastLoadedAmount' | 'futureSchedules' | 'supplyHistory' | 'isPriority' | 'createdAt'>) => {
    const newLoc: WaterLocation = {
      ...locData,
      id: `loc-${Date.now()}`,
      currentLevel: Math.round(locData.tankCapacity * 0.5),
      lastLoadedDate: 'Just Added',
      lastLoadedAmount: 0,
      futureSchedules: [],
      supplyHistory: [],
      isPriority: false,
      createdAt: new Date().toISOString()
    };

    if (locData.category === 'RO') {
      setRoLocations(prev => [newLoc, ...prev]);
    } else {
      setStandardLocations(prev => [newLoc, ...prev]);
    }
  };

  const updateLocation = (updated: WaterLocation) => {
    if (updated.category === 'RO') {
      setRoLocations(prev => prev.map(l => (l.id === updated.id ? updated : l)));
    } else {
      setStandardLocations(prev => prev.map(l => (l.id === updated.id ? updated : l)));
    }
    if (selectedLocation && selectedLocation.id === updated.id) {
      setSelectedLocation(updated);
    }
  };

  const deleteLocation = (id: string) => {
    setRoLocations(prev => prev.filter(l => l.id !== id));
    setStandardLocations(prev => prev.filter(l => l.id !== id));
    if (selectedLocation && selectedLocation.id === id) {
      setSelectedLocation(null);
    }
  };

  const addBowserDuty = (dutyData: Omit<BowserDuty, 'id' | 'createdAt'>) => {
    const newDuty: BowserDuty = {
      ...dutyData,
      id: `duty-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setBowserDuties(prev => [newDuty, ...prev]);
  };

  const updateBowserDuty = (updated: BowserDuty) => {
    setBowserDuties(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  };

  const deleteBowser = (vehicleNo: string) => {
    setBowserRegistry(prev => prev.filter(b => b.vehicleNo !== vehicleNo));
    setBowserDuties(prev => prev.filter(d => d.vehicleNo !== vehicleNo));
  };

  const addBowserRegistryEntry = (entry: BowserRegistryEntry) => {
    setBowserRegistry(prev => [...prev.filter(b => b.vehicleNo !== entry.vehicleNo), entry]);
  };

  const updateBowserRegistryEntry = (updated: BowserRegistryEntry) => {
    setBowserRegistry(prev => prev.map(b => (b.vehicleNo === updated.vehicleNo ? updated : b)));
  };

  const togglePriorityLocation = (locationId: string, reason?: string) => {
    const target = allLocations.find(l => l.id === locationId);
    if (!target) return;

    const newPriorityState = !target.isPriority;
    const updated: WaterLocation = {
      ...target,
      isPriority: newPriorityState,
      priorityReason: newPriorityState ? reason || 'High Demand Elevated by Admin' : undefined
    };
    updateLocation(updated);
  };

  const createWaterRequest = (reqData: Omit<WaterRequest, 'id' | 'status' | 'requestedAt'>) => {
    const newReq: WaterRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: reqData.isPriority ? 'Priority' : 'Pending',
      requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const updateRequestStatus = (requestId: string, status: WaterRequest['status']) => {
    setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status } : r)));
  };

  const quickFillLocation = (locationId: string, amount: number, bowserNo: string, waterType: any) => {
    const target = allLocations.find(l => l.id === locationId);
    if (!target) return;

    addLoadingLog({
      locationName: target.name,
      volumeLoaded: amount,
      waterType: waterType || (target.category === 'RO' ? 'RO Water' : 'Normal Water'),
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isManualOverride: false,
      bowserVehicleNo: bowserNo,
      bowserPinVerified: true,
      remarks: 'Quick Log Fill from Location Details Modal'
    });
  };

  const bulkImportLocations = (imported: WaterLocation[]) => {
    const ro = imported.filter(l => l.category === 'RO');
    const std = imported.filter(l => l.category !== 'RO');

    if (ro.length > 0) {
      setRoLocations(prev => [...ro, ...prev]);
    }
    if (std.length > 0) {
      setStandardLocations(prev => [...std, ...prev]);
    }
  };

  const bulkImportBowsers = (imported: BowserRegistryEntry[]) => {
    setBowserRegistry(prev => [...imported, ...prev]);
  };

  // Storage Tanks Methods
  const addStorageTank = (tank: DetailedStorageTank) => {
    setStorageTanks(prev => [tank, ...prev]);
  };

  const updateStorageTank = (tank: DetailedStorageTank) => {
    setStorageTanks(prev => prev.map(t => (t.id === tank.id ? tank : t)));
  };

  const deleteStorageTank = (id: string) => {
    setStorageTanks(prev => prev.filter(t => t.id !== id));
  };

  const setTankCurrentLevel = (id: string, levelMeters: number) => {
    setStorageTanks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const totalH = t.dimensions.totalHeightMeters;
        const clampedH = Math.max(0, Math.min(totalH, levelMeters));
        let computedLiters = 0;

        if (t.dimensions.formFactor === 'CYLINDRICAL_VERTICAL') {
          const r = (t.dimensions.diameterMeters || 0) / 2;
          computedLiters = Math.round(Math.PI * r * r * clampedH * 1000);
        } else if (t.dimensions.formFactor === 'RECTANGULAR_SUMP') {
          const l = t.dimensions.lengthMeters || 0;
          const w = t.dimensions.widthMeters || 0;
          computedLiters = Math.round(l * w * clampedH * 1000);
        } else {
          const r = (t.dimensions.diameterMeters || 0) / 2;
          const len = t.dimensions.lengthMeters || 0;
          const ratio = Math.max(-1, Math.min(1, (r - clampedH) / (r || 1)));
          const segArea = r * r * Math.acos(ratio) - (r - clampedH) * Math.sqrt(Math.max(0, 2 * r * clampedH - clampedH * clampedH));
          computedLiters = Math.round(segArea * len * 1000);
        }

        const cap = t.dimensions.calculatedCapacityLiters || 1;
        const pct = Math.min(100, Math.max(0, parseFloat(((computedLiters / cap) * 100).toFixed(1))));

        return {
          ...t,
          currentLevelMeters: clampedH,
          currentVolumeLiters: computedLiters,
          fillPercentage: pct,
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      })
    );
  };

  // Reservoir Methods
  const updateReservoirProfile = (profile: MainReservoirProfile) => {
    setReservoirProfile(profile);
  };

  const updateWellGate = (
    wellId: string,
    gatePercentage: number,
    status?: WellIntakeLevel['operationalStatus']
  ) => {
    setReservoirProfile(prev => {
      const updatedWells = prev.wells.map(well => {
        if (well.wellId !== wellId) return well;
        const newGate = Math.max(0, Math.min(100, gatePercentage));
        const newStatus = status !== undefined ? status : newGate === 0 ? 'ISOLATED' : well.operationalStatus;
        const newDischarge = newStatus === 'ACTIVE'
          ? calculateWellDischargeLps(well.waterColumnMeters, newGate)
          : 0;

        return {
          ...well,
          sluiceGateOpenPercentage: newGate,
          operationalStatus: newStatus,
          dischargeRateLps: newDischarge
        };
      });

      return {
        ...prev,
        wells: updatedWells
      };
    });
  };

  const addRainfallRecord = (record: Omit<RainfallRecord, 'id'>) => {
    const newRecord: RainfallRecord = {
      ...record,
      id: `rain-${Date.now()}`
    };

    setReservoirProfile(prev => {
      const estRunoff = record.catchmentRunoffEstLiters || calculateCatchmentRunoffLiters(record.rainfallMm);
      const newStorage = Math.min(prev.grossCapacityLiters, prev.currentStorageLiters + estRunoff * 0.7);
      const newLevel = parseFloat((prev.currentWaterLevelMeters + (record.rainfallMm / 1000) * 1.8).toFixed(2));
      const freeboard = parseFloat(Math.max(0, 8.2 - newLevel).toFixed(2));

      return {
        ...prev,
        currentStorageLiters: newStorage,
        currentWaterLevelMeters: newLevel,
        freeboardMeters: freeboard,
        rainfallRecords: [newRecord, ...prev.rainfallRecords]
      };
    });
  };

  // Chemical Inventory Methods
  const updateChemicalStock = (chemicalId: string, newStock: number) => {
    setChemicalInventory(prev =>
      prev.map(item => {
        if (item.id !== chemicalId) return item;
        const burn = item.dailyAverageConsumption || 1;
        const runway = parseFloat((newStock / burn).toFixed(1));
        let reorderStatus: ChemicalInventoryItem['reorderStatus'] = 'ADEQUATE';
        if (newStock <= item.minimumThreshold * 0.7) {
          reorderStatus = 'CRITICAL';
        } else if (newStock <= item.minimumThreshold) {
          reorderStatus = 'REORDER_NOW';
        }

        return {
          ...item,
          currentStock: newStock,
          runwayDays: runway,
          reorderStatus
        };
      })
    );
  };

  // WTP Daily Report Methods
  const addWTPReport = (report: DailyWTPTestReport) => {
    setWtpReports(prev => [report, ...prev]);

    if (report.chemicalsConsumed && report.chemicalsConsumed.length > 0) {
      setChemicalInventory(prev =>
        prev.map(item => {
          const match = report.chemicalsConsumed.find(c => c.chemicalId === item.id || c.chemicalName.toLowerCase().includes(item.name.toLowerCase().slice(0, 4)));
          if (!match) return item;

          const updatedStock = Math.max(0, item.currentStock - match.quantityUsed);
          const burn = item.dailyAverageConsumption || 1;
          const runway = parseFloat((updatedStock / burn).toFixed(1));
          let reorderStatus: ChemicalInventoryItem['reorderStatus'] = 'ADEQUATE';
          if (updatedStock <= item.minimumThreshold * 0.7) {
            reorderStatus = 'CRITICAL';
          } else if (updatedStock <= item.minimumThreshold) {
            reorderStatus = 'REORDER_NOW';
          }

          return {
            ...item,
            currentStock: updatedStock,
            runwayDays: runway,
            reorderStatus
          };
        })
      );
    }
  };

  // ========================================================
  // HUB A: Well Water Plant & Pump Telemetry Methods
  // ========================================================
  const updatePumpStatus = (pumpId: string, status: PumpTelemetry['status']) => {
    setPumpsTelemetry(prev =>
      prev.map(p => {
        if (p.pumpId !== pumpId) return p;
        const isRunning = status === 'RUNNING';
        return {
          ...p,
          status,
          currentAmps: isRunning ? parseFloat((p.ratedAmps * 0.92).toFixed(1)) : 0,
          bearingVibrationMmS: isRunning ? parseFloat((p.bearingVibrationMmS || 2.2).toFixed(1)) : 0
        };
      })
    );
  };

  const addWellTreatmentLog = (log: WellTreatmentLog) => {
    setWellTreatmentLogs(prev => [log, ...prev]);
  };

  const addInternalBillingRecord = (record: InternalPremisesBilling) => {
    setInternalBillingRecords(prev => [record, ...prev]);
  };

  // ========================================================
  // HUB B: Commercial Consumer Billing Methods
  // ========================================================
  const addNonNavalConsumer = (consumer: NonNavalConsumer) => {
    setNonNavalConsumers(prev => [consumer, ...prev]);
  };

  const updateNonNavalConsumer = (consumer: NonNavalConsumer) => {
    setNonNavalConsumers(prev =>
      prev.map(c => (c.accountNumber === consumer.accountNumber ? consumer : c))
    );
  };

  const createCommercialBill = (bill: CommercialWaterBill) => {
    setCommercialBills(prev => [bill, ...prev]);

    // Update consumer arrears and meter reading
    setNonNavalConsumers(prev =>
      prev.map(c => {
        if (c.accountNumber !== bill.accountNumber) return c;
        return {
          ...c,
          currentArrearsLkr: bill.totalPayableLkr,
          initialReadingUnits: bill.currentMeterReading
        };
      })
    );
  };

  const recordBillPayment = (receipt: ConsumerPaymentReceipt) => {
    setPaymentReceipts(prev => [receipt, ...prev]);

    // Update corresponding bill status
    setCommercialBills(prev =>
      prev.map(b => {
        if (b.billNumber !== receipt.billNumber) return b;
        const newPaid = b.amountPaidLkr + receipt.amountReceivedLkr;
        const isFull = newPaid >= b.totalPayableLkr;
        return {
          ...b,
          amountPaidLkr: newPaid,
          paymentStatus: isFull ? 'PAID' : 'PARTIALLY_PAID',
          paidDate: receipt.paymentDate,
          receiptNumber: receipt.receiptId,
          paymentMode: receipt.paymentMethod as any
        };
      })
    );

    // Deduct paid amount from consumer's arrears
    setNonNavalConsumers(prev =>
      prev.map(c => {
        if (c.accountNumber !== receipt.accountNumber) return c;
        const newArrears = Math.max(0, c.currentArrearsLkr - receipt.amountReceivedLkr);
        return {
          ...c,
          currentArrearsLkr: newArrears
        };
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        roLocations,
        standardLocations,
        allLocations,
        bowserDuties,
        bowserRegistry,
        loadingLogs,
        requests,
        priorityLocations,
        selectedLocation,
        setSelectedLocation,
        addLoadingLog,
        addLocation,
        updateLocation,
        deleteLocation,
        addBowserDuty,
        updateBowserDuty,
        deleteBowser,
        addBowserRegistryEntry,
        updateBowserRegistryEntry,
        togglePriorityLocation,
        createWaterRequest,
        addRequest: createWaterRequest,
        updateRequestStatus,
        quickFillLocation,
        bulkImportLocations,
        bulkImportBowsers,

        // Detailed Storage Tanks
        storageTanks,
        addStorageTank,
        updateStorageTank,
        deleteStorageTank,
        setTankCurrentLevel,

        // Hydrology & Reservoir
        reservoirProfile,
        updateReservoirProfile,
        updateWellGate,
        addRainfallRecord,

        // Chemical Inventory & WTP Reports
        chemicalInventory,
        updateChemicalStock,
        wtpReports,
        addWTPReport,

        // HUB A: Well Water Treatment & Electromechanical Pumps
        pumpsTelemetry,
        updatePumpStatus,
        wellTreatmentLogs,
        addWellTreatmentLog,
        internalBillingRecords,
        addInternalBillingRecord,

        // HUB B: Commercial Consumer Billing
        nonNavalConsumers,
        addNonNavalConsumer,
        updateNonNavalConsumer,
        commercialBills,
        createCommercialBill,
        paymentReceipts,
        recordBillPayment
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
