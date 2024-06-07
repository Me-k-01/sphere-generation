/** Permet de déplacer la vue du contexte OpenGL selon les entrées clavier */
class Camera {
    constructor(canvas) {     
        this.matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        this.matViewUniformLocation = gl.getUniformLocation(program, 'mView');
        this.matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

        this.worldMatrix = new Float32Array(16);
        const viewMatrix = new Float32Array(16);
        const projMatrix = new Float32Array(16);
        mat4.identity(this.worldMatrix);
        mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
        mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

        gl.uniformMatrix4fv(this.matWorldUniformLocation, gl.FALSE, this.worldMatrix);
        gl.uniformMatrix4fv(this.matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(this.matProjUniformLocation, gl.FALSE, projMatrix);

        this.xRotationMatrix = new Float32Array(16);
        this.yRotationMatrix = new Float32Array(16);

        this.identityMatrix = new Float32Array(16);
        mat4.identity(this.identityMatrix);

        this.lastUpdate = 0;
        
        this.viewAngleHorizontal = Math.PI/3;
        this.viewAngleVertical = 0;

        this.controller = {
            left: false,
            right : false,
            up: false,
            down : false
        }
          

        // Configuration des events
        window.addEventListener("keyup", event => {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
          
            switch (event.key) {
                case "ArrowLeft":
                    this.controller.left = false;
                    break;
                case "ArrowRight":
                    this.controller.right = false;
                    break;
                case "ArrowUp":
                    this.controller.up = false;
                    break;
                case "ArrowDown": 
                    this.controller.down = false;
                    break;
            } 
        });
        
        window.addEventListener("keydown", event => {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
          
            switch (event.key) {
                case "ArrowLeft":
                    this.controller.left = true;
                  break;
                case "ArrowRight": 
                    this.controller.right = true;
                  break;
                case "ArrowUp":
                    this.controller.up = true;
                    break;
                case "ArrowDown": 
                    this.controller.down = true;
                    break;
            } 
        });

        const bLeft = document.getElementById("controller-left");
        bLeft.addEventListener("mousedown", () => {
            this.controller.left = true;
        });
        bLeft.addEventListener("mouseup", () => {
            this.controller.left = false;
        });
        const bRight = document.getElementById("controller-right");
        bRight.addEventListener("mousedown", () => {
            this.controller.right = true;
        });
        bRight.addEventListener("mouseup", () => {
            this.controller.right = false;
        });
        /*window.addEventListener("resize", () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        });*/
    } 

    /**
     * Effectue les déplacement de la caméra 
     * @param {number} ms Le temps en milliseconde depuis le dernier appel à update. 
     */
    updateMove(ms) {
        const moveH = (+this.controller.right) + (-this.controller.left); 
        const moveV = (+this.controller.up) + (-this.controller.down); 
        this.viewAngleHorizontal += moveH * 0.004 *    (ms-this.lastUpdate) ;
        this.viewAngleVertical += moveV * 0.004 *    (ms-this.lastUpdate) ;
        this.lastUpdate = ms; 
    }
    
    /**
     * Configure la caméra pour le rendu
     * @param {WebGLRenderingContext} gl Le contexte WebGL 
     */
    render(gl) {
        mat4.rotate(this.yRotationMatrix, this.identityMatrix, this.viewAngleHorizontal, [0, 1, 0]);
        mat4.rotate(this.xRotationMatrix, this.identityMatrix, this.viewAngleVertical, [1, 0, 0]);
        mat4.mul(this.worldMatrix, this.yRotationMatrix, this.xRotationMatrix);
        gl.uniformMatrix4fv(this.matWorldUniformLocation, gl.FALSE, this.worldMatrix);
    }
}
