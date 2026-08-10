import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WaterLocation,
  BowserDuty,
  LoadingLog,
  WaterRequest,
  BowserRegistryEntry
} from '../types/waterDistribution';
import {
  SEED_RO_LOCATIONS,
  SEED_STANDARD_LOCATIONS,
  SEED_BOWSER_DUTIES,
  SEED_LOADING_LOGS,
  SEED_WATER_REQUESTS
} from '../services/seedData';
import { PUBLISHED_BOWSER_REGISTRY } from '../services/bowserPinRegistry';

interface DataContextType {
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence with localStorage
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

  const allLocations = [...roLocations, ...standardLocations];
  const priorityLocations = allLocations.filter(l => l.isPriority);

  const addLoadingLog = (logData: Omit<LoadingLog, 'id' | 'createdAt'>) => {
    const newLog: LoadingLog = {
      ...logData,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLoadingLogs(prev => [newLog, ...prev]);

    // Automatically update target location current level
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
      currentLevel: Math.round(locData.tankCapacity * 0.5), // Default 50% fill
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
        bulkImportBowsers
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
