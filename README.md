# Génération de sphere à N points

Ce projet génère un maillage 3D de point qui sont répartie sur une sphere selon [l'algorithme de sphere de Fibonacci](http://arxiv.org/pdf/0912.4540)

Les points sont ensuite relié par la procédure de triangularisation sans projection.

## Problèmatique

Le but de ce programme est de générer un maillage triangulaire dont les aires sont casi-uniforme.

Pour un N-arbitraire, il n'existe pas de solution qui donne des triangles possèdants des aires uniformes.

## Inconvéniant

Cet algorithme n'est pas parfait, mais distribu relativement bien les points sur la sphere tout en étant peu coûteux en temps de calcul O(N).

Cette algorithme fournis un bien meilleur résultat qu'une répartition des points par distributions aléatoires sur la sphere.

Cependant, les triangles formés depuis les points générés par méthode de Fibbonaci lattice sont légèrement déformés au niveau de leurs pôles. 

Il sera encore possible d'améliorer la distribution final en se basant sur les algorithmes cherchant a résoudre le problème de Thomson. Cependant ces solutions sont coûteuses en temps de calcul car on doit effectuer une simulation en se faisant repousser chaques points entre eux.

## Autres méthodes

L'implémentation de distribution par Fibbonnacci lattice est meilleur que le découpage de la sphere selon une grille 2D projetté au niveau de l'écrasement sur les pôles (Cf. [Measurement of areas on a sphere using
Fibonacci and latitude–longitude lattices](http://arxiv.org/pdf/0912.4540)).

Une autre méthode pour générer un tel maillage est la subdivision de solide de platon, cependant N serait restreint a certains nombres uniquement. 
De plus, l'air des triangles n'est pas exactement uniforme non plus dès la première subdivision. 
En effet, les triangles d'une même face sont déformé lors de la projection sur la sphere.
    
# Le probleme de Thomson

L'objectif de ce problème est de déterminer la configuration avec le potentiel énergetique minimal de N électrons confinés à la surface d'une sphère. En général, ce problème physique est résolu en appliquant une force entre les éléctrons avec la lois de Coulomb.

Ici nous ne traitons pas des éléctrons mais des points sur une sphère. Nous pourrions donc être tenter de parametrer une différente force de répulsion que celle donnée par la loi de Coulomb.

Cela pourrait potentiellement nous permettre de converger plus rapidement vers une simulation optimal.
 
# Simulation pour résoudre le probleme de Thomson

Comme discuté précédamment, une solution au problème de Thomson peut être approximée au travers d'une simulation de répulsion entre les éléctrons au cours d'un pas de temps. Nos points circonscrit à la sphère agirons tout comme les éléctrons et possèderons une force de répulsion.

Le nombre de cycle C à effectuer est arbitraire, et celui-ci peut donc être stoppé lorsque l'approximation est jugée suffisante.

Pour converger vers une bonne approximation sur un grand nombre de N, un grand nombre de cycle de simulation sera requit.

C peut plus ou moins varier selon la configuration de départ. Içi nous allons reprendre à partir de la distribution des points sur la sphère de Fibonnaci lattice pour accélerer l'algorithme.

---

# Affichage
Couleurs : 
- **Area coloring :** Triangle coloré selon le rapport entre l'air optimal pour uniformité et l'air calculé.
    Bleu : ratio proche de 1
    Rouge : ratio éloigné de 1

- **Neighboor coloring :** Coloration des points selon le nombre de voisins directes.

- Visualisation des points par affichage de cube rouge.

- Changement du nombre N de points circonscrits à la sphère avec un slider.

- Boutton "Simulate repulsion" : lance la recherche de la configuration énergetique minimale.

---

# Generation of N-vertices sphere



[Fibonacci sphere algorithm](http://arxiv.org/pdf/0912.4540)




