/**
 * Initialisation de la configuration et des comptes d'accès.
 *
 *   npx tsx src/backend/scripts/seed.ts
 *       → crée le planning par défaut (mardi–dimanche, lundi fermé, créneaux simples) et les fermetures connues
 *   npx tsx src/backend/scripts/seed.ts admin "Melissa" melissa@umelcouture.com "motdepasse" [ADMIN|SEAMSTRESS]
 *       → crée ou met à jour un compte d'accès à /admin
 */

import "dotenv/config";
import { prisma } from "@backend/core/db";
import { hashPassword } from "@backend/modules/auth/session";
import { DEFAULT_WEEK } from "@backend/modules/schedule/schedule.service";

const HOLIDAYS = ["2026-12-25", "2027-01-01", "2027-05-01"];

async function seedSchedule() {
    for (const [weekday, config] of DEFAULT_WEEK.entries()) {
        await prisma.scheduleConfig.upsert({ where: { weekday }, create: { weekday, ...config }, update: {} });
    }
    for (const day of HOLIDAYS) {
        await prisma.dateOverride.upsert({
            where: { day },
            create: { day, isOpen: false, note: "Jour férié" },
            update: {},
        });
    }
    await prisma.setting.upsert({
        where: { key: "alterationReminderDays" },
        create: { key: "alterationReminderDays", value: "2" },
        update: {},
    });
    console.log("✔ Planning par défaut initialisé (les réglages existants sont conservés).");
}

async function seedAdmin(args: string[]) {
    const [name, email, password, role = "ADMIN"] = args;
    if (!name || !email || !password || password.length < 10 || !["ADMIN", "SEAMSTRESS"].includes(role)) {
        throw new Error('Usage : seed.ts admin "Nom" email motdepasse(10+ caractères) [ADMIN|SEAMSTRESS]');
    }
    const data = { name, passwordHash: hashPassword(password), role: role as "ADMIN" | "SEAMSTRESS" };
    await prisma.adminUser.upsert({
        where: { email: email.toLowerCase() },
        create: { email: email.toLowerCase(), ...data },
        update: data,
    });
    console.log(`✔ Compte ${role} prêt pour ${email}.`);
}

async function main() {
    const [command, ...args] = process.argv.slice(2);
    if (command === "admin") await seedAdmin(args);
    else await seedSchedule();
}

main()
    .catch(err => {
        console.error(err.message ?? err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
