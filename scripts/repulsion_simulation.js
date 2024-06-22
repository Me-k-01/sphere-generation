 
/**
 * @typedef {import('./vec3.js').Vec3} Vec3
 */


let repulsionStrength = 1;

/**
 * Effectue un cycle de la boucle de simulation des répulsions entre les points.  
 * 
 * @param {Array<Vec3>} spherePoints
 * @return {Array<Vec3>} Une liste de velocités
 */
function cycleRepulsion(spherePoints) { 
    // Déplacement à effectuer 
    const velocities = new Array(spherePoints.length); 

    for (let i = 0; i < spherePoints.length; i++) {  
        for (let j = i+1; j < spherePoints.length; j++) { 
            // Direction non-normalisé de i vers j
            const dir = Vec3.sub(spherePoints[i], spherePoints[j]); 
            const dist = dir.getNorm();
            // La direction devient normalisée.
            dir.normalize();

            const f = repulsionStrength / dist; // Division des forces par deux.

            const dirI = Vec3.mul(dir, f);
            const dirJ = Vec3.mul(dir, -f); 

            if (velocities[i] !== undefined)
                velocities[i].add(dirI);
            else 
                velocities[i] = dirI;
                
            if (velocities[j] !== undefined)
                velocities[j].add(dirJ);
            else 
                velocities[j] = dirJ; 
        } 
    }
 
    return velocities;
}
/**
 * Effectue un cycle de la boucle de simulation des répulsions entre les points.
 * La simulation par du principe qu'il y a déjà une plus ou moins bonne distribution 
 * des points et ne fait se repousser entre eux uniquement les points qui sont considérés
 * comme voisins directs. 
 * 
 * @param {Array<Vec3>} spherePoints
 * @return {Array<Vec3>} Une liste de velocités
 */
function cycleOptimizedRepulsion(spherePoints) { 
    // Déplacement à effectuer 
    const velocities = new Array(spherePoints.length); 

    for (let i = 0; i < spherePoints.length; i++) {  
        // Calculer la force uniquement sur les voisins directes 
        for (const j of spherePoints[i].neighboors) {
            // À noté que la force de répulsion sera appliqué deux fois dans notre routine.  
            
            // Direction non-normalisé de i vers j
            const dir = Vec3.sub(spherePoints[i], spherePoints[j]); 
            const dist = dir.getNorm();
            // La direction devient normalisée.
            dir.normalize();

            const f = repulsionStrength / (dist * 2); // Division des forces par deux.

            const dirI = Vec3.mul(dir, f);
            const dirJ = Vec3.mul(dir, -f); 

            if (velocities[i] !== undefined)
                velocities[i].add(dirI);
            else 
                velocities[i] = dirI;
                
            if (velocities[j] !== undefined)
                velocities[j].add(dirJ);
            else 
                velocities[j] = dirJ;

        } 
    }
 
    return velocities;
}
 
function simulateRepulsion() { 
    const v = cycleRepulsion(sphere.mesh);
    // Appliquer les forces de répulsions calculés
    for (const i in v) {
        // En théorie chaque points possèdent au moins un voisin direct, car fait partie d'à minima 3 triangles pour un solide.
        v[i].add(sphere.mesh[i]);  
        // On retire les voisins, car la sphère les recréerais 

        // Convertie v en points sur la sphère
        v[i].normalize();
        v[i].mul(sphere.radius)
    }  
    sphere.applyPos(v);
    sphere.initGL(gl, program);
}

let simuID = undefined;
let timeSimu = 100; // en ms
const buttonSimu = document.getElementById("button-simulate-repulsion");

buttonSimu.addEventListener("click", (event) => {    
    if (simuID === undefined) {
        simuID = setInterval(simulateRepulsion, timeSimu); 
        event.target.className = "active";
    } else { 
        clearInterval(simuID);
        simuID = undefined;
        event.target.className = ""
    }
}); 
 