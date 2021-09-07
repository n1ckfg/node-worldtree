"use strict";

let controller1, controller2;

function onSelectStart() {
	this.userData.isSelecting = true;
}

function onSelectEnd() {
	this.userData.isSelecting = false;
}

function onSqueezeStart() {
	this.userData.isSqueezing = true;
	this.userData.positionAtSqueezeStart = this.position.y;
	this.userData.scaleAtSqueezeStart = this.scale.x;
}

function onSqueezeEnd() {
	this.userData.isSqueezing = false;
}

function handleController(controller) {
	const userData = controller.userData;
	const painter = userData.painter;

	const pivot = controller.getObjectByName( 'pivot' );

	if (userData.isSqueezing === true) {
		const delta = (controller.position.y - userData.positionAtSqueezeStart) * 5;
		const scale = Math.max(0.1, userData.scaleAtSqueezeStart + delta);

		pivot.scale.setScalar(scale);
		painter.setSize(scale);
	}

	cursor.setFromMatrixPosition(pivot.matrixWorld);

	if (userData.isSelecting === true) {
		painter.lineTo(cursor);
		painter.update();
	} else {
		painter.moveTo(cursor);
	}
}

function setupXr() {
	controller1 = renderer.xr.getController(0);
	controller1.addEventListener("selectstart", onSelectStart);
	controller1.addEventListener("selectend", onSelectEnd);
	controller1.addEventListener("squeezestart", onSqueezeStart);
	controller1.addEventListener("squeezeend", onSqueezeEnd);
	//controller1.userData.painter = painter1;
	scene.add(controller1);

	controller2 = renderer.xr.getController(1);
	controller2.addEventListener("selectstart", onSelectStart);
	controller2.addEventListener("selectend", onSelectEnd);
	controller2.addEventListener("squeezestart", onSqueezeStart);
	controller2.addEventListener("squeezeend", onSqueezeEnd);
	//controller2.userData.painter = painter2;
	scene.add(controller2);
}

function updateXr() {
	handleController(controller1);
	handleController(controller2);
}