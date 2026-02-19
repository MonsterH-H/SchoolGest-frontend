# SchoolGestApp - Frontend

Plateforme de gestion scolaire moderne et intégrée pour les établissements d'enseignement.

## Fonctionnalités

- **Espace Administrateur** : Gestion des utilisateurs, des classes, des matières et statistiques globales.
- **Espace Enseignant** : Gestion des cours, cahier de texte, devoirs et évaluations.
- **Espace Étudiant** : Consultation de l'emploi du temps, rendu des devoirs, notes et assiduité.
- **Gestion des Médias** : Téléversement sécurisé de photos de profil et justificatifs via Cloudinary.

## Prérequis

- Node.js (v18+)
- Angular CLI (v19+)
- Backend SchoolGestApp en cours d'exécution (port 8087 par défaut)

## Installation

1. Cloner le projet
2. Installer les dépendances : `npm install`
3. Lancer le serveur de développement : `ng serve`
4. Accéder à `http://localhost:4200`

## Configuration

Le fichier `src/environments/environment.ts` contient l'URL de l'API backend.

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8087'
};
```

## Docker

Pour lancer l'application avec Docker :

```bash
docker-compose up --build
```
"# SchoolGest-frontend" 
