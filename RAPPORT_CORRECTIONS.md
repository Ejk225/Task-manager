# Rapport — Corrections appliquées & analyse de l'historique Git

Projet : **Task-manager**
Branche de travail : `claude/brave-babbage-vzhrv3`
Statut : **modifications locales, non commitées, non poussées sur GitHub** — à tester en local avant tout commit.

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

Rien n'a été commité ni poussé — à toi de valider en local puis de committer/pousser quand tu es prêt.
