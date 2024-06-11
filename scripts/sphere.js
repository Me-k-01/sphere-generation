
/**
 * Ajoute un gizmo à l'affichage
 * @param {Vec3} pos Le centre du gizmo 
 * @param {Array<float>} vertices Vertex buffer object
 * @param {Array<float>} vertices Index buffer object
 * @param {Array<float>} vertices Color buffer
 */ 
function addGizmo(pos, vertices, indices, colors, size = 0.02) {  
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
    ].map((p, i) => p * size/2 + pos.get(i % 3));
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

/**
 * Ajoute un cube au buffer d'affichage web-gl
 * @param {Vec3} pos Le centre du gizmo 
 * @param {Array<float>} vertices Vertex buffer object
 * @param {Array<float>} vertices Index buffer object
 * @param {Array<float>} vertices Color buffer
 */ 
function addCube(pos, vertices, indices, colors, size = 0.02) {  
    const offsetId = vertices.length / 3; // Nombre actuel de sommets / 3 (car chaque sommet a 3 coordonnées)
     
    // Appliquer la transformation et la position
    const transformedVertices = [ 
        -1, -1, 1,      1, -1, 1,      1, 1, 1,     -1, 1, 1, // Front face
        -1, -1, -1,    -1, 1, -1,      1, 1, -1,     1, -1, -1, // Back face
    ].map((p, i) => p * size/2 + pos.get(i % 3));
    vertices.push(...transformedVertices);
 
    // Mise à jour des indices en tenant compte de la base
    const newIndices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        5, 3, 2, 5, 2, 6, // top
        4, 7, 1, 4, 1, 0, // bottom
        7, 6, 2, 7, 2, 1, // right
        4, 0, 3, 4, 3, 5, // left
    ].map(i => i + offsetId);
    indices.push(...newIndices);  

    const c =  [1.0, 0.0, 0.0, 1.0] ; // blue  
    colors.push(...c, ...c, ...c, ...c) ;  
    colors.push(...c, ...c, ...c, ...c) ;  
}
 
/**
 * Calulate the area of the triangle formed by v0, v1, v2
 * @param {Vec3} v0  
 * @param {Vec3} v1  
 * @param {Vec3} v2  
 */ 
function area(v0, v1, v2) { 
    const u = Vec3.sub(v1, v0);
    const v = Vec3.sub(v2, v0); 
    return u.cross(v).getNorm() / 2;
}
// Returns the middle of the triangle
function middle(v0, v1, v2) {
    return Vec3.add(v0, v1).add(v2);
}

function clamp(x, a, b) {
    return Math.max( a, Math.min(x, b) );
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
        /**
         * Radius de la sphère
         * @type {number}
         * @public
         */
        this.radius = 2;

        /**
         * L'ensemble des points de la sphere, groupé dans une liste 1D, en préparation à l'envoie au Vertices Buffer Object.
         * @type {Array<number>}
         * @private
         */
        this.vertices = [];
        /**
         * L'ensemble des triangles a rendre formant la sphere, groupé dans une liste 1D, en préparation à l'envoie à l'Indices Buffer Object.
         * @type {Array<number>}
         * @private
         */
        this.indices = [];
        /**
         * L'ensemble des couleurs de chaques points du triangles, groupé dans une liste 1D, en préparation à l'envoie au Color Buffer Object.
         * @type {Array<number>}
         * @private
         */
        this.colors = [];
    } 
    
    /**
     * Triangulisation de delauney contraintes 
     * @param {Array<Vec3>} mesh Le radius de la sphere.
     */
    delaunay() {
        
    }


    /**
     * Generation d'un ensemble de point circonscrit à une sphere à partir d'une courbe de fibonacci.
     * 
     * @param {number} nVertices Nombre de points sur la sphere à générer.
     * @param {number} radius Le radius de la sphere.
     * 
     * @returns {Array<Vec3>} Un ensemble de point circonrcit à la sphère.
     */
    generatePointsFibonacci(nVertices, radius) {
        const mesh = []; 
        const phi = Math.PI * (Math.sqrt(5) - 1);  // Angle d'or en radians 

        for (let i = 0; i < nVertices; i++) {
            const y = (1 - (i / nVertices) * 2);  // entre 1 et -1
            const r = Math.sqrt(1 - y * y);  // Radius pour y
    
            const theta = phi * i;  // Golden angle increment
    
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;  
            
            const pos = new Vec3(x, y, z).mul(radius); 

            pos.add(this.pos);
            mesh.push(pos); 
        }

        return mesh;
    } 
    /**
     * Triangularisation d'un polygone convexe. 
     * Ajoute les points et les faces a rendre respectivement dans this.vertices et this.indices.
     * 
     * @param {Array<Vec3>} mesh Un ensemble de point appartenant a un polygone convexe.
     * 
     * @returns {number} Retourne le nombre final de triangle à rendre
     */
    convexTriangulate(mesh) {  
        let nTri = 0;
        // Pour chaque triangle, on test s'il est une bordure du solide
        for (let i = 0; i < this.n ; i++) {
            for (let j = i+1; j < this.n; j++) { 
                for (let k = j+1; k < this.n ; k++) { 
                    // On évalue le triangle Pi, Pj, Pk

                    // Le plan du triangle est définis selon sa normale 
                    let normal = Vec3.sub(mesh[j], mesh[i]).cross(Vec3.sub(mesh[k], mesh[i])) ;
                    normal.normalize(); 

                    let sign = 0;  
                    // Verifie que le triangle est minimal, en s'assurant que chaque points est de l'autre coté du plan. 
                    let polygones = [i, j, k]; // Points appartenants au plan formant la face

                    for (let x = 0; x < this.n; x++) {
                        if ( x === i || x === j || x === k ) 
                            continue; 
                        const cosTheta = normal.dot(Vec3.sub(mesh[x], mesh[i])); 

                        // Cas ou le point est sur le plan 
                        // Car un solide quelconque circonscrit à la sphere pourrait possèder des faces à plus de 3 sommets (exemple du cube)
                        if (cosTheta === 0) {
                            polygones.push(x);
                            console.log("Same plane : ", polygones);
                            continue;
                        } 
                        // Choisir un signe pour la première fois
                        if (sign === 0) 
                            sign = Math.sign(cosTheta);  

                        // Verifier que chaque points de la sphere est du même côté de la normal
                        if (sign !== Math.sign(cosTheta)) {
                            polygones = [];
                            break; 
                        }   
                    } 

                    // Ajouter ce triangle au rendu
                    if (polygones.length === 3) { 

                        nTri++;
                        const m = middle(polygones[0], polygones[1], polygones[2]);
                        const n = this.vertices.length/3;
                        this.indices.push(n, n+1, n+2); 

                        // On arrange les points pour que leurs normales pointent vers l'exterieur de la sphere
                        let v0 = mesh[i];
                        let v1 = mesh[j];
                        let v2 = mesh[k];

                        // Inversion du sens de lecture des points du triangles
                        if (normal.dot( m ) < 0)  
                            [v1, v2] = [v2, v1];
                        
                        this.vertices.push(v0.x, v0.y, v0.z);
                        this.vertices.push(v1.x, v1.y, v1.z);
                        this.vertices.push(v2.x, v2.y, v2.z);

                    } else if (polygones.length > 3) {
                        // TODO : Delaunay
                    }
                }
            }
        } 
        return nTri; // On renvoi le nombre de triangle à rendre, car c'est une valeur qui est inconnu avant l'execution de l'algorithme de triangularisation.
    }

    /**
     * Ajoute des couleurs pour chaque points du maillages pour afficher le rapport entre l'aire de chaque triangle et 
     * l'aire optimal théorique pour l'homogénéité des triangles circonscrit à la sphere.
     * 
     * L'air de chaque face est retrouvé à partir de la liste this.indices.
     * La couleur est un gradient entre le bleu et le rouge, donnée par le rapport : 
     * aire optimal des triangles / aire calculé
     * 
     * Les couleurs sont ajoutés dans la liste 1D this.colors, qui contient les valeurs RGBA de chaque point du maillage pour le rendu WebGL.
     * 
     * @param {Array<Vec3>} mesh L'ensemble de point utilisé pour construire le maillage de la sphère
     */
    colorizeMeshByBestArea(mesh) {
        const nTri = this.indices.length / 3; // Nombre de face que l'on doit rendre
        const optimumArea = Math.PI * 4 * (this.radius) ** 2 / nTri; // L'aire optimal des triangles pour qu'ils soient tous équilatéraux.

        for (let i = 0; i < this.indices.length; i += 3) {
            const iv0 = this.indices[i+0]*3;
            const iv1 = this.indices[i+1]*3;
            const iv2 = this.indices[i+2]*3;  
            const a = area(new Vec3(
                this.vertices[iv0],
                this.vertices[iv0+1],
                this.vertices[iv0+2]
            ), new Vec3(
                this.vertices[iv1],
                this.vertices[iv1+1],
                this.vertices[iv1+2]
            ), new Vec3(
                this.vertices[iv2],
                this.vertices[iv2+1],
                this.vertices[iv2+2]
            ));   

            const c = a < optimumArea ? a/optimumArea : optimumArea/a; // Inversion pour ne pas dépasser 1 
            this.colors.push(1-c, 0, c, 0); 
            this.colors.push(1-c, 0, c, 0); 
            this.colors.push(1-c, 0, c, 0); 
        }
    }

    makeSphere() {
        this.vertices = []
        this.indices = []
        this.colors = []

        const toggle_point_preview = document.getElementById("toggle_point_preview").checked;
        const separate_triangle_coloring = document.getElementById("toggle_triangle_coloring").checked; 
        
        const mesh = this.generatePointsFibonacci(this.n, this.radius);
        this.convexTriangulate(mesh);
        if (separate_triangle_coloring) {
            this.colorizeMeshByBestArea(mesh);
        } else {
            // TODO : add another color type
            this.colorizeMeshByBestArea(mesh);
        }
 
        if (toggle_point_preview) {
            for (const p of mesh) {
                addCube(p, this.vertices, this.indices, this.colors);
            }
        } 
    }
     
    /**
     * Initialisation des buffers
     * @param {WebGLRenderingContext} gl Le contexte WebGL
     * @param {WebGLProgram} program Le program avec les shaders compilés
     */
    initGL(gl, program) {
        // Mesh creation  
        this.makeSphere();

        /**
         * Le nombre de triangles à rendre (comprends les objets de visualisation des points)
         * @type {number}
         * @public
         */
        this.nTriangle = this.indices.length / 3;  
        /**
         * Le nombre de points du vbo (comprends les objets de visualisation des points)
         * @type {number}
         * @public
         */
        this.nVertices = this.indices.length ; 

        // VBO
        this.vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        // IBO
        this.indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.positionAttribLocation = gl.getAttribLocation(program, 'vPosition'); 

        this.initColorBuffer(gl, program); 
    }

    /**
     * Initialisation du color buffer
     * @param {WebGLRenderingContext} gl Le contexte WebGL
     * @param {WebGLProgram} program Le program avec les shaders compilés  
     */
    initColorBuffer(gl, program) {   
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

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


