/**
 * Tableau de bord de l'atelier : uniquement des indicateurs calculables à partir des données réelles.
 *
 * Volontairement absents (données inexistantes dans l'application) :
 *  - chiffre d'affaires : les ventes de robes ne passent pas par le site ; seules les empreintes
 *    débitées (absences, annulations tardives) sont de l'argent réellement encaissé ici ;
 *  - taux de conversion : le statut « Convertie » des clientes n'est pas utilisé ;
 *  - taux d'absence par statut : les absences sont constatées via les empreintes débitées.
 */

import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "@backend/core/db";
import { getServiceTitle } from "@shared/reservation/services";
import { addDays, parisToUtc, todayInParis, toParisParts } from "@shared/tz";
import { bucketKeyOf, buildPeriod, PERIODS, relativeChange, type PeriodKey } from "./dashboard.period";
import { channelOf } from "./dashboard.sources";

const inRange = (day: string, start: string, end: string) => day >= start && day <= end;
const fullName = (c: { firstName: string; lastName: string }) => `${c.firstName} ${c.lastName}`.trim() || "Cliente";

export interface Kpi {
    value: number;
    previous: number;
    /** Variation relative (0.12 = +12 %) ; null si la période précédente vaut 0 */
    change: number | null;
    series: number[];
}

function kpi(current: number, previous: number, series: number[] = []): Kpi {
    return { value: current, previous, change: relativeChange(current, previous), series };
}

export async function getDashboardData(periodKey: PeriodKey) {
    const today = todayInParis();
    const period = buildPeriod(periodKey, today);
    const { start, end, previousStart, previousEnd } = period;
    const todayStartUtc = parisToUtc(today, "00:00");
    const previousStartUtc = parisToUtc(previousStart, "00:00");
    const in7 = addDays(today, 6);
    const in30 = addDays(today, 29);

    const [
        appointments,
        bookings,
        newCustomers,
        customersTotal,
        orders,
        charged,
        agenda,
        activeCards,
        upcomingWithoutCard,
        failedCharges,
        overdue,
        emailFailures,
        alterationsUpcoming,
        alterationsOverdue,
        history,
    ] = await Promise.all([
        // Rendez-vous des deux périodes (par jour du rendez-vous)
        prisma.appointment.findMany({
            where: { day: { gte: previousStart, lte: end } },
            select: { day: true, startTime: true, status: true, serviceId: true, customerId: true },
        }),
        // Réservations enregistrées (par date de prise du rendez-vous)
        prisma.appointment.findMany({ where: { createdAt: { gte: previousStartUtc } }, select: { createdAt: true } }),
        prisma.customer.findMany({ where: { createdAt: { gte: previousStartUtc } }, select: { createdAt: true } }),
        prisma.customer.count(),
        // Commandes en ligne : origine de la réservation
        prisma.deposit.findMany({ where: { createdAt: { gte: previousStartUtc } }, select: { createdAt: true, origin: true } }),
        // Empreintes réellement débitées
        prisma.deposit.findMany({
            where: { depositStatus: "CHARGED", chargedAt: { gte: previousStartUtc } },
            select: { chargedAt: true, depositCents: true, chargeReason: true },
        }),
        // Agenda des 7 prochains jours
        prisma.appointment.findMany({
            where: { day: { gte: today, lte: in7 }, status: "CONFIRMED" },
            select: {
                id: true,
                day: true,
                startTime: true,
                serviceId: true,
                slotType: true,
                customer: { select: { firstName: true, lastName: true } },
                deposit: { select: { depositStatus: true } },
            },
            orderBy: [{ day: "asc" }, { startTime: "asc" }],
        }),
        prisma.deposit.count({
            where: { depositStatus: "PENDING", appointment: { status: "CONFIRMED", day: { gte: today } } },
        }),
        prisma.appointment.count({ where: { status: "CONFIRMED", day: { gte: today, lte: in30 }, deposit: null } }),
        prisma.deposit.count({ where: { depositStatus: "FAILED" } }),
        // Rendez-vous passés jamais clôturés (présente / absente)
        prisma.appointment.aggregate({
            where: { status: "CONFIRMED", day: { lt: today } },
            _count: { _all: true },
            _min: { day: true },
        }),
        prisma.messageLog.count({ where: { status: "FAILED", createdAt: { gte: parisToUtc(addDays(today, -6), "00:00") } } }),
        prisma.alterationAppointment.findMany({
            where: { status: "SCHEDULED", date: { gte: todayStartUtc } },
            select: { id: true, date: true, seamstressName: true, customer: { select: { firstName: true, lastName: true } } },
            orderBy: { date: "asc" },
            take: 4,
        }),
        prisma.alterationAppointment.count({ where: { status: "SCHEDULED", date: { lt: todayStartUtc } } }),
        // Début de l'historique (premier rendez-vous enregistré, y compris ceux importés de l'ancien site)
        prisma.appointment.aggregate({ _min: { createdAt: true, day: true } }),
    ]);

    const firstRecord = [history._min.createdAt ? toParisParts(history._min.createdAt).day : null, history._min.day]
        .filter((d): d is string => !!d)
        .sort()[0];
    // La comparaison n'a de sens que si la période précédente est entièrement couverte par les données
    const comparable = !!firstRecord && firstRecord <= previousStart;

    // --- Rendez-vous : période courante / précédente -----------------------------------------------
    const current = appointments.filter(a => inRange(a.day, start, end));
    const previous = appointments.filter(a => inRange(a.day, previousStart, previousEnd));
    const held = (list: typeof appointments) => list.filter(a => a.status !== "CANCELLED");
    const cancelRate = (list: typeof appointments) =>
        list.length ? list.filter(a => a.status === "CANCELLED").length / list.length : null;

    const bucketIndex = new Map(period.buckets.map((b, i) => [b.key, i]));
    const perBucket = () => period.buckets.map(() => 0);
    const addTo = (series: number[], day: string) => {
        const i = bucketIndex.get(bucketKeyOf(day, period.granularity));
        if (i !== undefined) series[i]++;
    };

    const heldSeries = perBucket();
    for (const a of held(current)) addTo(heldSeries, a.day);

    const bookingDays = bookings.map(b => toParisParts(b.createdAt).day);
    const bookingSeries = perBucket();
    for (const d of bookingDays) if (inRange(d, start, end)) addTo(bookingSeries, d);
    const bookingsPrev = bookingDays.filter(d => inRange(d, previousStart, previousEnd)).length;

    const customerDays = newCustomers.map(c => toParisParts(c.createdAt).day);
    const customerSeries = perBucket();
    for (const d of customerDays) if (inRange(d, start, end)) addTo(customerSeries, d);
    const customersPrev = customerDays.filter(d => inRange(d, previousStart, previousEnd)).length;

    const chargedWithDay = charged.map(c => ({ ...c, day: toParisParts(c.chargedAt!).day }));
    const chargedNow = chargedWithDay.filter(c => inRange(c.day, start, end));
    const chargedPrev = chargedWithDay.filter(c => inRange(c.day, previousStart, previousEnd));
    const sumCents = (list: { depositCents: number }[]) => list.reduce((s, c) => s + c.depositCents, 0);

    const rateNow = cancelRate(current);
    const ratePrev = cancelRate(previous);

    // --- Statuts ------------------------------------------------------------------------------------
    const statusCount = (s: AppointmentStatus, pred: (d: string) => boolean = () => true) =>
        current.filter(a => a.status === s && pred(a.day)).length;
    const statuses = [
        { key: "done", label: "Passés", count: statusCount("COMPLETED") },
        { key: "today", label: "Prévus aujourd'hui", count: statusCount("CONFIRMED", d => d === today) },
        { key: "overdue", label: "Non clôturés", count: statusCount("CONFIRMED", d => d < today) },
        { key: "noshow", label: "Absentes", count: statusCount("NO_SHOW") },
        { key: "cancelled", label: "Annulés", count: statusCount("CANCELLED") },
    ] as const;

    // --- Prestations ---------------------------------------------------------------------------------
    const byService = new Map<string, number>();
    for (const a of held(current)) byService.set(a.serviceId, (byService.get(a.serviceId) ?? 0) + 1);
    const services = [...byService.entries()]
        .map(([id, count]) => ({ label: getServiceTitle(id), count }))
        .sort((a, b) => b.count - a.count);

    // --- Créneaux les plus demandés (jour de semaine × heure) ---------------------------------------
    const heat = new Map<string, number>();
    for (const a of held(current)) {
        const [y, m, d] = a.day.split("-").map(Number);
        const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
        const key = `${weekday}|${a.startTime.slice(0, 2)}`;
        heat.set(key, (heat.get(key) ?? 0) + 1);
    }
    const hours = [...new Set([...heat.keys()].map(k => k.split("|")[1]))].sort();
    const weekdays = [2, 3, 4, 5, 6, 0, 1].filter(w => w !== 1 || [...heat.keys()].some(k => k.startsWith("1|")));

    // --- Clientes ------------------------------------------------------------------------------------
    const seen = [...new Set(held(current).map(a => a.customerId))];
    const firstVisits = seen.length
        ? await prisma.appointment.groupBy({
              by: ["customerId"],
              where: { customerId: { in: seen }, status: { not: "CANCELLED" } },
              _min: { day: true },
          })
        : [];
    const returning = firstVisits.filter(f => (f._min.day ?? start) < start).length;

    // --- Origine des réservations (commandes en ligne de la période) -------------------------------
    const ordersNow = orders.filter(o => inRange(toParisParts(o.createdAt).day, start, end));
    const byChannel = new Map<string, number>();
    for (const o of ordersNow) {
        const channel = channelOf(o.origin);
        byChannel.set(channel, (byChannel.get(channel) ?? 0) + 1);
    }
    const sortedChannels = [...byChannel.entries()].sort((a, b) => b[1] - a[1]);
    // Au-delà de 5 canaux, le reste est regroupé pour rester lisible
    const sources = sortedChannels.slice(0, 5).map(([label, count]) => ({ label, count }));
    const rest = sortedChannels.slice(5).reduce((s, [, n]) => s + n, 0);
    if (rest) sources.push({ label: "Autres", count: rest });

    // --- Agenda --------------------------------------------------------------------------------------
    const todayList = agenda
        .filter(a => a.day === today)
        .map(a => ({
            id: a.id,
            time: a.startTime,
            customer: fullName(a.customer),
            service: getServiceTitle(a.serviceId),
            double: a.slotType === "DOUBLE",
            hasCard: a.deposit?.depositStatus === "PENDING",
        }));
    const week = Array.from({ length: 7 }, (_, i) => {
        const day = addDays(today, i);
        return { day, count: agenda.filter(a => a.day === day).length };
    });
    const nextDays = agenda
        .filter(a => a.day > today)
        .slice(0, 5)
        .map(a => ({ id: a.id, day: a.day, time: a.startTime, customer: fullName(a.customer), service: getServiceTitle(a.serviceId) }));
    const weekWithoutCard = agenda.filter(a => a.deposit?.depositStatus !== "PENDING").length;

    // --- À traiter -----------------------------------------------------------------------------------
    const actions = [
        overdue._count._all > 0 && {
            key: "overdue",
            tone: "warning" as const,
            count: overdue._count._all,
            title: `${overdue._count._all} rendez-vous passé${overdue._count._all > 1 ? "s" : ""} à clôturer`,
            detail: "Indiquez si la cliente est venue ou absente, pour garder des statistiques justes et pouvoir débiter l'empreinte en cas d'absence.",
            href: `/admin/rendez-vous?${new URLSearchParams({ from: overdue._min.day ?? today, to: addDays(today, -1), status: "CONFIRMED" })}`,
            cta: "Clôturer",
        },
        failedCharges > 0 && {
            key: "failed",
            tone: "critical" as const,
            count: failedCharges,
            title: `${failedCharges} débit${failedCharges > 1 ? "s" : ""} d'empreinte refusé${failedCharges > 1 ? "s" : ""}`,
            detail: "La banque a refusé le débit : contactez la cliente ou réessayez depuis la page Dépôts.",
            href: "/admin/depots?depot=FAILED",
            cta: "Voir les dépôts",
        },
        emailFailures > 0 && {
            key: "emails",
            tone: "critical" as const,
            count: emailFailures,
            title: `${emailFailures} e-mail${emailFailures > 1 ? "s" : ""} non envoyé${emailFailures > 1 ? "s" : ""} (7 jours)`,
            detail: "Des confirmations ou rappels n'ont pas pu partir : vérifiez l'adresse de la cliente.",
            href: "/admin/mailing",
            cta: "Voir l'historique",
        },
        alterationsOverdue > 0 && {
            key: "alterations",
            tone: "warning" as const,
            count: alterationsOverdue,
            title: `${alterationsOverdue} retouche${alterationsOverdue > 1 ? "s" : ""} passée${alterationsOverdue > 1 ? "s" : ""} à clôturer`,
            detail: "Marquez-les terminées ou absentes dans le planning Retouches.",
            href: "/admin/retouches",
            cta: "Ouvrir les retouches",
        },
        weekWithoutCard > 0 && {
            key: "nocard",
            tone: "info" as const,
            count: weekWithoutCard,
            title: `${weekWithoutCard} rendez-vous cette semaine sans empreinte bancaire`,
            detail: "En cas d'absence, aucun débit ne sera possible (rendez-vous pris sur l'ancien site ou saisis par l'atelier).",
            href: `/admin/rendez-vous?${new URLSearchParams({ from: today, to: in7 })}`,
            cta: "Voir la semaine",
        },
    ].filter(Boolean) as {
        key: string;
        tone: "critical" | "warning" | "info";
        count: number;
        title: string;
        detail: string;
        href: string;
        cta: string;
    }[];

    return {
        today,
        period: {
            ...period,
            label: PERIODS[periodKey].label,
            comparison: PERIODS[periodKey].comparison,
            comparable,
            historyStart: firstRecord ?? null,
        },
        kpis: {
            appointments: kpi(held(current).length, held(previous).length, heldSeries),
            bookings: kpi(bookingSeries.reduce((s, n) => s + n, 0), bookingsPrev, bookingSeries),
            newCustomers: kpi(customerSeries.reduce((s, n) => s + n, 0), customersPrev, customerSeries),
            cancelRate: {
                value: rateNow,
                previous: ratePrev,
                // Écart en points de pourcentage (pas de variation relative d'un taux)
                changePoints: rateNow !== null && ratePrev !== null ? (rateNow - ratePrev) * 100 : null,
                cancelled: statusCount("CANCELLED"),
                total: current.length,
            },
            charged: {
                cents: sumCents(chargedNow),
                count: chargedNow.length,
                previousCents: sumCents(chargedPrev),
                change: relativeChange(sumCents(chargedNow), sumCents(chargedPrev)),
            },
        },
        activity: period.buckets.map((b, i) => ({ ...b, appointments: heldSeries[i], bookings: bookingSeries[i] })),
        statuses: statuses.filter(s => s.count > 0),
        statusesTotal: current.length,
        services,
        heatmap: {
            hours,
            rows: weekdays.map(w => ({ weekday: w, cells: hours.map(h => heat.get(`${w}|${h}`) ?? 0) })),
            total: held(current).length,
        },
        customers: { total: customersTotal, seen: seen.length, returning, firstVisit: seen.length - returning },
        sources: { items: sources, total: ordersNow.length, appointments: held(current).length },
        guarantees: {
            activeCards,
            upcomingWithoutCard,
            failedCharges,
            noShowCharged: chargedNow.filter(c => c.chargeReason === "NO_SHOW").length,
        },
        agenda: { today: todayList, week, nextDays },
        alterations: {
            upcoming: alterationsUpcoming.map(a => ({
                id: a.id,
                ...toParisParts(a.date),
                customer: fullName(a.customer),
                seamstress: a.seamstressName,
            })),
        },
        actions,
    };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
