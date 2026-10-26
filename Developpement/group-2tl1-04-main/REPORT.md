# Rapport de Projet — Quiz Culture Générale (BobSauce)

**Cours :** Développement Informatique III  
**École :** EPHEC  
**Groupe :** Desbeek Lucas, Colard Manon, Hasanov Mustafa  
**Année académique :** 2025-2026

---

## 1. Pitch de l'application

**BobSauce** est une application web de quiz multijoueur en temps réel inspirée des jeux télévisés. Les joueurs rejoignent un salon, et une fois la partie lancée par l'hôte, des questions de culture générale s'affichent les unes après les autres. Chaque joueur peut buzzer pour tenter de répondre. Le premier à atteindre 100 points remporte la partie.

### Fonctionnalités principales

- Création et gestion de salons de jeu
- Système de buzzer en temps réel (Socket.IO)
- Timer de 30 secondes par question, 10 secondes pour répondre après le buzz
- Tolérance orthographique dans les réponses (distance de Levenshtein)
- Tableau des scores en direct
- Statistiques personnelles par joueur (parties jouées, victoires, buzzes, temps moyen de réponse...)
- Transfert automatique du rôle d'hôte en cas de déconnexion
- Limite de 12 joueurs par salon
- Suppression automatique du salon en base de données quand il est vide

---

## 2. Refactoring initial

### Code a été sélectionné

Le projet a été initialisé à partir de la base de code de **Desbeek Lucas**. Cette base comportait une API REST Node.js/Express avec Sequelize, une authentification JWT, et un frontend React avec React Router.

### Difficultés rencontrées 

- **Architecture du projet** : Le projet était structuré en plusieurs couches (Controllers, Services, Routes, Models) avec des conventions de nommage spécifiques (`nom_user`, `mail_user`, etc.). Il a fallu du temps pour comprendre la logique d'ensemble avant de pouvoir contribuer.
- **Système d'authentification** : Le mécanisme d'authentification utilisait initialement un header `Authorization: Bearer` côté frontend combiné à des cookies HttpOnly côté backend, ce qui créait des incohérences. La migration vers un système entièrement basé sur les cookies a nécessité une compréhension fine du flux d'authentification.
- **Socket.IO** : La gestion temps réel avec Socket.IO était nouvelle pour les membres. Comprendre la gestion des rooms, des événements et de l'état partagé côté serveur a demandé un effort d'adaptation important.
- **Sequelize et les associations** : Les associations entre modèles (Utilisateur → ListeStat, Salon → Utilisateur, etc.) et les subtilités de Sequelize (class fields vs `declare`, `getDataValue`, etc.) ont été une source de confusion initiale.

---

## 3. Infrastructure de déploiement

```
┌─────────────────────────────────────────────────────────┐
│                        VPS OVH                          │
│                                                         │
│         docker-compose.yml                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │  ┌─────────────────┐   ┌──────────────────────┐  │   │
│  │  │  Container      │   │  Container           │  │   │
│  │  │  Backend        │   │  Frontend            │  │   │
│  │  │  Node.js/Express│   │  Nginx               │  │   │
│  │  │  Port 3000      │   │  Port 5173           │  │   │
│  │  │  Socket.IO      │   │  (sert le build      │  │   │
│  │  └────────┬────────┘   │   React statique)    │  │   │
│  │           │            └──────────────────────┘  │   │
│  └───────────┼──────────────────────────────────────┘   │
│              │                                          │
│              ▼                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Supabase (PostgreSQL cloud)               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                   GitHub Actions (CI/CD)                │
│  Push sur main                                          │
│       │                                                 │
│       ▼                                                 │
│  Tests Jest ──▶ Build frontend ──▶ Déploiement VPS SSH │
└─────────────────────────────────────────────────────────┘
```


### Description des composants

- **Docker Compose** : Orchestre deux conteneurs distincts sur le même VPS — un pour le backend Node.js/Express/Socket.IO (port 3000) et un pour le frontend servi par Nginx (port 5173). Les deux conteneurs communiquent via le réseau interne Docker Compose.
- **Backend (conteneur Node.js)** : API REST + serveur Socket.IO pour le temps réel.
- **Frontend (conteneur Nginx)** : Sert les fichiers statiques du build React.
- **Supabase** : Base de données PostgreSQL hébergée dans le cloud, accessible depuis le conteneur backend.
- **GitHub Actions** : Pipeline CI/CD qui exécute les tests Jest à chaque push sur `main`, build le frontend, et déploie sur le VPS via SSH.

## 4. Design Patterns utilisés

### 4.1 Singleton — Connexion à la base de données

**Où :** `src/config/database.ts`

La connexion Sequelize à la base de données PostgreSQL est instanciée une seule et unique fois via un module exporté. Node.js met en cache les modules importés, ce qui garantit qu'une seule instance de `Sequelize` existe dans toute l'application, peu importe le nombre de fichiers qui l'importent.

**Pourquoi :** Éviter la création de multiples connexions à la base de données, ce qui serait coûteux en ressources et pourrait provoquer des erreurs de connexion.

```typescript
// src/config/database.ts
const sequelize = new Sequelize(process.env.DATABASE_URL, { ... });
export default sequelize; // Une seule instance partagée
```

### 4.2 Observer — Événements Socket.IO

**Où :** `src/server.ts`

Le système de jeu en temps réel repose entièrement sur le pattern Observer via Socket.IO. Le serveur (sujet) maintient une liste d'abonnés (les sockets connectés dans une room). Lorsqu'un événement se produit (buzz, réponse correcte, fin de partie...), le serveur notifie tous les abonnés concernés via `io.to(room).emit(...)`.

**Pourquoi :** Découpler la logique de jeu de la communication réseau. Chaque joueur observe les événements qui le concernent sans que le serveur ait besoin de connaître les détails de chaque client.

```typescript
// Le serveur notifie tous les observateurs d'une room
io.to(room).emit("new-question", questionData);
io.to(room).emit("scores-update", scores);
io.to(room).emit("game-over", gameOverData);
```

### 4.3 Service Layer (Séparation des responsabilités)

**Où :** `src/controllers/`, `src/services/`, `src/routes/`

La logique métier est encapsulée dans des Services (`AuthService`, `UserService`), séparée des Controllers qui gèrent uniquement la couche HTTP (validation des requêtes, formatage des réponses). Les Routes délèguent aux Controllers.

**Pourquoi :** Améliorer la maintenabilité, la testabilité (les services peuvent être testés indépendamment), et respecter le principe de responsabilité unique (SRP).

---

## 5. Sécurité — Couverture OWASP

### A01 — Broken Access Control

Les routes sensibles de l'API sont protégées par le middleware `authMiddleware` qui vérifie la validité du token JWT avant d'autoriser l'accès. Un utilisateur non authentifié reçoit une réponse `401 Unauthorized`.

```typescript
router.get("/me", authMiddleware, async (req, res) => { ... });
```

### A02 — Cryptographic Failures

Les mots de passe ne sont jamais stockés en clair. Ils sont hashés avec `bcrypt` (salt rounds = 10) avant d'être persistés en base de données.

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### A03 — Injection

L'utilisation de Sequelize ORM avec des requêtes paramétrées protège contre les injections SQL. Les données utilisateur ne sont jamais interpolées directement dans des requêtes SQL.

```typescript
await Utilisateur.findOne({ where: { mail_user: username } });
```

### A07 — Identification and Authentication Failures

- Les tokens JWT sont stockés dans des cookies `HttpOnly`, inaccessibles depuis JavaScript, ce qui protège contre le vol de token via XSS.
- Les tokens ont une durée de vie limitée (1 heure).
- Le cookie utilise `sameSite: "lax"` pour limiter les attaques CSRF.

---

## 6. Tests automatisés

Les tests sont écrits avec **Jest** et couvrent les services métier critiques et fonctions utilitaires.

Pour cela nous avons utilisé des tests unitaires avec des mocks de dépendances.

### Rapport de couverture

> <img width="1886" height="393" alt="image" src="https://github.com/user-attachments/assets/efe21104-5dcb-4ef2-9e10-7024624df266" />


Pour générer le rapport :
```bash
cd server
npm run test:coverage
```

Les tests couvrent notamment :
- `AuthController` : register, login, logout, gestion des erreurs (utilisateur existant, mot de passe invalide)
- `gameUtils` : fonctions utilitaires
---

## 7. Lien de production

L'application est accessible à l'adresse suivante :

**http://91.134.138.136:5173**

---

## 8. Instructions de lancement

### Prérequis

- Docker et Docker Compose installés
- Node.js 18+
- Un fichier `.env` dans le dossier `server/` avec les variables suivantes :

```env
DATABASE_URL=postgresql://...
JWT_SECRET=votre_secret
```

### Lancement

```bash
# Cloner le dépôt
git clone <URL_DU_DEPOT>
cd group-2tl1-04

# Lancer avec Docker Compose
docker compose up --build -d

# L'application est accessible sur :
# Frontend : http://localhost:5173
# Backend  : http://localhost:3000
```

### Tests

```bash
cd server
npm install
npm run test          # Lancer les tests
npm run test:coverage # Rapport de couverture
```
