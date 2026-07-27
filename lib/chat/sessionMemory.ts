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
  const lower = text.toLowerCase();

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

  // Extract Cities / Governorates
  if (lower.includes("قاهرة") || lower.includes("قاهره") || lower.includes("جيزة") || lower.includes("جيزه") || lower.includes("cairo")) {
    extracted.city = "القاهرة والجيزة";
    extracted.governorate = "القاهرة";
  } else if (lower.includes("منصورة") || lower.includes("منصوره") || lower.includes("دقهلية") || lower.includes("دقهليه")) {
    extracted.city = "المنصورة";
    extracted.governorate = "الدقهلية";
  } else if (lower.includes("اسكندرية") || lower.includes("إسكندرية") || lower.includes("اسكندريه") || lower.includes("alex")) {
    extracted.city = "الإسكندرية";
    extracted.governorate = "الإسكندرية";
  } else if (lower.includes("طنطا") || lower.includes("محلة") || lower.includes("محله") || lower.includes("غربية")) {
    extracted.city = "طنطا والمحلة";
    extracted.governorate = "الغربية";
  }

  // Extract Preferred Category
  if (lower.includes("شورت") || lower.includes("بحر") || lower.includes("ساحل")) {
    extracted.preferredCategory = "شورتات";
  } else if (lower.includes("تيشيرت") || lower.includes("تي شيرت") || lower.includes("توب")) {
    extracted.preferredCategory = "تيشيرتات";
  } else if (lower.includes("هودي") || lower.includes("سويت شيرت")) {
    extracted.preferredCategory = "هوديز";
  }

  return extracted;
}
