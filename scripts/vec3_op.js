
/**
 * Calcul l'air du triangle formé par v0, v1, v2
 * 
 * @param {Vec3} v0  
 * @param {Vec3} v1  
 * @param {Vec3} v2 
* @returns {float} L'air du triangle
 */ 
function getArea(v0, v1, v2) { 
    const u = Vec3.sub(v1, v0);
    const v = Vec3.sub(v2, v0); 
    return u.cross(v).getNorm() / 2;
}
/**
 * Calcul le point millieu du triangle formé par v0, v1, v2
 * 
 * @param {Vec3} v0  
 * @param {Vec3} v1  
 * @param {Vec3} v2  
* @returns {Vec3} Le point milieu
 */  
function middle(v0, v1, v2) {
    return Vec3.add(v0, v1).add(v2);
}

/**
 * Fonction de seuillage d'une valeur entre une valeur minimal et maximale.
 * 
 * @param {*} x La valeur a seuillé
 * @param {*} mini Le minimum
 * @param {*} maxi Le maximum
 * @returns Une valeur compris entre mini et maxi.
 */
function clamp(x, mini, maxi) {
    return Math.max( mini, Math.min(x, maxi) );
} 