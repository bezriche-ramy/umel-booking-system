# Plan d'Architecture & Implémentation Backend — Umel Couture (Next.js + Stripe + Database + Admin)

Ce plan intègre l'ensemble du **Brief Technique Umel Couture (Septembre 2026)** et exploite les données extraites du dump SQL (`u104968185_Pnt3Y.sql`) pour remplacer définitivement WordPress, Amelia et WooCommerce par une stack Next.js 16 moderne, performante et prête pour la production.
Ce plan intègre l'ensemble du **Brief Technique Umel Couture (Septembre 2026)**, exploite les données réelles du dump SQL (`u104968185_Pnt3Y.sql`), et **supprime totalement les données mockées / simulation** de réservation pour basculer sur un backend réel prêt à déployer.

---

## 0. Suppression Intégrale des Données Mockées (Fake Data Cleanup)

- **Suppression du fichier `lib/reservation/mock-availability.ts`** :
  - Remplacer les créneaux simulés et les délais artificiels (`setTimeout`) par de vrais appels d'API reliés à la base de données.
- **Remplacement de `PaymentGuaranteePlaceholder` dans `StepGuarantee.tsx`** :
  - Supprimer la carte factice / mockup "Emplacement Stripe Elements".
  - Monter le vrai composant `<PaymentElement />` officiel de `@stripe/react-stripe-js` connecté à un SetupIntent réel.
- **Remplacement du faux `submitReservationDraft`** :
  - Remplacer l'enregistrement simulé par un `fetch('/api/appointments/book')` créant le client et la réservation en base de données avec confirmation par email immédiate.

---

## 1. Migration des Données de l'ancien SQL vers la nouvelle BDD

Depuis le dump SQL (`u104968185_Pnt3Y.sql`), nous extrayons et importons :
- **181 Clientes réelles** (`wp_amelia_users`) : Nom, Prénom, Email, Téléphone (`+33...`), Civilité.
- **251 Réservations historiques** (`wp_amelia_appointments`) : Statuts, dates, types de services.
- **Paramètres des créneaux** : Rendez-vous semaine vs weekend (1h, base 20€).

---

## 2. Modèle de Données (Database Schema)

Une base de données relationnelle moderne (PostgreSQL via Prisma ou Supabase / Neon / SQLite local pour dev) articulée autour de 6 modèles clés :

### A. `Customer` (Base Clients & CRM)
- `id` (UUID)
- `firstName`, `lastName`
- `email` (unique, indexé)
- `phone` (format E.164 indexé)
- `status`: `PROSPECT` | `CONVERTED` | `VIP` | `ARCHIVED`
- `notes`: Texte pour les mesures, préférences robe, historique
- `createdAt`, `updatedAt`

### B. `Appointment` (RDV Créations - Public)
- `id` (UUID)
- `customerId` (FK -> Customer)
- `date`: DateTime (créneau d'1h)
- `slotType`: `SIMPLE` (1 cliente) | `DOUBLE` (2 clientes simultanées)
- `status`: `PENDING_HOLD` | `CONFIRMED` | `COMPLETED` | `NO_SHOW` | `CANCELLED_ON_TIME` | `CANCELLED_LATE`
- `stripeSetupIntentId`: ID de l'empreinte bancaire Stripe
- `stripePaymentMethodId`: ID de la carte enregistrée
- `depositCharged`: booléen (true si les 20€ ont été prélevés)
- `depositChargeId`: ID du paiement Stripe en cas de no-show
- `notes`: Commentaire cliente / type de robe souhaitée

### C. `AlterationAppointment` (RDV Retouches - Privé & Indépendant)
- `id` (UUID)
- `customerId` (FK -> Customer)
- `seamstressName`: Nom de la retoucheuse assignée
- `date`: DateTime
- `durationMinutes`: entier (ex: 30, 45, 60)
- `status`: `SCHEDULED` | `IN_PROGRESS` | `DONE` | `CANCELLED`
- `dressDetails`: Marque robe, description des retouches, devis
- `remindersSent`: booléen ou date d'envoi

### D. `SlotConfig` & `DaySchedule` (Gestion des Jours & Toggles Créneaux)
- `dayOfWeek`: 0 (Dimanche) à 6 (Samedi). *Mardi à Dimanche activés par défaut, Lundi fermé.*
- `isOpen`: booléen (toggle pour fermer ou ouvrir un jour entier)
- `startHour`: "10:00"
- `endHour`: "18:30" (17:00 le dimanche)
- `slotDuration`: 60 min
- `allowDoubleSlots`: booléen (activation toggle Simple vs Double par jour)
- `doubleSlotHours`: Liste d'heures où le créneau double est autorisé (ex: `["10:00", "14:00"]`)
- `overrides`: Dates exceptionnelles fermées / ouvertes (jours fériés, vacances)

### E. `EmailCampaign` & `MessageLog` (Module Mailing & Relances)
- `recipientEmail`, `recipientPhone`
- `type`: `CONFIRMATION` | `REMINDER_72H` | `PROMO` | `FOLLOW_UP`
- `channel`: `EMAIL` (Resend/Postmark) | `SMS` (Twilio/Brevo)
- `sentAt`, `status`

---

## 3. Système d'Empreinte Bancaire Stripe (Sans WooCommerce)

> [!IMPORTANT]
> **Résolution du bug "Fonds insuffisants" identifié dans le brief :**
> L'erreur survenait parce qu'une simple vérification de carte à 0€ ou un vieux webhook WooCommerce ne garantissait pas la validité du moyen de paiement ni les notifications 3 jours avant.

### Architecture Stripe conforme au Brief :
1. **Prise d'empreinte lors de la réservation :**
   - Utilisation de **Stripe SetupIntent** avec `usage: 'off_session'` (et 3D Secure / SCA client).
   - La cliente renseigne sa carte bancaire : **0€ débité immédiatement**.
2. **Notification préalable à J-3 (72h avant) :**
   - Cron job / webhook qui envoie un email/SMS automatique : rappel du rendez-vous et avertissement que l'annulation doit se faire avant les 72h.
3. **Capture / Prélèvement des 20€ UNIQUEMENT en cas d'absence (No-Show) ou annulation tardive (< 72h) :**
   - Déclenchement via le dashboard Admin (bouton 1-clic "Marquer No-Show & Prélever 20€") ou automatique.
   - Appel à l'API `stripe.paymentIntents.create({ amount: 2000, currency: 'eur', customer, payment_method, off_session: true, confirm: true })`.
4. **Si la cliente est présente au RDV :**
   - L'empreinte expire ou est libérée, **aucun montant n'est prélevé**.

---

## 4. Calendrier Public (Créations) & Calendrier Privé (Retouches)

### Calendrier Public (Client) :
- Simple, luxueux, fluide (accordé à la charte Umel Couture).
- Créneaux d'1 heure par défaut du mardi au dimanche.
- Un créneau est disponible si le nombre de réservations confirmées n'a pas atteint la capacité (1 pour créneau simple, 2 si créneau double activé sur cette heure).
- Écran récapitulatif + formulaire + formulaire bancaire Stripe Elements.

### Calendrier Privé (Retouches — 100% Indépendant) :
- Page réservée aux retoucheuses et à Umel/Melissa (`/admin/retouches`).
- Ajout manuel d'un rendez-vous retouche avec cliente, date, heure, nom de la retoucheuse, notes de retouche.
- Filtre par retoucheuse.
- Aucun lien avec la capacité du calendrier création.

---

## 5. Dashboard Admin Complet (`/admin`)

Interface réservée pour Umel & Melissa avec authentification sécurisée :
1. **Vue Planning & Réservations :**
   - Calendrier dynamique (semaine/mois/jour) + vue liste filtrable par date, cliente, statut.
   - Actions directes : Déplacer un RDV (drag & drop ou sélecteur), Annuler, Remplacer une cliente, Marquer Présente / No-Show.
2. **Gestion des Créneaux & Toggles :**
   - Toggle on/off pour chaque jour de la semaine.
   - Toggle par créneau horaire : Créneau Simple (1 cliente) ou Double (2 clientes simultanées).
   - Ajout d'indisponibilités / congés exceptionnels.
3. **Module Mailing / SMS :**
   - Envoi de relance manuelle ou automatique.
   - Envoi d'offres promotionnelles ou annonces à la base de 181 clientes importée.
4. **Gestion Clients (CRM) :**
   - Fiche cliente complète (historique RDV, notes de mensurations, statut prospect/convertie).

---

## 6. Plan de Déploiement Vercel

1. **Variables d'environnement nécessaires :**
   - `DATABASE_URL` (PostgreSQL / Supabase / Neon)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` & `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY` (Emails de confirmation & rappels 72h)
   - `ADMIN_SECRET` / `NEXTAUTH_SECRET` (Accès Back-office)
2. **Script d'importation unique :**
   - Script Node.js `scripts/import-sql-data.ts` qui lit `u104968185_Pnt3Y.sql` et insère automatiquement les 181 clientes et historiques dans la base de données.
