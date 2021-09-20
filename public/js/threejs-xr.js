"use strict";

let controller0, controller1;
let pivot0, pivot1;
let xrReady = false;

function onTriggerStart() {
	this.userData.trigger = true;
	const pivot = this.getObjectByName("pivot");
	const target = new THREE.Vector3().setFromMatrixPosition(pivot.matrixWorld);
	beginStroke(target.x, target.y, target.z);
}

function onTriggerEnd() {
	this.userData.trigger = false;
	endStroke();
}

function onGripStart() {
	this.userData.grip = true;
}

function onGripEnd() {
	this.userData.grip = false;
}

function handleController(controller) {
	const userData = controller.userData;
	const pivot = controller.getObjectByName("pivot");
	const target = new THREE.Vector3().setFromMatrixPosition(pivot.matrixWorld);

	if (userData.trigger) {
		console.log("Trigger");
		updateStroke(target.x, target.y, target.z);
	}

	if (userData.grip) {
		console.log("Grip");
	}
}

function makeControllerMeshes() {
	const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
	geometry.rotateX(-Math.PI / 2);
	const material = new THREE.MeshStandardMaterial({ flatShading: true });
	const mesh = new THREE.Mesh(geometry, material);

	const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3));
	pivot.name = 'pivot';
	pivot.position.z = - 0.05;
	mesh.add(pivot);

	controller0.add(mesh.clone());
	controller1.add(mesh.clone());
}

function setupXr() {
	controller0 = renderer.xr.getController(0);
	controller0.addEventListener("selectstart", onTriggerStart);
	controller0.addEventListener("selectend", onTriggerEnd);
	controller0.addEventListener("squeezestart", onGripStart);
	controller0.addEventListener("squeezeend", onGripEnd);
	scene.add(controller0);

	controller1 = renderer.xr.getController(1);
	controller1.addEventListener("selectstart", onTriggerStart);
	controller1.addEventListener("selectend", onTriggerEnd);
	controller1.addEventListener("squeezestart", onGripStart);
	controller1.addEventListener("squeezeend", onGripEnd);
	scene.add(controller1);

	makeControllerMeshes();

	xrReady = true;
}

function updateXr() {
	if (xrReady) {
		handleController(controller0);
		handleController(controller1);
	}
}