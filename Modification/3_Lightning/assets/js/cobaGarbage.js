'use strict'

var canvas
var gl

var numPositions = 36

var positions = []
var colors = []
var normals = []
var indices = [] // Untuk IBO

var thetaLoc, translationLoc

// Transform controls
var rotationTheta = [30, 30, 0]
var translation = [0, 0, 0]

// Lighting parameters
var lightPosition = [1.0, 1.0, 1.0, 1.0]
var ambientLight = [0.2, 0.2, 0.2]
var diffuseLight = [1.0, 1.0, 1.0]
var specularLight = [1.0, 1.0, 1.0]
var shininess = 10.0 // Static value for moderate shininess

// Warna untuk bagian-bagian berbeda
var blueColor = vec4(0.2, 0.4, 0.8, 1.0)
var darkBlueColor = vec4(0.15, 0.3, 0.7, 1.0)
var blackColor = vec4(0.1, 0.1, 0.1, 1.0)
var whiteColor = vec4(0.95, 0.95, 0.95, 1.0)
var iconColor = vec4(0.1, 0.8, 0.1, 1.0)

// Camera parameters
var near = 0.3
var far = 10.0
var radius = 4.0
var cameraTheta = 0.0
var cameraPhi = 0.0
var dr = (5.0 * Math.PI) / 180.0

var fovy = 45.0
var aspect

var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc
var lightPositionLoc, ambientLightLoc, diffuseLightLoc, specularLightLoc, shininessLoc
var modelViewMatrix, projectionMatrix
var eye
const at = vec3(0.0, 0.0, 0.0)
const up = vec3(0.0, 1.0, 0.0)

init()

function init () {
  canvas = document.getElementById('gl-canvas')
  gl = canvas.getContext('webgl2')
  if (!gl) {
    alert('WebGL 2.0 tidak tersedia')
    return
  }
  createGarbageBin()

  gl.viewport(0, 0, canvas.width, canvas.height)
  aspect = canvas.width / canvas.height
  gl.clearColor(0.95, 0.95, 0.95, 1.0)
  gl.enable(gl.DEPTH_TEST)

  var program = initShaders(gl, 'vertex-shader', 'fragment-shader')
  gl.useProgram(program)

  // Setup color buffer
  var cBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)

  var colorLoc = gl.getAttribLocation(program, 'aColor')
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(colorLoc)

  // Setup position buffer
  var vBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW)

  var positionLoc = gl.getAttribLocation(program, 'aPosition')
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionLoc)

  // Setup normal buffer
  var nBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW)

  var normalLoc = gl.getAttribLocation(program, 'aNormal')
  gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(normalLoc)

  // Setup index buffer
  var iBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  )

  // Get uniform locations
  modelViewMatrixLoc = gl.getUniformLocation(program, 'uModelViewMatrix')
  projectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix')
  normalMatrixLoc = gl.getUniformLocation(program, 'uNormalMatrix')
  lightPositionLoc = gl.getUniformLocation(program, 'uLightPosition')
  ambientLightLoc = gl.getUniformLocation(program, 'uAmbientLight')
  diffuseLightLoc = gl.getUniformLocation(program, 'uDiffuseLight')
  specularLightLoc = gl.getUniformLocation(program, 'uSpecularLight')
  shininessLoc = gl.getUniformLocation(program, 'uShininess')

  setupControls()
  setupLightingControls()
  
  // Perspective buttons
  document.getElementById('Button1').onclick = function () {
    near *= 1.1
    far *= 1.1
  }
  document.getElementById('Button2').onclick = function () {
    near *= 0.9
    far *= 0.9
  }
  document.getElementById('Button3').onclick = function () {
    radius *= 2.0
  }
  document.getElementById('Button4').onclick = function () {
    radius *= 0.5
  }
  document.getElementById('Button5').onclick = function () {
    cameraTheta += dr
  }
  document.getElementById('Button6').onclick = function () {
    cameraTheta -= dr
  }
  document.getElementById('Button7').onclick = function () {
    cameraPhi += dr
  }
  document.getElementById('Button8').onclick = function () {
    cameraPhi -= dr
  }

  render()
}

// function colorCube()
// {
//     quad(1, 0, 3, 2);
//     quad(2, 3, 7, 6);
//     quad(3, 0, 4, 7);
//     quad(6, 5, 1, 2);
//     quad(4, 5, 6, 7);
//     quad(5, 4, 0, 1);
// }

// function quad(a, b, c, d)
// {
//     // Kita perlu membagi empat sisi menjadi dua segitiga
//     // agar WebGL bisa merendernya. Dalam hal ini, kita
//     // membuat dua segitiga dari indeks empat sisi.

//     // warna verteks ditentukan berdasarkan indeks verteks

//     var indices = [a, b, c, a, c, d];

//     for ( var i = 0; i < indices.length; ++i ) {
//         positions.push( vertices[indices[i]] );
//         //colors.push( vertexColors[indices[i]] );

//         // untuk warna solid pada setiap sisi gunakan ini
//         colors.push(vertexColors[a]);
//     }
// }

function createGarbageBin () {
  positions = []
  colors = []
  normals = []
  indices = []

  // Badan utama tempat sampah (warna biru, tanpa tutup, bentuk persegi panjang)
  createRectangularPrism(0, 0, 0, 0.8, 1.2, 0.5, vec4(0.2, 0.4, 0.8, 1.0))

  // Volume dalam (biru, lebih proporsional, persegi panjang)
  createRectangularPrism(0, 0.1, 0, 0.7, 1.001, 0.4, vec4(0.15, 0.3, 0.7, 1.0))

  // Pinggiran logam di bagian atas (tanpa tutup, persegi panjang)
  createMetalRim(0, 0.58, 0, 0.85, 0.04, 0.55, vec4(0.2, 0.4, 0.8, 1.0))

  // Roda (posisi depan dan belakang)
  createWheel(-0.2, -0.65, 0.35, 0.15, 0.1)
  createWheel(-0.2, -0.65, -0.35, 0.15, 0.1)

  // Area label (persegi putih di tengah depan)
  createRectangularPrism(0, 0.1, 0.31, 0.25, 0.25, 0.01, whiteColor)

  // Ikon tempat sampah
  createTrashIcon(0, 0.1, 0.315)

  // Alas penopang bawah (persegi panjang)
  createRectangularPrism(0, -0.65, 0, 0.7, 0.08, 0.4, vec4(0.15, 0.3, 0.7, 1.0))

  // Pegangan/sandaran samping
  createSideHandle(-0.41, 0.2, 0, 0.02, 0.3, 0.08)
  createSideHandle(0.41, 0.2, 0, 0.02, 0.3, 0.08)
}

function createRectangularPrism (x, y, z, width, height, depth, color) {
  var hw = width / 2
  var hh = height / 2
  var hd = depth / 2

  // Face normals
  var faceNormals = [
    vec3(0, 0, 1),   // front
    vec3(1, 0, 0),   // right
    vec3(0, 1, 0),   // top
    vec3(0, -1, 0),  // bottom
    vec3(0, 0, -1),  // back
    vec3(-1, 0, 0)   // left
  ]

  // Face definitions with vertices
  var faces = [
    // front
    {normal: faceNormals[0], vertices: [
      vec4(x + hw, y - hh, z + hd, 1.0),
      vec4(x - hw, y - hh, z + hd, 1.0),
      vec4(x - hw, y + hh, z + hd, 1.0),
      vec4(x + hw, y + hh, z + hd, 1.0)
    ]},
    // right
    {normal: faceNormals[1], vertices: [
      vec4(x + hw, y + hh, z + hd, 1.0),
      vec4(x + hw, y + hh, z - hd, 1.0),
      vec4(x + hw, y - hh, z - hd, 1.0),
      vec4(x + hw, y - hh, z + hd, 1.0)
    ]},
    // top
    {normal: faceNormals[2], vertices: [
      vec4(x - hw, y + hh, z + hd, 1.0),
      vec4(x - hw, y + hh, z - hd, 1.0),
      vec4(x + hw, y + hh, z - hd, 1.0),
      vec4(x + hw, y + hh, z + hd, 1.0)
    ]},
    // bottom
    {normal: faceNormals[3], vertices: [
      vec4(x + hw, y - hh, z + hd, 1.0),
      vec4(x + hw, y - hh, z - hd, 1.0),
      vec4(x - hw, y - hh, z - hd, 1.0),
      vec4(x - hw, y - hh, z + hd, 1.0)
    ]},
    // back
    {normal: faceNormals[4], vertices: [
      vec4(x + hw, y - hh, z - hd, 1.0),
      vec4(x + hw, y + hh, z - hd, 1.0),
      vec4(x - hw, y + hh, z - hd, 1.0),
      vec4(x - hw, y - hh, z - hd, 1.0)
    ]},
    // left
    {normal: faceNormals[5], vertices: [
      vec4(x - hw, y - hh, z + hd, 1.0),
      vec4(x - hw, y - hh, z - hd, 1.0),
      vec4(x - hw, y + hh, z - hd, 1.0),
      vec4(x - hw, y + hh, z + hd, 1.0)
    ]}
  ]

  for (var f = 0; f < faces.length; f++) {
    var face = faces[f]
    var baseIdx = positions.length
    
    // Add all 4 vertices for this face
    for (var v = 0; v < 4; v++) {
      positions.push(face.vertices[v])
      colors.push(color)
      normals.push(face.normal)
    }
    
    // Create two triangles from the quad
    // Triangle 1: 0, 1, 2
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2)
    // Triangle 2: 0, 2, 3
    indices.push(baseIdx, baseIdx + 2, baseIdx + 3)
  }
}

function createWheel (x, y, z, radius, thickness) {
  var segments = 32
  var angleStep = (2 * Math.PI) / segments
  
  for (var i = 0; i < segments; i++) {
    var angle1 = i * angleStep
    var angle2 = (i + 1) * angleStep

    var x1 = x + radius * Math.cos(angle1)
    var y1 = y + radius * Math.sin(angle1)
    var x2 = x + radius * Math.cos(angle2)
    var y2 = y + radius * Math.sin(angle2)

    var baseIdx = positions.length

    // Front face triangle
    positions.push(vec4(x, y, z + thickness / 2, 1.0))
    positions.push(vec4(x1, y1, z + thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z + thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    normals.push(vec3(0, 0, 1))
    normals.push(vec3(0, 0, 1))
    normals.push(vec3(0, 0, 1))
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2)

    baseIdx += 3

    // Back face triangle
    positions.push(vec4(x, y, z - thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z - thickness / 2, 1.0))
    positions.push(vec4(x1, y1, z - thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    normals.push(vec3(0, 0, -1))
    normals.push(vec3(0, 0, -1))
    normals.push(vec3(0, 0, -1))
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2)

    baseIdx += 3

    // Side face - calculate normal for curved surface
    var nx = Math.cos((angle1 + angle2) / 2)
    var ny = Math.sin((angle1 + angle2) / 2)
    var sideNormal = vec3(nx, ny, 0)

    // First side triangle
    positions.push(vec4(x1, y1, z + thickness / 2, 1.0))
    positions.push(vec4(x1, y1, z - thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z - thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    normals.push(sideNormal)
    normals.push(sideNormal)
    normals.push(sideNormal)
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2)

    baseIdx += 3

    // Second side triangle
    positions.push(vec4(x1, y1, z + thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z - thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z + thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    normals.push(sideNormal)
    normals.push(sideNormal)
    normals.push(sideNormal)
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2)
  }
}

function createMetalRim (x, y, z, width, height, depth) {
  createRectangularPrism(
    x,
    y,
    z,
    width,
    height,
    depth,
    vec4(0.2, 0.4, 0.8, 1.0)
  ) // Dark blue metal
}

function createTrashIcon (x, y, z) {
  // Person figure
  createRectangularPrism(
    x - 0.08,
    y + 0.08,
    z,
    0.02,
    0.08,
    0.01,
    vec4(0.1, 0.8, 0.1, 1.0)
  ) // Body
  createRectangularPrism(
    x - 0.08,
    y + 0.14,
    z,
    0.03,
    0.03,
    0.01,
    vec4(0.1, 0.8, 0.1, 1.0)
  ) // Head
  createRectangularPrism(
    x - 0.06,
    y + 0.11,
    z,
    0.04,
    0.02,
    0.01,
    vec4(0.1, 0.8, 0.1, 1.0)
  ) // Arm

  // Trash bin
  createRectangularPrism(
    x + 0.05,
    y + 0.02,
    z,
    0.06,
    0.08,
    0.01,
    vec4(0.1, 0.8, 0.1, 1.0)
  )
  createRectangularPrism(
    x + 0.05,
    y + 0.08,
    z,
    0.07,
    0.02,
    0.01,
    vec4(0.1, 0.8, 0.1, 1.0)
  ) // Lid

  // Arrow/trash motion
  createRectangularPrism(
    x - 0.02,
    y + 0.08,
    z,
    0.08,
    0.01,
    0.01,
    vec4(0.1, 0.8, 0.1, 1.0)
  )
  createRectangularPrism(
    x + 0.02,
    y + 0.06,
    z,
    0.01,
    0.03,
    0.01,
    vec4(0.1, 0.8, 0.1, 1.0)
  )
}

function createSideHandle (x, y, z, width, height, depth) {
  // Pegangan vertikal di sisi
  createRectangularPrism(
    x,
    y,
    z,
    width,
    height,
    depth,
    vec4(0.15, 0.3, 0.7, 1.0)
  ) // Dark blue
}

function setupControls () {
  // Kontrol rotasi X
  var rotateXSlider = document.getElementById('rotateX')
  var rotateXValue = document.getElementById('rotateX-value')
  rotateXSlider.addEventListener('input', function () {
    rotationTheta[0] = parseFloat(this.value)
    rotateXValue.textContent = rotationTheta[0] + '°'
  })

  // Kontrol rotasi Y
  var rotateYSlider = document.getElementById('rotateY')
  var rotateYValue = document.getElementById('rotateY-value')
  rotateYSlider.addEventListener('input', function () {
    rotationTheta[1] = parseFloat(this.value)
    rotateYValue.textContent = rotationTheta[1] + '°'
  })

  // Kontrol translasi X
  var translateXSlider = document.getElementById('translateX')
  var translateXValue = document.getElementById('translateX-value')
  translateXSlider.addEventListener('input', function () {
    translation[0] = parseFloat(this.value)
    translateXValue.textContent = translation[0].toFixed(1)
  })

  // Kontrol translasi Y
  var translateYSlider = document.getElementById('translateY')
  var translateYValue = document.getElementById('translateY-value')
  translateYSlider.addEventListener('input', function () {
    translation[1] = parseFloat(this.value)
    translateYValue.textContent = translation[1].toFixed(1)
  })
}

function setupLightingControls() {
  var lightStep = 0.5
  var colorStep = 0.05
  var shineStep = 5
  
  // Light Position Controls
  document.getElementById('ButtonL0').onclick = function() {
    lightPosition[0] = Math.min(lightPosition[0] + lightStep, 5.0)
    updateLightPositionDisplay()
  }
  document.getElementById('ButtonL1').onclick = function() {
    lightPosition[0] = Math.max(lightPosition[0] - lightStep, -5.0)
    updateLightPositionDisplay()
  }
  document.getElementById('ButtonL2').onclick = function() {
    lightPosition[1] = Math.min(lightPosition[1] + lightStep, 5.0)
    updateLightPositionDisplay()
  }
  document.getElementById('ButtonL3').onclick = function() {
    lightPosition[1] = Math.max(lightPosition[1] - lightStep, -5.0)
    updateLightPositionDisplay()
  }
  document.getElementById('ButtonL4').onclick = function() {
    lightPosition[2] = Math.min(lightPosition[2] + lightStep, 5.0)
    updateLightPositionDisplay()
  }
  document.getElementById('ButtonL5').onclick = function() {
    lightPosition[2] = Math.max(lightPosition[2] - lightStep, -5.0)
    updateLightPositionDisplay()
  }

  // Ambient Light Controls
  document.getElementById('ButtonL6').onclick = function() {
    ambientLight[0] = Math.min(ambientLight[0] + colorStep, 1.0)
    updateAmbientDisplay()
  }
  document.getElementById('ButtonL7').onclick = function() {
    ambientLight[0] = Math.max(ambientLight[0] - colorStep, 0.0)
    updateAmbientDisplay()
  }
  document.getElementById('ButtonL8').onclick = function() {
    ambientLight[1] = Math.min(ambientLight[1] + colorStep, 1.0)
    updateAmbientDisplay()
  }
  document.getElementById('ButtonL9').onclick = function() {
    ambientLight[1] = Math.max(ambientLight[1] - colorStep, 0.0)
    updateAmbientDisplay()
  }
  document.getElementById('ButtonL10').onclick = function() {
    ambientLight[2] = Math.min(ambientLight[2] + colorStep, 1.0)
    updateAmbientDisplay()
  }
  document.getElementById('ButtonL11').onclick = function() {
    ambientLight[2] = Math.max(ambientLight[2] - colorStep, 0.0)
    updateAmbientDisplay()
  }

  // Diffuse Light Controls
  document.getElementById('ButtonL12').onclick = function() {
    diffuseLight[0] = Math.min(diffuseLight[0] + colorStep, 1.0)
    updateDiffuseDisplay()
  }
  document.getElementById('ButtonL13').onclick = function() {
    diffuseLight[0] = Math.max(diffuseLight[0] - colorStep, 0.0)
    updateDiffuseDisplay()
  }
  document.getElementById('ButtonL14').onclick = function() {
    diffuseLight[1] = Math.min(diffuseLight[1] + colorStep, 1.0)
    updateDiffuseDisplay()
  }
  document.getElementById('ButtonL15').onclick = function() {
    diffuseLight[1] = Math.max(diffuseLight[1] - colorStep, 0.0)
    updateDiffuseDisplay()
  }
  document.getElementById('ButtonL16').onclick = function() {
    diffuseLight[2] = Math.min(diffuseLight[2] + colorStep, 1.0)
    updateDiffuseDisplay()
  }
  document.getElementById('ButtonL17').onclick = function() {
    diffuseLight[2] = Math.max(diffuseLight[2] - colorStep, 0.0)
    updateDiffuseDisplay()
  }

  // Specular Light Controls
  document.getElementById('ButtonL18').onclick = function() {
    specularLight[0] = Math.min(specularLight[0] + colorStep, 1.0)
    updateSpecularDisplay()
  }
  document.getElementById('ButtonL19').onclick = function() {
    specularLight[0] = Math.max(specularLight[0] - colorStep, 0.0)
    updateSpecularDisplay()
  }
  document.getElementById('ButtonL20').onclick = function() {
    specularLight[1] = Math.min(specularLight[1] + colorStep, 1.0)
    updateSpecularDisplay()
  }
  document.getElementById('ButtonL21').onclick = function() {
    specularLight[1] = Math.max(specularLight[1] - colorStep, 0.0)
    updateSpecularDisplay()
  }
  document.getElementById('ButtonL22').onclick = function() {
    specularLight[2] = Math.min(specularLight[2] + colorStep, 1.0)
    updateSpecularDisplay()
  }
  document.getElementById('ButtonL23').onclick = function() {
    specularLight[2] = Math.max(specularLight[2] - colorStep, 0.0)
    updateSpecularDisplay()
  }

  // Shininess Controls
  document.getElementById('ButtonL24').onclick = function() {
    shininess = Math.min(shininess + shineStep, 100.0)
    updateShininessDisplay()
  }
  document.getElementById('ButtonL25').onclick = function() {
    shininess = Math.max(shininess - shineStep, 1.0)
    updateShininessDisplay()
  }
}

function updateLightPositionDisplay() {
  document.getElementById('light-position-value').textContent = 
    '(' + lightPosition[0].toFixed(1) + ', ' + 
    lightPosition[1].toFixed(1) + ', ' + 
    lightPosition[2].toFixed(1) + ')'
}

function updateAmbientDisplay() {
  document.getElementById('ambient-value').textContent = 
    'RGB(' + ambientLight[0].toFixed(2) + ', ' + 
    ambientLight[1].toFixed(2) + ', ' + 
    ambientLight[2].toFixed(2) + ')'
}

function updateDiffuseDisplay() {
  document.getElementById('diffuse-value').textContent = 
    'RGB(' + diffuseLight[0].toFixed(2) + ', ' + 
    diffuseLight[1].toFixed(2) + ', ' + 
    diffuseLight[2].toFixed(2) + ')'
}

function updateSpecularDisplay() {
  document.getElementById('specular-value').textContent = 
    'RGB(' + specularLight[0].toFixed(2) + ', ' + 
    specularLight[1].toFixed(2) + ', ' + 
    specularLight[2].toFixed(2) + ')'
}

function updateShininessDisplay() {
  document.getElementById('shininess-value').textContent = shininess.toFixed(1)
}

function resetAll () {
  // Reset rotation and translation
  rotationTheta = [30, 30, 0]
  translation = [0, 0, 0]

  // Reset camera parameters
  near = 0.3
  far = 10.0
  radius = 4.0
  cameraTheta = 0.0
  cameraPhi = 0.0

  // Reset lighting parameters
  lightPosition = [1.0, 1.0, 1.0, 1.0]
  ambientLight = [0.2, 0.2, 0.2]
  diffuseLight = [1.0, 1.0, 1.0]
  specularLight = [1.0, 1.0, 1.0]
  shininess = 10.0

  document.getElementById('rotateX').value = 30
  document.getElementById('rotateX-value').textContent = '30°'
  document.getElementById('rotateY').value = 30
  document.getElementById('rotateY-value').textContent = '30°'
  document.getElementById('translateX').value = 0
  document.getElementById('translateX-value').textContent = '0.0'
  document.getElementById('translateY').value = 0
  document.getElementById('translateY-value').textContent = '0.0'

  // Update lighting displays
  updateLightPositionDisplay()
  updateAmbientDisplay()
  updateDiffuseDisplay()
  updateSpecularDisplay()
  updateShininessDisplay()
}

function render () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // 1. Set up the camera view matrix
  eye = vec3(
    radius * Math.sin(cameraTheta) * Math.cos(cameraPhi),
    radius * Math.sin(cameraTheta) * Math.sin(cameraPhi),
    radius * Math.cos(cameraTheta)
  )
  var viewMatrix = lookAt(eye, at, up)

  // 2. Set up the model transformations
  var modelMatrix = mat4()
  modelMatrix = mult(
    modelMatrix,
    translate(translation[0], translation[1], translation[2])
  )
  modelMatrix = mult(modelMatrix, rotate(rotationTheta[0], vec3(1, 0, 0)))
  modelMatrix = mult(modelMatrix, rotate(rotationTheta[1], vec3(0, 1, 0)))
  modelMatrix = mult(modelMatrix, rotate(rotationTheta[2], vec3(0, 0, 1)))

  // 3. Combine them into a modelView matrix
  modelViewMatrix = mult(viewMatrix, modelMatrix)

  // 4. Calculate normal matrix (inverse transpose of modelView)
  var normalMatrix = [
    vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
    vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
    vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
  ]

  // 5. Set up the projection matrix
  projectionMatrix = perspective(fovy, aspect, near, far)

  // 6. Send matrices to the shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix))
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix))

  // 7. Send lighting parameters to shader
  gl.uniform4fv(lightPositionLoc, flatten(vec4(lightPosition[0], lightPosition[1], lightPosition[2], 1.0)))
  gl.uniform3fv(ambientLightLoc, flatten(vec3(ambientLight[0], ambientLight[1], ambientLight[2])))
  gl.uniform3fv(diffuseLightLoc, flatten(vec3(diffuseLight[0], diffuseLight[1], diffuseLight[2])))
  gl.uniform3fv(specularLightLoc, flatten(vec3(specularLight[0], specularLight[1], specularLight[2])))
  gl.uniform1f(shininessLoc, shininess)

  // 8. Draw the object
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

  requestAnimationFrame(render)
}
