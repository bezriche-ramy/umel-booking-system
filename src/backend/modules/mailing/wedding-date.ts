/**
 * Date de mariage saisie librement par la cliente (« 12/06/2027 », « 12.06.2027 », « 12 juin 2027 »…).
 * Renvoie « AAAA-MM-JJ », ou null si la date est approximative (« été 2027 ») : pas de félicitations dans ce cas.
 */
const MONTHS: Record<string, number> = {
    janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
};

export function parseWeddingDate(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const s = raw.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    let d: number, m: number, y: number;
    const num = s.match(/^(\d{1,2})\s*[./\- ]\s*(\d{1,2})\s*[./\- ]\s*(\d{2}|\d{4})$/);
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const txt = s.match(/^(\d{1,2})(?:er)?\s+([a-z]+)\s+(\d{4})$/);
    if (num) [d, m, y] = [Number(num[1]), Number(num[2]), Number(num[3])];
    else if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
    else if (txt && MONTHS[txt[2]]) [d, m, y] = [Number(txt[1]), MONTHS[txt[2]], Number(txt[3])];
    else return null;
    if (y < 100) y += 2000;
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
    return date.toISOString().slice(0, 10);
}
