# Génération de sphere à N points

Ce projet génère un maillage 3D de point qui sont répartie sur une sphere selon [l'algorithme de sphere de Fibonacci](http://arxiv.org/pdf/0912.4540)

Les points sont ensuite relié par la procédure de triangularisation de Delauney contrainte.

## Problèmatique

Le but de ce programme est de générer un maillage triangulaire dont les aires sont casi-uniforme.

Pour un N-arbitraire, il n'existe pas de solution qui donne des triangles possèdant des aires uniformes.

## Inconvéniant

Cette algorithme n'est pas parfait, mais distribu assez bien les points sur la sphere tout en étant peu couteux en calcul.


## Autres méthodes

Cette implémentation est déjà meilleur que le découpage de la sphere selon une grille 2D projetté, car il n'y a pas décrasement sur les poles (Cf. [Measurement of areas on a sphere using
Fibonacci and latitude–longitude lattices](http://arxiv.org/pdf/0912.4540).


Une autre méthode pour générer un tel maillage est la subdivision de solide de platon, cependant N serait restreint a certains nombre uniquement. De plus, l'air des triangles n'est plus uniforme après la première subdivision. En effet, les triangles d'une même face sont déformé lors de la projection sur la sphere.

D'autres méthode plus exact existe, mais utilisent des simulations couteuses, tel que les algorithmes cherchant à résoudre le problème de Thomson, en appliquant un force de répulsion.

Pour converger vers une bonne approximation sur un grand nombre de N, un grand nombre de tour de simulation est requit.


---

# Generation of N-vertices sphere



[Fibonacci sphere algorithm](http://arxiv.org/pdf/0912.4540)




