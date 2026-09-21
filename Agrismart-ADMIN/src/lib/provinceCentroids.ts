// Province / municipality centroids for fallback heatmap points
// Sources: approximate centroids for Philippines provinces + Occidental Mindoro municipalities
// Used when a farm has no precise lat/lng

export const PHILIPPINES_CENTER = { latitude: 12.8797, longitude: 121.7740 };

export const PROVINCE_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  // Core list from weather page
  'metro manila': { latitude: 14.6042, longitude: 120.9822 },
  'cebu': { latitude: 10.3157, longitude: 123.8854 },
  'davao del sur': { latitude: 6.7528, longitude: 125.3572 },
  'iloilo': { latitude: 10.7202, longitude: 122.5621 },
  'laguna': { latitude: 14.1709, longitude: 121.2442 },
  'batangas': { latitude: 13.7565, longitude: 121.0583 },
  'pampanga': { latitude: 15.0794, longitude: 120.62 },
  'bulacan': { latitude: 14.7943, longitude: 120.8799 },
  'cavite': { latitude: 14.2456, longitude: 120.8786 },
  'occidental mindoro': { latitude: 13.1024, longitude: 120.7651 },
  'oriental mindoro': { latitude: 13.0, longitude: 121.3 },
  'nueva ecija': { latitude: 15.5784, longitude: 121.1113 },
  'pangasinan': { latitude: 15.8949, longitude: 120.2863 },
  'isabela': { latitude: 16.9754, longitude: 121.8107 },
  'negros occidental': { latitude: 10.2926, longitude: 123.0247 },
  'palawan': { latitude: 9.8349, longitude: 118.7384 },

  // Additional major provinces
  'quezon': { latitude: 14.0316, longitude: 121.5406 },
  'rizal': { latitude: 14.6037, longitude: 121.3089 },
  'bataan': { latitude: 14.6417, longitude: 120.481 },
  'zambales': { latitude: 15.3555, longitude: 119.9544 },
  'tarlac': { latitude: 15.48, longitude: 120.5979 },
  'benguet': { latitude: 16.5577, longitude: 120.8037 },
  'cagayan': { latitude: 17.6581, longitude: 121.7303 },
  'la union': { latitude: 16.6063, longitude: 120.3322 },
  'ilocos norte': { latitude: 18.1647, longitude: 120.7115 },
  'ilocos sur': { latitude: 17.3067, longitude: 120.533 },
  'albey': { latitude: 13.1775, longitude: 123.532 },
  'albay': { latitude: 13.1775, longitude: 123.532 },
  'camarines sur': { latitude: 13.525, longitude: 123.3489 },
  'sorsogon': { latitude: 12.9928, longitude: 124.014 },
  'leyte': { latitude: 11.0333, longitude: 124.854 },
  'bohol': { latitude: 9.8349, longitude: 124.1435 },
  'misamis oriental': { latitude: 8.4866, longitude: 124.8459 },
  'bukidnon': { latitude: 7.912, longitude: 125.0206 },
  'davao del norte': { latitude: 7.5618, longitude: 125.6533 },
  'south cotabato': { latitude: 6.3358, longitude: 124.7741 },
  'maguindanao': { latitude: 6.942, longitude: 124.4197 },
  'zamboanga del sur': { latitude: 7.8384, longitude: 123.2967 },

  // Occidental Mindoro municipalities (more specific than province)
  'sablayan': { latitude: 12.8352, longitude: 120.7753 },
  'san jose': { latitude: 12.3525, longitude: 121.0678 },
  'magsaysay': { latitude: 12.3167, longitude: 120.9 },
  'bulalacao': { latitude: 12.3333, longitude: 121.35 },
  'calintaan': { latitude: 12.5764, longitude: 120.947 },
  'rizal occidental mindoro': { latitude: 12.4667, longitude: 120.9667 },
  'paluan': { latitude: 13.425, longitude: 120.4617 },
  'abra de ilog': { latitude: 13.4439, longitude: 120.7286 },
  'mamburao': { latitude: 13.2197, longitude: 120.5958 },
  'santa cruz': { latitude: 13.4167, longitude: 120.7167 },
  'lubang': { latitude: 13.85, longitude: 120.15 },
  'looc': { latitude: 13.7333, longitude: 120.25 },
};

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export function getProvinceCenter(provinceRaw: string | null | undefined): { latitude: number; longitude: number; matched: string | null } {
  if (!provinceRaw || typeof provinceRaw !== 'string') return { ...PHILIPPINES_CENTER, matched: null };
  const key = normalize(provinceRaw);
  if (PROVINCE_CENTROIDS[key]) {
    return { ...PROVINCE_CENTROIDS[key], matched: key };
  }
  // Try without "province" suffix/prefix
  const withoutProvince = key.replace(/\bprovince\b/g, '').trim();
  if (PROVINCE_CENTROIDS[withoutProvince]) {
    return { ...PROVINCE_CENTROIDS[withoutProvince], matched: withoutProvince };
  }
  // Try contains match (e.g. "Occidental Mindoro - Sablayan" contains "sablayan")
  for (const k of Object.keys(PROVINCE_CENTROIDS)) {
    if (key.includes(k) || k.includes(key)) {
      return { ...PROVINCE_CENTROIDS[k], matched: k };
    }
  }
  // Fallback to Philippines center
  return { ...PHILIPPINES_CENTER, matched: null };
}
