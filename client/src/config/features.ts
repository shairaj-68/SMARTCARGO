export interface FeatureFlags {
  FEATURE_AI_RECOMMEND: boolean;
  FEATURE_NL_SEARCH: boolean;
  FEATURE_PACKING_V2: boolean;
  FEATURE_PRICE_INTEL: boolean;
  FEATURE_DELAY_PREDICT: boolean;
  FEATURE_DOC_AI: boolean;
  FEATURE_CONTROL_TOWER: boolean;
  FEATURE_DEMAND_FORECAST: boolean;
  FEATURE_CARBON: boolean;
  FEATURE_MULTILINGUAL: boolean;
}

const STORAGE_KEY = 'smartcargo_v2_features';

const defaultFlags: FeatureFlags = {
  FEATURE_AI_RECOMMEND: true,
  FEATURE_NL_SEARCH: true,
  FEATURE_PACKING_V2: true,
  FEATURE_PRICE_INTEL: true,
  FEATURE_DELAY_PREDICT: true,
  FEATURE_DOC_AI: true,
  FEATURE_CONTROL_TOWER: true,
  FEATURE_DEMAND_FORECAST: true,
  FEATURE_CARBON: true,
  FEATURE_MULTILINGUAL: true,
};

export function getFeatureFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultFlags, ...JSON.parse(stored) };
  } catch (e) {}
  return defaultFlags;
}

export function setFeatureFlags(flags: Partial<FeatureFlags>) {
  const current = getFeatureFlags();
  const updated = { ...current, ...flags };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
