export interface SemesterInfo {
  code: string;
  academicYear: number;
  term: 1 | 2;
}

/**
 * Derive Thai academic semester from a date.
 * ส.ค.(8)–ธ.ค.(12) = ภาค 1 of that year
 * ม.ค.(1)–พ.ค.(5)  = ภาค 2 of previous academic year
 * มิ.ย.–ก.ค.       = null (ปิดภาค)
 */
export function getSemester(date: Date): SemesterInfo | null {
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  if (m >= 8 && m <= 12) {
    const ay = y + 543;
    return { code: `1/${ay}`, academicYear: ay, term: 1 };
  }
  if (m >= 1 && m <= 5) {
    const ay = y - 1 + 543;
    return { code: `2/${ay}`, academicYear: ay, term: 2 };
  }
  return null;
}

export function getCurrentSemester(): SemesterInfo | null {
  return getSemester(new Date());
}

/** List distinct semester codes visible in an array of due dates, sorted desc */
export function getSemesterOptions(dueDates: Date[]): string[] {
  const seen = new Set<string>();
  for (const d of dueDates) {
    const s = getSemester(d);
    if (s) seen.add(s.code);
  }
  return [...seen].sort().reverse();
}

/** Thai label: "1/2569" → "ภาคเรียนที่ 1 ปีการศึกษา 2569" */
export function formatSemesterLabel(code: string): string {
  const [term, year] = code.split("/");
  return `ภาคเรียนที่ ${term} ปีการศึกษา ${year}`;
}
