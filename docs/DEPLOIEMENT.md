# Déploiement (Vercel) et exploitation

## Services à créer

| Service | Usage | Variables |
| --- | --- | --- |
| PostgreSQL (Neon, Supabase ou Vercel Postgres) | base de données | `DATABASE_URL` (poolée), `DIRECT_URL` (directe) |
| Stripe | empreinte bancaire 20 € (SetupIntent + prélèvement hors session) | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Resend | e-mails (domaine umelcouture.com à vérifier) | `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` |
| — | session admin | `SESSION_SECRET` (`openssl rand -hex 32`) |
| — | cron des relances | `CRON_SECRET` (`openssl rand -hex 32`) |

Voir `.env.example`.

## Premier déploiement

1. Renseigner les variables d'environnement dans Vercel (Production + Preview).
2. Déployer : Vercel exécute `vercel-build` = `prisma generate && prisma migrate deploy && next build`.
3. Depuis un poste avec `DATABASE_URL` / `DIRECT_URL` de production dans `.env` :
   ```bash
   npm run db:seed                                   # planning par défaut + jours fériés
   npm run db:import-amelia -- /chemin/dump.sql      # 641 clientes + 764 rendez-vous Amelia
   npm run admin:create -- "Umel" umel@umelcouture.com "motdepasse-long" ADMIN
   npm run admin:create -- "Melissa" melissa@umelcouture.com "motdepasse-long" ADMIN
   npm run admin:create -- "Sarah" sarah@umelcouture.com "motdepasse-long" SEAMSTRESS
   npm run stripe:check -- --dry-run                 # rapport : cartes des dépôts encore utilisables
   npm run stripe:check                              # les cartes supprimées / expirées passent en « Sans carte »
   ```
   L'import reprend aussi les **commandes WooCommerce** (plugin « Dépôt No-Show ») : chaque commande garde son numéro,
   sa carte enregistrée et son historique de débit, et est reliée à sa réservation Amelia. Les nouvelles commandes du site
   continuent la numérotation.
   `stripe:check` lit uniquement Stripe (clé `STRIPE_LIVE_SECRET_KEY`) : aucun paiement, aucune modification côté Stripe.
   L'import est idempotent : il peut être relancé avec un dump plus récent juste avant la bascule (mise à jour, pas de doublon).
4. Désactiver Amelia / WooCommerce sur WordPress et rediriger la prise de rendez-vous vers le nouveau site.

## Cron

`vercel.json` appelle `/api/cron/reminders` chaque jour à 7h UTC (Vercel envoie `Authorization: Bearer $CRON_SECRET`).
Les relances peuvent aussi être lancées depuis `/admin/mailing`.

## Stripe : empreinte et prélèvements

- À la réservation : `SetupIntent` (`usage: off_session`) — la carte est enregistrée et authentifiée (3D Secure), 0 € débité.
- Absence ou annulation < 72h : l'admin clique « prélever 20 € » → `PaymentIntent` hors session, clé d'idempotence par tentative.
- Les échecs sont historisés avec le code exact Stripe (`code` / `decline_code`, ex. `insufficient_funds`,
  `authentication_required`) dans la fiche du rendez-vous et dans le Mailing.
- Le rappel J-3 prévient la cliente avant l'échéance des 72h, ce qui réduit les refus pour fonds insuffisants.

## Développement local

```bash
cp .env.example .env    # DATABASE_URL vers un PostgreSQL local, clés Stripe de test (sk_test / pk_test)
npm install
npx prisma migrate dev
npm run db:seed && npm run db:import-amelia && npm run admin:create -- "Dev" dev@example.com "motdepasse-dev" ADMIN
npm run dev
```
Carte de test Stripe : `4242 4242 4242 4242`. Carte refusée (fonds insuffisants) au prélèvement : `4000 0000 0000 9995`.

## Hébergement sur VPS (au lieu de Vercel)

Prérequis : Ubuntu/Debian, Node.js **22 LTS**, PostgreSQL 16, Nginx, PM2, un certificat HTTPS (obligatoire pour Stripe
et pour le cookie de session admin `secure`).

```bash
# Base de données
sudo -u postgres createuser umel -P
sudo -u postgres createdb umel -O umel
# .env : DATABASE_URL et DIRECT_URL = "postgresql://umel:MOTDEPASSE@localhost:5432/umel"

# Application
git clone <repo> /var/www/umel && cd /var/www/umel
npm ci
npx prisma migrate deploy
npm run db:seed && npm run db:import-amelia -- /chemin/dump.sql
npm run admin:create -- "Umel" umel@umelcouture.com "motdepasse-long" ADMIN
npm run build
pm2 start npm --name umel -- start      # écoute sur le port 3000
pm2 save && pm2 startup
```

Nginx (proxy vers le port 3000) + HTTPS :
```nginx
server {
    server_name umelcouture.com www.umelcouture.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
`sudo certbot --nginx -d umelcouture.com -d www.umelcouture.com`

Relances quotidiennes (remplace le cron Vercel ; `vercel.json` est alors ignoré) — `crontab -e` :
```
0 9 * * * curl -s -H "Authorization: Bearer VOTRE_CRON_SECRET" https://umelcouture.com/api/cron/reminders > /dev/null
```

Sauvegarde quotidienne de la base (recommandé) :
```
30 3 * * * pg_dump -U umel umel | gzip > /var/backups/umel-$(date +\%F).sql.gz
```

Mise à jour : `git pull && npm ci && npx prisma migrate deploy && npm run build && pm2 restart umel`.
