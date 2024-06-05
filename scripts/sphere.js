
/**
 * Ajoute un gizmo à l'affichage  
 * @param {Vec3} pos Le centre du gizmo 
 * @param {Array} vertices VBO
 * @param {Array} vertices IBO
 * @param {Array} vertices Buffer de couleurs
 */

function addGizmo(pos, vertices, indices, colors, size = 0.01) {  
    const offsetId = vertices.length / 3; // Nombre actuel de sommets / 3 (car chaque sommet a 3 coordonnées)
     
    // Appliquer la transformation et la position
    const transformedVertices = [
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
    ].map((p, i) => p * size + pos.get(i % 3));
    vertices.push(...transformedVertices);
 
    // Mise à jour des indices en tenant compte de la base
    const newIndices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ].map(i => i + offsetId);
    indices.push(...newIndices);  

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
      colors.push(...c, ...c, ...c, ...c) ;  
    }   
}

// Returns the middle of the triangle
function middle(v0, v1, v2) {
    return Vec3.add(v0, v1).add(v2);
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
         * Le nombre de points du maillages de la sphère
         * @type {number}
         * @public
         */
        this.n = n ; 
    } 
    
    /**
     * Triangulisation de delauney contraintes 
     */
    delauney() {
        
    }

    
    /**
     * Generation d'une sphere de fibonacci
     * @param {number} nVertices nombre de points sur la sphere
     */
    fibonacciSphere(nVertices) {   
        let vertices = [];
        let indices = [];
        let colors = [];

        let mesh = []

        const scale = 2; // Scale of the sphere 
        const phi = Math.PI * (Math.sqrt(5) - 1);  // golden angle in radians

        for (let i = 0; i < nVertices; i++) {
            const y = (1 - (i / nVertices) * 2);  // y goes from 1 to -1
            const radius = Math.sqrt(1 - y * y);  // radius at y
    
            const theta = phi * i;  // golden angle increment
    
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;  
            
            const pos = new Vec3(x, y, z).mul(scale); 

            vertices.push(pos.x, pos.y, pos.z); 
            colors.push(Math.random(), Math.random(), 1.0, 1.0); 

            mesh.push(pos); 
        }
        
        // Pour chaque potentiel triangle de la sphere 
        const sliceMesh = Math.trunc(nVertices/3); 
        for (let i = 0; i < sliceMesh ; i++) {
            for (let j = sliceMesh; j < sliceMesh*2; j++) {

            current_triangle_to_evaluate:
                for (let k = sliceMesh*2; k < nVertices ; k++) {
                    // On forme le triangle à évaluer  
                    // Le plan est définis selon la normal 
                    // console.log(mesh[i]);
                    // console.log(mesh[j]);
                    // console.log(mesh[k]);
                    // console.log(Vec3.sub(mesh[j], mesh[i]));
                    // console.log(Vec3.sub(mesh[k], mesh[i]));
                    let normal = Vec3.sub(mesh[j], mesh[i]).cross(Vec3.sub(mesh[k], mesh[i])) ;
                    normal.normalize();

                    const m = middle(mesh[i], mesh[j], mesh[k])
                    // On arange les points pour que leurs normal pointent vers l'exterieur de la sphere
                    if (normal.dot( m ) < 0) { 
                        // Inversion du sens de lecture des points du triangles   
                        // const interm = j;
                        // j = k;
                        // k = interm;
                        // normal.mul(-1);  
                    }

                    let sign = 0;
                    // Verifie que le triangle est minimal, en s'assurant que chaque points est de l'autre coté du plan. 
                    const polygones = [i, j, k]; // Points appartenant au plan
                    for (let x = 0; x<nVertices; x++) {
                        if (x === i || x === j || x === k) 
                            continue;
                        // Verifier qu'aucun point ne se trouve au dessus de la normal
                        const cosTheta = normal.dot(Vec3.sub(mesh[x], mesh[i]));

                        if (cosTheta === 0) {
                            polygones.push(x);
                            console.log("Same plane : ", polygones);
                            continue;
                        } 

                        if (sign === 0) 
                            sign = Math.sign(cosTheta); // Pick a sign for the first time
                        if (sign !== Math.sign(cosTheta))
                            break current_triangle_to_evaluate;

                        // console.log(cosTheta);
                        // if (cosTheta > 0) 
                        //     break current_triangle_to_evaluate;
                        // Cas ou le point est sur le plan (un cube circonscrie à la sphere possèderais des faces à 4 sommets par exemple)
                         
                    }
                    // console.log("Adding triangle : ", polygones);
                    // Ajouter ce triangles au rendu
                    if (polygones.length === 3) {
                        indices.push(i, j, k);
                        indices.push(i, k, j);
                    }
                }
            }
        }

        for (const pos of mesh) {
            addGizmo(pos, vertices, indices, colors)
        }
        // console.log(indices);

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
        /**
         * Le nombre de triangles à rendre (comprends les gizmos)
         * @type {number}
         * @public
         */
        this.nTriangle = indices.length / 3;  
        /**
         * Le nombre de points du vbo (comprends les gizmos)
         * @type {number}
         * @public
         */
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
            0, // 3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex 
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
        gl.drawElements(gl.TRIANGLES, this.nVertices, gl.UNSIGNED_SHORT, 0);
    } 
}


