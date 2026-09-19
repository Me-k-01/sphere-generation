/** Permet de déplacer la vue du contexte OpenGL selon les entrées clavier */
class Camera {
    constructor(canvas, fov = 45) {     
        this.matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        this.matViewUniformLocation = gl.getUniformLocation(program, 'mView');
        this.matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

        this.canvas = canvas

        this.nearPlane    = 0.1
        this.farPlane     = 1000
        this.fovRadian    = glMatrix.toRadian(fov) // FOV vertical en Radian
        this.sensitivity = 0.01  // Mouse sensitivity
        this.distance = 8  // Distance from the object

        this.rotationSpeed = 0.0001

        this.lastCursorPos = undefined

        this.theta = Math.PI / 4  // Initial angle around the vertical axis (Y)
        this.phi = Math.PI / 4    // Initial angle around the horizontal axis (X-Z)
        this.setPosFromPolar(this.theta, this.phi)

        this.target   = vec3.fromValues(0, 0, 0)
        this.upVector = vec3.fromValues(0, 1, 0)

        this.worldMatrix = new Float32Array(16);
        this.viewMatrix  = new Float32Array(16);
        this.projMatrix  = new Float32Array(16);

        this.stop = false // Stop la camera

        mat4.identity(this.worldMatrix);
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.upVector);
        // this.aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight
        mat4.perspective(this.projMatrix, this.fovRadian, this.getAspectRatio(), this.nearPlane, this.farPlane);

        gl.uniformMatrix4fv(this.matWorldUniformLocation, gl.FALSE, this.worldMatrix);
        gl.uniformMatrix4fv(this.matViewUniformLocation, gl.FALSE, this.viewMatrix);
        gl.uniformMatrix4fv(this.matProjUniformLocation, gl.FALSE, this.projMatrix);

        this.xRotationMatrix = new Float32Array(16);
        this.yRotationMatrix = new Float32Array(16);

        this.identityMatrix = new Float32Array(16);
        mat4.identity(this.identityMatrix);
        
        this.viewAngleHorizontal = Math.PI/3;
        this.viewAngleVertical = 0;

        this.controller = {
            left: false,
            right : false,
            up: false,
            down : false,
            left_click : false,
            middle_click : false,
            right_click : false,
        }
          
        const keyEvtHandler = (state) => (event) => {
            if (event.defaultPrevented)
                return;
            switch (event.key) {
                case "ArrowLeft":
                    this.controller.left = state;
                    break;
                case "ArrowRight":
                    this.controller.right = state;
                    break;
                case "ArrowUp":
                    this.controller.up = state;
                    break;
                case "ArrowDown": 
                    this.controller.down = state;
                    break;
            } 
        }

        const mouseEvtHandler = (mouseState) => (event) => {
            if (event.defaultPrevented)
                return; 
            switch (event.button) {
                case 0:
                    this.controller.left_click = mouseState;
                    break;
                case 1: 
                    this.controller.middle_click = mouseState;
                    break;
                case 2: 
                    this.controller.right_click = mouseState;
                    break; 
            }
            if (mouseState === false)
                this.lastCursorPos = undefined;
        }

        // Configuration des events
        window.addEventListener("keyup"    , keyEvtHandler(false));
        window.addEventListener("keydown"  , keyEvtHandler(true));
        window.addEventListener("mousedown", mouseEvtHandler(true));
        window.addEventListener("mouseup"  , mouseEvtHandler(false));
        window.addEventListener("mousemove", (evt) => this.mouseMoveCamera(evt.clientX, evt.clientY));

        window.addEventListener("resize", () => {
            this.canvas.width  = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);

            mat4.perspective(this.projMatrix, this.fovRadian, this.getAspectRatio(), this.nearPlane, this.farPlane);
            gl.uniformMatrix4fv(this.matProjUniformLocation, gl.FALSE, this.projMatrix);
        });
    } 

    getAspectRatio() { 
        return this.canvas.clientWidth / this.canvas.clientHeight; 
    }

    setPosFromPolar(theta, phi) { 
        // Convertion coordonné spherique en cartesien 
        this.position = vec3.fromValues(
            this.distance * Math.sin(phi) * Math.cos(theta),
            this.distance * Math.cos(phi),
            this.distance * Math.sin(phi) * Math.sin(theta)
        );
    }
 
    /**
     * Controle de la camera avec la souris
     * @param {number} clientX 
     * @param {number} clientY 
     */
    mouseMoveCamera(clientX, clientY) {
        if (this.stop || ! this.controller.left_click)
            return;
        
        let cursorPos = vec2.fromValues(clientX, clientY);

        // Définie l'emplacement initial du curseur avant le deplacement
        if (! this.lastCursorPos)
            this.lastCursorPos = cursorPos;
 
        let dPos = vec2.create();
        vec2.subtract(dPos, cursorPos, this.lastCursorPos);

        // Deplacement des coordonnée sphérique selon le déplacement de la souris
        this.theta += dPos[0] * this.sensitivity;
        this.phi   -= dPos[1] * this.sensitivity;  // Axe Y inversé
        // Clamp phi to avoid gimbal lock (prevent looking directly up or down)
        this.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.phi)) ;
        
        this.lastCursorPos = cursorPos;
        this.setPosFromPolar(this.theta, this.phi)

        mat4.lookAt(this.viewMatrix, this.position, this.target, this.upVector);
    }

    /**
     * Effectue les déplacement de la caméra 
     * @param {number} dt Le temps en milliseconde écoulé depuis le dernier appelle à la fonction. 
     */
    updateMove(dt) {
        if (!document.getElementById("toggle_camera_rotation").checked) 
            return;
        // Tourne autour de l'objet
        this.viewAngleHorizontal += this.rotationSpeed * dt ;
        mat4.rotate(this.yRotationMatrix, this.identityMatrix, this.viewAngleHorizontal, [0, 1, 0]);
        mat4.rotate(this.xRotationMatrix, this.identityMatrix, this.viewAngleVertical, [1, 0, 0]);
        mat4.mul(this.worldMatrix, this.yRotationMatrix, this.xRotationMatrix);
    }

    /**
     * Effectue les déplacement de la caméra 
     * @param {number} dt Le temps en milliseconde écoulé depuis le dernier appelle à la fonction. 
     */
    updateMoveArrow(dt) {
        const moveH = (+this.controller.right) + (-this.controller.left); 
        const moveV = (+this.controller.up) + (-this.controller.down); 
        this.viewAngleHorizontal += moveH * 0.004 * dt;
        this.viewAngleVertical += moveV * 0.004 * dt;
    }
    
    /**
     * Configure la caméra pour le rendu
     * @param {number} dt Le temps en milliseconde écoulé depuis le dernier appelle à la fonction. 
     */
    render(dt) { 
        gl.uniformMatrix4fv(this.matWorldUniformLocation, gl.FALSE, this.worldMatrix);
        gl.uniformMatrix4fv(this.matProjUniformLocation, gl.FALSE, this.projMatrix);
        gl.uniformMatrix4fv(this.matViewUniformLocation, gl.FALSE, this.viewMatrix);
    }

    /**
     * Change le focus de la camera 
     * @param {float} focus Le focus en degrés 
     */
    setFocus(focus) {
        this.fov = max(1.0, min(focus, 179.0)) // Restreint la fov
        mat4.perspective(this.projMatrix, glMatrix.toRadian(this.fov), this.getAspectRatio(), this.nearPlane, this.farPlane);
    }
}
