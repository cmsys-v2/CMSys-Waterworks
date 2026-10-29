export type ConsumerCategory = 
  | 'COMMERCIAL_PRIVATE' 
  | 'PORT_AUTHORITY_SLPA' 
  | 'CONTRACTOR_AGENCY' 
  | 'SHIPPING_VESSEL_CIVILIAN' 
  | 'INSTITUTIONAL';

export interface NonNavalConsumer {
  accountNumber: string; // e.g., NNC-2024-001
  consumerName: string;
  companyOrOrg: string;
  category: ConsumerCategory;
  contactPerson: string;
  contactPhone: string;
  email?: string;
  connectionLocation: string; // Dockyard jetty, gate warehouse, etc.
  meterSerial: string;
  initialReadingUnits: number;
  activeStatus: 'ACTIVE' | 'DISCONNECTED' | 'UNDER_MAINTENANCE';
  currentArrearsLkr: number;
  advanceDepositLkr: number;
}

export interface TariffSlab {
  minUnits: number;
  maxUnits: number | null; // null for highest bracket
  ratePerUnitLkr: number;
  fixedChargeLkr: number;
}

export interface CommercialWaterBill {
  billNumber: string; // e.g., INV-2024-10-042
  accountNumber: string;
  billingPeriod: string; // YYYY-MM
  billDate: string;
  dueDate: string;
  previousMeterReading: number;
  currentMeterReading: number;
  totalUnitsConsumed: number; // in m³ (1,000L)
  
  // Breakdown
  volumetricChargeLkr: number;
  fixedServiceChargeLkr: number;
  vatOrSurchargeLkr: number;
  broughtForwardArrearsLkr: number;
  totalPayableLkr: number;
  
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  amountPaidLkr: number;
  paidDate?: string;
  receiptNumber?: string;
  paymentMode?: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'GOV_VOUCHER';
}

export interface ConsumerPaymentReceipt {
  receiptId: string;
  billNumber: string;
  accountNumber: string;
  paymentDate: string;
  amountReceivedLkr: number;
  paymentMethod: string;
  referenceNo: string; // Cheque No / Bank Slip Ref
  receivedByBadge: string;
  balanceArrearsLkr: number;
}
