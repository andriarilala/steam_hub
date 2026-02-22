# Guide de Déploiement en Production

Pour garantir un déploiement fonctionnel sur Vercel, vous devez configurer les variables d'environnement suivantes dans les paramètres de votre projet Vercel.

## Variables Requises

| Variable | Description | Valeur Recommandée |
| :--- | :--- | :--- |
| **`DATABASE_URL`** | Chaîne de connexion PostgreSQL | `postgres://user:password@host:port/db` (ex: depuis Neon, Supabase) |
| **`NEXTAUTH_SECRET`** | Chaîne aléatoire pour chiffrer les JWTs | Générez-en une avec `openssl rand -base64 32` |
| **`NEXTAUTH_URL`** | L'URL complète de votre site en production | `https://votre-domaine.vercel.app` |

## Facultatif (Fournisseurs Externes)

Si vous utilisez la connexion via Google ou Facebook, ces variables sont également requises :

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

## Instructions de Configuration

1. **Migration de la Base de Données** : Une fois `DATABASE_URL` configurée, lancez :
   ```bash
   npx prisma db push
   ```
   *Note : Sur Vercel, le script de `build` exécutera automatiquement `prisma generate`.*

2. **Données de Test (Seeding)** : Les utilisateurs de démonstration (`test@example.com`) ne sont **créés qu'en mode développement**. Pour la production, les utilisateurs doivent s'inscrire via la page `/signup`.

3. **HTTPS** : Vercel gère automatiquement le HTTPS. Assurez-vous que `NEXTAUTH_URL` commence par `https://`.
