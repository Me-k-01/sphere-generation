
/**
 * Ajoute un gizmo a l'affichage pour preview un point
 * @param {Vec3} pos Le centre du gizmo 
 * @param {Array} vertices VBO
 * @param {Array} vertices IBO
 * @param {Array} vertices Buffer de couleurs
 */

function addGizmo(pos, vertices, indices, colors, size = 0.05) {  
    // Array.prototype.push.apply(vertices,
    //     [-1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1, -1, 1, 1, -1].map((p, i) => p*gizmoSize + pos.get(i%3))
    // );   
    // Array.prototype.push.apply(
    //     indices,
    //     [2, 3, 1, 4, 7, 3, 8, 5, 7, 6, 1, 5, 7, 1, 3, 4, 6, 8, 2, 4, 3, 4, 8, 7, 8, 6, 5, 6, 2, 1, 7, 5, 1, 4, 2, 6]
    // );

    Array.prototype.push.apply(vertices, [
        // Front face
        -1, -1, 1,      1, -1, 1,      1, 1, 1,     -1, 1, 1, 
        // Back face
        -1, -1, -1,    -1, 1, -1,      1, 1, -1,     1, -1, -1,
        // Top face
        -1, 1, -1,     -1, 1, 1,       1, 1, 1,      1, 1, -1,
        // Bottom face
        -1, -1, -1,     1, -1, -1,     1, -1, 1,    -1, -1, 1,
        // Right face
        1, -1, -1,      1, 1, -1,      1, 1, 1,      1, -1, 1,
        // Left face
        -1, -1, -1,    -1, -1, 1,     -1, 1, 1,     -1, 1, -1,
    ].map((p, i) => p*size + pos.get(i%3))); // Transform

    const offset = indices.length;
    Array.prototype.push.apply(indices, [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ].map(i => i + offset)); 

    const faceCols = [
        [1.0, 1.0, 1.0, 1.0], // Front face: white
        [1.0, 0.0, 0.0, 1.0], // Back face: red
        [0.0, 1.0, 0.0, 1.0], // Top face: green
        [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0], // Right face: yellow
        [1.0, 0.0, 1.0, 1.0], // Left face: purple
    ];  
    for (const c of faceCols) { 
      // Four vertices of the face
      Array.prototype.push.apply(colors, c);
      Array.prototype.push.apply(colors, c);
      Array.prototype.push.apply(colors, c);
      Array.prototype.push.apply(colors, c);
    }  
}

/** Sphere **/
class Sphere {
    /**
     * Créer un Quad
     * @param {Vec3} pos Le centre de la sphere
     * @param {number} n Le nombre de point 
     * @param {Vec3} emissiveColor Couleur RGB du Quad
     */
    constructor(pos, n, emissiveColor) {
        this.pos = pos; // Centre de la sphere
        this.emissiveColor = emissiveColor; // Couleur
        /**
         * Couleurs reflechis par la surface
         * @type {Vec3}
         * @public
         */
        this.reflectedColor = new Vec3(0, 0, 0);
        

        /**
         * Le nombre de vertices
         * @type {number}
         * @public
         */
        this.n = n;  
    } 

    fibonacciSphere(samples) {   
        let vertices = [];
        let indices = [];
        let colors = [];

        const phi = Math.PI * (Math.sqrt(5) - 1);  // golden angle in radians 
        addGizmo(new Vec3(0, -1, 0), vertices, indices, colors);  
        addGizmo(new Vec3(0, 1, 0), vertices, indices, colors);  
        // for (let i = 0; i < samples; i++) {
        //     const y = 1 - (i / samples) * 2;  // y goes from 1 to -1
        //     const radius = Math.sqrt(1 - y * y);  // radius at y
    
        //     const theta = phi * i;  // golden angle increment
    
        //     const x = Math.cos(theta) * radius;
        //     const z = Math.sin(theta) * radius;  
        //     // addGizmo(new Vec3(x, y, z), vertices, indices, colors);
        //     vertices.push(x, y, z);
        //     indices.push(i);
        // }
         
        return {vertices, indices, colors};
    }
    
    /**
     * Initialisation des buffers
     * @param {WebGLRenderingContext} gl Le contexte WebGL
     * @param {WebGLProgram} program Le program avec les shaders compilés
     */
    initGL(gl, program) {
        // Mesh creation 
        const {vertices, indices, colors} = this.fibonacciSphere(this.n); 
        this.nTriangle = indices.length / 3;  
        this.nVertices = indices.length ;
        // VBO
        this.vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // IBO
        this.indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.positionAttribLocation = gl.getAttribLocation(program, 'vPosition'); 

        this.initColorBuffer(gl, program, colors);
        console.log(vertices);
        console.log(indices);
        console.log(colors);
    }

    /**
     * Initialisation du color buffer
     * @param {WebGLRenderingContext} gl Le contexte WebGL
     * @param {WebGLProgram} program Le program avec les shaders compilés 
     * @param {Array} colors le buffer de couleur 
     */
    initColorBuffer(gl, program, colors) {   
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
            false, // Normalize?
            // 3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0,
            0 // Offset from the beginning of a single vertex to this attribute
        ); 
        gl.enableVertexAttribArray(this.positionAttribLocation);   
        
        // Set color attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer( 
            this.colorAttribLocation,
            4,
            gl.FLOAT,
            false,
            0,
            0,
        ); 
        gl.enableVertexAttribArray(this.colorAttribLocation);  
        gl.drawElements(gl.TRIANGLES, 36 + 18, gl.UNSIGNED_SHORT, 0);
    }

}

