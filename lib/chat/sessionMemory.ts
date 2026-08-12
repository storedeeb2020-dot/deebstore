export interface UserSessionData {
  size?: string;
  city?: string;
  governorate?: string;
  preferredCategory?: string;
  lastProductId?: string;
}

// In-memory session store (keyed by session ID)
const memoryStore = new Map<string, UserSessionData>();

export function getSessionData(sessionId: string): UserSessionData {
  return memoryStore.get(sessionId) || {};
}

export function updateSessionData(sessionId: string, updates: Partial<UserSessionData>): UserSessionData {
  const current = getSessionData(sessionId);
  const updated = { ...current, ...updates };
  memoryStore.set(sessionId, updated);
  return updated;
}

export function extractEntitiesFromMessage(text: string): Partial<UserSessionData> {
  const extracted: Partial<UserSessionData> = {};

  // Extract height and weight for size calculation
  const nums = text.match(/\d+/g)?.map(Number) || [];
  if (nums.length >= 2) {
    const height = Math.max(...nums);
    const weight = Math.min(...nums);
    if (height >= 140 && height <= 220 && weight >= 40 && weight <= 150) {
      if (height < 165 || weight < 60) extracted.size = "S";
      else if (height <= 175 && weight <= 72) extracted.size = "M";
      else if (height <= 182 && weight <= 84) extracted.size = "L";
      else if (height <= 190 && weight <= 95) extracted.size = "XL";
      else extracted.size = "XXL";
    }
  }

  return extracted;
}
