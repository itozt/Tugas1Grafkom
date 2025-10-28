"use strict";

var canvas;
var gl;

var numPositions = 0;

var doorTexture;
var labelTexture;

var positions = [];
var colors = [];
var normalsArray = [];
var texCoordsArray = [];
var partIDs = [];

var texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)];

var vertices = [];

var frameOuterDepan = [
	vec4(-0.5, -1.0, 0.075, 1.0),
	vec4(0.5, -1.0, 0.075, 1.0),
	vec4(0.5, 1.1, 0.075, 1.0),
	vec4(-0.5, 1.1, 0.075, 1.0),
];

var frameInnerDepan = [
	vec4(-0.4, -1.0, 0.075, 1.0),
	vec4(0.4, -1.0, 0.075, 1.0),
	vec4(0.4, 1.0, 0.075, 1.0),
	vec4(-0.4, 1.0, 0.075, 1.0),
];

var frameOuterBelakang = [
	vec4(-0.5, -1.0, -0.075, 1.0),
	vec4(0.5, -1.0, -0.075, 1.0),
	vec4(0.5, 1.1, -0.075, 1.0),
	vec4(-0.5, 1.1, -0.075, 1.0),
];

var frameInnerBelakang = [
	vec4(-0.4, -1.0, -0.075, 1.0),
	vec4(0.4, -1.0, -0.075, 1.0),
	vec4(0.4, 1.0, -0.075, 1.0),
	vec4(-0.4, 1.0, -0.075, 1.0),
];

var doorVertices = [
	vec4(-0.4, -1.0, 0.04, 1.0),
	vec4(0.4, -1.0, 0.04, 1.0),
	vec4(0.4, 1.0, 0.04, 1.0),
	vec4(-0.4, 1.0, 0.04, 1.0),

	vec4(-0.4, -1.0, -0.04, 1.0),
	vec4(0.4, -1.0, -0.04, 1.0),
	vec4(0.4, 1.0, -0.04, 1.0),
	vec4(-0.4, 1.0, -0.04, 1.0),
];

var labelVertices = [
	vec4(-0.1, 0.45, 0.04, 1.0),
	vec4(0.1, 0.45, 0.041, 1.0),
	vec4(0.1, 0.7, 0.041, 1.0),
	vec4(-0.1, 0.7, 0.041, 1.0),
];

var handleBaseVertices = [
	vec4(-0.28, 0.0, 0.045, 1.0),
	vec4(-0.3, 0.035, 0.045, 1.0),
	vec4(-0.34, 0.035, 0.045, 1.0),
	vec4(-0.36, 0.0, 0.045, 1.0),
	vec4(-0.34, -0.035, 0.045, 1.0),
	vec4(-0.3, -0.035, 0.045, 1.0),
];

var handleBar1StartVertices = [
	vec4(-0.305, 0.013, 0.045, 1.0),
	vec4(-0.312, 0.026, 0.045, 1.0),
	vec4(-0.328, 0.026, 0.045, 1.0),
	vec4(-0.335, 0.013, 0.045, 1.0),
	vec4(-0.328, 0.0, 0.045, 1.0),
	vec4(-0.312, 0.0, 0.045, 1.0),
];

var handleBar1EndVertices = [
	vec4(-0.305, 0.013, 0.15, 1.0),
	vec4(-0.312, 0.026, 0.15, 1.0),
	vec4(-0.328, 0.026, 0.15, 1.0),
	vec4(-0.335, 0.013, 0.15, 1.0),
	vec4(-0.328, 0.0, 0.15, 1.0),
	vec4(-0.312, 0.0, 0.15, 1.0),
];

var handleBar2StartVertices = [
	vec4(-0.305, 0.013, 0.15, 1.0),
	vec4(-0.312, 0.026, 0.15, 1.0),
	vec4(-0.328, 0.026, 0.15, 1.0),
	vec4(-0.335, 0.013, 0.15, 1.0),
	vec4(-0.328, 0.0, 0.15, 1.0),
	vec4(-0.312, 0.0, 0.15, 1.0),
];

var handleBar2EndVertices = [
	vec4(-0.185, 0.013, 0.15, 1.0),
	vec4(-0.192, 0.026, 0.15, 1.0),
	vec4(-0.208, 0.026, 0.15, 1.0),
	vec4(-0.215, 0.013, 0.15, 1.0),
	vec4(-0.208, 0.0, 0.15, 1.0),
	vec4(-0.192, 0.0, 0.15, 1.0),
];

vertices = vertices.concat(
	frameOuterDepan,
	frameInnerDepan,
	frameOuterBelakang,
	frameInnerBelakang,
	doorVertices,
	labelVertices,
	handleBaseVertices,
	handleBar1StartVertices,
	handleBar1EndVertices,
	handleBar2StartVertices,
	handleBar2EndVertices
);

var sectionColors = {
	frame: vec4(0.75, 0.75, 0.75, 1.0),
	door: vec4(0.545, 0.271, 0.075, 1.0),
	handle: vec4(0.75, 0.75, 0.75, 1.0),
	label: vec4(1.0, 1.0, 1.0, 1.0),
};

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var theta = [0, 0, 0];
var scale = 0.8;

var doorAngle = 0.0;
var handleAngle = 0.0;

var hierarchyEnabled = true;

var thetaLoc;
var scaleLoc;
var doorAngleLoc;
var handleAngleLoc;

var near = 0.3;
var far = 5.0;
var radius = 3.5;
var cameraTheta = 0.0;
var cameraPhi = Math.PI / 2.0;

var fovy = 45.0;
var aspect;

var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;

var nMatrix, nMatrixLoc;

var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var lightPositionLoc, shininessLoc;

function configureTexture(image, textureUnit) {
	var texture = gl.createTexture();
	gl.activeTexture(textureUnit);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(
		gl.TEXTURE_2D,
		gl.TEXTURE_MIN_FILTER,
		gl.NEAREST_MIPMAP_LINEAR
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	return texture;
}

var doorImage = new Image();
doorImage.src = "texture_pintu.jpg";
doorImage.onload = function () {
	doorTexture = configureTexture(doorImage, gl.TEXTURE0);
};

var labelImage = new Image();
labelImage.src = "texture_label.jpg";
labelImage.onload = function () {
	labelTexture = configureTexture(labelImage, gl.TEXTURE1);
};

init();

function init() {
	canvas = document.getElementById("gl-canvas");

	gl = canvas.getContext("webgl2");
	if (!gl) alert("WebGL 2.0 isn't available");

	createDoorModel();

	gl.viewport(0, 0, canvas.width, canvas.height);

	aspect = canvas.width / canvas.height;

	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	gl.enable(gl.DEPTH_TEST);

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	var ambientProduct = mult(lightAmbient, materialAmbient);
	var diffuseProduct = mult(lightDiffuse, materialDiffuse);
	var specularProduct = mult(lightSpecular, materialSpecular);

	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

	var normalLoc = gl.getAttribLocation(program, "aNormal");
	gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(normalLoc);

	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

	var colorLoc = gl.getAttribLocation(program, "aColor");
	gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(colorLoc);

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

	var positionLoc = gl.getAttribLocation(program, "aPosition");
	gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(positionLoc);

	var tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
	gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(texCoordLoc);

	var partIDBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, partIDBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(partIDs), gl.STATIC_DRAW);
	var partIDLoc = gl.getAttribLocation(program, "aPartID");
	gl.vertexAttribPointer(partIDLoc, 1, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(partIDLoc);

	gl.uniform1i(gl.getUniformLocation(program, "uDoorTexture"), 0);
	gl.uniform1i(gl.getUniformLocation(program, "uLabelTexture"), 1);

	thetaLoc = gl.getUniformLocation(program, "uTheta");
	scaleLoc = gl.getUniformLocation(program, "uScale");
	doorAngleLoc = gl.getUniformLocation(program, "uDoorAngle");
	handleAngleLoc = gl.getUniformLocation(program, "uHandleAngle");

	gl.uniform1f(doorAngleLoc, doorAngle);
	gl.uniform1f(handleAngleLoc, handleAngle);

	modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
	nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

	ambientProductLoc = gl.getUniformLocation(program, "uAmbientProduct");
	diffuseProductLoc = gl.getUniformLocation(program, "uDiffuseProduct");
	specularProductLoc = gl.getUniformLocation(program, "uSpecularProduct");
	lightPositionLoc = gl.getUniformLocation(program, "uLightPosition");
	shininessLoc = gl.getUniformLocation(program, "uShininess");

	gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
	gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
	gl.uniform4fv(specularProductLoc, flatten(specularProduct));
	gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
	gl.uniform1f(shininessLoc, materialShininess);

	initSliders();
	initLightControls();

	render();
}

function createDoorModel() {
	positions = [];
	colors = [];
	normalsArray = [];
	texCoordsArray = [];
	partIDs = [];

	generateDoorframe();
	generateDoor();
	generateDoorLabel();
	generateDoorHandle();

	numPositions = positions.length;
}

function generateDoorframe() {
	addQuad(7, 6, 2, 3, sectionColors.frame, "solid", 0.0);
	addQuad(6, 14, 10, 2, sectionColors.frame, "solid", 0.0);
	addQuad(14, 15, 11, 10, sectionColors.frame, "solid", 0.0);
	addQuad(15, 7, 3, 11, sectionColors.frame, "solid", 0.0);
	addQuad(7, 15, 14, 6, sectionColors.frame, "solid", 0.0);
	addQuad(3, 2, 10, 11, sectionColors.frame, "solid", 0.0);

	addQuad(4, 7, 3, 0, sectionColors.frame, "solid", 0.0);
	addQuad(0, 8, 11, 3, sectionColors.frame, "solid", 0.0);
	addQuad(8, 12, 15, 11, sectionColors.frame, "solid", 0.0);
	addQuad(12, 4, 7, 15, sectionColors.frame, "solid", 0.0);

	addQuad(1, 2, 6, 5, sectionColors.frame, "solid", 0.0);
	addQuad(5, 6, 14, 13, sectionColors.frame, "solid", 0.0);
	addQuad(13, 14, 10, 9, sectionColors.frame, "solid", 0.0);
	addQuad(9, 10, 2, 1, sectionColors.frame, "solid", 0.0);

	addQuad(0, 1, 9, 8, sectionColors.frame, "solid", 0.0);
	addQuad(4, 5, 13, 12, sectionColors.frame, "solid", 0.0);
}

function generateDoor() {
	addQuad(16, 17, 18, 19, sectionColors.door, "door", 1.0);

	addQuad(21, 20, 23, 22, sectionColors.door, "door", 1.0);

	addQuad(16, 20, 21, 17, sectionColors.door, "solid", 1.0);
	addQuad(17, 21, 22, 18, sectionColors.door, "solid", 1.0);
	addQuad(18, 22, 23, 19, sectionColors.door, "solid", 1.0);
	addQuad(19, 23, 20, 16, sectionColors.door, "solid", 1.0);
}

function generateDoorLabel() {
	addQuad(24, 25, 26, 27, sectionColors.label, "label", 1.0);
}

function generateDoorHandle() {
	// PartID 1
	for (var i = 0; i < 6; i++) {
		var next = (i + 1) % 6;
		addTriangle(28 + i, 28 + next, 28, sectionColors.handle, "solid", 1.0);
	}

	// Partid 2
	for (var i = 0; i < 6; i++) {
		var next = (i + 1) % 6;
		addQuad(
			34 + i,
			40 + i,
			40 + next,
			34 + next,
			sectionColors.handle,
			"solid",
			2.0
		);
		addQuad(
			39 - i,
			45 - i,
			45 - next,
			39 - next,
			sectionColors.handle,
			"solid",
			2.0
		);
	}

	for (var i = 0; i < 6; i++) {
		var next = (i + 1) % 6;
		addTriangle(34 + i, 34 + next, 34, sectionColors.handle, "solid", 2.0);
	}

	for (var i = 0; i < 6; i++) {
		var next = (i + 1) % 6;
		addTriangle(40 + i, 40 + next, 40, sectionColors.handle, "solid", 2.0);
	}

	for (var i = 0; i < 6; i++) {
		var next = (i + 1) % 6;
		addQuad(
			46 + i,
			52 + i,
			52 + next,
			46 + next,
			sectionColors.handle,
			"solid",
			2.0
		);
		addQuad(
			51 - i,
			57 - i,
			57 - next,
			51 - next,
			sectionColors.handle,
			"solid",
			2.0
		);
	}

	for (var i = 0; i < 6; i++) {
		var next = (i + 1) % 6;
		addTriangle(46 + i, 46 + next, 46, sectionColors.handle, "solid", 2.0);
	}

	for (var i = 0; i < 6; i++) {
		var next = (i + 1) % 6;
		addTriangle(52 + i, 52 + next, 52, sectionColors.handle, "solid", 2.0);
	}
}

function addTriangle(v1, v2, v3, color, textureType, partID) {
	var t1 = subtract(vertices[v2], vertices[v1]);
	var t2 = subtract(vertices[v3], vertices[v1]);
	var normal = normalize(cross(t1, t2));
	normal = vec4(normal[0], normal[1], normal[2], 0.0);

	positions.push(vertices[v1]);
	positions.push(vertices[v2]);
	positions.push(vertices[v3]);

	normalsArray.push(normal);
	normalsArray.push(normal);
	normalsArray.push(normal);

	colors.push(color);
	colors.push(color);
	colors.push(color);

	partIDs.push(partID);
	partIDs.push(partID);
	partIDs.push(partID);

	if (textureType === "door") {
		texCoordsArray.push(texCoord[0]);
		texCoordsArray.push(texCoord[1]);
		texCoordsArray.push(texCoord[2]);
	} else if (textureType === "label") {
		texCoordsArray.push(vec2(1.0, 0.0));
		texCoordsArray.push(vec2(1.0, 1.0));
		texCoordsArray.push(vec2(2.0, 1.0));
	} else {
		texCoordsArray.push(vec2(-1, -1));
		texCoordsArray.push(vec2(-1, -1));
		texCoordsArray.push(vec2(-1, -1));
	}
}

function addQuad(v1, v2, v3, v4, color, textureType, partID) {
	var t1 = subtract(vertices[v2], vertices[v1]);
	var t2 = subtract(vertices[v3], vertices[v1]);
	var normal = normalize(cross(t1, t2));
	normal = vec4(normal[0], normal[1], normal[2], 0.0);

	positions.push(vertices[v1]);
	positions.push(vertices[v2]);
	positions.push(vertices[v3]);

	normalsArray.push(normal);
	normalsArray.push(normal);
	normalsArray.push(normal);

	colors.push(color);
	colors.push(color);
	colors.push(color);

	partIDs.push(partID);
	partIDs.push(partID);
	partIDs.push(partID);

	if (textureType === "door") {
		texCoordsArray.push(texCoord[0]);
		texCoordsArray.push(texCoord[1]);
		texCoordsArray.push(texCoord[2]);
	} else if (textureType === "label") {
		texCoordsArray.push(vec2(1.0, 0.0));
		texCoordsArray.push(vec2(1.0, 1.0));
		texCoordsArray.push(vec2(2.0, 1.0));
	} else {
		texCoordsArray.push(vec2(-1, -1));
		texCoordsArray.push(vec2(-1, -1));
		texCoordsArray.push(vec2(-1, -1));
	}

	positions.push(vertices[v1]);
	positions.push(vertices[v3]);
	positions.push(vertices[v4]);

	normalsArray.push(normal);
	normalsArray.push(normal);
	normalsArray.push(normal);

	colors.push(color);
	colors.push(color);
	colors.push(color);

	partIDs.push(partID);
	partIDs.push(partID);
	partIDs.push(partID);

	if (textureType === "door") {
		texCoordsArray.push(texCoord[0]);
		texCoordsArray.push(texCoord[2]);
		texCoordsArray.push(texCoord[3]);
	} else if (textureType === "label") {
		texCoordsArray.push(vec2(1.0, 0.0));
		texCoordsArray.push(vec2(2.0, 1.0));
		texCoordsArray.push(vec2(2.0, 0.0));
	} else {
		texCoordsArray.push(vec2(-1, -1));
		texCoordsArray.push(vec2(-1, -1));
		texCoordsArray.push(vec2(-1, -1));
	}
}

function initSliders() {
	var resetButton = document.getElementById("resetButton");
	var hierarchyToggle = document.getElementById("hierarchyToggle");
	var doorAngleSlider = document.getElementById("doorAngle");
	var handleAngleSlider = document.getElementById("handleAngle");
	var doorAngleValue = document.getElementById("doorAngleValue");
	var handleAngleValue = document.getElementById("handleAngleValue");

	hierarchyToggle.onclick = function () {
		hierarchyEnabled = !hierarchyEnabled;
		if (hierarchyEnabled) {
			this.textContent = "Hirarki: ON";
			this.classList.remove("bg-red-500");
			this.classList.add("bg-green-500");
		} else {
			this.textContent = "Hirarki: OFF";
			this.classList.remove("bg-green-500");
			this.classList.add("bg-red-500");
		}
	};

	doorAngleSlider.oninput = function () {
		doorAngle = parseFloat(this.value);
		doorAngleValue.textContent = doorAngle.toFixed(0) + "°";
		gl.uniform1f(doorAngleLoc, doorAngle);
		
		if (hierarchyEnabled) {
			// Ketika pintu dibuka, handle ikut turun proporsional
			var proportionalHandleAngle = (doorAngle / 90.0) * 70.0;
			handleAngle = proportionalHandleAngle;
			handleAngleSlider.value = handleAngle;
			handleAngleValue.textContent = handleAngle.toFixed(0) + "°";
			gl.uniform1f(handleAngleLoc, handleAngle);
		}
	};

	handleAngleSlider.oninput = function () {
		handleAngle = parseFloat(this.value);
		handleAngleValue.textContent = handleAngle.toFixed(0) + "°";
		gl.uniform1f(handleAngleLoc, handleAngle);
		
		if (hierarchyEnabled) {
			// Ketika handle diturunkan, pintu ikut terbuka proporsional
			var proportionalDoorAngle = (handleAngle / 70.0) * 90.0;
			doorAngle = proportionalDoorAngle;
			doorAngleSlider.value = doorAngle;
			doorAngleValue.textContent = doorAngle.toFixed(0) + "°";
			gl.uniform1f(doorAngleLoc, doorAngle);
		}
	};

	resetButton.onclick = function () {
		doorAngle = 0.0;
		handleAngle = 0.0;
		document.getElementById("doorAngle").value = 0;
		document.getElementById("handleAngle").value = 0;
		doorAngleValue.textContent = "0°";
		handleAngleValue.textContent = "0°";
		gl.uniform1f(doorAngleLoc, doorAngle);
		gl.uniform1f(handleAngleLoc, handleAngle);

		// Reset hirarki ke ON
		hierarchyEnabled = true;
		hierarchyToggle.textContent = "Hirarki: ON";
		hierarchyToggle.classList.remove("bg-red-500");
		hierarchyToggle.classList.add("bg-green-500");

		lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
		lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
		lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
		lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
		materialShininess = 20.0;

		document.getElementById("lightPosX").value = 1.0;
		document.getElementById("lightPosY").value = 1.0;
		document.getElementById("lightPosZ").value = 1.0;

		document.getElementById("ambientR").value = 0.2;
		document.getElementById("ambientG").value = 0.2;
		document.getElementById("ambientB").value = 0.2;

		document.getElementById("diffuseR").value = 1.0;
		document.getElementById("diffuseG").value = 1.0;
		document.getElementById("diffuseB").value = 1.0;

		document.getElementById("specularR").value = 1.0;
		document.getElementById("specularG").value = 1.0;
		document.getElementById("specularB").value = 1.0;

		document.getElementById("shininess").value = 20.0;

		updateLightProducts();
		gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
		gl.uniform1f(shininessLoc, materialShininess);

		recreateGeometry();
	};

	updateUniforms();
}

function initLightControls() {
	var lightPosXSlider = document.getElementById("lightPosX");
	var lightPosYSlider = document.getElementById("lightPosY");
	var lightPosZSlider = document.getElementById("lightPosZ");

	var ambientColorR = document.getElementById("ambientR");
	var ambientColorG = document.getElementById("ambientG");
	var ambientColorB = document.getElementById("ambientB");

	var diffuseColorR = document.getElementById("diffuseR");
	var diffuseColorG = document.getElementById("diffuseG");
	var diffuseColorB = document.getElementById("diffuseB");

	var specularColorR = document.getElementById("specularR");
	var specularColorG = document.getElementById("specularG");
	var specularColorB = document.getElementById("specularB");

	var shininessSlider = document.getElementById("shininess");

	lightPosXSlider.oninput = function () {
		lightPosition[0] = parseFloat(this.value);
		gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
	};

	lightPosYSlider.oninput = function () {
		lightPosition[1] = parseFloat(this.value);
		gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
	};

	lightPosZSlider.oninput = function () {
		lightPosition[2] = parseFloat(this.value);
		gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
	};

	ambientColorR.oninput = function () {
		lightAmbient[0] = parseFloat(this.value);
		updateLightProducts();
	};
	ambientColorG.oninput = function () {
		lightAmbient[1] = parseFloat(this.value);
		updateLightProducts();
	};
	ambientColorB.oninput = function () {
		lightAmbient[2] = parseFloat(this.value);
		updateLightProducts();
	};

	diffuseColorR.oninput = function () {
		lightDiffuse[0] = parseFloat(this.value);
		updateLightProducts();
	};
	diffuseColorG.oninput = function () {
		lightDiffuse[1] = parseFloat(this.value);
		updateLightProducts();
	};
	diffuseColorB.oninput = function () {
		lightDiffuse[2] = parseFloat(this.value);
		updateLightProducts();
	};

	specularColorR.oninput = function () {
		lightSpecular[0] = parseFloat(this.value);
		updateLightProducts();
	};
	specularColorG.oninput = function () {
		lightSpecular[1] = parseFloat(this.value);
		updateLightProducts();
	};
	specularColorB.oninput = function () {
		lightSpecular[2] = parseFloat(this.value);
		updateLightProducts();
	};

	shininessSlider.oninput = function () {
		materialShininess = parseFloat(this.value);
		gl.uniform1f(shininessLoc, materialShininess);
	};
}

function updateLightProducts() {
	var ambientProduct = mult(lightAmbient, materialAmbient);
	var diffuseProduct = mult(lightDiffuse, materialDiffuse);
	var specularProduct = mult(lightSpecular, materialSpecular);

	gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
	gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
	gl.uniform4fv(specularProductLoc, flatten(specularProduct));
}

function recreateGeometry() {
	createDoorModel();

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	var normalLoc = gl.getAttribLocation(
		gl.getParameter(gl.CURRENT_PROGRAM),
		"aNormal"
	);
	gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(normalLoc);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	var colorLoc = gl.getAttribLocation(
		gl.getParameter(gl.CURRENT_PROGRAM),
		"aColor"
	);
	gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(colorLoc);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);
	var positionLoc = gl.getAttribLocation(
		gl.getParameter(gl.CURRENT_PROGRAM),
		"aPosition"
	);
	gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(positionLoc);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	var texCoordLoc = gl.getAttribLocation(
		gl.getParameter(gl.CURRENT_PROGRAM),
		"aTexCoord"
	);
	gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(texCoordLoc);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(partIDs), gl.STATIC_DRAW);
	var partIDLoc = gl.getAttribLocation(
		gl.getParameter(gl.CURRENT_PROGRAM),
		"aPartID"
	);
	gl.vertexAttribPointer(partIDLoc, 1, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(partIDLoc);
}

function updateUniforms() {
	gl.uniform3fv(thetaLoc, theta);
	gl.uniform1f(scaleLoc, scale);
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if (doorTexture) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, doorTexture);
	}
	if (labelTexture) {
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, labelTexture);
	}

	eye = vec3(
		radius * Math.sin(cameraTheta) * Math.cos(cameraPhi),
		radius * Math.sin(cameraTheta) * Math.sin(cameraPhi),
		radius * Math.cos(cameraTheta)
	);

	modelViewMatrix = lookAt(eye, at, up);
	projectionMatrix = perspective(fovy, aspect, near, far);

	nMatrix = normalMatrix(modelViewMatrix, true);

	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));

	gl.drawArrays(gl.TRIANGLES, 0, numPositions);

	requestAnimationFrame(render);
}
