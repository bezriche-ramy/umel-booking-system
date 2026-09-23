/** Normalises French phone numbers to E.164 (+33…). Foreign numbers already in + format are kept. */
export function normalizePhone(raw: string | null | undefined): string | null {
    if (!raw) return null;
    let p = String(raw).replace(/[^\d+]/g, "");
    if (!p) return null;
    if (p.startsWith("00")) p = `+${p.slice(2)}`;
    if (p.startsWith("+")) return p;
    if (p.startsWith("0") && p.length === 10) return `+33${p.slice(1)}`;
    if (p.startsWith("33") && p.length === 11) return `+${p}`;
    if (p.length === 9 && /^[67]/.test(p)) return `+33${p}`;
    return p;
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
