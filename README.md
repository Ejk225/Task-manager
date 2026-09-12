# Task Manager

Application web de gestion de projets et de tâches collaborative : création de projets, invitation de membres, suivi de tâches (statut, priorité, échéance, assignation), commentaires, pièces jointes, historique des modifications et tableau de bord statistique.

## Stack technique

**Backend**
- Node.js / Express
- PostgreSQL + Sequelize (ORM)
- Authentification JWT + bcrypt
- Upload de fichiers via Multer

**Frontend**
- React 18 + Vite
- React Router
- Recharts (graphiques du tableau de bord)
- jsPDF (export PDF)
- Axios

**Infra**
- Docker / Docker Compose (PostgreSQL + backend + frontend/Nginx)

## Fonctionnalités

- Inscription / connexion (JWT)
- Projets : création, modification, suppression, invitation de membres par email
- Rôles par projet : Propriétaire, Membre, Invité (lecture seule)
- Tâches : statut (à faire / en cours / terminée / archivée), priorité, échéance, assignation, filtres et recherche
- Commentaires sur les tâches
- Pièces jointes (upload / téléchargement, glisser-déposer)
- Historique des modifications d'une tâche
- Tableau de bord avec statistiques et graphiques
- Export PDF (projets, détail de projet, tâches)

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose
- Node.js 18+ (uniquement pour lancer backend/frontend hors Docker)

## Installation et lancement (Docker — recommandé)

1. Copier le fichier d'environnement à la racine du projet :

   ```bash
   cp .env.example .env
   ```

   Puis éditer `.env` et renseigner au minimum `DB_PASSWORD` et `JWT_SECRET` (une valeur générée avec la commande indiquée dans le fichier).

2. Lancer la stack complète :

   ```bash
   docker compose up --build
   ```

3. Accès :
   - Frontend : http://localhost
   - API backend : http://localhost:5000/api
   - PostgreSQL : localhost:5433 (mappé pour éviter un conflit avec un Postgres local)

Le schéma de base de données (`init.sql`) est exécuté automatiquement au premier démarrage du volume PostgreSQL. Pour repartir d'une base vierge après une modification du schéma :

```bash
docker compose down -v
docker compose up --build
```

## Lancement en développement (sans Docker)

**Backend**

```bash
cd backend
npm install
cp ../.env.example .env   # adapter DB_HOST=localhost et les autres variables
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Le frontend attend l'API sur l'URL définie dans `frontend/public/config.js` (`http://localhost:5000/api` en local).

## Variables d'environnement

Voir `.env.example` à la racine :

| Variable | Description |
|---|---|
| `DB_NAME` | Nom de la base PostgreSQL |
| `DB_USER` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Secret de signature des tokens JWT |
| `JWT_EXPIRES_IN` | Durée de validité d'un token (ex : `7d`) |
| `FRONTEND_URL` | URL du frontend, utilisée pour la configuration CORS |

## Structure du projet

```
Task-manager/
├── backend/
│   ├── config/          # Configuration de la connexion PostgreSQL
│   ├── controllers/      # Logique métier par ressource
│   ├── middlewares/      # Authentification, permissions, upload
│   ├── models/           # Modèles Sequelize
│   ├── routes/           # Déclaration des routes Express
│   ├── utils/            # JWT, journalisation de l'historique
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/   # Composants réutilisables (cartes, icônes, badges...)
│       ├── context/       # Contexte d'authentification
│       ├── pages/         # Pages routées (Projets, Tâches, Dashboard...)
│       ├── services/      # Appels API et export PDF
│       └── styles/        # Feuilles de style par module
├── init.sql              # Schéma SQL initial
└── docker-compose.yml
```

## API — aperçu des routes

Toutes les routes (sauf inscription/connexion) nécessitent un token JWT dans l'en-tête `Authorization: Bearer <token>`.

| Ressource | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile` |
| Projets | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id` |
| Membres | `POST/GET /api/projects/:id/members`, `DELETE /api/projects/:id/members/:userId`, `POST /api/projects/:id/leave` |
| Tâches | `GET /api/projects/:projectId/tasks`, `POST /api/projects/:projectId/tasks`, `GET/PUT/DELETE /api/tasks/:id`, `PUT /api/tasks/:id/status`, `PUT /api/tasks/:id/assign` |
| Commentaires | `GET/POST /api/tasks/:taskId/comments`, `PUT/DELETE /api/comments/:id` |
| Pièces jointes | `POST/GET /api/tasks/:id/attachments`, `GET /api/attachments/:id/download`, `DELETE /api/attachments/:id` |
| Historique | `GET /api/tasks/:id/history` |
| Statistiques | `GET /api/stats/dashboard` |

## Tests et qualité

```bash
cd frontend && npm run lint
```

> Aucune suite de tests automatisés n'est encore en place côté backend ou frontend.

## Licence

Projet réalisé dans le cadre du titre RNCP Concepteur Développeur d'Applications (CDA).
