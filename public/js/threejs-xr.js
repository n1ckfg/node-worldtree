"use strict";

import * as THREE from "./libraries/threejs/build/three.module.js";

class ThreeXr {

	constructor(_renderer, _camera, _scene) {
		this.renderer = _renderer;
		this.camera = _camera;
		this.scene = _scene;

		this.controller0;
		this.controller1;
		this.pivot0;
		this.pivot1;
		this.xrReady = false;
	}

	onTriggerStart() {
		this.userData.trigger = true;
		let target;
		if (this === this.controller0) {
			target = new THREE.Vector3().setFromMatrixPosition(this.pivot0.matrixWorld);
		} else {
			target = new THREE.Vector3().setFromMatrixPosition(this.pivot1.matrixWorld);
		}
		//beginStroke(target.x, target.y, target.z);
	}

	onTriggerEnd() {
		this.userData.trigger = false;
		//endStroke();
	}

	onGripStart() {
		this.userData.grip = true;
	}

	onGripEnd() {
		this.userData.grip = false;
	}

	handleController(controller) {
		const userData = controller.userData;

		if (userData.trigger) {
			console.log("Trigger");
			let target;
			if (controller === this.controller0) {
				target = new THREE.Vector3().setFromMatrixPosition(this.pivot0.matrixWorld);
			} else {
				target = new THREE.Vector3().setFromMatrixPosition(this.pivot1.matrixWorld);
			}

			//updateStroke(target.x, target.y, target.z);
		}

		if (userData.grip) {
			console.log("Grip");
		}
	}

	makeControllerMeshes() {
		const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
		geometry.rotateX(-Math.PI / 2);
		const material = new THREE.MeshStandardMaterial({ flatShading: true });
		const mesh = new THREE.Mesh(geometry, material);

		const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3));
		pivot.name = 'pivot';
		pivot.position.z = - 0.05;
		mesh.add(pivot);

		this.controller0.add(mesh.clone());
		this.pivot0 = this.controller0.getObjectByName("pivot");
		this.controller1.add(mesh.clone());
		this.pivot1 = this.controller1.getObjectByName("pivot");
	}

	setupXr() {
		this.controller0 = this.renderer.xr.getController(0);
		this.controller0.addEventListener("selectstart", this.onTriggerStart);
		this.controller0.addEventListener("selectend", this.onTriggerEnd);
		this.controller0.addEventListener("squeezestart", this.onGripStart);
		this.controller0.addEventListener("squeezeend", this.onGripEnd);
		this.scene.add(this.controller0);

		this.controller1 = this.renderer.xr.getController(1);
		this.controller1.addEventListener("selectstart", this.onTriggerStart);
		this.controller1.addEventListener("selectend", this.onTriggerEnd);
		this.controller1.addEventListener("squeezestart", this.onGripStart);
		this.controller1.addEventListener("squeezeend", this.onGripEnd);
		this.scene.add(this.controller1);

		this.makeControllerMeshes();

		this.xrReady = true;
	}

	updateXr() {
		if (this.xrReady) {
			this.handleController(this.controller0);
			this.handleController(this.controller1);
		}
	}

}

export { ThreeXr };