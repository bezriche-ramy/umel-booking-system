# Guide de l'espace atelier — Umel Couture

Adresse : **https://umelcouture.com/admin** (identifiant = votre e-mail + mot de passe).
Fonctionne sur ordinateur, tablette et téléphone (bouton **Menu** en haut sur mobile).

## 1. Rendez-vous (calendrier Créations)

- **Liste** : rendez-vous groupés par jour. Filtres : période, cliente (nom, e-mail, téléphone, référence), statut.
- **Calendrier** : vue mois. Cliquez sur un rendez-vous pour ouvrir ses actions.
- Actions sur un rendez-vous :
  - **✓ Présente** : la cliente est venue. Rien n'est prélevé.
  - **Absente · prélever 20 €** : passe le rendez-vous en « absente » et prélève l'empreinte. En cas d'échec, le motif exact
    de la banque s'affiche (ex. « Fonds insuffisants [card_declined / insufficient_funds] »). Vous pouvez réessayer plus tard.
  - **Déplacer** : nouvelle date / heure. Cochez « Forcer » pour placer un rendez-vous hors planning ou sur un créneau complet.
  - **Remplacer la cliente** : annule le rendez-vous (sans prélèvement) et place une autre cliente sur le même créneau.
  - **Annuler** : si l'annulation a lieu moins de 72h avant, la case « prélever l'empreinte de 20 € » est proposée.
  - **Notes internes** : visibles uniquement par l'équipe.
- **+ Nouveau rendez-vous** : pour un rendez-vous pris par téléphone, WhatsApp ou en boutique (sans carte bancaire).

« Empreinte ✓ » = carte enregistrée à la réservation. « Sans carte » = rendez-vous saisi par l'atelier ou importé d'Amelia
(aucun prélèvement possible).

## 1 bis. Commandes et Dépôts

Chaque réservation en ligne crée une **commande** (numérotation reprise de l'ancien site : #5096, #5097…) qui porte la
**carte enregistrée** de la cliente. Les commandes de l'ancien site WooCommerce ont été reprises avec leur numéro.

- **Commandes** : liste façon WooCommerce (numéro, cliente, date, état, total, origine), filtres par état, recherche par
  numéro, nom ou e-mail. « Voir » ouvre la fiche : cliente, rendez-vous lié, dépôt, historique.
- **Dépôts** : toutes les empreintes de 20 €.
  - **⏳ En attente · Carte enregistrée** : rien n'a été débité, le bouton **💳 Débiter 20 €** est disponible.
    Il demande le motif : **Absence** (le rendez-vous passe en « Absente ») ou **Annulation < 72h**.
  - **✓ Débité** : date et lien vers le paiement Stripe.
  - **Échec** : la banque a refusé ; le motif exact est affiché (ex. fonds insuffisants). On peut réessayer plus tard.
  - **Expiré** : ancienne pré-autorisation de l'ancien site, plus débitable.
  - **Sans carte** : carte supprimée ou expirée chez Stripe (vérifié automatiquement à la mise en ligne).

## 2. Planning & créneaux

- **Semaine type** : pour chaque jour, ouvert/fermé, premier et dernier créneau, et deux interrupteurs :
  - **Simple** : 1 cliente par horaire ;
  - **Double** : 2 clientes **en même temps** sur le même horaire.
  Les deux peuvent être actifs ensemble (3 clientes maximum sur l'horaire). Réglage initial repris d'Amelia : simple du mardi
  au vendredi, double le samedi et le dimanche.
- **Exceptions par date** : fermer un jour (congés, férié), ouvrir un lundi, ajouter un créneau (ex. 18h), ou régler
  simple/double horaire par horaire pour une date précise. « Supprimer » rend la date à la semaine type.

Les changements s'appliquent immédiatement au calendrier du site. Les rendez-vous déjà pris ne sont jamais supprimés.

## 3. Retouches (calendrier privé)

Totalement séparé du calendrier Créations : rien n'est visible sur le site, aucune réservation en ligne.

- Planning de la semaine, une ligne par retoucheuse (filtre par retoucheuse en haut).
- **+ Nouvelle retouche** : cliente (existante ou nouvelle), retoucheuse, date, heure, durée, travaux, devis.
- Cliquez sur une retouche pour la modifier, la déplacer, changer son statut ou la supprimer.
- **Relances automatiques** : e-mail de rappel à J-X (réglable en bas de page, 2 jours par défaut).

Les retoucheuses disposent d'un compte limité à cet onglet.

## 4. Clientes

- Toutes les clientes (641 importées d'Amelia + chaque nouvelle réservation, créée automatiquement).
- Filtres : recherche, statut (prospect / convertie), origine. **Exporter en CSV** reprend les filtres (ouvrable dans Excel).
- Fiche cliente : coordonnées, statut, date du mariage, notes, historique des rendez-vous, retouches et e-mails envoyés.
  Cochez « ne souhaite pas recevoir les offres » pour l'exclure des campagnes.

## 5. Mailing

- **Relances automatiques** chaque matin : rappel aux clientes ayant rendez-vous dans les 3 jours (avec rappel de la
  politique d'empreinte, pour limiter les refus de prélèvement), et rappels retouches.
- **Campagne** : choisissez les destinataires, l'objet et le message (`{{prenom}}` est remplacé par le prénom).
  Envoyez-vous d'abord un **test**, puis confirmez l'envoi.
- **Historique** : chaque e-mail envoyé, en échec ou non envoyé, avec le motif.

## 5 bis. Relance après le rendez-vous

Dans **Mailing → Relance après le rendez-vous** : un e-mail de courtoisie part automatiquement quelques jours après la venue
de la cliente.

- **Interrupteur** pour l'activer ou la couper à tout moment, **délai J+** réglable, **objet et message modifiables**
  (`{{prenom}}` est remplacé par le prénom).
- Envoyée **uniquement aux clientes marquées « Présente »** dans les rendez-vous : ni les absentes, ni les annulations.
  Pensez donc à marquer « ✓ Présente » après chaque rendez-vous.
- Les clientes ayant coché « ne souhaite pas recevoir les offres » sont exclues.
- **Une seule relance par rendez-vous**, et jamais pour les rendez-vous antérieurs à l'activation : l'historique importé
  d'Amelia ne reçoit rien.

## 6. Comptes

**Comptes** (administratrices uniquement) : qui peut se connecter à l'espace atelier.

- **+ Ajouter un compte** : e-mail + mot de passe (10 caractères minimum). Le compte est créé en **Administratrice**.
- **Rôle** : *Administratrice* (tout l'espace) ou *Retoucheuse* (onglet Retouches uniquement). Le changement est immédiat.
- **Nouveau mot de passe** en cas d'oubli, **Supprimer** pour retirer un accès (effet immédiat, même si la personne est connectée).
- Par sécurité : on ne peut pas supprimer ni rétrograder son propre compte, ni la dernière administratrice.
- Après 5 mots de passe erronés, la connexion est bloquée 15 minutes pour ce compte.
