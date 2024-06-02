/** Rayon */
class Ray {
    /** Créer un Rayon
     * @param {Vec3} origin Point d'origine du rayon.
     * @param {Vec3} direction direction du rayon.
     * @param {number} z
     */
    constructor(origin, direction) {
        this.or = origin;
        this.dir = direction;
    }
    
    /** Teste l'intersection avec un plan
     * @param {Vec3} pos Un point appartenant au plan.
     * @param {Vec3} normal La normal du plan faisant face à la direction du rayon.
     * @return {number} La distance a partir de l'origine jusqu'a l'intersection. S'il n'y a pas d'intersection, renvoie -1.
     */
    intersectPlane(pos, normal) {
        let den = normal.dot(this.dir);
	
		if (Math.abs(den) < 0.0000001) {
			return -1;
		}
		return Vec3.sub(pos, this.or).dot(normal) / den;
    }

    /** Teste l'intersection avec un quad
     * @param {Quad} quad Un quad.
     * @return {number} La distance a partir de l'origine jusqu'a l'intersection. S'il n'y a pas d'intersection, renvoie -1.
     */
    intersectQuad(quad) {
        let dist = this.intersectPlane(quad.pos, quad.n);
        
        if (dist === -1) { 
            return -1; // Rayon parallèle au plan
        }
        const posOnPlane = Vec3.add(this.or, Vec3.mul(this.dir, dist));

        posOnPlane.sub(quad.pos);

        // On test si la position se trouve dans le carré.
        const u = posOnPlane.dot(quad.u);
        const v = posOnPlane.dot(quad.v);

        if ( u >= 0 && u <= quad.u.dot(quad.u) && 
             v >= 0 && v <= quad.v.dot(quad.v))
            return dist;
        else 
            return -1;
    }
}