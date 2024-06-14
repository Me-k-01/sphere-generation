
const vertexShaderText = 
[
    'precision mediump float;',
    '',
    'attribute vec3 vPosition;', 
    'attribute vec4 vColor;',
    'varying vec4 fragColor;', 
    'uniform mat4 mWorld;',
    'uniform mat4 mView;',
    'uniform mat4 mProj;',
    '',
    'void main()',
    '{',
    '  fragColor = vColor;',
    '  gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);',
    '}'
].join('\n');

const fragmentShaderText =
[
    'precision mediump float;',
    '',
    'varying vec4 fragColor;',
    'void main()',
    '{',
    '  gl_FragColor = fragColor;',
    '}'
].join('\n');

// Controlleurs de la scène   
const canvas = document.getElementById('canvas'); 
canvas.width  = window.innerWidth; 
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');



/** Construit le contexte OpenGL. */
function initGL() {       
    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    //gl.cullFace(gl.BACK);

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    } 

    return program;
}

// The objects to update and render on the scene
const polys = [
    // new Quad(new Vec3(0, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1), new Vec3(255, 255, 0)),
    new Sphere(new Vec3(0, 0, 0), 50, new Vec3(0, 255, 0))
] 
const sphere = polys[0];
const program = initGL();
for (const p of polys)
    p.initGL(gl, program);
  
// Tell OpenGL state machine which program should be active.
gl.useProgram(program);
const camera = new Camera(canvas);
   
const nSlider = document.getElementById("slider-n");
const nInput = document.getElementById("input-n");
 
function changeSphere(n) { 
    sphere.n = n; 
    sphere.makeSphere();
    sphere.initGL(gl, program);
}

nSlider.addEventListener("input", (event) => {
    const n = event.target.value; 
    nInput.value = n; 
    changeSphere(n);
});

nInput.addEventListener("input", (event) => { 
    const n = event.target.value;    
    nSlider.value = n;
    changeSphere(n);
}); 
document.getElementById("toggle_triangle_coloring").addEventListener("input", (event) => {  
    changeSphere(sphere.n); // Update colors
}); 
document.getElementById("toggle_point_preview").addEventListener("input", (event) => {  
    changeSphere(sphere.n); // Update colors
}); 

/**
 * Boucle de rendu.
 * @param {number} ms Le temps en seconde écoulé depuis le dernière appelle de la fonction.
 */
function render(ms) { 
    camera.updateMove(ms);
    camera.render(gl);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
     
    for (const p of polys)
        p.render(gl)

    requestAnimationFrame(render);
}; 

requestAnimationFrame(render);
