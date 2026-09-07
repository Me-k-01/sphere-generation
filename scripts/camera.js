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

        this.position = vec3.fromValues(0, 0, -8)
        this.target   = vec3.fromValues(0, 0, 0)
        this.upVector = vec3.fromValues(0, 1, 0)

        this.worldMatrix = new Float32Array(16);
        this.viewMatrix  = new Float32Array(16);
        this.projMatrix  = new Float32Array(16);

        this.do_move_camera = true // Should we prevent control callback from acting (in case the user is hovering the gui for exemple)


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

        this.lastUpdate = 0;
        
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
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
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

        const mouseEvtHandler = (state) => (button) => {
            switch (button) {
                case 0:
                    this.controller.left_click = state;
                    break;
                case 1: 
                    this.controller.middle_click = state;
                    break;
                case 2: 
                    this.controller.right_click = state;
                    break;
            }
        }

        // Configuration des events
        window.addEventListener("keyup", keyEvtHandler(false));
        window.addEventListener("keydown", keyEvtHandler(true));
        window.addEventListener("mousedown", mouseEvtHandler(true));
        window.addEventListener("mouseup", mouseEvtHandler(false));

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

    // Translates the camera to a new position, and update the view matrix for OpenGL
    setPosition(position) { 
        this.position = position;
        this.view_matrix = mat4.lookAt(this.viewMatrix, this.position, this.target, this.up_vector);
    }


    // Call back for mouse control : used to orient the camera
    updateCameraRotation(window, xpos, ypos) {
        if (! this.do_move_camera || ! this.controller.left_click) {
            return
        }
        // Prevent jolting by setting the first mouse position
        if (this.first_mouse) {
            this.last_mouse_x = xpos
            this.last_mouse_y = ypos
            this.first_mouse = false
        }

        dx = xpos - this.last_mouse_x
        dy = ypos - this.last_mouse_y

        // Update angles based on mouse movement
        this.theta += dx * this.sensitivity
        this.phi   -= dy * this.sensitivity  // Inverted Y-axis

        // Clamp phi to avoid gimbal lock (prevent looking directly up or down)
        this.phi = max(0.01, min(np.pi - 0.01, this.phi))

        // Update last known position
        this.last_mouse_x = xpos
        this.last_mouse_y = ypos

        // Convert spherical coordinate to cartesian
        this.position.x = this.distance * np.sin(this.phi) * np.cos(this.theta)
        this.position.y = this.distance * np.cos(this.phi)
        this.position.z = this.distance * np.sin(this.phi) * np.sin(this.theta)

        this.view_matrix = glm.lookAt(this.position, this.target, this.up_vector)

        if (this.on_position_change) {
            this.view_matrix = mat4.lookAt(this.viewMatrix, this.position, this.target, this.up_vector);
        }
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
        gl.uniformMatrix4fv(this.matProjUniformLocation, gl.FALSE, this.projMatrix);
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
