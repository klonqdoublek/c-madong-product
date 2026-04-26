// FNV-1a 32-bit hash for deterministic mock bed occupancy
// TODO: replace isMockOccupied with real beds.is_occupied query once admin tooling seeds occupancy
function fnv1a32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function isMockOccupied(
  bedId: string,
  semester: string,
  currentBedId?: string | null
): boolean {
  if (bedId === currentBedId) return false; // user's own bed always "available"
  return fnv1a32(`${bedId}-${semester}`) % 100 < 70; // ~70% occupied
}

export function getCurrentSemester(): string {
  const now = new Date();
  const bangkokOffset = 7 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bkk = new Date(utc + bangkokOffset * 60000);
  const m = bkk.getMonth() + 1;
  const y = bkk.getFullYear();
  if (m >= 8 && m <= 12) return `${y + 543}-1`;
  if (m >= 1 && m <= 5)  return `${y + 543}-2`;
  return `${y + 543}-s`;
}
