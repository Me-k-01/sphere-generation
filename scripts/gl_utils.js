
/**
 * Ajoute un cube dont les face sont coloré à l'affichage.
 * 
 * @param {Vec3} pos Le centre du cube 
 * @param {Array<float>} vertices Vertex buffer
 * @param {Array<float>} indices Index buffer
 * @param {Array<float>} colors Color buffer
 * @param {float} size Taille du côté du cube
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
 * Ajoute un cube au buffer d'affichage web-gl.
 * 
 * @param {Vec3} pos Le centre du gizmo
 * @param {Array<float>} vertices Vertex buffer
 * @param {Array<float>} indices Index buffer
 * @param {Array<float>} colors Color buffer
 * @param {float} size Taille du côté du cube
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
 