"use strict";

let controller0, controller1;
let xrReady = false;

function onTriggerStart() {
	this.userData.trigger = true;
	beginStroke(this.position.x, this.position.y, this.position.z);
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

	if (userData.trigger) {
		console.log("Trigger");
		updateStroke(controller.position.x, controller.position.y, controller.position.z);
	}

	if (userData.grip) {
		console.log("Grip");
	}
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

	xrReady = true;
}

function updateXr() {
	if (xrReady) {
		handleController(controller0);
		handleController(controller1);
	}
}