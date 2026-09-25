-- Lien privé « Gérer mon rendez-vous » (déplacer / annuler en ligne)
ALTER TABLE "Appointment" ADD COLUMN "manageToken" TEXT;
CREATE UNIQUE INDEX "Appointment_manageToken_key" ON "Appointment"("manageToken");

-- Les rendez-vous à venir déjà en base reçoivent aussi un lien (48 caractères aléatoires)
UPDATE "Appointment"
SET "manageToken" = md5(random()::text || id || clock_timestamp()::text) || substr(md5(random()::text), 1, 16)
WHERE status = 'CONFIRMED' AND "manageToken" IS NULL;
