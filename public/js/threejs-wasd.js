"use strict";

import * as THREE from "./libraries/threejs/build/three.module.js";
import { Util } from "./general-util.js";

class ThreeWasd extends THREE.EventDispatcher {

    constructor(_domElement, _renderer, _camera, _scene) {
        super();

        this.domElement = _domElement;
        this.renderer = _renderer;
        this.camera = _camera;
        this.scene = _scene;

        this.rotateStart = new THREE.Vector2(this.domElement.innerWidth/2, this.domElement.innerHeight/2);
        this.rotateEnd = new THREE.Vector2(0,0);
        this.rotateDelta = new THREE.Vector2(0,0);
        this.dragged = false;

        this.MOUSE_SPEED_X = 0.5;
        this.MOUSE_SPEED_Y = 0.3;
        this.phi = 0;
        this.theta = 0;

        this.isWalkingForward = false;
        this.isWalkingBackward = false;
        this.isWalkingLeft = false;
        this.isWalkingRight = false;
        this.isFlyingUp = false;
        this.isFlyingDown = false;

        this.armFrameBack = false;
        this.armFrameForward = false;
        this.armTogglePause = false;

        this.movingSpeed = 0;
        this.movingSpeedMax = 0.04;
        this.movingDelta = 0.002;

        this.clicked = false; 
        this.altKeyBlock = false;
        this.mouse3D = new THREE.Vector3();
    }

    setupMouse() {
        const _onMouseMove = this.onMouseMove.bind(this);
        const _onMouseDown = this.onMouseDown.bind(this);
        const _onMouseUp = this.onMouseUp.bind(this);

        this.domElement.addEventListener("mousemove", _onMouseMove);
        this.domElement.addEventListener("mousedown", _onMouseDown);
        this.domElement.addEventListener("mouseup", _onMouseUp);
    }

    setupWasd() {
        const _onKeyDown = this.onKeyDown.bind(this);
        const _onKeyUp = this.onKeyUp.bind(this);

        this.domElement.addEventListener("keydown", _onKeyDown);
        this.domElement.addEventListener("keyup", _onKeyUp);
    }

    setupResize() {
        const _onResize = this.onResize.bind(this);

        this.domElement.addEventListener("resize", _onResize);
    }

    onMouseDown(event) {
        this.rotateStart.set(event.clientX, event.clientY);
        this.clicked = true; 
        this.updateMousePos(event);
    }

        // Very similar to https://gist.github.com/mrflix/8351020
    onMouseMove(event) {
        this.updateMousePos(event);

        if (this.altKeyBlock) {
            if (!this.dragged && !this.isPointerLocked()) {
                return;
            }

            // Support pointer lock API.
            if (this.isPointerLocked()) {
                let movementX = event.movementX || event.mozMovementX || 0;
                let movementY = event.movementY || event.mozMovementY || 0;
                this.rotateEnd.set(this.rotateStart.x - movementX, this.rotateStart.y - movementY);
            } else {
                this.rotateEnd.set(event.clientX, event.clientY);
            }

            // Calculate how much we moved in mouse space.
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
            this.rotateStart.copy(this.rotateEnd);

            // Keep track of the cumulative euler angles.
            let element = document.body;
            this.phi += 2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.MOUSE_SPEED_Y;
            this.theta += 2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.MOUSE_SPEED_X;

            // Prevent looking too far up or down.
            this.phi = Util.clamp(this.phi, -Math.PI/2, Math.PI/2);

            //let euler = new THREE.Euler(-this.phi, -this.theta, 0, 'YXZ');
            let euler = new THREE.Euler(this.phi, this.theta, 0, 'YXZ');
            this.camera.quaternion.setFromEuler(euler);
        }
    }

    onMouseUp(event) {
        this.clicked = false;
    }

    onTouchStart(event) {
        this.clicked = true; 
        this.updateTouchPos(event);
    }

    onTouchMove(event) {
        this.updateTouchPos(event);
    }

    onTouchEnd(event) {
        this.clicked = false;
    }     

    updateMousePos(event) {
        this.mouse3D = new THREE.Vector3((event.clientX / this.domElement.innerWidth) * 2 - 1, -(event.clientY / this.domElement.innerHeight) * 2 + 1, 0.5);
        this.mouse3D.unproject(this.camera);   
    }

    updateTouchPos(event) {
        if (event.targetTouches.length > 0) {
            let touch = event.targetTouches[0];
            this.mouse3D = new THREE.Vector3((touch.pageX / this.domElement.innerWidth) * 2 - 1, -(touch.pageY / this.domElement.innerHeight) * 2 + 1, 0.5);
            this.mouse3D.unproject(this.camera);   
        }
    }

    onKeyDown(event) {
        if (Util.getKeyCode(event) === 'w') this.isWalkingForward = true;
        if (Util.getKeyCode(event) === 'a') this.isWalkingLeft = true;
        if (Util.getKeyCode(event) === 's') this.isWalkingBackward = true;
        if (Util.getKeyCode(event) === 'd') this.isWalkingRight = true;
        if (Util.getKeyCode(event) === 'q') this.isFlyingDown = true;
        if (Util.getKeyCode(event) === 'e') this.isFlyingUp = true;

        if (Util.getKeyCode(event) === 'j') this.armFrameBack = true;
        if (Util.getKeyCode(event) === 'k' || Util.getKeyCode(event) === ' ') this.armTogglePause = true;
        if (Util.getKeyCode(event) === 'l') this.armFrameForward = true;

        if (event.altKey && !this.altKeyBlock) {
            this.altKeyBlock = true;
            console.log(this.altKeyBlock);
        }
    }

    onKeyUp(event) {
        if (Util.getKeyCode(event) === 'w') this.isWalkingForward = false;
        if (Util.getKeyCode(event) === 'a') this.isWalkingLeft = false;
        if (Util.getKeyCode(event) === 's') this.isWalkingBackward = false;
        if (Util.getKeyCode(event) === 'd') this.isWalkingRight = false;
        if (Util.getKeyCode(event) === 'q') this.isFlyingDown = false;
        if (Util.getKeyCode(event) === 'e') this.isFlyingUp = false;

        if (Util.getKeyCode(event) === 'j') this.armFrameBack = false;
        if (Util.getKeyCode(event) === 'k' || Util.getKeyCode(event) === ' ') this.armTogglePause = false;
        if (Util.getKeyCode(event) === 'l') this.armFrameForward = false;

        if (this.altKeyBlock) {
            this.altKeyBlock = false;
            console.log(this.altKeyBlock);
        }
    }

    updateWasd() {
        if ((this.isWalkingForward || this.isWalkingBackward || this.isWalkingLeft || this.isWalkingRight || this.isFlyingUp || this.isFlyingDown) && this.movingSpeed < this.movingSpeedMax) {
            if (this.movingSpeed < this.movingSpeedMax) {
                this.movingSpeed += this.movingDelta;
            } else if (this.movingSpeed > this.movingSpeedMax) {
                this.movingSpeed = this.movingSpeedMax;
            }
        } else {
            if (this.movingSpeed > 0) {
                this.movingSpeed -= this.movingDelta;
            } else if (this.movingSpeed < 0) {
                this.movingSpeed = 0;
            }
        }

        if (this.movingSpeed > 0) {
            if (this.isWalkingForward) {
                this.camera.translateZ(-this.movingSpeed);
            }

            if (this.isWalkingBackward) {
                this.camera.translateZ(this.movingSpeed);     
            } 

            if (this.isWalkingLeft) {
                this.camera.translateX(-this.movingSpeed);
            }

            if (this.isWalkingRight) {
                this.camera.translateX(this.movingSpeed);
            }

            if (this.isFlyingUp) {
                this.camera.translateY(this.movingSpeed);
            }

            if (this.isFlyingDown) {
                this.camera.translateY(-this.movingSpeed);
            }
        }
    }

    onResize(event) {
        const width = this.domElement.innerWidth;
        const height = this.domElement.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    clearScene(preserveList) {
        for (let i=this.scene.children.length-1; i>=0; i--) {
            let doRemove = true;
            if (preserveList !== undefined) {
                for (let preserveObj of preserveList) {
                    if (this.scene.children[i] === preserveObj) {
                        doRemove = false;
                        break;
                    }
                }
            }
            if (doRemove) {
                this.clearObj(this.scene.children[i]);
                this.scene.children.splice(i, 1);
            }
        }
    }

    clearObj(obj) {
        while (obj.children.length > 0) { 
            this.clearObj(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) { 
            // in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop]) {
                    return;         
                }
                if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function') {
                    obj.material[prop].dispose();
                }                                                  
            });
            obj.material.dispose();
        }
    } 

    isPointerLocked() {
        let el = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
        return el !== undefined;
    }

    resetCameraPosition() {
        this.camera.position.set(0, 0, 0);
        this.camera.lookAt(0, 0, 0);
        this.phi = 0;
        this.theta = 0;
    }

}

export { ThreeWasd };