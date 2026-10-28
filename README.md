# Beauty Clinic — Gestion Pro

Application pour **Beauty Clinic** : **pointage employés** et **gestion stock, ventes et achats** (FCFA, interface en français).

## Modules

- **Pointage** — les employés pointent entrée/sortie (`/pointage`) ; le gérant consulte l’historique (`/dashboard/pointage`).
- **Stock** — produits, seuils d’alerte, ajustements manuels.
- **Ventes** — enregistrement des ventes avec décrément stock.
- **Achats** — fournisseurs et réceptions avec incrément stock.

## Démarrage

```bash
cp .env.example .env   # DATABASE_URL, DIRECT_URL, AUTH_SECRET, SUPERADMIN_EMAILS
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Structure

Clone initial : `onime-solutions/onime-menu` (auth, abonnement, design system ONIME, shell mobile/desktop).

Dossier : `C:\Users\leone\Documents\GitHub\gestion-pro`
