import type { Prisma } from "@prisma/client";
import { prisma } from "@backend/core/db";
import { emailLayout, sendEmailBatch, textToHtml } from "@backend/modules/mailing/email.service";
import { todayInParis } from "@shared/tz";

export const AUDIENCES = {
    ALL: "Toutes les clientes",
    PROSPECT: "Prospects",
    CONVERTIE: "Clientes converties",
    UPCOMING: "Clientes avec un rendez-vous à venir",
    ALTERATIONS: "Clientes retouches",
} as const;

export type Audience = keyof typeof AUDIENCES;

export function audienceWhere(audience: Audience): Prisma.CustomerWhereInput {
    const base: Prisma.CustomerWhereInput = { email: { not: null }, marketingOptOut: false };
    switch (audience) {
        case "PROSPECT":
        case "CONVERTIE":
            return { ...base, status: audience };
        case "UPCOMING":
            return { ...base, appointments: { some: { status: "CONFIRMED", day: { gte: todayInParis() } } } };
        case "ALTERATIONS":
            return { ...base, alterations: { some: {} } };
        default:
            return base;
    }
}

const UNSUBSCRIBE_NOTE =
    '<p style="margin:20px 0 0;font-size:12px;color:#766e69">Vous ne souhaitez plus recevoir nos actualités ? Répondez simplement « STOP » à cet e-mail.</p>';

/** Envoi groupé (offres, événements, annonces). Personnalisation : {{prenom}}. */
export async function sendCampaign(input: { subject: string; body: string; audience: Audience; sentBy: string }) {
    const recipients = await prisma.customer.findMany({
        where: audienceWhere(input.audience),
        select: { id: true, email: true, firstName: true },
    });
    const campaign = await prisma.campaign.create({
        data: { subject: input.subject, body: input.body, audience: input.audience, sentBy: input.sentBy },
    });

    const messages = recipients
        .filter(r => r.email)
        .map(r => ({
            to: r.email!,
            subject: input.subject,
            html: emailLayout(
                input.subject,
                textToHtml(input.body.replace(/\{\{\s*prenom\s*\}\}/gi, r.firstName)) + UNSUBSCRIBE_NOTE,
            ),
            customerId: r.id,
        }));
    const { sent, failed } = await sendEmailBatch(messages, { kind: "CAMPAIGN", campaignId: campaign.id });

    await prisma.campaign.update({ where: { id: campaign.id }, data: { sentCount: sent, failCount: failed } });
    return { campaignId: campaign.id, recipients: recipients.length, sent, failed };
}
