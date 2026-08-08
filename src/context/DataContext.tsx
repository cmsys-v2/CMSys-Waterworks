import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WaterLocation,
  BowserDuty,
  LoadingLog,
  WaterRequest,
  WaterType,
  ScheduleItem
} from '../types/waterDistribution';
import {
  INITIAL_RO_LOCATIONS,
  INITIAL_STANDARD_LOCATIONS,
  INITIAL_BOWSER_DUTIES,
  INITIAL_LOADING_LOGS,
  INITIAL_REQUESTS
} from '../services/seedData';

interface DataContextType {
  roLocations: WaterLocation[];
  standardLocations: WaterLocation[];
  allLocations: WaterLocation[];
  bowserDuties: BowserDuty[];
  loadingLogs: LoadingLog[];
  requests: WaterRequest[];
  priorityLocations: WaterLocation[];
  selectedLocation: WaterLocation | null;
  setSelectedLocation: (loc: WaterLocation | null) => void;
  
  // Actions
  addBowserDuty: (duty: Omit<BowserDuty, 'id' | 'createdAt'>) => void;
  addLoadingLog: (log: Omit<LoadingLog, 'id' | 'createdAt'>) => void;
  togglePriorityLocation: (locationId: string, reason?: string) => void;
  addRequest: (req: Omit<WaterRequest, 'id' | 'requestedAt'>) => void;
  updateRequestStatus: (requestId: string, status: WaterRequest['status']) => void;
  quickFillLocation: (locationId: string, volume: number, bowserNo: string, waterType: WaterType) => void;
  addLocation: (location: Omit<WaterLocation, 'id' | 'createdAt' | 'currentLevel' | 'lastLoadedDate' | 'lastLoadedAmount' | 'futureSchedules' | 'supplyHistory' | 'isPriority'>) => void;
  updateLocation: (location: WaterLocation) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RO: 'cced_locations_ro',
  STD: 'cced_locations_std',
  DUTIES: 'cced_bowser_duties',
  LOGS: 'cced_loading_logs',
  REQUESTS: 'cced_water_requests',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roLocations, setRoLocations] = useState<WaterLocation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RO);
    return saved ? JSON.parse(saved) : INITIAL_RO_LOCATIONS;
  });

  const [standardLocations, setStandardLocations] = useState<WaterLocation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STD);
    return saved ? JSON.parse(saved) : INITIAL_STANDARD_LOCATIONS;
  });

  const [bowserDuties, setBowserDuties] = useState<BowserDuty[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DUTIES);
    return saved ? JSON.parse(saved) : INITIAL_BOWSER_DUTIES;
  });

  const [loadingLogs, setLoadingLogs] = useState<LoadingLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOADING_LOGS;
  });

  const [requests, setRequests] = useState<WaterRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [selectedLocation, setSelectedLocation] = useState<WaterLocation | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RO, JSON.stringify(roLocations));
  }, [roLocations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STD, JSON.stringify(standardLocations));
  }, [standardLocations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DUTIES, JSON.stringify(bowserDuties));
  }, [bowserDuties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(loadingLogs));
  }, [loadingLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  const allLocations = [...roLocations, ...standardLocations];
  const priorityLocations = allLocations.filter(loc => loc.isPriority);

  const addBowserDuty = (dutyData: Omit<BowserDuty, 'id' | 'createdAt'>) => {
    const newDuty: BowserDuty = {
      ...dutyData,
      id: `duty-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setBowserDuties(prev => [newDuty, ...prev]);
  };

  const addLoadingLog = (logData: Omit<LoadingLog, 'id' | 'createdAt'>) => {
    const newLog: LoadingLog = {
      ...logData,
      id: `load-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLoadingLogs(prev => [newLog, ...prev]);

    const targetLoc = allLocations.find(l => l.name === logData.locationName);
    if (targetLoc) {
      quickFillLocation(
        targetLoc.id,
        logData.volumeLoaded,
        logData.bowserVehicleNo || 'NAHA-01',
        logData.waterType
      );
    }
  };

  const togglePriorityLocation = (locationId: string, reason?: string) => {
    const updater = (prev: WaterLocation[]) =>
      prev.map(loc => {
        if (loc.id === locationId) {
          const newPriority = !loc.isPriority;
          return {
            ...loc,
            isPriority: newPriority,
            priorityReason: newPriority ? (reason || 'Elevated to Priority by Admin (SCE WW)') : undefined
          };
        }
        return loc;
      });

    setRoLocations(updater);
    setStandardLocations(updater);

    if (selectedLocation && selectedLocation.id === locationId) {
      setSelectedLocation(prev => prev ? ({
        ...prev,
        isPriority: !prev.isPriority,
        priorityReason: !prev.isPriority ? (reason || 'Elevated to Priority by Admin (SCE WW)') : undefined
      }) : null);
    }
  };

  const addRequest = (reqData: Omit<WaterRequest, 'id' | 'requestedAt'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newRequest: WaterRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      requestedAt: formattedDate
    };
    setRequests(prev => [newRequest, ...prev]);

    if (reqData.isPriority || reqData.urgency === 'Emergency') {
      togglePriorityLocation(reqData.locationId, `Elevated due to ${reqData.urgency} Request`);
    }
  };

  const updateRequestStatus = (requestId: string, status: WaterRequest['status']) => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status } : r))
    );
  };

  const quickFillLocation = (locationId: string, volume: number, bowserNo: string, waterType: WaterType) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updateLoc = (loc: WaterLocation): WaterLocation => {
      if (loc.id !== locationId) return loc;
      const newLevel = Math.min(loc.tankCapacity, loc.currentLevel + volume);
      const newSupplyLog = {
        id: `sh-${Date.now()}`,
        date: formattedDate,
        bowserVehicleNo: bowserNo,
        waterType,
        amountLoaded: volume,
        driverName: 'SCE Duty Bowser Operator'
      };
      return {
        ...loc,
        currentLevel: newLevel,
        lastLoadedDate: formattedDate,
        lastLoadedAmount: volume,
        supplyHistory: [newSupplyLog, ...loc.supplyHistory]
      };
    };

    setRoLocations(prev => prev.map(updateLoc));
    setStandardLocations(prev => prev.map(updateLoc));

    if (selectedLocation && selectedLocation.id === locationId) {
      setSelectedLocation(prev => prev ? updateLoc(prev) : null);
    }
  };

  const addLocation = (locData: Omit<WaterLocation, 'id' | 'createdAt' | 'currentLevel' | 'lastLoadedDate' | 'lastLoadedAmount' | 'futureSchedules' | 'supplyHistory' | 'isPriority'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} 00:00`;

    const newLoc: WaterLocation = {
      ...locData,
      id: `${locData.category.toLowerCase()}-loc-${Date.now()}`,
      currentLevel: locData.tankCapacity * 0.5,
      lastLoadedDate: formattedDate,
      lastLoadedAmount: 5000,
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

  const updateLocation = (updatedLoc: WaterLocation) => {
    const updateFn = (prev: WaterLocation[]) =>
      prev.map(l => (l.id === updatedLoc.id ? updatedLoc : l));

    if (updatedLoc.category === 'RO') {
      setRoLocations(updateFn);
    } else {
      setStandardLocations(updateFn);
    }

    if (selectedLocation && selectedLocation.id === updatedLoc.id) {
      setSelectedLocation(updatedLoc);
    }
  };

  return (
    <DataContext.Provider
      value={{
        roLocations,
        standardLocations,
        allLocations,
        bowserDuties,
        loadingLogs,
        requests,
        priorityLocations,
        selectedLocation,
        setSelectedLocation,
        addBowserDuty,
        addLoadingLog,
        togglePriorityLocation,
        addRequest,
        updateRequestStatus,
        quickFillLocation,
        addLocation,
        updateLocation
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
