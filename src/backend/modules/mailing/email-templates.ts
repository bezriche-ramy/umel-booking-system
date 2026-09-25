import { DEPOSIT_AMOUNT_CENTS, FREE_CANCELLATION_HOURS, getServiceTitle } from "@shared/reservation/services";
import { siteConfig } from "@shared/siteData";
import { emailLayout, escapeHtml } from "@backend/modules/mailing/email.service";
import { formatParisDateTime } from "@shared/tz";

const deposit = `${DEPOSIT_AMOUNT_CENTS / 100} €`;

interface AppointmentLike {
    reference: string;
    serviceId: string;
    date: Date;
}

const policyHtml = `<p style="margin:16px 0 0;padding:14px 16px;background:#f2ede6;font-size:13px">
<strong>Empreinte bancaire de ${deposit}</strong> : aucun montant n'est débité si vous êtes présente à votre rendez-vous.
Elle est prélevée uniquement en cas d'absence ou d'annulation moins de ${FREE_CANCELLATION_HOURS}h avant le rendez-vous.
Pour annuler ou déplacer : ${siteConfig.phone}.</p>`;

function details(a: AppointmentLike): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;font-size:14px">
<tr><td style="padding:6px 0;color:#766e69">Référence</td><td style="padding:6px 0;text-align:right"><strong>${escapeHtml(a.reference)}</strong></td></tr>
<tr><td style="padding:6px 0;color:#766e69">Prestation</td><td style="padding:6px 0;text-align:right">${escapeHtml(getServiceTitle(a.serviceId))}</td></tr>
<tr><td style="padding:6px 0;color:#766e69">Date</td><td style="padding:6px 0;text-align:right">${escapeHtml(formatParisDateTime(a.date))}</td></tr>
<tr><td style="padding:6px 0;color:#766e69">Adresse</td><td style="padding:6px 0;text-align:right">${escapeHtml(`${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.city}`)}</td></tr>
</table>`;
}

const retouchesNote = `<p style="margin:12px 0 0"><strong>Pour vos retouches :</strong> apportez impérativement vos chaussures de mariée définitives et votre lingerie du jour J.</p>`;

export function confirmationEmail(firstName: string, a: AppointmentLike) {
    return {
        subject: `Votre rendez-vous Umel Couture est confirmé (${a.reference})`,
        html: emailLayout(
            "Votre rendez-vous est confirmé",
            `<p>Chère ${escapeHtml(firstName)},</p><p>Nous avons le plaisir de confirmer votre rendez-vous à l'atelier.</p>
${details(a)}${a.serviceId === "retouches" ? retouchesNote : ""}${policyHtml}
<p style="margin-top:18px">À très bientôt,<br>L'équipe ${siteConfig.name}</p>`,
        ),
    };
}

export function reminderEmail(firstName: string, a: AppointmentLike) {
    return {
        subject: `Rappel : votre rendez-vous Umel Couture approche`,
        html: emailLayout(
            "Votre rendez-vous approche",
            `<p>Chère ${escapeHtml(firstName)},</p><p>Nous vous rappelons votre prochain rendez-vous à l'atelier.</p>
${details(a)}${a.serviceId === "retouches" ? retouchesNote : ""}
<p style="margin:16px 0 0;padding:14px 16px;background:#f2ede6;font-size:13px">
<strong>Important :</strong> le délai d'annulation gratuite (${FREE_CANCELLATION_HOURS}h) arrive à échéance. Sans annulation de votre part,
l'empreinte de ${deposit} sera prélevée en cas d'absence. Merci de vérifier que votre carte est approvisionnée.
Un empêchement ? Appelez-nous au ${siteConfig.phone}.</p>
<p style="margin-top:18px">À très bientôt,<br>L'équipe ${siteConfig.name}</p>`,
        ),
    };
}

export function cancellationEmail(firstName: string, a: AppointmentLike, charged: boolean) {
    return {
        subject: `Annulation de votre rendez-vous (${a.reference})`,
        html: emailLayout(
            "Rendez-vous annulé",
            `<p>Chère ${escapeHtml(firstName)},</p><p>Votre rendez-vous a bien été annulé.</p>${details(a)}
<p>${charged ? `Conformément à notre politique d'annulation (moins de ${FREE_CANCELLATION_HOURS}h avant le rendez-vous), l'empreinte de ${deposit} a été prélevée.` : "Aucun montant ne vous a été prélevé."}</p>
<p>Pour reprendre rendez-vous : <a href="${siteConfig.url}/contact#reservation" style="color:#b8934a">${siteConfig.url.replace("https://", "")}/contact</a></p>`,
        ),
    };
}

export function rescheduleEmail(firstName: string, a: AppointmentLike) {
    return {
        subject: `Votre rendez-vous Umel Couture a été déplacé (${a.reference})`,
        html: emailLayout(
            "Nouvel horaire de rendez-vous",
            `<p>Chère ${escapeHtml(firstName)},</p><p>Votre rendez-vous a été déplacé. Voici les nouvelles informations :</p>${details(a)}${policyHtml}`,
        ),
    };
}

export function depositChargedEmail(
    firstName: string,
    a: { reference: string; serviceId: string | null; date: Date | null; amountCents: number },
) {
    const amount = `${a.amountCents / 100} €`;
    const appointment = a.serviceId && a.date ? details({ reference: a.reference, serviceId: a.serviceId, date: a.date }) : "";
    return {
        subject: `Prélèvement de l'empreinte bancaire (${a.reference})`,
        html: emailLayout(
            "Empreinte bancaire prélevée",
            `<p>Chère ${escapeHtml(firstName)},</p><p>Suite à votre absence (ou à une annulation moins de ${FREE_CANCELLATION_HOURS}h avant), l'empreinte bancaire de ${amount} a été prélevée conformément aux conditions acceptées lors de la réservation.</p>${appointment}
<p>Pour toute question : ${siteConfig.phone}.</p>`,
        ),
    };
}

export function alterationReminderEmail(firstName: string, date: Date, days: number) {
    return {
        subject: `Rappel : votre séance de retouches Umel Couture`,
        html: emailLayout(
            "Votre séance de retouches approche",
            `<p>Chère ${escapeHtml(firstName)},</p><p>Nous vous rappelons votre séance de retouches ${days === 1 ? "demain" : `dans ${days} jours`} :
<strong>${escapeHtml(formatParisDateTime(date))}</strong>.</p>${retouchesNote}
<p>Un empêchement ? Appelez-nous au ${siteConfig.phone}.</p>`,
        ),
    };
}
