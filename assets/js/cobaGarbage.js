'use strict'

var canvas
var gl

// var numPositions  = 36;

var positions = []
var colors = []
var indices = [] // Untuk IBO

// var vertices = [
//     vec4(-0.5, -0.5,  0.5, 1.0),
//     vec4(-0.5,  0.5,  0.5, 1.0),
//     vec4(0.5,  0.5,  0.5, 1.0),
//     vec4(0.5, -0.5,  0.5, 1.0),
//     vec4(-0.5, -0.5, -0.5, 1.0),
//     vec4(-0.5,  0.5, -0.5, 1.0),
//     vec4(0.5,  0.5, -0.5, 1.0),
//     vec4(0.5, -0.5, -0.5, 1.0)
// ];

// var vertexColors = [
//     vec4(0.0, 1.0, 0.0, 1.0),  // hitam
//     vec4(0.0, 2.0, 0.0, 1.0),  // merah
//     vec4(0.0, 2.0, 0.0, 1.0),  // kuning
//     vec4(0.0, 5.0, 0.0, 1.0),  // hijau
//     vec4(0.0, 0.0, 4.0, 1.0),  // biru
//     vec4(0.0, 0.0, 2.0, 1.0),  // magenta
//     vec4(0.0, 0.0, 0.0, 1.0),  // cyan
//     vec4(1.0, 0.0, 0.0, 1.0)   // putih
// ];

// var xAxis = 0;
// var yAxis = 1;
// var zAxis = 2;

// var axis = 0;
// var theta = [0, 0, 0];

var thetaLoc, translationLoc

// Transform controls
var theta = [30, 30, 0] // Rotasi awal
var translation = [0, 0] // Translasi awal

// Warna untuk bagian-bagian berbeda
var blueColor = vec4(0.2, 0.4, 0.8, 1.0) // Badan utama tempat sampah - biru
var darkBlueColor = vec4(0.15, 0.3, 0.7, 1.0) // Tepi tempat sampah - biru tua
var blackColor = vec4(0.1, 0.1, 0.1, 1.0) // Bagian dalam dan roda - hitam
var whiteColor = vec4(0.95, 0.95, 0.95, 1.0) // Bagian label - abu-abu
var iconColor = vec4(0.1, 0.8, 0.1, 1.0) // Ikon - hijau

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
  gl.clearColor(0.95, 0.95, 0.95, 1.0)
  gl.enable(gl.DEPTH_TEST)

  var program = initShaders(gl, 'vertex-shader', 'fragment-shader')
  gl.useProgram(program)

  // Setup color buffer (VBO untuk warna)
  var cBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)

  var colorLoc = gl.getAttribLocation(program, 'aColor')
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(colorLoc)

  // Setup position buffer (VBO untuk posisi)
  var vBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW)

  var positionLoc = gl.getAttribLocation(program, 'aPosition')
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionLoc)

  // Setup index buffer (IBO)
  var iBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  )

  // Get uniform locations
  thetaLoc = gl.getUniformLocation(program, 'uTheta')
  translationLoc = gl.getUniformLocation(program, 'uTranslation')

  setupControls()
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
  indices = []

  // Badan utama tempat sampah (warna biru, tanpa tutup, bentuk persegi panjang)
  createRectangularPrism(0, 0, 0, 0.8, 1.2, 0.5, vec4(0.2, 0.4, 0.8, 1.0)) // Biru, persegi panjang

  // Volume dalam (biru, lebih proporsional, persegi panjang)
  createRectangularPrism(0, 0.1, 0, 0.7, 1.001, 0.4, vec4(0.15, 0.3, 0.7, 1.0)) // Biru, bagian dalam persegi panjang

  // Pinggiran logam di bagian atas (tanpa tutup, persegi panjang)
  createMetalRim(0, 0.58, 0, 0.85, 0.04, 0.55, vec4(0.2, 0.4, 0.8, 1.0))

  // Roda (posisi depan dan belakang, bukan kiri-kanan)
  createWheel(-0.2, -0.65, 0.35, 0.15, 0.1) // Roda depan
  createWheel(-0.2, -0.65, -0.35, 0.15, 0.1) // Roda belakang

  // Area label (persegi putih di tengah depan)
  createRectangularPrism(0, 0.1, 0.31, 0.25, 0.25, 0.01, whiteColor)

  // Ikon tempat sampah (orang membuang sampah versi sederhana)
  createTrashIcon(0, 0.1, 0.315)

  // Alas penopang bawah (persegi panjang)
  createRectangularPrism(0, -0.65, 0, 0.7, 0.08, 0.4, vec4(0.15, 0.3, 0.7, 1.0)) // Darker blue, rectangular

  // Pegangan/sandaran samping (disesuaikan untuk bentuk persegi panjang)
  createSideHandle(-0.41, 0.2, 0, 0.02, 0.3, 0.08)
  createSideHandle(0.41, 0.2, 0, 0.02, 0.3, 0.08)
}

function createRectangularPrism (x, y, z, width, height, depth, color) {
  var hw = width / 2 // setengah lebar
  var hh = height / 2 // setengah tinggi
  var hd = depth / 2 // setengah kedalaman

  var vertices = [
    // Front face
    vec4(x - hw, y - hh, z + hd, 1.0),
    vec4(x + hw, y - hh, z + hd, 1.0),
    vec4(x + hw, y + hh, z + hd, 1.0),
    vec4(x - hw, y + hh, z + hd, 1.0),
    // Back face
    vec4(x - hw, y - hh, z - hd, 1.0),
    vec4(x + hw, y - hh, z - hd, 1.0),
    vec4(x + hw, y + hh, z - hd, 1.0),
    vec4(x - hw, y + hh, z - hd, 1.0)
  ]

  // Definisikan sisi menggunakan indeks titik sudut
  var faces = [
    [1, 0, 3, 2], // front
    [2, 3, 7, 6], // right
    [3, 0, 4, 7], // top
    [6, 5, 1, 2], // bottom
    [4, 5, 6, 7], // back
    [5, 4, 0, 1] // left
  ]

  var baseIndex = positions.length
  for (var i = 0; i < vertices.length; i++) {
    positions.push(vertices[i])
    colors.push(color)
  }
  for (var f = 0; f < faces.length; f++) {
    var face = faces[f]
    // Dua segitiga per sisi
    indices.push(baseIndex + face[0], baseIndex + face[1], baseIndex + face[2])
    indices.push(baseIndex + face[0], baseIndex + face[2], baseIndex + face[3])
  }
}

function createWheel (x, y, z, radius, thickness) {
  var segments = 32
  var angleStep = (2 * Math.PI) / segments
  var baseIndex = positions.length
  // Membuat silinder untuk roda
  for (var i = 0; i < segments; i++) {
    var angle1 = i * angleStep
    var angle2 = (i + 1) * angleStep

    var x1 = x + radius * Math.cos(angle1)
    var y1 = y + radius * Math.sin(angle1)
    var x2 = x + radius * Math.cos(angle2)
    var y2 = y + radius * Math.sin(angle2)

    // Segitiga sisi depan
    positions.push(vec4(x, y, z + thickness / 2, 1.0))
    positions.push(vec4(x1, y1, z + thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z + thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2)
    baseIndex += 3

    // Segitiga sisi belakang
    positions.push(vec4(x, y, z - thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z - thickness / 2, 1.0))
    positions.push(vec4(x1, y1, z - thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2)
    baseIndex += 3

    // Sisi samping (dua segitiga)
    positions.push(vec4(x1, y1, z + thickness / 2, 1.0))
    positions.push(vec4(x1, y1, z - thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z - thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2)
    baseIndex += 3

    positions.push(vec4(x1, y1, z + thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z - thickness / 2, 1.0))
    positions.push(vec4(x2, y2, z + thickness / 2, 1.0))
    colors.push(blackColor)
    colors.push(blackColor)
    colors.push(blackColor)
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2)
    baseIndex += 3
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
    theta[0] = parseFloat(this.value)
    rotateXValue.textContent = theta[0] + '°'
  })

  // Kontrol rotasi Y
  var rotateYSlider = document.getElementById('rotateY')
  var rotateYValue = document.getElementById('rotateY-value')
  rotateYSlider.addEventListener('input', function () {
    theta[1] = parseFloat(this.value)
    rotateYValue.textContent = theta[1] + '°'
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

function resetTransforms () {
  theta = [30, 30, 0]
  translation = [0, 0]

  document.getElementById('rotateX').value = 30
  document.getElementById('rotateX-value').textContent = '30°'
  document.getElementById('rotateY').value = 30
  document.getElementById('rotateY-value').textContent = '30°'
  document.getElementById('translateX').value = 0
  document.getElementById('translateX-value').textContent = '0.0'
  document.getElementById('translateY').value = 0
  document.getElementById('translateY-value').textContent = '0.0'
}

function render () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Update uniforms
  gl.uniform3fv(thetaLoc, theta)
  gl.uniform2fv(translationLoc, translation)

  // Gambar semua segitiga dengan IBO
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

  requestAnimationFrame(render)
}
