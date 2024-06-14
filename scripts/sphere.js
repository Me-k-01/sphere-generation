 

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
     * Ajoute les points et les faces a rendre respectivement dans this.vertices et this.indices 
     * en créant des doublons de chaque vertex pour que les points des faces puissent être colorier differamment selon les faces.
     * On retourne tout de même une liste d'indices lié au mesh, pour pouvoir retrouver leurs relations d'adjacences dans notre structures de données.
     * 
     * @param {Array<Vec3>} mesh Un ensemble de point appartenant a un polygone convexe.
     * 
     * @returns {Array<number>} Retourne une liste d'indices de face qui seront rendu, liés à mesh
     */
    convexTriangulate(mesh) {  
        let nTri = 0; // Le nombre de triangle à rendre, n'est pas une valeur qui est connu avant l'execution de la procedure de triangularisation.
        let meshIndices = []; // Une liste des points qui seront rendu, groupé par paires de 3 car l'on rends uniquement des triangles.

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
                        const m = middle(polygones[0], polygones[1], polygones[2]);
                        const n = this.vertices.length/3;
                        this.indices.push(n, n+1, n+2);  

                        // On arrange les points pour que leurs normales pointent vers l'exterieur de la sphere 
                        // Avec une inversion du sens de lecture des points du triangles
                        let sj = j;
                        let sk = k;
                        
                        if (normal.dot( m ) < 0) {
                            sj = k;
                            sk = j;
                        }

                        let v0 = mesh[i];
                        let v1 = mesh[sj];
                        let v2 = mesh[sk];
                        
                        this.vertices.push(v0.x, v0.y, v0.z);
                        this.vertices.push(v1.x, v1.y, v1.z);
                        this.vertices.push(v2.x, v2.y, v2.z);

                        meshIndices.push(i, sj, sk);
                        
                        // Remember the connections for Thomson's problem
                        mesh[i].neighboors.add(sj);
                        mesh[i].neighboors.add(sk);
                        mesh[sj].neighboors.add(i);
                        mesh[sj].neighboors.add(sk);
                        mesh[sk].neighboors.add(i); 
                        mesh[sk].neighboors.add(sj);   

                    } else if (polygones.length > 3) {
                        // TODO : Triangulation de Delaunay dans les cas avec plus de 3 points sur un même plan bordure de sphère.
                    }
                }
            }
        } 
        return meshIndices;  
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
     * @param {Array<Vec3>} mesh L'ensemble de points utilisé pour construire le maillage de la sphère.
     * @param {Array<number>} indices L'ensemble des indices des points qui seront rendu.
     */
    colorizeMeshByBestArea(mesh, indices) {
        const nTri = indices.length / 3; // Nombre de face que l'on doit rendre
        const optimumArea = Math.PI * 4 * (this.radius) ** 2 / nTri; // L'aire optimal des triangles pour qu'ils soient tous équilatéraux.

        for (let i = 0; i < indices.length; i += 3) { 
            const v0 = mesh[indices[i+0]];
            const v1 = mesh[indices[i+1]];
            const v2 = mesh[indices[i+2]];  

            const area = getArea(v0, v1, v2)
            
            const areaErrRatio = area < optimumArea ? area/optimumArea : optimumArea/area // Rapport de l'erreur entre l'air optimum théorique et l'aire calculé. 

            this.colors.push(1-areaErrRatio, 0, areaErrRatio, 0); 
            this.colors.push(1-areaErrRatio, 0, areaErrRatio, 0); 
            this.colors.push(1-areaErrRatio, 0, areaErrRatio, 0); 
        }
    } 
    /**
     * Ajoute des couleurs pour chaque points du maillages pour afficher le nombre de connection. 
     * 
     * La couleur est un gradient entre le bleu et le rouge, donnée par le rapport : 1 / nombre de voisins directs
     * 
     * Les couleurs sont ajoutés dans la liste 1D this.colors, qui contient les valeurs RGBA de chaque point du maillage pour le rendu WebGL.
     * 
     * @param {Array<Vec3>} mesh L'ensemble de points utilisé pour construire le maillage de la sphère.
     * @param {Array<number>} indices L'ensemble des indices des points qui seront rendu.
     */
    colorizePointsByNumberOfConnection(mesh, indices) {
        let max = -Infinity;
        let min = Infinity;
        for (let i = 0; i < indices.length; i ++) { 
            const n = mesh[indices[i]].neighboors.size;
            max = Math.max(max, n);
            min = Math.min(max, n); 
        }

        for (let i = 0; i < indices.length; i += 3) { 
            const v0 = mesh[indices[i+0]];
            const v1 = mesh[indices[i+1]];
            const v2 = mesh[indices[i+2]];  
            let c; 

            // Nombre total des voisins d'un point donné. 
            const n0 = v0.neighboors.size;
            const n1 = v1.neighboors.size;
            const n2 = v2.neighboors.size;
            // console.log(n0, n1, n2);

            // const c0 = (n0-min)/(max-min) ;
            // const c1 = (n1-min)/(max-min) ;
            // const c2 = (n2-min)/(max-min) ;

            const c0 = 1 - n0/max ;
            const c1 = 1 - n1/max ;
            const c2 = 1 - n2/max ;
            
            this.colors.push(0, c0, 1-c0, 0); 
            this.colors.push(0, c1, 1-c1, 0);
            this.colors.push(0, c2, 1-c2, 0);
        }
    } 

    makeSphere() {
        this.vertices = []
        this.indices = []
        this.colors = []

        const toggle_point_preview = document.getElementById("toggle_point_preview").checked;
        const separate_triangle_coloring = document.getElementById("toggle_triangle_coloring").checked; 
        
        const mesh = this.generatePointsFibonacci(this.n, this.radius); // mesh is only used for convexTriangulate and coloring
        const meshIndices = this.convexTriangulate(mesh); // meshIndices is only used for coloring

        if (separate_triangle_coloring) {
            this.colorizeMeshByBestArea(mesh, meshIndices);
        } else { 
            this.colorizePointsByNumberOfConnection(mesh, meshIndices);
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


