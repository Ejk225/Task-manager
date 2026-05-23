-- Création des tables

CREATE TABLE IF NOT EXISTS "Utilisateur" (
  id_utilisateur SERIAL PRIMARY KEY,
  nom            VARCHAR(100) NOT NULL,
  email          VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe   VARCHAR(255) NOT NULL,
  role           VARCHAR(20) DEFAULT 'user',
  date_creation  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Projet" (
  id_projet              SERIAL PRIMARY KEY,
  nom                    VARCHAR(200) NOT NULL,
  description            TEXT,
  date_creation          TIMESTAMP DEFAULT NOW(),
  id_utilisateur_createur INTEGER NOT NULL REFERENCES "Utilisateur"(id_utilisateur)
);

CREATE TABLE IF NOT EXISTS "Participe" (
  id_utilisateur INTEGER NOT NULL REFERENCES "Utilisateur"(id_utilisateur),
  id_projet      INTEGER NOT NULL REFERENCES "Projet"(id_projet) ON DELETE CASCADE,
  role           VARCHAR(20) NOT NULL DEFAULT 'membre'
                 CHECK (role IN ('proprietaire', 'membre', 'invite')),
  date_ajout     TIMESTAMP DEFAULT NOW(),
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id_utilisateur, id_projet)
);

CREATE TABLE IF NOT EXISTS "Tache" (
  id_tache               SERIAL PRIMARY KEY,
  titre                  VARCHAR(200) NOT NULL,
  description            TEXT,
  statut                 VARCHAR(20) NOT NULL DEFAULT 'a_faire'
                         CHECK (statut IN ('a_faire','en_cours','terminee','archivee')),
  priorite               VARCHAR(20) NOT NULL DEFAULT 'moyenne'
                         CHECK (priorite IN ('basse','moyenne','haute','urgente')),
  date_echeance          DATE,
  date_creation          TIMESTAMP DEFAULT NOW(),
  id_projet              INTEGER NOT NULL REFERENCES "Projet"(id_projet) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS "HistoriqueTache" (
  id_historique     SERIAL PRIMARY KEY,
  champ_modifie     VARCHAR(50) NOT NULL,
  ancienne_valeur   TEXT,
  nouvelle_valeur   TEXT,
  date_modification TIMESTAMP DEFAULT NOW(),
  id_tache          INTEGER NOT NULL REFERENCES "Tache"(id_tache) ON DELETE CASCADE,
  id_utilisateur    INTEGER NOT NULL REFERENCES "Utilisateur"(id_utilisateur)
);