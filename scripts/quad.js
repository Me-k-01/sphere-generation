/** Carreau **/
class Quad {
    /**
     * Créer un Quad
     * @param {Vec3} pos La position haut gauche du quad
     * @param {Vec3} u Une première direction d'arrête partant du coin fournis 
     * @param {Vec3} v Une seconde direction d'arrête partant du coin fournis
     * @param {Vec3} emissiveColor Couleur RGB du Quad
     */
    constructor(pos, u, v, emissiveColor) {
        this.pos = pos; // Coin haut droit du quad 
        // Deux arrêtes partantes du point
        this.u = u; 
        this.v = v;

        this.emissiveColor = emissiveColor; // Couleur initiale du carreau
        
        /**
         * Couleurs reflechis par la surface
         * @type {Vec3}
         * @public
         */
        this.reflectedColor = new Vec3(0, 0, 0);

        /**
         * Normal du quad
         * @type {Vec3}
         * @public
         */
        this.n = u.cross(v).normalize();

        /**
         * Aire du quad
         * @type {Vec3}
         * @public
         */
        this.area = u.getNorm() * v.getNorm();
    }

    /**
     * Renvoie la position milieu du quad. 
     * @return {Vec3} Le milieu
     */
    getMiddle() { 
        return Vec3.add(this.u, this.v).mul(0.5).add(this.pos);
    }

    /**
     * Initialisation des buffer
     * @param {WebGLRenderingContext} gl Le contexte WebGL
     * @param {WebGLProgram} program Le program avec les shaders compilés
     */
    initGL(gl, program) {
        // Create buffer
        const vertices = new Array(6*4);
        let i = 0;
        
        for (let ax of Vec3.axis) { 
            vertices[i]   = this.pos[ax]
            vertices[i+3] = this.pos[ax] + this.u[ax] 
            vertices[i+6] = this.pos[ax] + this.v[ax] 
            vertices[i+9] = this.pos[ax] + this.u[ax] + this.v[ax]
            i++;
        }  
        const indices = [ 0, 3, 1, 0, 2, 3 ];

        this.vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.positionAttribLocation = gl.getAttribLocation(program, 'vPosition'); 

        this.initColorBuffer(gl, program);
    }

    
 
 

    /**
     * Initialisation du color buffer
     * @param {WebGLRenderingContext} gl Le contexte WebGL
     * @param {WebGLProgram} program Le program avec les shaders compilés
     */
    initColorBuffer(gl, program) { 
        const colors = [];
        for (let i = 0; i < 4; i++) {
            colors.push(
                this.emissiveColor.x + this.reflectedColor.x, // R
                this.emissiveColor.y + this.reflectedColor.y, // V
                this.emissiveColor.z + this.reflectedColor.z, // B
                1                                             // Alpha
            );
        } 
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        this.colorAttribLocation = gl.getAttribLocation(program, "vColor");
    }
    
    /**
     * Rendu du polygone.
     * @param {WebGLRenderingContext} gl Le contexte WebGL.
     */
    render(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);
        gl.vertexAttribPointer(
            this.positionAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        ); 
        gl.enableVertexAttribArray(this.positionAttribLocation);   
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(
            this.colorAttribLocation,
            4,
            gl.FLOAT,
            gl.FALSE,
            0,
            0,
        ); 
        gl.enableVertexAttribArray(this.colorAttribLocation);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /**
     * Séléctionne aléatoirement un point appartenant à la surface.
     * @return {Vec3} Un point de la surface du Quad.
     */
    samplePoint() {
        return Vec3.add(this.pos, Vec3.mul(this.u, Math.random())).add(Vec3.mul(this.v, Math.random()));
    }
}


