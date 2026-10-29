AUTODEX V9 — FOURCHETTES DE PRIX ET DIAGNOSTIC DE SAUVEGARDE

Contenu du projet :
- server.js : API et stockage PostgreSQL
- public/index.html : application AutoDex
- package.json : dépendances et commande de démarrage

Changements V9 :
- Les estimations de prix proposent désormais une fourchette indicative basse/haute autour de la valeur de référence. La largeur augmente pour les voitures rares et haut de gamme. Il ne s'agit pas d'une expertise ni d'une garantie de prix de vente.
- La fourchette est conservée dans la fiche de la voiture et affichée dans la collection et les profils.
- Les photos importées sont redimensionnées à 1800 px et compressées en JPEG qualité 80 % pour réduire le volume envoyé à la base de données.
- Les erreurs de sauvegarde donnent des messages plus utiles et le serveur consigne le code et le message de l'erreur dans les logs Render, sans afficher de données secrètes au visiteur.
- Le code garde le catalogue, le cadrage et l'affichage photo plein écran existants.

Installation : remplace les fichiers server.js et public/index.html dans le dépôt, commit puis push. Render doit redéployer.

Important : la correction ne peut pas garantir de résoudre une panne liée aux limites du fournisseur PostgreSQL ou à une configuration de compte. Si la sauvegarde échoue encore, lire le log « Save collection failed » sur Render : le code d'erreur permettra de cibler la cause. Ne supprimez pas la base de données.
