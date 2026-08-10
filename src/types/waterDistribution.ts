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
