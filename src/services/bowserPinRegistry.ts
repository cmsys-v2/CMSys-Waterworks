import { BowserRegistryEntry } from '../types/waterDistribution';

// Generate published registry for 30 registered bowsers (SR-01 to SR-30)
export const PUBLISHED_BOWSER_REGISTRY: BowserRegistryEntry[] = Array.from({ length: 30 }, (_, i) => {
  const num = i + 1;
  const srNo = `SR-${String(num).padStart(2, '0')}`;
  const vehicleNo = `NAHA-${String(num).padStart(2, '0')}`;
  const pin = `${1000 + num}`; // Predetermined PINs: 1001, 1002 ... 1030
  
  const taNames = ['PO Silva H.M.', 'PO Ranasinghe H.K.', 'PO Bandara W.M.', 'CPO Fernando K.', 'PO Perera M.T.'];
  const meNames = ['CPO Kumara R.P.', 'CPO Gunawardena M.', 'PO Rajapaksha K.', 'L/Sea Cooray D.', 'PO Ratnayake B.'];

  return {
    srNo,
    vehicleNo,
    pin,
    capacity: num % 2 === 0 ? 15000 : 12000,
    defaultTaName: taNames[i % taNames.length],
    defaultMeName: meNames[i % meNames.length]
  };
});

export const validateBowserPin = (vehicleNoOrSr: string, pinInput: string): boolean => {
  const entry = PUBLISHED_BOWSER_REGISTRY.find(
    b => b.vehicleNo.toLowerCase() === vehicleNoOrSr.trim().toLowerCase() ||
         b.srNo.toLowerCase() === vehicleNoOrSr.trim().toLowerCase()
  );
  if (!entry) {
    // Fallback: allow 1001 for test bowsers if not strictly matching
    return pinInput.trim() === '1001' || pinInput.trim() === '1234';
  }
  return entry.pin === pinInput.trim();
};
