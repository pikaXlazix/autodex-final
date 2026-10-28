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
