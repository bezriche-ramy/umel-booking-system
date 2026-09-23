# Mise en production sur le VPS

Checklist du jour J, dans l'ordre. Compter environ 2 heures.
**WordPress reste en ligne jusqu'à l'étape 9** : tant que le DNS n'est pas changé, les clientes réservent sur l'ancien site.

---

## 0. À préparer avant de commencer

- [ ] Accès SSH au VPS (Ubuntu / Debian) et son **adresse IP**
- [ ] Stripe (compte **SARL UMEL COUTURE**) : **Roll key** sur la clé secrète → nouvelle `sk_live_…` + la `pk_live_…`
- [ ] Clé Resend `re_…` (domaine umelcouture.com **Verified** dans Resend)
- [ ] Accès Squarespace (DNS) et accès WordPress (admin + phpMyAdmin Hostinger)

## 1. Installer le serveur (une seule fois)

```bash
sudo apt update && sudo apt install -y nginx postgresql git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm install -g pm2
sudo apt install -y certbot python3-certbot-nginx
```

Pare-feu : seuls SSH et le web sont ouverts (le site écoute uniquement en local, sur le port 3000).

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

## 2. Base de données

```bash
sudo -u postgres psql -c "CREATE USER umel WITH PASSWORD 'MOT_DE_PASSE_LONG';"
sudo -u postgres psql -c "CREATE DATABASE umel OWNER umel;"
```

## 3. Code et configuration

```bash
sudo mkdir -p /var/www/umel && sudo chown $USER /var/www/umel
git clone <URL_DU_DEPOT> /var/www/umel && cd /var/www/umel
cp .env.example .env && nano .env
```

Remplir `.env` (modèle commenté dans `.env.example`) :

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | `postgresql://umel:MOT_DE_PASSE_LONG@localhost:5432/umel` (les deux identiques) |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | la **nouvelle** `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `STRIPE_LIVE_SECRET_KEY` | la même `sk_live_…` (vérification des cartes importées) |
| `RESEND_API_KEY` | `re_…` |
| `EMAIL_FROM` / `EMAIL_REPLY_TO` | `Umel Couture <contact@umelcouture.com>` / `contact@umelcouture.com` |

```bash
npm ci                 # installe aussi Prisma et tsx, nécessaires aux étapes suivantes
npm run db:deploy      # crée les tables
npm run build
```

> Le site **refuse de démarrer** si un réglage critique manque ou est incorrect (secret de test, clés Stripe
> test/live mélangées…) et en donne la raison dans `pm2 logs umel`.

## 4. Reprise des données WordPress (dump le plus récent possible)

1. Hostinger → phpMyAdmin → base WordPress → **Exporter** (format SQL, méthode rapide).
2. Envoyer le fichier sur le serveur : `scp dump.sql utilisateur@IP_DU_VPS:/var/www/umel/`
3. Importer :

```bash
npm run db:seed                                   # planning par défaut (simple en semaine, double le week-end) + jours fériés
npm run db:import-amelia -- /var/www/umel/dump.sql
npm run stripe:check                              # vérifie les cartes des dépôts auprès de Stripe (lecture seule)
rm /var/www/umel/dump.sql                         # le dump contient des données personnelles
```

L'import reprend clientes, rendez-vous Amelia et **commandes WooCommerce** (numéro, carte enregistrée, historique des
débits). Les nouvelles commandes du site continuent la numérotation. L'import peut être relancé sans créer de doublon.

## 5. Premier compte d'accès

```bash
npm run admin:create -- "Umel" contact@umelcouture.com "MOT_DE_PASSE_10_CARACTERES_MIN" ADMIN
```

Les autres comptes (Melissa, retoucheuses) se créent ensuite dans **/admin/comptes** (e-mail + mot de passe).

## 6. Démarrer le site

```bash
pm2 start npm --name umel -- start
pm2 save && pm2 startup     # exécuter la commande affichée pour le redémarrage automatique du serveur
pm2 logs umel --lines 30    # vérifier : « Ready », aucune ligne [config] ✗
```

## 7. Nginx

`/etc/nginx/sites-available/umel` :

```nginx
server {
    server_name umelcouture.com www.umelcouture.com;
    client_max_body_size 5m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/umel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 8. Tâches automatiques (`crontab -e`)

```cron
# Relances e-mail (J-3, retouches, après rendez-vous), chaque matin à 9h
0 9 * * * curl -s -H "Authorization: Bearer VOTRE_CRON_SECRET" http://127.0.0.1:3000/api/cron/reminders > /dev/null
# Sauvegarde de la base chaque nuit (14 jours conservés)
30 3 * * * mkdir -p ~/backups && pg_dump "postgresql://umel:MOT_DE_PASSE_LONG@localhost:5432/umel" | gzip > ~/backups/umel-$(date +\%F).sql.gz && find ~/backups -name 'umel-*.sql.gz' -mtime +14 -delete
```

## 9. Bascule (le nouveau site devient public)

1. **WordPress** : désactiver Amelia et le formulaire de réservation, pour que plus personne ne réserve sur l'ancien site.
2. Si des réservations ont eu lieu depuis le dump de l'étape 4 : refaire un dump, puis
   `npm run db:import-amelia -- dump.sql` et `npm run stripe:check`.
3. **Squarespace → DNS** : enregistrement **A `@`** → **IP du VPS** (aujourd'hui `213.130.145.221`, l'ancien WordPress).
   Ne pas toucher aux enregistrements Google (MX, `google._domainkey`, TXT `v=spf1…`) ni à ceux de Resend.
4. Quand `umelcouture.com` pointe vers le VPS (`ping umelcouture.com`), activer HTTPS :

```bash
sudo certbot --nginx -d umelcouture.com -d www.umelcouture.com
```

> HTTPS est **obligatoire** : sans lui, la connexion à l'espace atelier ne tient pas et Stripe refuse la carte.

Les anciennes adresses WordPress (`/rdv`, `/mon-rendez-vous`, `/panier`, `/commander`, `/mon-compte`,
`/robes-de-mariee-servon`) redirigent automatiquement vers les nouvelles pages.

## 10. Vérifications après la bascule

- [ ] `https://umelcouture.com` s'affiche, avec le cadenas HTTPS
- [ ] `https://umelcouture.com/rdv` arrive sur la réservation
- [ ] Réservation test avec **votre propre carte** : aucun montant débité, e-mail de confirmation reçu,
      la commande apparaît dans **/admin/depots** → puis annuler ce rendez-vous dans l'admin (sans débit)
- [ ] Dans Stripe : le SetupIntent de la réservation test apparaît (0 €)
- [ ] `/admin/login` fonctionne, Rendez-vous / Commandes / Dépôts montrent les données importées
- [ ] Le lendemain matin : **Mailing → Historique** montre les rappels J-3 envoyés par la tâche automatique

## Retour arrière (si problème majeur)

Remettre l'enregistrement **A `@`** sur `213.130.145.221` dans Squarespace et réactiver Amelia : l'ancien site reprend.
Les réservations prises entre-temps restent dans la base du VPS (menu Rendez-vous).

## Mettre à jour le site plus tard

```bash
cd /var/www/umel && git pull && npm ci && npm run db:deploy && npm run build && pm2 restart umel
```

---

## Référence : Stripe (empreinte et débit)

- À la réservation : `SetupIntent` (`usage: off_session`) : la carte est enregistrée et authentifiée (3D Secure), 0 € débité.
- Absence ou annulation < 72h : « Débiter 20 € » dans l'admin → `PaymentIntent` hors session, clé d'idempotence par tentative.
- Les échecs sont historisés avec le code exact Stripe (ex. `insufficient_funds`, `authentication_required`).
- Le rappel J-3 prévient la cliente avant la fin du délai de 72h, ce qui réduit les refus pour fonds insuffisants.

## Référence : développement local

```bash
cp .env.example .env    # PostgreSQL local, clés Stripe de TEST (sk_test / pk_test)
npm install
npm run db:deploy
npm run db:seed && npm run db:import-amelia -- /chemin/dump.sql
npm run admin:create -- "Dev" dev@example.com "motdepasse-dev" ADMIN
npm run dev
```

Carte de test Stripe : `4242 4242 4242 4242`. Carte refusée au débit (fonds insuffisants) : `4000 0000 0000 9995`.
