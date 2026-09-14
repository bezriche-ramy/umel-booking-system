/**
 * ============================================================================
 * CONFIGURATION DU PLANNING ET DES DISPONIBILITÉS — UMEL COUTURE
 * ============================================================================
 *
 * Ce fichier est conçu pour être géré très simplement par TOUTE L'ÉQUIPE.
 * Vous pouvez ici en quelques secondes :
 * 1. Ouvrir ou fermer un jour habituel de la semaine (ex: fermer le dimanche).
 * 2. Poser des congés annuels ou fermetures exceptionnelles (ex: Noël, vacances d'été).
 * 3. Ouvrir exceptionnellement une journée (ex: ouvrir un lundi de fête).
 * 4. Bloquer ou ajouter des créneaux horaires spécifiques pour une date précise.
 *
 * ============================================================================
 */

export interface WeekdayConfig {
    label: string;
    isOpen: boolean;
    startHour: number; // Ex: 10 pour 10:00
    lastSlotHour: number; // Ex: 17 pour le créneau 17:00-18:00
    storeClosingTime: string; // Ex: "18:30"
}

export const SCHEDULE_CONFIG = {
    /**
     * OPTION RAPIDE : FERMETURE TOTALE DU DIMANCHE
     * Mettre à `true` pour fermer automatiquement tous les dimanches.
     */
    fermerLesDimanches: false,

    /**
     * HORAIRES HABITUELS DE LA SEMAINE
     * Créneaux de 1 heure chaque heure :
     * - Mardi au Samedi : de 10h à 17h dernier créneau (boutique ouverte jusqu'à 18h30)
     *   => Créneaux : 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00
     * - Dimanche : de 11h à 16h dernier créneau (boutique ouverte jusqu'à 17h00)
     *   => Créneaux : 11:00, 12:00, 13:00, 14:00, 15:00, 16:00
     * - Lundi : Fermé
     */
    joursSemaine: {
        // 0 = Dimanche en JavaScript
        0: {
            label: "Dimanche",
            isOpen: true, // Passez à false pour fermer le dimanche
            startHour: 11,
            lastSlotHour: 16, // Dernier créneau 16h-17h
            storeClosingTime: "17:00",
        },
        // 1 = Lundi
        1: {
            label: "Lundi",
            isOpen: false, // Atelier fermé
            startHour: 10,
            lastSlotHour: 17,
            storeClosingTime: "18:30",
        },
        // 2 = Mardi
        2: {
            label: "Mardi",
            isOpen: true,
            startHour: 10,
            lastSlotHour: 17, // Dernier créneau 17h-18h
            storeClosingTime: "18:30",
        },
        // 3 = Mercredi
        3: {
            label: "Mercredi",
            isOpen: true,
            startHour: 10,
            lastSlotHour: 17,
            storeClosingTime: "18:30",
        },
        // 4 = Jeudi
        4: {
            label: "Jeudi",
            isOpen: true,
            startHour: 10,
            lastSlotHour: 17,
            storeClosingTime: "18:30",
        },
        // 5 = Vendredi
        5: {
            label: "Vendredi",
            isOpen: true,
            startHour: 10,
            lastSlotHour: 17,
            storeClosingTime: "18:30",
        },
        // 6 = Samedi
        6: {
            label: "Samedi",
            isOpen: true,
            startHour: 10,
            lastSlotHour: 17,
            storeClosingTime: "18:30",
        },
    } as Record<number, WeekdayConfig>,

    /**
     * CONGÉS & FERMETURES EXCEPTIONNELLES
     * Format : "AAAA-MM-JJ" (ex: "2026-12-25" pour le 25 décembre 2026).
     * Les dates inscrites ici apparaissent instantanément grisées / fermées dans le calendrier.
     */
    fermeturesExceptionnelles: [
        "2026-05-01", // 1er Mai
        "2026-12-25", // Noël
        "2027-01-01", // Nouvel An
        // Ajoutez ici d'autres dates de vacances ou congés d'équipe
    ] as string[],

    /**
     * OUVERTURES EXCEPTIONNELLES
     * Permet d'ouvrir une journée qui est normalement fermée (par exemple un lundi avant un jour férié).
     * Format : "AAAA-MM-JJ".
     */
    ouverturesExceptionnelles: [
        // Ex: "2026-12-21",
    ] as string[],

    /**
     * CRÉNEAUX BLOQUÉS PONCTUELLEMENT
     * Permet à l'équipe de bloquer un horaire précis pour une date donnée (ex: réunion d'atelier, privatisation).
     * Format : { "AAAA-MM-JJ": ["14:00", "15:00"] }
     */
    creneauxBloques: {
        // Exemple :
        // "2026-10-15": ["14:00"],
    } as Record<string, string[]>,

    /**
     * CRÉNEAUX SUPPLÉMENTAIRES PONCTUELS
     * Permet d'ajouter un créneau d'urgence ou exceptionnel pour une date donnée (ex: créneau de 18h).
     * Format : { "AAAA-MM-JJ": ["18:00"] }
     */
    creneauxSupplementaires: {
        // Exemple :
        // "2026-10-17": ["18:00"],
    } as Record<string, string[]>,
};

/**
 * Helper : vérifie si une date donnée est ouverte aux réservations.
 */
export function isDayOpen(date: Date): boolean {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const isoDate = `${y}-${m}-${d}`;

    // 1. Vérification des ouvertures exceptionnelles prioritaires
    if (SCHEDULE_CONFIG.ouverturesExceptionnelles.includes(isoDate)) {
        return true;
    }

    // 2. Vérification des fermetures exceptionnelles / congés
    if (SCHEDULE_CONFIG.fermeturesExceptionnelles.includes(isoDate)) {
        return false;
    }

    // 3. Option globale de fermeture des dimanches
    const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    if (dayOfWeek === 0 && SCHEDULE_CONFIG.fermerLesDimanches) {
        return false;
    }

    // 4. Vérification de la configuration habituelle du jour de la semaine
    const weekdayConfig = SCHEDULE_CONFIG.joursSemaine[dayOfWeek];
    return weekdayConfig ? weekdayConfig.isOpen : false;
}

/**
 * Helper : génère la liste des créneaux disponibles pour une date donnée
 * en respectant les horaires du jour (mardi-samedi vs dimanche), les blocages et les créneaux bonus.
 */
export function getAvailableSlotsForDate(date: Date): Array<{ start: string; end: string }> {
    if (!isDayOpen(date)) {
        return [];
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const isoDate = `${y}-${m}-${d}`;

    const dayOfWeek = date.getDay();
    const weekdayConfig = SCHEDULE_CONFIG.joursSemaine[dayOfWeek];

    const slots: Array<{ start: string; end: string }> = [];

    if (weekdayConfig && weekdayConfig.isOpen) {
        // Génération des créneaux réguliers d'1 heure
        for (let hour = weekdayConfig.startHour; hour <= weekdayConfig.lastSlotHour; hour++) {
            const start = `${String(hour).padStart(2, "0")}:00`;
            const end = `${String(hour + 1).padStart(2, "0")}:00`;
            slots.push({ start, end });
        }
    }

    // Retirer les créneaux spécifiquement bloqués pour cette date
    const blockedForDay = SCHEDULE_CONFIG.creneauxBloques[isoDate] || [];
    const filteredSlots = slots.filter(slot => !blockedForDay.includes(slot.start));

    // Ajouter les créneaux supplémentaires pour cette date
    const extrasForDay = SCHEDULE_CONFIG.creneauxSupplementaires[isoDate] || [];
    extrasForDay.forEach(extraStart => {
        const [h] = extraStart.split(":").map(Number);
        const extraEnd = `${String(h + 1).padStart(2, "0")}:00`;
        if (!filteredSlots.some(s => s.start === extraStart)) {
            filteredSlots.push({ start: extraStart, end: extraEnd });
        }
    });

    // Tri par ordre chronologique
    filteredSlots.sort((a, b) => a.start.localeCompare(b.start));

    return filteredSlots;
}
