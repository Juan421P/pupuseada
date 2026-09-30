export const cents = (n: number): number => Math.round(n * 100);
export const fold = (s: string): string => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
