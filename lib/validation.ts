export function cleanText(value: unknown, max = 5000) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
export function validUsername(value: string) { return /^[a-zA-Z0-9_]{3,30}$/.test(value); }
export function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
