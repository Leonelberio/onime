# ONIME (clone multi-boutiques)

Projet dérivé de `gestion-pro`, orienté **multi-organisation** :

- **Organization** : abonnement, marque, devise, propriétaire
- **Boutique** : stock, ventes, achats, clients, fournisseurs, pointage (GPS)
- **Vue consolidée** : le propriétaire agrège les KPI du jour sur toutes les boutiques (sélecteur dans la barre latérale)
- **Vue boutique** : opérations d’écriture (stock, ventes, équipe…) exigent une boutique active

## Démarrage

1. Copier `.env` depuis `gestion-pro` (ou créer `DATABASE_URL` / `DIRECT_URL` / `AUTH_SECRET` sur une **base dédiée** ONIME).
2. `npm install`
3. `npx prisma migrate deploy` (migrations multi-org + `20261028130000_product_barcode`)
4. `npm run db:seed`
5. `npm run dev`

Compte démo seed : `owner@onime.demo` / `onime-demo-2026` (2 boutiques : Plateau, Almadies).

## Scan code-barres

- Bouton **Scanner** sur Stock, et dans les modales vente / achat / ajustement / nouveau produit.
- Renseignez le champ **Code-barres** (ou le SKU) sur chaque produit ; la caméra lit EAN, UPC, Code 128, etc.
- API : `GET /api/barcode/lookup?code=…` (boutique active requise).

## Prochaines étapes suggérées

- Comptabilité par boutique + consolidation
- Rôles manager multi-boutiques
- Facturation par nombre de boutiques
