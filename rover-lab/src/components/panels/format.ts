export const fmt = (v: number, digits = 0) => v.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const signed = (v: number, digits = 0) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${fmt(Math.abs(v), digits)}`;
export const kmh = (ms: number) => ms * 3.6;
