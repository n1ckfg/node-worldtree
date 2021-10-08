"use strict";

import * as THREE from "./libraries/threejs/build/three.module.js";
import { XRControllerModelFactory } from './libraries/threejs/examples/jsm/webxr/XRControllerModelFactory.js';

class ThreeXr {

	constructor(_renderer, _camera, _scene, _useControllerFactory) {
		this.renderer = _renderer;
		this.camera = _camera;
		this.scene = _scene;

		this.useControllerFactory = _useControllerFactory;

		this.raycaster;

		this.controller0;
		this.controller1;
		this.controllerGrip0;
		this.controllerGrip1;
		this.pivot0;
		this.pivot1;
		this.xrReady = false;
	}

	onTriggerStart() {
		this.userData.trigger = true;
	}

	onTriggerEnd() {
		this.userData.trigger = false;
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
			if (controller === this.controller0) {
				userData.target = new THREE.Vector3().setFromMatrixPosition(this.pivot0.matrixWorld);
			} else {
				userData.target = new THREE.Vector3().setFromMatrixPosition(this.pivot1.matrixWorld);
			}
		}

		if (userData.grip) {
			console.log("Grip");
		}
	}

	makeControllerMeshes() {
		const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3));
		pivot.name = 'pivot';
		pivot.position.z = -0.05;

		if (this.useControllerFactory) {
			const controllerModelFactory = new XRControllerModelFactory();
			
			this.controllerGrip0 = this.renderer.xr.getControllerGrip(0);
			this.controllerGrip0.add(controllerModelFactory.createControllerModel(this.controllerGrip0));
			this.scene.add(this.controllerGrip0);

			this.controllerGrip1 = this.renderer.xr.getControllerGrip(1);
			this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1));
			this.scene.add(this.controllerGrip1);

			this.controller0.add(pivot.clone());
			this.controller1.add(pivot.clone());
		} else {
			const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
			geometry.rotateX(-Math.PI / 2);
			const material = new THREE.MeshStandardMaterial({ flatShading: true });
			const mesh = new THREE.Mesh(geometry, material);
			mesh.add(pivot);

			this.controller0.add(mesh.clone());
			this.controller1.add(mesh.clone());
		}

		this.pivot0 = this.controller0.getObjectByName("pivot");
		this.pivot1 = this.controller1.getObjectByName("pivot");

		this.xrReady = true;
	}

	setupRaycaster() {
		const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);

		const line = new THREE.Line(geometry);
		line.name = "line";
		line.scale.z = 5;

		this.controller0.add(line.clone());
		this.controller1.add(line.clone());

		this.raycaster = new THREE.Raycaster();
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
	}

	updateXr() {
		if (this.xrReady) {
			this.handleController(this.controller0);
			this.handleController(this.controller1);
		}
	}

}

export { ThreeXr };