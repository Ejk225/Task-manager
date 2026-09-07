# Rapport — Corrections appliquées & analyse de l'historique Git

Projet : **Task-manager**
Branche de travail : `claude/brave-babbage-vzhrv3`
Statut : **3 commits locaux, non poussés sur GitHub** (`git log` les montre, `git push` n'a jamais été exécuté) — testé en local avec succès (voir §3 et §6.4), en attente de ta validation finale avant push.

---

## 1. Résumé

Suite à l'analyse initiale du projet, 9 points concrets (sécurité + dette technique) ont été corrigés directement dans le code. Rien n'a été commité : tous les changements sont dans l'arbre de travail (`git status` les affichera comme modifiés/non indexés). Tu peux tester en local, puis committer toi-même si tout fonctionne comme prévu.

En parallèle, l'historique Git (26 commits, du 22 janvier au 8 juillet) a été passé en revue commit par commit pour reconstituer le déroulé réel du développement et repérer d'où viennent certaines incohérences relevées dans l'analyse précédente.

---

## 2. Corrections appliquées

### 2.1 Secrets versionnés dans `docker-compose.yml` (sécurité)
**Avant** : `JWT_SECRET: ton_jwt_secret_super_long_ici` et `POSTGRES_PASSWORD: postgres123` étaient écrits en clair dans le fichier commité.
**Après** : `docker-compose.yml` lit désormais `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` depuis un fichier `.env` à la racine (déjà couvert par `.gitignore`, qui ignore tout fichier `.env`). Si `DB_PASSWORD` ou `JWT_SECRET` sont absents, `docker compose up` refuse de démarrer avec un message explicite (`:?` en syntaxe Compose).
**Fichiers** : `docker-compose.yml`
**Nouveaux fichiers** :
- `.env.example` (versionnable, sert de modèle)
- `.env` (créé pour toi en local avec un secret JWT généré aléatoirement — **ne sera jamais commité**, il est dans `.gitignore`)

Validé avec `docker compose config` : la configuration se résout correctement.

### 2.2 Pas de garde-fou si `JWT_SECRET` est absent
**Avant** : `backend/utils/jwtUtils.js` utilisait `process.env.JWT_SECRET` directement ; si la variable était absente, `jwt.sign`/`jwt.verify` échouaient de façon peu claire au moment de l'appel.
**Après** : le module lève une erreur explicite (`JWT_SECRET manquant : ...`) dès son chargement, donc le serveur refuse de démarrer proprement plutôt que d'échouer silencieusement plus tard.
**Fichier** : `backend/utils/jwtUtils.js`

### 2.3 Attribution de rôle arbitraire à l'inscription
**Avant** : `authController.js` acceptait un champ `role` envoyé par le client (`role: role || 'membre'`) — un utilisateur pouvait théoriquement s'inscrire en s'auto-attribuant `role: 'admin'`.
**Après** : le rôle est **toujours forcé à `'membre'`** côté serveur, quel que soit le contenu du corps de la requête ; le champ `role` n'est même plus lu depuis `req.body`.
**Fichier** : `backend/controllers/authController.js`

### 2.4 Logs de debug laissés en production
**Avant** : `backend/middlewares/guestMiddleware.js` contenait des `console.log('[DEBUG blockGuests]', ...)` qui journalisaient des IDs utilisateur/projet à chaque requête (ajoutés le 5 juillet, jamais retirés depuis).
**Après** : logs supprimés, la logique métier est inchangée.
**Fichier** : `backend/middlewares/guestMiddleware.js`

### 2.5 Téléchargement de pièce jointe sans contrôle d'accès au projet (faille de sécurité la plus sérieuse)
**Avant** : `downloadAttachment` vérifiait seulement que l'utilisateur était authentifié (middleware `authenticate`), mais pas qu'il appartenait au projet de la tâche concernée — contrairement à l'upload et au listing qui passaient par `checkTaskPermission`. N'importe quel utilisateur connecté connaissant (ou devinant) un `id_piece_jointe` pouvait télécharger le fichier d'un projet auquel il n'appartient pas.
**Après** : `downloadAttachment` recharge la pièce jointe avec sa tâche et le projet associé, puis vérifie que l'utilisateur est membre (`Participe`) ou créateur du projet avant d'autoriser le téléchargement (403 sinon), sur le même modèle que `checkTaskPermission`.
**Fichier** : `backend/controllers/attachmentController.js`

### 2.6 Code mort / trompeur côté frontend
- `attachmentService.js` exposait `getDownloadUrl()`, qui construisait une URL avec `?token=...` en query string — jamais utilisée nulle part dans le code, et de toute façon inopérante côté backend (le token n'est lu que dans le header `Authorization`). **Supprimée.**
- La dépendance `socket.io-client` était installée mais jamais importée ni utilisée (aucune fonctionnalité temps réel dans l'app). **Retirée de `frontend/package.json`** (pense à relancer `npm install` en local pour mettre à jour `package-lock.json`).
**Fichiers** : `frontend/src/services/attachmentService.js`, `frontend/package.json`

### 2.7 `init.sql` désynchronisé du modèle Sequelize
**Avant** :
- `HistoriqueTache` dans `init.sql` ne définissait pas la colonne `details JSONB`, pourtant exigée par `backend/models/TaskHistory.js` et utilisée par `logComplexEvent` (pièces jointes, réassignations). Sur un environnement provisionné uniquement via `init.sql` (premier déploiement, pas de `sync({alter:true})`), ces insertions auraient échoué.
- `Utilisateur.role` avait `DEFAULT 'user'` sans contrainte, alors que le modèle Sequelize impose un ENUM `admin/manager/membre` (la valeur `'user'` n'existe même pas dans cet ENUM).
**Après** : ajout de la colonne `details JSONB` sur `HistoriqueTache`, et alignement de la contrainte `role` sur `Utilisateur` (`DEFAULT 'membre'` + `CHECK (role IN ('admin','manager','membre'))`), cohérent avec le modèle et avec le correctif 2.3.
**Fichier** : `init.sql`

### 2.8 Dead code dans `historyLogger.js`
`logSimpleChange()` n'était appelée nulle part (le vrai enregistrement d'historique dans `taskController.js` fait ses propres `TaskHistory.create()`/`bulkCreate()` en inline). Fonction supprimée, seule `logComplexEvent` (réellement utilisée par `attachmentController.js`) est conservée.
**Fichier** : `backend/utils/historyLogger.js`

### 2.9 Ce qui n'a volontairement PAS été touché
Pour rester sur des corrections ciblées et à faible risque plutôt que de réécrire des pans entiers du projet :
- **`authorize()`** (contrôle par rôle global dans `authMiddleware.js`) reste présent mais non branché sur aucune route. Il est désormais réellement inoffensif (2.3 empêche l'auto-élévation de rôle), mais son utilité reste à décider : soit le brancher sur de vraies routes admin, soit le supprimer si le modèle de permissions par projet (`Participe.role`) suffit.
- **Duplication de la logique de vérification de membership** entre `projectMiddleware.js`, `taskMiddleware.js` et `commentController.js` — fonctionnellement correcte mais dupliquée. Une factorisation demanderait de toucher plusieurs routes et tests manuels plus larges, jugé hors scope d'un correctif ciblé.
- **Validation des uploads basée sur le mimetype déclaré** (falsifiable) — améliorer cela demanderait une dépendance supplémentaire (détection par magic bytes), non ajoutée sans validation de ta part.
- **Absence de tests automatisés** et de vraies migrations Sequelize — ce sont des chantiers structurants, pas des "corrections", laissés en recommandation.

### 2.10 Vérifications effectuées
- `node --check` sur tous les fichiers backend modifiés → syntaxe valide.
- `docker compose config` → résout correctement les variables d'environnement depuis `.env`.
- Les associations Sequelize utilisées dans le correctif 2.5 (`Attachment → Task (as: 'tache') → Project (as: 'projet')`) ont été vérifiées dans `backend/models/index.js`.
- Je n'ai **pas** pu lancer le serveur avec une vraie base de données dans cet environnement (pas de `node_modules` installés ici, pas d'accès à Postgres) — **teste bien le flux d'inscription, l'upload/téléchargement de pièces jointes et le démarrage Docker en local avant de committer.**

---

## 3. Comment tester en local

```bash
# 1. Copier/vérifier le fichier d'environnement racine (déjà créé pour toi, à ne pas commit)
cat .env

# 2. Lancer la stack complète
docker compose up --build

# 3. Vérifier :
#    - inscription d'un nouvel utilisateur -> doit toujours recevoir role "membre" même si tu envoies role="admin" dans le body
#    - upload d'une pièce jointe sur une tâche d'un projet A
#    - tenter de télécharger cette pièce jointe en étant connecté avec un compte qui N'EST PAS membre du projet A -> doit renvoyer 403
#    - démarrage du backend sans JWT_SECRET (retire-le temporairement du .env) -> doit planter au démarrage avec un message clair
```

Si tu préfères lancer le backend seul en local (hors Docker) :
```bash
cd backend
npm install
cp ../.env.example .env   # ou adapte tes propres variables DB_HOST=localhost etc.
npm run dev
```

---

## 4. Analyse de l'historique Git

26 commits, tous du même auteur (`Eliel`), du **22 janvier 2026** au **8 juillet 2026**. Reconstitution chronologique :

| Date | Commit(s) | Ce qui a été livré |
|---|---|---|
| 22 janv. | `efa4f6e` "Premier commit avec .gitignore" | En réalité un **import massif** : auth complète (bcrypt, JWT), modèles `User`/`Project`/`Participe`, `memberController` (316 lignes), `projectController` (209 lignes) — ce n'est pas un "premier commit" au sens littéral, du code préexistant a été importé en un seul commit. |
| 22 janv. | `8a833fa` | Ajustements sur `memberController`/`projectRoutes` (gestion des membres). |
| 10 mars | `2c721c1` (Sprint 3) | Gestion complète des tâches : modèle `Task`, `taskController`, `taskMiddleware`, pages React Liste/Détail de tâches, filtres statut/priorité. **~7 semaines d'écart** avec le commit précédent — développement non linéaire ou non tout commité au fil de l'eau. |
| 17 mai | `e680c2d` (Sprint 4) | Commentaires (`commentController`, `Comment` model) + première version de `statsController.js`. |
| 19 mai | `0548bc9` | Pièces jointes (`attachmentController`, `Attachment` model, `uploadMiddleware`, composant `AttachmentsList`). |
| 23 mai | `98d484e` (Sprint 5) | Historique des tâches (`historyController`, `TaskHistory` model — **première version, sans JSONB**), rôle invité (`guestMiddleware` créé ici). |
| 23 mai | `af9b80e` "Déploiement... en local avec docker" | Introduction de **tout l'environnement Docker d'un coup** : `docker-compose.yml`, Dockerfiles, `nginx.conf`, **et surtout `init.sql`** (73 lignes) — c'est ce commit qui fige le schéma SQL initial, **avant** que `TaskHistory` n'ait sa colonne JSONB (ajoutée seulement le 5 juillet, cf. plus bas) → explique directement l'incohérence relevée entre `init.sql` et le modèle Sequelize. |
| 23 mai | `f27a40b` | Correction du `.gitignore` (juste après avoir committé les fichiers Docker, signe que le `.gitignore` était incomplet au moment du commit précédent). |
| 23-24 mai | `faa88c8`, `92718c5`, `22ad969`, `69fadfe` (commit vide) | Série de correctifs de configuration pour le déploiement Railway (port Nginx, `VITE_API_URL`, `public/config.js` pour la config runtime). Le commit `69fadfe` "force rebuild Railway" est **vide** (aucun changement de fichier) — un commit uniquement destiné à déclencher un redéploiement, pratique à éviter (préférer un redeploy manuel sur la plateforme plutôt qu'un commit vide). |
| 10 juin | `c365f40` | Une **première version** du Dashboard : "message de bienvenue" + CSS, sans statistiques. |
| 10 juin | `4ab5c64` "force rebuild dashboard" (vide), `ee11014` "force cache bust" | Encore deux commits pour forcer un redéploiement/rebuild — même pratique que `69fadfe`. |
| 10 juin | `0cd6827`, `18ebce3` (x2 "fix: nginx port local et Railway") | Deux commits quasi identiques dans le message et l'objet (ajustement du port Nginx) — signe d'aller-retours de debug en production plutôt que d'un test local préalable. |
| 11 juin | `7def169` | Le Dockerfile frontend est modifié pour substituer `$PORT` via `envsubst` avant de lancer Nginx (fix définitif du problème de port Railway rencontré depuis le 23 mai). |
| 5 juillet | `da62651` "ajout de l'historique... JSONB" | **Ajout réel de la colonne `details JSONB`** sur `TaskHistory` — modification du modèle Sequelize (`backend/models/TaskHistory.js`) **mais `init.sql` n'est pas touché dans ce commit**. C'est la cause directe et documentée de l'incohérence relevée dans le rapport d'analyse initial : le schéma versionné dans `init.sql` n'a jamais été mis à jour après ce commit, jusqu'à la correction appliquée aujourd'hui (§2.7). |
| 5 juillet | `50ee8e4`, `7f7285d` (encore un fix nginx), `e045a17` "ajout de log de debeuguage" | Les logs `[DEBUG blockGuests]` corrigés en §2.4 ont été ajoutés ce jour-là pour investiguer un bug lié aux rôles invité — et jamais retirés depuis (2 mois d'écart avec l'analyse actuelle). |
| 6 juillet | `5f75511`, `e7b829a`, `02132c9` | Marqueur de version + argument `CACHEBUST` dans le Dockerfile backend pour forcer la recopie du code source (contournement d'un problème de cache Docker), puis retrait d'un log de test — encore une itération de debug de déploiement. |
| 8 juillet | `8c8681f`, `12b5a54` (derniers commits) | Refactor des filtres de recherche des tâches, puis **le vrai tableau de bord avec statistiques et graphiques** (`recharts`) qui remplace/étend la version "message de bienvenue" de juin — c'est la fonctionnalité la plus récente du projet. |

### Constats tirés de l'historique
1. **Le premier commit n'est pas un vrai point de départ** : il contient déjà un système d'auth et de gestion de membres complet, donc une partie du développement initial (probablement plusieurs sprints locaux) a été squashée avant la mise sous Git.
2. **`init.sql` a été figé une seule fois** (23 mai, commit `af9b80e`) et n'a plus jamais été mis à jour en parallèle des évolutions de modèles Sequelize (notamment l'ajout de la colonne JSONB le 5 juillet) — c'est la cause racine, maintenant documentée, de la désynchronisation relevée dans l'analyse. Sequelize fonctionnant avec `sync({alter:false})`, personne ne s'en est rendu compte car la table `HistoriqueTache` a probablement été créée/complétée manuellement ou via un environnement où la colonne existait déjà (Railway), sans jamais repasser par `init.sql`.
3. **Plusieurs commits vides ou quasi vides** (`69fadfe`, `4ab5c64`) servent uniquement à forcer un redéploiement — pratique qui pollue l'historique ; un redeploy manuel sur Railway (ou un commit réel, même minime) serait préférable.
4. **Le débogage se fait beaucoup en production** : plusieurs allers-retours sur le port Nginx (`0cd6827`/`18ebce3` quasi identiques, puis encore `50ee8e4`/`7f7285d`/`e045a17` le 5 juillet), et un log de debug ajouté le 5 juillet dans `guestMiddleware.js` n'a jamais été nettoyé — cohérent avec la faille de logs relevée en §2.4 : elle n'est pas un oubli isolé mais le symptôme d'un style de travail "corriger en observant les logs Railway" plutôt que de tester en local avant de déployer.
5. **Deux dashboards successifs** : celui de juin (`c365f40`, message de bienvenue) a été largement réécrit/étendu en juillet (`12b5a54`, statistiques + graphiques) — pas une incohérence en soi, juste une évolution rapide de la fonctionnalité en une seule journée de développement (8 juillet), ce qui explique pourquoi le Dashboard est la partie la plus dense et la plus récente du code frontend.
6. **Aucun commit ne mentionne de tests** — cohérent avec l'absence totale de suite de tests relevée dans l'analyse : le projet a été développé et validé uniquement par observation manuelle (locale puis via les logs de production), jamais par une suite automatisée.

---

## 5. Récapitulatif des fichiers modifiés/créés

**Modifiés** :
- `docker-compose.yml`
- `backend/utils/jwtUtils.js`
- `backend/controllers/authController.js`
- `backend/middlewares/guestMiddleware.js`
- `backend/controllers/attachmentController.js`
- `backend/utils/historyLogger.js`
- `init.sql`
- `frontend/src/services/attachmentService.js`
- `frontend/package.json`

**Créés** :
- `.env` (local, ignoré par git)
- `.env.example` (à committer, sert de modèle pour toute personne qui clone le projet)
- `RAPPORT_CORRECTIONS.md` (ce fichier)

Rien n'a été poussé sur GitHub (3 commits locaux) — à toi de valider puis de pousser quand tu es prêt.

---

## 6. Tests manuels effectués (session du 7 septembre)

Le projet a été lancé en local via `docker compose up --build` et testé manuellement dans le navigateur. Résultats :

1. **Inscription/connexion** : OK.
2. **Backend + PostgreSQL** : OK après réinitialisation du volume Docker (`docker compose down -v`) — nécessaire car un volume `postgres_data` préexistant gardait l'ancien mot de passe (Postgres ne relit `POSTGRES_PASSWORD` qu'à la toute première initialisation du volume).
3. **Frontend** : plantait en boucle (`nginx: invalid number of arguments in "listen" directive`) car `docker-compose.yml` ne fournit pas de variable `PORT` au service frontend, et le `Dockerfile` (pensé pour Railway) fait un `envsubst` dessus. **Corrigé** en ajoutant `ENV PORT=80` par défaut dans `frontend/Dockerfile` (Railway continue de fonctionner car il fournit toujours sa propre variable `PORT`, qui prime).
4. **`frontend/public/config.js`** pointait en dur vers l'URL de production Railway (comportement voulu par le fichier lui-même, cf. son commentaire "NE JAMAIS COMMIT CE FICHIER MODIFIÉ POUR DU LOCAL") — basculé temporairement vers `localhost:5000` pour les tests, à remettre sur la valeur de prod avant tout commit/push.
5. **Faille §2.5 (téléchargement de pièce jointe)** : testée avec deux comptes réels (A membre du projet, B non-membre). Requête `fetch()` authentifiée en tant que B sur `/api/attachments/1/download` → **403 confirmé**. Avant le correctif, cette même requête aurait renvoyé 200.
6. **Correctif §2.3 (rôle forcé à l'inscription)** : requête `POST /api/auth/register` avec `role: "admin"` explicite dans le corps → l'utilisateur créé a bien `role: "membre"` en retour. Confirmé.
7. **Rôle invité (non-régression)** : un membre ajouté avec le rôle "invité" reçoit bien un message "Les invités ne peuvent pas effectuer cette action" en tentant de changer le statut d'une tâche. Confirmé, la suppression des logs de debug (§2.4) n'a rien cassé.

**Commit supplémentaire pendant les tests** : `frontend/Dockerfile` — ajout de `ENV PORT=80` (valeur par défaut pour le développement local uniquement, sans impact sur Railway).

---

## 7. Analyse de conformité — Cahier des charges CDA + Dossier de Projet

Le candidat a partagé son **Cahier des charges**, sa **Liste des compétences travaillées** et son **Dossier de Projet** (titre RNCP Concepteur Développeur d'Applications, session juillet 2026). Comparaison avec le code réel du dépôt :

### 7.1 Conformité au cahier des charges

| Exigence | Statut |
|---|---|
| Authentification (bcrypt, JWT sur toutes routes protégées) | ✅ Conforme |
| Projet : seul le créateur modifie/supprime | ✅ Conforme (`checkProjectOwnership`) |
| Invité = lecture seule stricte | ✅ Conforme (testé §6.7) |
| "Seuls le créateur de la tâche ou le membre assigné peuvent modifier son statut/contenu" | ❌ **Non conforme.** Le modèle `Tache` n'a pas de champ `id_utilisateur_createur` : n'importe quel membre du projet peut modifier n'importe quelle tâche (`checkTaskPermission` ne vérifie que l'appartenance au projet, pas la propriété de la tâche). |
| Commentaires : ordre antéchronologique, seul l'auteur modifie/supprime | ✅ Conforme |
| Pièces jointes | ✅ Conforme (après correctif §2.5) |
| Dashboard + export PDF | ✅ Conforme |
| "Rôles Administrateur/Membre/Invité assignables par le propriétaire" | ⚠️ Partiel — `memberController.addMember` n'autorise que `['membre','invite']` ; impossible de promouvoir un membre "Administrateur", un seul propriétaire par projet en pratique. |
| "Aucune donnée sensible en clair dans le code source versionné" | ❌ Ne l'était pas avant le correctif §2.1 (secrets en dur dans `docker-compose.yml` commité). |
| "Vérification systématique de la propriété des ressources" | ❌ Ne l'était pas avant le correctif §2.5 (faille de téléchargement). |

### 7.2 Écart trouvé entre le Dossier de Projet et le dépôt réel (important pour la soutenance)

L'**Annexe B** du Dossier de Projet (script SQL) montre un schéma avec `TIMESTAMPTZ` partout, la colonne `details JSONB`, et un index GIN dessus. Le **vrai `init.sql` du dépôt** (avant nos correctifs) utilisait des `TIMESTAMP` classiques, **n'avait pas** la colonne `details`, et **pas d'index GIN**. Le récit du chapitre 9 ("Difficulté 6 : migration vers TIMESTAMPTZ appliquée en dev et en prod") décrit une correction qui n'a jamais été reportée dans le script SQL versionné — écart facilement vérifiable par un jury comparant l'annexe au dépôt GitHub réel.

**Décision prise avec le candidat** : ne pas modifier le schéma de production pour coller à l'annexe (risque inutile, changement de type de colonne sur une base en prod). À la place :
- **Ajout sûr et non-destructif** : un index GIN sur `HistoriqueTache.details` a été ajouté à `init.sql` (commit local, voir §5) — une opération purement additive qui ne modifie aucune donnée existante. **Reste à faire par le candidat** : exécuter une fois sur la base de production (voir §8 ci-dessous) pour que l'affirmation de l'Annexe B et de la compétence CP8 soit vraie partout, pas seulement sur une nouvelle installation.
- **Le dossier de projet doit être corrigé** (pas le code) pour refléter la réalité : remplacer `TIMESTAMPTZ` par `TIMESTAMP` dans l'Annexe B, et adoucir le récit de la "Difficulté 6" pour ne pas prétendre à une migration qui n'a pas eu lieu. Textes de remplacement fournis en §8.
- Autre point mineur relevé : le plan de tests (§7.2 du dossier, 12 scénarios) ne couvre aucun scénario sur le téléchargement de pièce jointe — c'est justement là qu'une vraie faille a été trouvée et corrigée aujourd'hui (§2.5). Ajouter un scénario T13 renforcerait la soutenance.

---

## 8. À faire à la reprise (rien de fait pour l'instant sur ces 2 points)

### 8.1 SQL à exécuter une fois sur la base de production (Railway)
Non destructif, sûr, ajoute uniquement un index :
```sql
CREATE INDEX IF NOT EXISTS idx_historique_details
  ON "HistoriqueTache" USING GIN (details);
```

### 8.2 Corriger le Dossier de Projet (document source, pas le code)

**Annexe B — remplacer le bloc SQL actuel par celui-ci** (seul changement : `TIMESTAMP` au lieu de `TIMESTAMPTZ` partout ; le reste — colonne `details`, index GIN — était déjà correct dans l'annexe et correspond maintenant au dépôt réel après le correctif §7.2) :

```sql
CREATE TABLE IF NOT EXISTS "Utilisateur" ( 
  id_utilisateur SERIAL PRIMARY KEY, 
  nom            VARCHAR(100) NOT NULL, 
  email          VARCHAR(150) UNIQUE NOT NULL, 
  mot_de_passe   VARCHAR(255) NOT NULL, 
  role           VARCHAR(20) NOT NULL DEFAULT 'membre' 
                 CHECK (role IN ('admin','manager','membre')), 
  date_creation  TIMESTAMP DEFAULT NOW() 
); 
  
CREATE TABLE IF NOT EXISTS "Projet" ( 
  id_projet     SERIAL PRIMARY KEY, 
  nom           VARCHAR(200) NOT NULL, 
  description   TEXT, 
  date_creation TIMESTAMP DEFAULT NOW(), 
  id_utilisateur_createur INTEGER NOT NULL 
    REFERENCES "Utilisateur"(id_utilisateur) 
); 
  
CREATE TABLE IF NOT EXISTS "Participe" ( 
  id_utilisateur INTEGER NOT NULL REFERENCES "Utilisateur"(id_utilisateur), 
  id_projet      INTEGER NOT NULL REFERENCES "Projet"(id_projet) ON DELETE CASCADE, 
  role           VARCHAR(20) NOT NULL DEFAULT 'membre' 
                 CHECK (role IN ('proprietaire','membre','invite')), 
  date_ajout     TIMESTAMP DEFAULT NOW(), 
  PRIMARY KEY (id_utilisateur, id_projet) 
); 

CREATE TABLE IF NOT EXISTS "Tache" ( 
  id_tache      SERIAL PRIMARY KEY, 
  titre         VARCHAR(200) NOT NULL, 
  description   TEXT, 
  statut        VARCHAR(20) NOT NULL DEFAULT 'a_faire' 
                CHECK (statut IN ('a_faire','en_cours','terminee','archivee')), 
  priorite      VARCHAR(20) NOT NULL DEFAULT 'moyenne' 
                CHECK (priorite IN ('basse','moyenne','haute','urgente')), 
  date_echeance DATE, 
  date_creation TIMESTAMP DEFAULT NOW(), 
  id_projet     INTEGER NOT NULL REFERENCES "Projet"(id_projet) ON DELETE CASCADE, 
  id_utilisateur_assigne INTEGER REFERENCES "Utilisateur"(id_utilisateur) 
); 
  
CREATE TABLE IF NOT EXISTS "Commentaire" ( 
  id_commentaire   SERIAL PRIMARY KEY, 
  contenu          TEXT NOT NULL, 
  date_commentaire TIMESTAMP DEFAULT NOW(), 
  id_tache         INTEGER NOT NULL REFERENCES "Tache"(id_tache) ON DELETE CASCADE, 
  id_utilisateur   INTEGER NOT NULL REFERENCES "Utilisateur"(id_utilisateur) 
); 

CREATE TABLE IF NOT EXISTS "PieceJointe" ( 
  id_piece_jointe SERIAL PRIMARY KEY, 
  nom_fichier     VARCHAR(255) NOT NULL, 
  nom_original    VARCHAR(255) NOT NULL, 
  type_mime       VARCHAR(100) NOT NULL, 
  taille          INTEGER NOT NULL, 
  chemin          VARCHAR(500) NOT NULL, 
  date_upload     TIMESTAMP DEFAULT NOW(), 
  id_tache        INTEGER NOT NULL REFERENCES "Tache"(id_tache) ON DELETE CASCADE, 
  id_utilisateur  INTEGER NOT NULL REFERENCES "Utilisateur"(id_utilisateur) 
); 
  
-- Table d'historique : support de la compétence CP8 (SQL + NoSQL) 
CREATE TABLE IF NOT EXISTS "HistoriqueTache" ( 
  id_historique     SERIAL PRIMARY KEY, 
  champ_modifie     VARCHAR(50) NOT NULL, 
  ancienne_valeur   TEXT, 
  nouvelle_valeur   TEXT, 
  details           JSONB,  -- document JSON à structure variable 
  date_modification TIMESTAMP DEFAULT NOW(), 
  id_tache          INTEGER NOT NULL REFERENCES "Tache"(id_tache) ON DELETE CASCADE, 
  id_utilisateur    INTEGER NOT NULL REFERENCES "Utilisateur"(id_utilisateur) 
); 
  
CREATE INDEX idx_historique_details 
  ON "HistoriqueTache" USING GIN (details);
```

**"Difficulté 6" — remplacer le paragraphe actuel du dossier par celui-ci** (garde la démarche de diagnostic, sans prétendre à une migration qui n'a pas eu lieu) :

> **Difficulté 6 : Décalage horaire sur l'horodatage des commentaires**
> Symptôme : un commentaire tout juste publié pouvait afficher un horodatage décalé de plusieurs heures selon le fuseau du serveur consultant les données.
> Diagnostic : les colonnes de date (`date_commentaire`, `date_creation`, etc.) sont typées `TIMESTAMP WITHOUT TIME ZONE`, ce qui ne conserve aucune information de fuseau horaire lors du stockage — la valeur peut alors être réinterprétée différemment selon le fuseau du client qui la lit.
> Solution envisagée : la correction propre consiste à migrer ces colonnes vers `TIMESTAMPTZ`, ce qui nécessite une opération de migration sur la base de production (changement de type de colonne). Par prudence, cette migration a été **différée** plutôt qu'appliquée en urgence sur une base en production, pour ne pas introduire de risque de verrouillage de table sans fenêtre de maintenance dédiée. Elle est documentée comme axe d'amélioration prioritaire pour une prochaine itération (cf. chapitre Perspectives d'évolution).

### 8.3 Optionnel (non bloquant, mentionné pour mémoire)
- Ajouter un scénario T13 au plan de tests : "Téléchargement d'une pièce jointe par un utilisateur non-membre du projet → 403" (cf. §7.2).
- Exécuter réellement `npm audit` (backend et frontend) avant la restitution, pour que l'affirmation "veille sécurité via npm audit" (CP11) soit vérifiable, pas seulement déclarative.
