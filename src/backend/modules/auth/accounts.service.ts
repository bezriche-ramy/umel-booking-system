/**
 * Comptes d'accès à l'espace atelier (équivalent de la page « Comptes » de WordPress).
 * Création avec un e-mail et un mot de passe ; rôle Administratrice (tout) ou Retoucheuse (onglet Retouches seulement).
 */

import type { AdminRole } from "@prisma/client";
import { prisma } from "@backend/core/db";
import { hashPassword } from "./session";

export const MIN_PASSWORD_LENGTH = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AccountError extends Error {}

/** Nom affiché déduit de l'e-mail : « melissa.umel@… » → « Melissa Umel ». */
function nameFromEmail(email: string): string {
    return email
        .split("@")[0]
        .split(/[._-]+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

function checkPassword(password: unknown): string {
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        throw new AccountError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    }
    return password;
}

export async function createAccount(emailInput: unknown, passwordInput: unknown, role: AdminRole = "ADMIN") {
    const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) throw new AccountError("Adresse e-mail invalide.");
    const password = checkPassword(passwordInput);
    if (await prisma.adminUser.findUnique({ where: { email } })) {
        throw new AccountError("Un compte existe déjà avec cet e-mail.");
    }
    return prisma.adminUser.create({
        data: { email, name: nameFromEmail(email), passwordHash: hashPassword(password), role },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
}

/** Il doit toujours rester au moins une administratrice. */
async function assertNotLastAdmin(id: string) {
    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new AccountError("Compte introuvable.");
    if (user.role === "ADMIN" && (await prisma.adminUser.count({ where: { role: "ADMIN" } })) <= 1) {
        throw new AccountError("Impossible : c'est la dernière administratrice.");
    }
    return user;
}

export async function changeRole(id: string, role: AdminRole, currentUserId: string) {
    if (id === currentUserId) throw new AccountError("Vous ne pouvez pas changer votre propre rôle.");
    if (role !== "ADMIN") await assertNotLastAdmin(id);
    return prisma.adminUser.update({ where: { id }, data: { role } });
}

export async function resetPassword(id: string, password: unknown) {
    return prisma.adminUser.update({ where: { id }, data: { passwordHash: hashPassword(checkPassword(password)) } });
}

export async function deleteAccount(id: string, currentUserId: string) {
    if (id === currentUserId) throw new AccountError("Vous ne pouvez pas supprimer votre propre compte.");
    await assertNotLastAdmin(id);
    await prisma.adminUser.delete({ where: { id } });
}

export async function listAccounts() {
    return prisma.adminUser.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });
}
