AUTODEX FINAL — VERSION SANS IA
================================

CONTENU
- public/index.html : interface AutoDex et catalogue étendu de marques/modèles, y compris Aston Martin Valhalla, hypercars et voitures sportives. Les marques et modèles sont des menus dépendants. Un champ manuel permet d'ajouter un modèle absent.
- server.js : serveur web et route /api/price-estimate. Aucun appel à OpenAI, aucune clé API IA nécessaire.
- package.json : démarrage Render avec `npm start`.

PRIX
L'application interroge les fichiers publics de statistiques d'annonces de Karoto. Elle tente la médiane du modèle et de l'année, puis la médiane du modèle toutes années confondues. Ce sont des prix d'annonces indicatifs, pas une garantie de valeur de vente. Les données publiques peuvent ne pas contenir les hypercars rares : dans ce cas, l'application le signale et permet une saisie manuelle. Les fichiers de prix sont mis en cache côté serveur six heures.

IMPORTANT POUR LA COLLECTION
La collection est enregistrée dans le stockage local du navigateur sur l'appareil utilisé. Elle n'est pas automatiquement synchronisée entre appareils. Évitez d'effacer les données du navigateur si vous souhaitez garder les fiches. Les photos occupent aussi de l'espace local.

PUBLICATION DEPUIS ZÉRO (GITHUB + RENDER)
1. Décompressez ce ZIP. Le dossier à utiliser s'appelle FINAL.
2. Connectez-vous à GitHub et créez un nouveau repository : bouton + en haut à droite > New repository. Nom conseillé : autodex-final. Choisissez Private ou Public, mais ne cochez pas l'option qui ajoute automatiquement README/.gitignore (le projet en contient déjà un).
3. Installez GitHub Desktop si nécessaire, puis ouvrez-le et connectez-vous à GitHub.
4. Dans GitHub Desktop : File > Add Local Repository. Choisissez le dossier FINAL décompressé. S'il indique que ce n'est pas un repository Git, choisissez Create a Repository, avec le dossier FINAL comme local path. Ne créez pas un second dossier FINAL imbriqué.
5. Dans GitHub Desktop, écrivez le résumé `Première version AutoDex FINAL`, cliquez sur Commit to main, puis sur Publish repository. Sélectionnez le repository `autodex-final` que vous venez de créer et publiez-le.
6. Connectez-vous à Render. Choisissez New + > Web Service, puis connectez le repository GitHub `autodex-final`.
7. Configurez : Name `autodex-final`; Runtime/Language `Node`; Build Command `npm install`; Start Command `npm start`. Ne renseignez aucune variable OPENAI_API_KEY. Le plan gratuit est suffisant pour commencer si Render le propose.
8. Cliquez sur Create Web Service et attendez que le déploiement affiche Live.
9. Ouvrez l'URL Render fournie. Testez l'ajout d'une voiture et la liste des modèles. Essayez Aston Martin > Valhalla. Vérifiez le prix sur un modèle courant : les prix de certains modèles rares peuvent être indisponibles dans la source publique.
10. Pour utiliser AutoDex sur le téléphone, ouvrez l'URL Render dans Chrome puis menu ⋮ > Ajouter à l'écran d'accueil. C'est une application web installable, pas une application native publiée sur Play Store.

SI TU MODIFIES LE PROJET PLUS TARD
Modifie les fichiers dans le dossier FINAL, puis GitHub Desktop > Commit to main > Push origin. Render redéploie automatiquement si l'auto-deploy est activé.

DÉPANNAGE
- Build failed : vérifiez que Build Command est `npm install` et Start Command `npm start`.
- Site en ligne mais estimation indisponible : la source de données publique peut être temporairement inaccessible ou ne pas connaître le modèle. Le prix peut être saisi manuellement.
- Pas de modèle dans la liste : choisissez « Autre / non listée » ou « Autre modèle » et saisissez son nom.


COMPTES UTILISATEURS (NOUVEAU)
==============================
- Création de compte avec nom unique (3-24 caractères) et mot de passe (8 caractères minimum).
- Mot de passe protégé avec scrypt ; sessions aléatoires stockées côté serveur et cookie HttpOnly persistant 30 jours.
- Chaque compte a sa propre collection ; les fiches et photos sont enregistrées dans PostgreSQL et sont accessibles depuis plusieurs appareils.
- Connexion Google non incluse : elle nécessite une configuration OAuth Google distincte.

CONFIGURATION OBLIGATOIRE SUR RENDER POUR LES COMPTES
=====================================================
1. Dans Render, crée une base PostgreSQL via New + > PostgreSQL. Choisis un nom, la région compatible avec le service et un plan disponible.
2. Une fois créée, ouvre la base de données et copie l'Internal Database URL (si service et base sont dans Render) ou l'URL de connexion recommandée par Render. Garde cette URL secrète.
3. Ouvre le Web Service AutoDex > Environment > Add Environment Variable.
4. Key : DATABASE_URL
   Value : colle l'URL PostgreSQL copiée depuis Render.
5. Enregistre les changements et laisse Render redéployer. La première mise en route crée automatiquement les tables.
6. Ouvre le site : crée un compte de test, ajoute une voiture, recharge la page, puis vérifie que la voiture est toujours là. Teste ensuite depuis un autre appareil.

IMPORTANT
---------
- Sans DATABASE_URL, les inscriptions sont désactivées et l'écran indique que la base de données n'est pas configurée.
- La base PostgreSQL doit rester active et conserver ses données ; consulte les tarifs et règles de conservation de Render avant de choisir le plan.
- Ce projet stocke les photos dans le JSON de la collection. La taille totale de la collection est limitée à 10 Mo et 500 voitures par compte pour éviter de surcharger la base. Réduis la taille des photos si nécessaire.
- Les comptes de l'ancienne version locale ne sont pas importés automatiquement. Les anciennes voitures restées dans le localStorage d'un navigateur ne sont pas migrées dans un compte automatiquement.
