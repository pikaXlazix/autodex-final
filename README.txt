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


AMIS, PROFILS ET STATISTIQUES (NOUVEAU)
======================================
- Recherche d'utilisateurs par pseudo et envoi de demandes d'amis.
- Demandes reçues : accepter ou refuser ; demandes envoyées : annuler.
- Les profils et collections complètes (voitures, photos, prix, marques et valeur totale) sont visibles uniquement entre amis acceptés. Un utilisateur non ami ne peut pas consulter une collection.
- La base PostgreSQL crée automatiquement la table des relations au redémarrage du serveur. Aucune variable Render supplémentaire n'est requise.

ESTIMATIONS HYPERCARS (AMÉLIORATION)
===================================
- Ajout de références spécifiques pour de nombreuses versions rares : Bugatti Bolide/Centodieci/Chiron, Aston Martin Valkyrie/Vulcan/Victor, Ferrari F80/LaFerrari Aperta/Daytona SP3, Lamborghini Veneno/Sián, Koenigsegg Jesko, McLaren F1/P1/Senna, Pagani Zonda/Huayra/Utopia, ainsi que d'autres modèles.
- Pour ces modèles précis, AutoDex utilise la référence dédiée plutôt qu'une moyenne trop générale des annonces. L'année ajuste ensuite l'estimation avec une décote plus prudente pour les voitures de collection.
- Ces références sont des estimations manuelles indicatives, non des cotations certifiées. Les séries limitées, kilométrages, état, historique, spécification et ventes aux enchères peuvent modifier fortement la valeur réelle.

MISE À JOUR DEPUIS TON PROJET EXISTANT
=====================================
1. Décompresse le ZIP et ouvre le dossier FINAL.
2. Copie/remplace le contenu du dossier FINAL dans le dossier local de ton dépôt GitHub `autodex-ai` (garde le même dépôt, ne crée pas un nouveau projet).
3. Dans GitHub Desktop, vérifie les fichiers modifiés, fais un commit avec le résumé `Ajout amis profils et estimations hypercars`, puis clique sur Push origin.
4. Render redéploiera automatiquement si le déploiement automatique est activé. Attends le statut Live.
5. Teste avec deux comptes distincts : envoie une demande depuis le premier, accepte-la depuis le second, puis ouvre le profil depuis la liste d'amis.

MISE A JOUR PHOTOS ET ESTIMATIONS LUXE
=====================================
- Le formulaire photo propose maintenant un aperçu au format 4:3, avec réglages de zoom et de position horizontale/verticale. Le cadrage est enregistré dans la fiche et réutilisé sur les cartes de collection et les profils d'amis.
- Les photos de la collection sont plus hautes ; la galerie des profils affiche les photos sur une hauteur plus importante, avec une adaptation mobile.
- Les estimations spécifiques couvrent désormais plusieurs Ferrari (F8 Tributo/F8 Spider, Roma, 296 GTB/GTS, 812 Superfast/GTS, 599 GTO, 430 Scuderia, etc.), Lamborghini (Huracán Performante/Tecnica/EVO, Aventador SV/S, Urus Performante, etc.), Aston Martin (DBS Superleggera, DBX707, DB12, DB11 AMR) et McLaren (Artura, 675LT, 620R, 600LT, 650S, 570S).
- Exemple : une Ferrari F8 Tributo utilise une référence de base indicative de 430 000 €, ajustée selon l'année. Une F8 Tributo de 2020 ressort donc autour de 340 000 €, plutôt qu'une estimation générique trop basse. Le résultat réel varie selon kilométrage, état, historique, options et marché.
- Ces références sont intégrées au serveur et sont prioritaires sur les médianes génériques de la source publique pour les modèles listés. Elles ne sont pas des prix de vente garantis ni une cotation en direct.
