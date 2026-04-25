const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateTicketCode(): string {
  const l1 = LETTERS[Math.floor(Math.random() * 26)];
  const l2 = LETTERS[Math.floor(Math.random() * 26)];
  const digits = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `${l1}${l2}${digits}`;
}

export function formatTicketCode(code: string | null | undefined): string {
  return code ? `#${code}` : "#------";
}
