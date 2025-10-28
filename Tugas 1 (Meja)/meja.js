// meja.js - Script untuk objek meja 3D

// Variabel global
let scene, camera, renderer, desk;
let rotateXSlider, rotateYSlider, translateXSlider, translateYSlider;
let rotateXValue, rotateYValue, translateXValue, translateYValue;

// Data vertices dan faces untuk tabel
const vertices = [];
const faces = [];

// Inisialisasi scene
function init() {
    // Setup canvas
    const canvas = document.getElementById('mejaCanvas');
    
    // Setup scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);
    
    // Setup renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.width, canvas.height);
    
    // Tambahkan pencahayaan minimal
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Tambahkan pencahayaan dari atas
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Tambahkan cahaya lembut dari bawah
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.1);
    scene.add(hemisphereLight);

    // Aktifkan shadow map pada renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Buat objek meja
    createDeskObject();
    
    // Setup kontrol
    setupControls();
    
    // Isi tabel
    populateTables();
    
    // Mulai render loop
    animate();
}

function createDeskObject() {
    // Group untuk menggabungkan semua bagian meja
    desk = new THREE.Group();
    
    // Warna
    const creamColor = 0xFFF8DC; // Krem kekuningan (cornsilk)
    const darkGrayColor = 0x404040; // Abu-abu tua
    
    // 1. Papan atas (table top) - krem kekuningan, diperbesar lagi
    const topGeometry = new THREE.BoxGeometry(15, 0.6, 8);
    const topMaterial = new THREE.MeshLambertMaterial({ color: creamColor });
    const tableTop = new THREE.Mesh(topGeometry, topMaterial);
    tableTop.position.set(0, 6.0, 0); 
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    desk.add(tableTop);
    
    // 2. Kaki penyangga kiri - abu-abu tua, lebih tinggi
    const leftLegGeometry = new THREE.BoxGeometry(1, 6.0, 6); 
    const leftLegMaterial = new THREE.MeshLambertMaterial({ color: darkGrayColor });
    const leftLeg = new THREE.Mesh(leftLegGeometry, leftLegMaterial);
    leftLeg.position.set(-5.5, 3.0, 0); 
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    desk.add(leftLeg);
    
    // 3. Kaki penyangga kanan - abu-abu tua, lebih tinggi
    const rightLegGeometry = new THREE.BoxGeometry(1, 6.0, 6); 
    const rightLegMaterial = new THREE.MeshLambertMaterial({ color: darkGrayColor });
    const rightLeg = new THREE.Mesh(rightLegGeometry, rightLegMaterial);
    rightLeg.position.set(5.5, 3.0, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    desk.add(rightLeg);
    
    // 4. Panel depan - krem kekuningan, menempel langsung dengan kaki penyangga
    const frontPanelGeometry = new THREE.BoxGeometry(10, 3.0, 0.15); // Diubah: Tinggi panel
    const frontPanelMaterial = new THREE.MeshLambertMaterial({ color: creamColor });
    const frontPanel = new THREE.Mesh(frontPanelGeometry, frontPanelMaterial);
    frontPanel.position.set(0, 3.5, 3); // Diubah: Posisi y disesuaikan
    frontPanel.castShadow = true;
    frontPanel.receiveShadow = true;
    desk.add(frontPanel);
    
    // Set rotasi awal
    desk.rotation.x = THREE.MathUtils.degToRad(20);
    desk.rotation.y = THREE.MathUtils.degToRad(15);
    
    scene.add(desk);
    
    // Simpan vertices untuk tabel (koordinat yang disederhanakan)
    saveVerticesData();
}

function saveVerticesData() {
    // Vertices untuk table top (diperbesar lagi)
    const topVertices = [
        [-7.5, 6.3, -4], [7.5, 6.3, -4], [7.5, 6.3, 4], [-7.5, 6.3, 4], // atas
        [-7.5, 5.7, -4], [7.5, 5.7, -4], [7.5, 5.7, 4], [-7.5, 5.7, 4]  // bawah
    ];
    
    // Vertices untuk left leg (lebih tinggi)
    const leftLegVertices = [
        [-6, 6, -3], [-5, 6, -3], [-5, 6, 3], [-6, 6, 3], // atas
        [-6, 0, -3], [-5, 0, -3], [-5, 0, 3], [-6, 0, 3]   // bawah
    ];
    
    // Vertices untuk right leg (lebih tinggi)
    const rightLegVertices = [
        [5, 6, -3], [6, 6, -3], [6, 6, 3], [5, 6, 3], // atas
        [5, 0, -3], [6, 0, -3], [6, 0, 3], [5, 0, 3]   // bawah
    ];
    
    // Vertices untuk front panel (menempel dengan kaki)
    const frontPanelVertices = [
        [-5, 5.0, 3], [5, 5.0, 3], [5, 5.0, 3.15], [-5, 5.0, 3.15], // atas
        [-5, 2.0, 3], [5, 2.0, 3], [5, 2.0, 3.15], [-5, 2.0, 3.15] // bawah
    ];
    
    // Gabungkan semua vertices
    vertices.length = 0; // Clear array
    vertices.push(...topVertices, ...leftLegVertices, ...rightLegVertices, ...frontPanelVertices);
    
    // Buat faces (segitiga) - setiap kubus memiliki 12 triangles (6 faces * 2 triangles each)
    faces.length = 0; // Clear array
    
    // Table top faces (indices 0-7)
    faces.push(
        [0, 1, 2], [0, 2, 3], // atas
        [4, 7, 6], [4, 6, 5], // bawah
        [0, 4, 5], [0, 5, 1], // depan
        [2, 6, 7], [2, 7, 3], // belakang
        [0, 3, 7], [0, 7, 4], // kiri
        [1, 5, 6], [1, 6, 2]  // kanan
    );
    
    // Left leg faces (indices 8-15)
    for(let i = 0; i < 12; i++) {
        const face = [...faces[i]];
        face[0] += 8; face[1] += 8; face[2] += 8;
        faces.push(face);
    }
    
    // Right leg faces (indices 16-23)
    for(let i = 0; i < 12; i++) {
        const face = [...faces[i]];
        face[0] += 16; face[1] += 16; face[2] += 16;
        faces.push(face);
    }
    
    // Front panel faces (indices 24-31)
    for(let i = 0; i < 12; i++) {
        const face = [...faces[i]];
        face[0] += 24; face[1] += 24; face[2] += 24;
        faces.push(face);
    }
}

function setupControls() {
    // Ambil elemen kontrol
    rotateXSlider = document.getElementById('rotateX');
    rotateYSlider = document.getElementById('rotateY');
    translateXSlider = document.getElementById('translateX');
    translateYSlider = document.getElementById('translateY');
    
    rotateXValue = document.getElementById('rotateXValue');
    rotateYValue = document.getElementById('rotateYValue');
    translateXValue = document.getElementById('translateXValue');
    translateYValue = document.getElementById('translateYValue');
    
    // Event listeners
    rotateXSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        desk.rotation.x = THREE.MathUtils.degToRad(value);
        rotateXValue.textContent = value + '°';
    });
    
    rotateYSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        desk.rotation.y = THREE.MathUtils.degToRad(value);
        rotateYValue.textContent = value + '°';
    });
    
    translateXSlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        desk.position.x = value;
        translateXValue.textContent = value;
    });
    
    translateYSlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        desk.position.y = value;
        translateYValue.textContent = value;
    });
}

function populateTables() {
    // Clear existing content
    const verticesTableBody = document.querySelector('#verticesTable tbody');
    const facesTableBody = document.querySelector('#facesTable tbody');
    verticesTableBody.innerHTML = '';
    facesTableBody.innerHTML = '';
    
    // Isi tabel vertices
    vertices.forEach((vertex, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${vertex[0].toFixed(2)}</td>
            <td>${vertex[1].toFixed(2)}</td>
            <td>${vertex[2].toFixed(2)}</td>
        `;
        verticesTableBody.appendChild(row);
    });
    
    // Isi tabel faces
    faces.forEach((face, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${face[0] + 1}</td>
            <td>${face[1] + 1}</td>
            <td>${face[2] + 1}</td>
        `;
        facesTableBody.appendChild(row);
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Mulai aplikasi setelah DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});