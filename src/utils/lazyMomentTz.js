let cachedMoment;

export async function getMomentTz() {
  if (cachedMoment) {
    return cachedMoment;
  }
  const mod = await import('moment-timezone');
  cachedMoment = mod.default || mod;
  return cachedMoment;
}
