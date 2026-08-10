import { WaterLocation, BowserDuty, LoadingLog, WaterRequest } from '../types/waterDistribution';

export const INITIAL_RO_LOCATIONS: WaterLocation[] = [
  {
    id: 'ro-loc-01',
    name: 'Submarine Base RO Plant & Tank',
    base: 'Naval Dockyard East',
    category: 'RO',
    tankCapacity: 25000,
    currentLevel: 18500,
    lastLoadedDate: '2026-08-07 14:30',
    lastLoadedAmount: 8000,
    monthlyAvgConsumption: 125000,
    consumingPeopleCount: 450,
    benefactors: ['Submarine Squadron Crew', 'Technical Engineers', 'Clearance Diving Unit'],
    pointOfContact: {
      name: 'LCdr K.A. Perera',
      rank: 'Lieutenant Commander',
      phone: '+94 77 123 4567',
      department: 'Submarine Operations & Engineering'
    },
    coordinates: {
      lat: 8.5725,
      lng: 81.2385
    },
    isPriority: true,
    priorityReason: 'High priority operational submarine crew intake',
    futureSchedules: [
      {
        id: 'fs-01',
        scheduledDate: '2026-08-09',
        approxTime: '09:00',
        expectedVolume: 10000,
        bowserVehicleNo: 'NAHA-04',
        waterType: 'RO Water',
        status: 'Scheduled'
      },
      {
        id: 'fs-02',
        scheduledDate: '2026-08-11',
        approxTime: '14:00',
        expectedVolume: 8000,
        bowserVehicleNo: 'NAHA-07',
        waterType: 'RO Water',
        status: 'Scheduled'
      }
    ],
    supplyHistory: [
      { id: 'sh-01', date: '2026-08-07 14:30', bowserVehicleNo: 'NAHA-04', waterType: 'RO Water', amountLoaded: 8000, driverName: 'PO Silva (TA-402)' },
      { id: 'sh-02', date: '2026-08-05 10:15', bowserVehicleNo: 'NAHA-02', waterType: 'RO Water', amountLoaded: 10000, driverName: 'CPO Fernando' },
      { id: 'sh-03', date: '2026-08-02 16:00', bowserVehicleNo: 'NAHA-04', waterType: 'RO Water', amountLoaded: 7500, driverName: 'PO Silva (TA-402)' }
    ],
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'ro-loc-02',
    name: 'Officers Mess RO Water Station',
    base: 'SLNS Gemunu',
    category: 'RO',
    tankCapacity: 15000,
    currentLevel: 6200,
    lastLoadedDate: '2026-08-06 09:15',
    lastLoadedAmount: 5000,
    monthlyAvgConsumption: 78000,
    consumingPeopleCount: 280,
    benefactors: ['Wardroom Officers', 'Visiting Admirals & Guests', 'Mess Support Staff'],
    pointOfContact: {
      name: 'Lt C. Wickramasinghe',
      rank: 'Lieutenant',
      phone: '+94 71 987 6543',
      department: 'Mess Executive Office'
    },
    coordinates: {
      lat: 8.5760,
      lng: 81.2340
    },
    isPriority: false,
    futureSchedules: [
      {
        id: 'fs-03',
        scheduledDate: '2026-08-08',
        approxTime: '11:30',
        expectedVolume: 6000,
        bowserVehicleNo: 'NAHA-02',
        waterType: 'RO Water',
        status: 'Confirmed'
      }
    ],
    supplyHistory: [
      { id: 'sh-04', date: '2026-08-06 09:15', bowserVehicleNo: 'NAHA-02', waterType: 'RO Water', amountLoaded: 5000, driverName: 'CPO Fernando' },
      { id: 'sh-05', date: '2026-08-03 11:00', bowserVehicleNo: 'NAHA-04', waterType: 'RO Water', amountLoaded: 6000, driverName: 'PO Silva' }
    ],
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'ro-loc-03',
    name: 'Command Medical Hospital RO Supply',
    base: 'SLNS Gemunu',
    category: 'RO',
    tankCapacity: 30000,
    currentLevel: 22000,
    lastLoadedDate: '2026-08-07 17:00',
    lastLoadedAmount: 12000,
    monthlyAvgConsumption: 160000,
    consumingPeopleCount: 650,
    benefactors: ['Hospital Patients', 'Medical Staff & Surgeons', 'Emergency Ward'],
    pointOfContact: {
      name: 'Surgeon Cdr M. Jayawardena',
      rank: 'Commander (Doctor)',
      phone: '+94 77 444 5566',
      department: 'Naval Hospital Administration'
    },
    coordinates: {
      lat: 8.5710,
      lng: 81.2315
    },
    isPriority: true,
    priorityReason: 'Medical critical facility - non-stop pure RO requirement',
    futureSchedules: [
      {
        id: 'fs-04',
        scheduledDate: '2026-08-09',
        approxTime: '15:00',
        expectedVolume: 10000,
        bowserVehicleNo: 'NAHA-04',
        waterType: 'RO Water',
        status: 'Scheduled'
      }
    ],
    supplyHistory: [
      { id: 'sh-06', date: '2026-08-07 17:00', bowserVehicleNo: 'NAHA-04', waterType: 'RO Water', amountLoaded: 12000, driverName: 'PO Silva' },
      { id: 'sh-07', date: '2026-08-04 08:30', bowserVehicleNo: 'NAHA-07', waterType: 'RO Water', amountLoaded: 10000, driverName: 'PO Ratnayake' }
    ],
    createdAt: '2026-08-01T00:00:00.000Z'
  }
];

export const INITIAL_STANDARD_LOCATIONS: WaterLocation[] = [
  {
    id: 'std-loc-01',
    name: 'Main Jetty Gantry Supply Tank',
    base: 'Naval Dockyard West',
    category: 'Standard',
    tankCapacity: 50000,
    currentLevel: 14000,
    lastLoadedDate: '2026-08-06 18:00',
    lastLoadedAmount: 15000,
    monthlyAvgConsumption: 320000,
    consumingPeopleCount: 1200,
    benefactors: ['Docked Warships (OPVs & Fast Attack Crafts)', 'Pier Deck Hands', 'Harbour Tug Crew'],
    pointOfContact: {
      name: 'Cdr S. Gunaratne',
      rank: 'Commander',
      phone: '+94 77 888 9911',
      department: 'Pier & Harbour Management'
    },
    coordinates: {
      lat: 8.5780,
      lng: 81.2410
    },
    isPriority: true,
    priorityReason: 'Scheduled fleet departure refueling and tank filling',
    futureSchedules: [
      {
        id: 'fs-05',
        scheduledDate: '2026-08-08',
        approxTime: '08:00',
        expectedVolume: 20000,
        bowserVehicleNo: 'NB-4521',
        waterType: 'Normal Water',
        status: 'Confirmed'
      }
    ],
    supplyHistory: [
      { id: 'sh-08', date: '2026-08-06 18:00', bowserVehicleNo: 'NB-4521', waterType: 'Normal Water', amountLoaded: 15000, driverName: 'PO Bandara' },
      { id: 'sh-09', date: '2026-08-04 12:00', bowserVehicleNo: 'NAHA-08', waterType: 'Normal Water', amountLoaded: 18000, driverName: 'L/Sea Cooray' }
    ],
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'std-loc-02',
    name: 'Fleet Workshop & Engineering Complex',
    base: 'Dockyard Central',
    category: 'Standard',
    tankCapacity: 35000,
    currentLevel: 28000,
    lastLoadedDate: '2026-08-07 11:20',
    lastLoadedAmount: 12000,
    monthlyAvgConsumption: 190000,
    consumingPeopleCount: 850,
    benefactors: ['Heavy Machinery Technicians', 'Shipyard Welders', 'Dockyard Apprentices'],
    pointOfContact: {
      name: 'LCdr D. Dissanaike',
      rank: 'Lieutenant Commander',
      phone: '+94 71 333 2211',
      department: 'Dockyard Mechanical Workshop'
    },
    coordinates: {
      lat: 8.5740,
      lng: 81.2360
    },
    isPriority: false,
    futureSchedules: [
      {
        id: 'fs-06',
        scheduledDate: '2026-08-10',
        approxTime: '10:00',
        expectedVolume: 12000,
        bowserVehicleNo: 'NAHA-08',
        waterType: 'Normal Water',
        status: 'Scheduled'
      }
    ],
    supplyHistory: [
      { id: 'sh-10', date: '2026-08-07 11:20', bowserVehicleNo: 'NAHA-08', waterType: 'Normal Water', amountLoaded: 12000, driverName: 'L/Sea Cooray' }
    ],
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'std-loc-03',
    name: 'SLNS Tissa Main Barracks & Kitchen',
    base: 'SLNS Tissa',
    category: 'Standard',
    tankCapacity: 40000,
    currentLevel: 9500,
    lastLoadedDate: '2026-08-05 15:45',
    lastLoadedAmount: 15000,
    monthlyAvgConsumption: 240000,
    consumingPeopleCount: 1100,
    benefactors: ['Sailors Barracks', 'Main Galley & Kitchen', 'Administrative Staff'],
    pointOfContact: {
      name: 'Lt T. Alwis',
      rank: 'Lieutenant',
      phone: '+94 77 555 7788',
      department: 'Regimental Administration'
    },
    coordinates: {
      lat: 8.5680,
      lng: 81.2290
    },
    isPriority: false,
    futureSchedules: [
      {
        id: 'fs-07',
        scheduledDate: '2026-08-08',
        approxTime: '16:00',
        expectedVolume: 15000,
        bowserVehicleNo: 'NB-4521',
        waterType: 'Normal Water',
        status: 'Scheduled'
      }
    ],
    supplyHistory: [
      { id: 'sh-11', date: '2026-08-05 15:45', bowserVehicleNo: 'NB-4521', waterType: 'Normal Water', amountLoaded: 15000, driverName: 'PO Bandara' }
    ],
    createdAt: '2026-08-01T00:00:00.000Z'
  }
];

export const INITIAL_BOWSER_DUTIES: BowserDuty[] = [
  {
    id: 'duty-01',
    capacity: 12000,
    vehicleNo: 'NAHA-04',
    taName: 'PO Silva H.M.',
    taNumber: 'TA-40291',
    taContract: 'Naval Transport Unit - Contract #NTU-2026/88',
    dutyMeName: 'CPO Kumara R.P.',
    dutyMeNumber: 'ME-1104',
    dutyMeContract: 'Chief Mechanical Branch - Contract #MEB-992',
    dutyDate: '2026-08-08',
    status: 'Active',
    schedule: [
      {
        id: 'sch-01',
        pipelinePlace: 'Submarine Pier Gantry Alpha',
        waterType: 'RO Water',
        quantity: 10000,
        locationName: 'Submarine Base RO Plant & Tank',
        approxTime: '09:00',
        status: 'Scheduled',
        remarks: 'Priority supply for incoming vessel'
      },
      {
        id: 'sch-02',
        pipelinePlace: 'Hospital RO Connection Line',
        waterType: 'RO Water',
        quantity: 8000,
        locationName: 'Command Medical Hospital RO Supply',
        approxTime: '14:30',
        status: 'Scheduled'
      }
    ],
    createdAt: '2026-08-08T00:10:00.000Z'
  },
  {
    id: 'duty-02',
    capacity: 15000,
    vehicleNo: 'NB-4521',
    taName: 'PO Bandara W.M.',
    taNumber: 'TA-38910',
    taContract: 'Heavy Bowser Fleet - Contract #HBF-771',
    dutyMeName: 'PO Rajapaksha K.',
    dutyMeNumber: 'ME-2451',
    dutyMeContract: 'Engineering Support - Contract #ENG-410',
    dutyDate: '2026-08-08',
    status: 'Active',
    schedule: [
      {
        id: 'sch-03',
        pipelinePlace: 'Main Jetty Booster Station',
        waterType: 'Normal Water',
        quantity: 15000,
        locationName: 'Main Jetty Gantry Supply Tank',
        approxTime: '08:00',
        status: 'Delivered',
        remarks: 'Successfully delivered full load'
      },
      {
        id: 'sch-04',
        pipelinePlace: 'Tissa Galley Feeder Pipe',
        waterType: 'Normal Water',
        quantity: 15000,
        locationName: 'SLNS Tissa Main Barracks & Kitchen',
        approxTime: '16:00',
        status: 'Scheduled'
      }
    ],
    createdAt: '2026-08-08T00:20:00.000Z'
  }
];

export const INITIAL_LOADING_LOGS: LoadingLog[] = [
  {
    id: 'load-01',
    locationName: 'Submarine Base RO Plant & Tank',
    volumeLoaded: 8000,
    waterType: 'RO Water',
    timestamp: '2026-08-08 00:35:10',
    isManualOverride: false,
    bowserVehicleNo: 'NAHA-04',
    gantryOperator: 'Chief Petty Officer Jayasooriya',
    remarks: 'RO Gantry #2 - High Purity Verified (TDS < 15 ppm)',
    createdAt: '2026-08-08T00:35:10.000Z'
  },
  {
    id: 'load-02',
    locationName: 'Main Jetty Gantry Supply Tank',
    volumeLoaded: 15000,
    waterType: 'Normal Water',
    timestamp: '2026-08-07 18:00:00',
    isManualOverride: true,
    bowserVehicleNo: 'NB-4521',
    gantryOperator: 'PO Mendis',
    remarks: 'Manual entry for evening fleet refuel',
    createdAt: '2026-08-07T18:00:00.000Z'
  },
  {
    id: 'load-03',
    locationName: 'Command Medical Hospital RO Supply',
    volumeLoaded: 12000,
    waterType: 'RO Water',
    timestamp: '2026-08-07 17:00:00',
    isManualOverride: false,
    bowserVehicleNo: 'NAHA-04',
    gantryOperator: 'CPO Jayasooriya',
    remarks: 'Hospital emergency stock top-up',
    createdAt: '2026-08-07T17:00:00.000Z'
  }
];

export const INITIAL_REQUESTS: WaterRequest[] = [
  {
    id: 'req-01',
    locationId: 'std-loc-01',
    locationName: 'Main Jetty Gantry Supply Tank',
    base: 'Naval Dockyard West',
    category: 'Standard',
    waterType: 'Normal Water',
    requiredVolume: 20000,
    urgency: 'Emergency',
    isPriority: true,
    status: 'Priority',
    requestedBy: 'Cdr S. Gunaratne (Harbour Master)',
    contactPhone: '+94 77 888 9911',
    requestedAt: '2026-08-08 00:15',
    remarks: 'Cruiser arriving at 0900. Tank at critical level.'
  },
  {
    id: 'req-02',
    locationId: 'ro-loc-01',
    locationName: 'Submarine Base RO Plant & Tank',
    base: 'Naval Dockyard East',
    category: 'RO',
    waterType: 'RO Water',
    requiredVolume: 10000,
    urgency: 'Urgent',
    isPriority: true,
    status: 'Assigned',
    requestedBy: 'LCdr K.A. Perera',
    contactPhone: '+94 77 123 4567',
    requestedAt: '2026-08-07 22:00',
    remarks: 'Assigned to Bowser NAHA-04'
  },
  {
    id: 'req-03',
    locationId: 'std-loc-03',
    locationName: 'SLNS Tissa Main Barracks & Kitchen',
    base: 'SLNS Tissa',
    category: 'Standard',
    waterType: 'Normal Water',
    requiredVolume: 15000,
    urgency: 'Standard',
    isPriority: false,
    status: 'Pending',
    requestedBy: 'Lt T. Alwis',
    contactPhone: '+94 77 555 7788',
    requestedAt: '2026-08-07 19:30',
    remarks: 'Routine meal preparation top-up'
  }
];

// Alias Exports
export const SEED_RO_LOCATIONS = INITIAL_RO_LOCATIONS;
export const SEED_STANDARD_LOCATIONS = INITIAL_STANDARD_LOCATIONS;
export const SEED_BOWSER_DUTIES = INITIAL_BOWSER_DUTIES;
export const SEED_LOADING_LOGS = INITIAL_LOADING_LOGS;
export const SEED_WATER_REQUESTS = INITIAL_REQUESTS;
