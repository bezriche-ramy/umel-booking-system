/** Libellés et formats partagés (utilisables côté serveur et client). */

export const STATUS_LABELS: Record<string, string> = {
    CONFIRMED: "Confirmé",
    COMPLETED: "Présente",
    NO_SHOW: "Absente",
    CANCELLED: "Annulé",
    SCHEDULED: "Planifiée",
    DONE: "Terminée",
    PROSPECT: "Prospect",
    CONVERTIE: "Convertie",
};

export function formatDay(day: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
    const [y, m, d] = day.split("-").map(Number);
    return new Intl.DateTimeFormat("fr-FR", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
    ON_HOLD: "En attente",
    COMPLETED: "Terminée",
    FAILED: "Échouée",
    CANCELLED: "Annulée",
    REFUNDED: "Remboursée",
};

export const DEPOSIT_STATUS_LABELS: Record<string, string> = {
    PENDING: "En attente",
    CHARGED: "Débité",
    FAILED: "Échec",
    REFUNDED: "Remboursé",
    EXPIRED: "Expiré",
    NO_CARD: "Sans carte",
};

export const CHARGE_REASON_LABELS: Record<string, string> = {
    NO_SHOW: "Absence",
    LATE_CANCELLATION: "Annulation tardive (< 72h)",
    MANUAL: "Débit manuel",
    PREPAID: "Payé à la réservation (ancien système)",
};

export const formatEuros = (cents: number) =>
    `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
