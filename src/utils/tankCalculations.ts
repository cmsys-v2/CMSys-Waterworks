import { TankDimensions, TankFormFactor } from '../types/waterDistribution';

/**
 * Standard Dimensional to Capacity Calculation Engine
 * Converts geometric measurements into accurate water volume metrics.
 */
export interface CalculatedTankMetrics {
  crossSectionAreaM2: number;
  totalGrossVolumeLiters: number;
  usableGrossVolumeLiters: number;
  netCapacityLiters: number;
  deadStorageLiters: number;
  currentVolumeLiters: number;
  fillPercentage: number;
}

/**
 * Calculate the area of a circular segment for a horizontal cylinder
 * @param r Radius in meters
 * @param h Liquid level height in meters
 */
export function calculateHorizontalCylinderSegmentArea(r: number, h: number): number {
  if (h <= 0) return 0;
  const d = 2 * r;
  if (h >= d) return Math.PI * r * r;

  // Segment Area = r^2 * acos((r - h) / r) - (r - h) * sqrt(2*r*h - h^2)
  const clampedRatio = Math.max(-1, Math.min(1, (r - h) / r));
  const theta = Math.acos(clampedRatio);
  const chordHalf = Math.sqrt(Math.max(0, 2 * r * h - h * h));
  return r * r * theta - (r - h) * chordHalf;
}

/**
 * Core calculation function given tank dimensions and current water level.
 */
export function calculateTankMetrics(
  dimensions: Partial<TankDimensions>,
  currentLevelMeters: number = 0
): CalculatedTankMetrics {
  const formFactor: TankFormFactor = dimensions.formFactor || 'CYLINDRICAL_VERTICAL';
  const totalH = Math.max(0, dimensions.totalHeightMeters || 0);
  const usableH = Math.min(totalH, Math.max(0, dimensions.usableHeightMeters ?? totalH));
  const deadStorage = Math.max(0, dimensions.deadStorageLiters || 0);
  const currentH = Math.max(0, Math.min(totalH, currentLevelMeters));

  let crossSectionAreaM2 = 0;
  let totalGrossVolumeM3 = 0;
  let usableGrossVolumeM3 = 0;
  let currentVolumeLiters = 0;

  if (formFactor === 'CYLINDRICAL_VERTICAL') {
    const dia = Math.max(0, dimensions.diameterMeters || 0);
    const radius = dia / 2;
    crossSectionAreaM2 = Math.PI * radius * radius;
    totalGrossVolumeM3 = crossSectionAreaM2 * totalH;
    usableGrossVolumeM3 = crossSectionAreaM2 * usableH;
    currentVolumeLiters = Math.round(crossSectionAreaM2 * currentH * 1000);
  } else if (formFactor === 'RECTANGULAR_SUMP') {
    const length = Math.max(0, dimensions.lengthMeters || 0);
    const width = Math.max(0, dimensions.widthMeters || 0);
    crossSectionAreaM2 = length * width;
    totalGrossVolumeM3 = crossSectionAreaM2 * totalH;
    usableGrossVolumeM3 = crossSectionAreaM2 * usableH;
    currentVolumeLiters = Math.round(crossSectionAreaM2 * currentH * 1000);
  } else if (formFactor === 'CYLINDRICAL_HORIZONTAL') {
    const dia = Math.max(0, dimensions.diameterMeters || 0);
    const length = Math.max(0, dimensions.lengthMeters || 0);
    const radius = dia / 2;
    crossSectionAreaM2 = Math.PI * radius * radius;
    totalGrossVolumeM3 = crossSectionAreaM2 * length;

    const usableSegmentArea = calculateHorizontalCylinderSegmentArea(radius, usableH);
    usableGrossVolumeM3 = usableSegmentArea * length;

    const currentSegmentArea = calculateHorizontalCylinderSegmentArea(radius, currentH);
    currentVolumeLiters = Math.round(currentSegmentArea * length * 1000);
  }

  const totalGrossVolumeLiters = Math.round(totalGrossVolumeM3 * 1000);
  const usableGrossVolumeLiters = Math.round(usableGrossVolumeM3 * 1000);
  const netCapacityLiters = Math.max(0, usableGrossVolumeLiters - deadStorage);

  const effectiveCapacity = netCapacityLiters > 0 ? netCapacityLiters : totalGrossVolumeLiters;
  const fillPercentage = effectiveCapacity > 0
    ? Math.min(100, Math.max(0, parseFloat(((currentVolumeLiters / effectiveCapacity) * 100).toFixed(1))))
    : 0;

  return {
    crossSectionAreaM2: parseFloat(crossSectionAreaM2.toFixed(3)),
    totalGrossVolumeLiters,
    usableGrossVolumeLiters,
    netCapacityLiters,
    deadStorageLiters: deadStorage,
    currentVolumeLiters,
    fillPercentage
  };
}

/**
 * Computes exact coagulant mass required in kg based on inflow liters and optimal dose in mg/L (ppm)
 * Formula: Mass (kg) = (Inflow (L) * Dose (mg/L)) / 1,000,000
 */
export function calculateCoagulantMassKg(inflowLiters: number, optimalDosePpm: number): number {
  if (inflowLiters <= 0 || optimalDosePpm <= 0) return 0;
  return parseFloat(((inflowLiters * optimalDosePpm) / 1000000).toFixed(2));
}

/**
 * Computes estimated catchment runoff in Liters from precipitation
 * Default catchment constant for Naval Dockyard / Anandamkulam basin: ~120,000 L/mm
 */
export function calculateCatchmentRunoffLiters(rainfallMm: number, multiplierLitersPerMm: number = 120000): number {
  if (rainfallMm <= 0) return 0;
  return Math.round(rainfallMm * multiplierLitersPerMm);
}

/**
 * Computes well discharge in Liters per second based on sluice opening percentage and water column
 */
export function calculateWellDischargeLps(
  waterColumnMeters: number,
  gateOpenPercentage: number,
  baseFlowCoefficient: number = 28.5
): number {
  if (waterColumnMeters <= 0 || gateOpenPercentage <= 0) return 0;
  const gateRatio = Math.min(100, Math.max(0, gateOpenPercentage)) / 100;
  const headSqrt = Math.sqrt(Math.max(0, waterColumnMeters));
  return parseFloat((baseFlowCoefficient * gateRatio * headSqrt).toFixed(1));
}
