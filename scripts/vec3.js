/** Vecteur 3D **/
class Vec3 {
    static axis = ['x', 'y', 'z'];

    /** Créer un vecteur 3D
     * @param {number} x
     * @param {number} y
     * @param {number} z 
     */
    constructor(x, y, z) {
        this.x = x;    
        this.y = y;        
        this.z = z; 
        /**
         * Le nombre de points du maillages de la sphère
         * @type {Set<number>}
         * @public
         */
        this.neighboors = new Set();
    }

    /** Retourne le contenu de l'axe i du vecteur 
     * @return {number} n
     */
    get(i) {
        return this[Vec3.axis[i]]
    }
    
    /**
     *  Addition de deux vecteurs. Modifie la valeur du vec3 concerné.
     * @param {Vec3} o - Le second vecteur.
     * @return {Vec3} La valeur courante modifiée.
     */
    add(o) {
        this.x += o.x;
        this.y += o.y;
        this.z += o.z;
        return this;
    }

    /**
     *  Addition de deux vecteurs.
     * @param {Vec3} a - Le premier vecteur.
     * @param {Vec3} b - Le second vecteur.
     * @return {Vec3} Le resultat dans un nouveau vecteur.
     */
    static add(a, b) { 
        return new Vec3(a.x+b.x, a.y+b.y, a.z+b.z);
    }

    /**
     *  Soustraction de deux vecteurs. Modifie la valeur du vec3 concerné.
     * @param {Vec3} o - Le second vecteur.
     * @return {Vec3} La valeur courante modifiée.
     */
    sub(o) {
        this.x -= o.x;
        this.y -= o.y;
        this.z -= o.z;
        return this;
    }
    
    /**
     *  Soustraction de deux vecteurs (a-b).
     * @param {Vec3} a - Le premier vecteur.
     * @param {Vec3} b - Le second vecteur.
     * @return {Vec3} Le resultat dans un nouveau vecteur.
     */
    static sub(a, b) { 
        return new Vec3(a.x-b.x, a.y-b.y, a.z-b.z);
    }

    /**
     *  Multiplication avec un scalaire. Modifie la valeur courante.
     * @param {number} n - Le scalaire.
     * @return {Vec3} La valeur courante modifiée.
     */
    mul(n) { 
        this.x *= n;
        this.y *= n;
        this.z *= n; 
        return this;
    }

    /**
     *  Multiplication avec un scalaire. 
     * @param {Vec3} a - Un vecteur a multiplier.
     * @param {number} n - Le scalaire.
     * @return {Vec3} Le resultat dans un nouveau vecteur.
     */
    static mul(a, n) {
        return new Vec3(a.x*n, a.y*n, a.z*n);
    }

    /**
     *  Calcule la norme du vecteur.   
     * @return {number} La norme.
     */ 
    getNorm() { 
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }
 
    /**
     * Normalise un vecteur.
     * @return {Vec3} La valeur courante modifiée.
     */ 
    normalize() { 
        const length = this.getNorm();
        this.x /= length;
        this.y /= length;
        this.z /= length;
        return this;
    } 

    /**
     *  Distance entre deux points.
     * @param {Vec3} o Un second vecteur.
     * @return {number} La distance. 
     */  
    dist(o) { 
        return Math.sqrt(this.distSquare(o));
    }

    /**
     *  Distance entre deux points mis au carré.
     * @param {Vec3} o Un second vecteur.
     * @return {number} La distance au carré. 
     */  
    distSquare(o) {
        const x = this.x - o.x;
        const y = this.y - o.y;
        const z = this.z - o.z;
        return x*x + y*y + z*z;
    }
 
    /**
     *  Produit vectoriel.
     * @param {Vec3} o Un second vecteur.
     * @return {Vec3} Le vecteur produit. 
     */  
    cross(o) { 
        return new Vec3(
            this.y * o.z - this.z * o.y,
            this.z * o.x - this.x * o.z,
            this.x * o.y - this.y * o.x
        ); 
    }
    /**
     *  Produit scalaire.
     * @param {Vec3} o Un second vecteur.
     * @return {number} Le produit scalaire. 
     */   
    dot(o) {
        return this.x*o.x + this.y*o.y + this.z*o.z; 
    }

}


  