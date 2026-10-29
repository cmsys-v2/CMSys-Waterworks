import { ConsumerCategory } from '../types/commercialBilling';

export interface SlabChargeItem {
  slabDescription: string;
  unitsInSlab: number;
  ratePerUnit: number;
  amountLkr: number;
}

export interface ComputedBillResult {
  volumetric: number;
  fixedCharge: number;
  vatOrSurcharge: number;
  broughtForwardArrears: number;
  total: number;
  slabBreakdown: SlabChargeItem[];
}

/**
 * Deterministic Tariff Calculation Engine based on National Water Supply & Drainage Board (NWSDB)
 * Sri Lanka Gazette Tariff Structure (August 2023 Revision) for Commercial & Non-Naval Consumers.
 */
export function computeCommercialBill(
  units: number,
  category: ConsumerCategory,
  broughtForwardArrears: number = 0
): ComputedBillResult {
  const unitsSanitized = Math.max(0, units);
  let volumetric = 0;
  let fixedCharge = 0;
  const slabBreakdown: SlabChargeItem[] = [];

  if (category === 'COMMERCIAL_PRIVATE' || category === 'CONTRACTOR_AGENCY') {
    let remaining = unitsSanitized;

    // Slab 1: 01 – 25 units @ 110.00 LKR
    const s1 = Math.min(remaining, 25);
    if (s1 > 0) {
      const amt = s1 * 110;
      volumetric += amt;
      slabBreakdown.push({
        slabDescription: 'Slab 1 (01 - 25 units)',
        unitsInSlab: s1,
        ratePerUnit: 110,
        amountLkr: amt
      });
      remaining = Math.max(0, remaining - 25);
    }

    // Slab 2: 26 – 50 units @ 130.00 LKR
    if (remaining > 0) {
      const s2 = Math.min(remaining, 25);
      const amt = s2 * 130;
      volumetric += amt;
      slabBreakdown.push({
        slabDescription: 'Slab 2 (26 - 50 units)',
        unitsInSlab: s2,
        ratePerUnit: 130,
        amountLkr: amt
      });
      remaining = Math.max(0, remaining - 25);
    }

    // Slab 3: 51 – 100 units @ 160.00 LKR
    if (remaining > 0) {
      const s3 = Math.min(remaining, 50);
      const amt = s3 * 160;
      volumetric += amt;
      slabBreakdown.push({
        slabDescription: 'Slab 3 (51 - 100 units)',
        unitsInSlab: s3,
        ratePerUnit: 160,
        amountLkr: amt
      });
      remaining = Math.max(0, remaining - 50);
    }

    // Slab 4: 101 – 200 units @ 180.00 LKR
    if (remaining > 0) {
      const s4 = Math.min(remaining, 100);
      const amt = s4 * 180;
      volumetric += amt;
      slabBreakdown.push({
        slabDescription: 'Slab 4 (101 - 200 units)',
        unitsInSlab: s4,
        ratePerUnit: 180,
        amountLkr: amt
      });
      remaining = Math.max(0, remaining - 100);
    }

    // Slab 5: 201 – 400 units @ 200.00 LKR
    if (remaining > 0) {
      const s5 = Math.min(remaining, 200);
      const amt = s5 * 200;
      volumetric += amt;
      slabBreakdown.push({
        slabDescription: 'Slab 5 (201 - 400 units)',
        unitsInSlab: s5,
        ratePerUnit: 200,
        amountLkr: amt
      });
      remaining = Math.max(0, remaining - 200);
    }

    // Slab 6: Above 400 units @ 220.00 LKR
    if (remaining > 0) {
      const amt = remaining * 220;
      volumetric += amt;
      slabBreakdown.push({
        slabDescription: 'Slab 6 (Above 400 units)',
        unitsInSlab: remaining,
        ratePerUnit: 220,
        amountLkr: amt
      });
    }

    // Step-wise Fixed monthly charge (NWSDB 2023 Gazette)
    if (unitsSanitized <= 25) fixedCharge = 400;
    else if (unitsSanitized <= 50) fixedCharge = 1000;
    else if (unitsSanitized <= 100) fixedCharge = 1600;
    else if (unitsSanitized <= 200) fixedCharge = 3200;
    else if (unitsSanitized <= 400) fixedCharge = 5000;
    else fixedCharge = 6500;

  } else if (category === 'SHIPPING_VESSEL_CIVILIAN') {
    // Port maritime & bunkering commercial vessels
    const rate = 420;
    volumetric = unitsSanitized * rate;
    fixedCharge = 5000;
    slabBreakdown.push({
      slabDescription: 'Port Maritime Bunkering Rate (Flat)',
      unitsInSlab: unitsSanitized,
      ratePerUnit: rate,
      amountLkr: volumetric
    });
  } else {
    // Government / Institutional Flat Rate (SLPA, Telecom, External Agencies)
    const rate = 165;
    volumetric = unitsSanitized * rate;
    fixedCharge = 2500;
    slabBreakdown.push({
      slabDescription: 'Institutional Quasi-Gov Standard Rate',
      unitsInSlab: unitsSanitized,
      ratePerUnit: rate,
      amountLkr: volumetric
    });
  }

  const vatOrSurcharge = 0; // VAT exempt or embedded per local naval gazette
  const total = Math.round(volumetric + fixedCharge + broughtForwardArrears);

  return {
    volumetric,
    fixedCharge,
    vatOrSurcharge,
    broughtForwardArrears,
    total,
    slabBreakdown
  };
}
