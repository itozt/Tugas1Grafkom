# TUGAS GRAFIKA KOMPUTER 

### List Anggota Kelompok

| Nama                             | NRP        | Kelas              |
| -------------------------------- | ---------- | ------------------ |
| Alvin Zanua Putra                | 5025231064 | Grafika Computer A |
| Christoforus Indra Bagus Pratama | 5025231124 | Grafika Komputer A |

**Tujuan:**

- Mahasiswa mampu meniru objek benda nyata dan menggambarkannya ke dalam system grafika.
- Mahasiswa mampu menerapkan konsep-konsep di dalam VBO, IBO, vertex shader, dan fragment shader.
- Mahasiswa mampu membuat aplikasi Grafika sederhana yang interaktif.
- Mahasiswa mampu menerapkan proses Transformasi di dalam Grafika

**Rincian Tugas:**
Buat aplikasi grafika untuk menggambarkan objek benda nyata di dalam lingkungan Teknik informatika dengan ketentuan sebagai berikut:

- Tugas berkelompok maksimal 2 orang per kelompok.
- Waktu pengerjaan 1 minggu.
- Foto objek yang mau anda gambar baik dari dekat maupun jauh untuk memastikan bahwa objeknya berada di lingkungan Teknik Informatika.
- Masukkan foto objek di dalam web juga, agar tidak banyak file yang dibuka.
- Pembuatan koordinat dari objek manual, tidak boleh menggunakan aplikasi seperti blender atau yang lain. Tujuannya agar mahasiswa paham tentang system koordinat.
- Untukpewarnaan objek hanya menggunakan warna tidak menggunakan tekstur.
- Buat aplikasi interaktif agar pengguna bisa berinteraksi dengan objek yang anda gambar.
- Pastikan ada operasi transformasi di dalam aplikasi anda.

**Poin Penilaian:**

1. Seberapa unik objek yang anda pilih dibandingkan kelompok lain.
2. Seberapa komplek objek yang anda buat.
3. Sebarapa mirip objek dengan objek aslinya
4. Jumlah interaksi yang ada.
5. Jumlah Transformasi yang ada.


- Foto jarak jauh dan dekat dulu
- Canvas + image
- Koordinat nya manual gaboleh blender (caranya print kasih garis koordinat di fotonya)
- Tujuanya buat tau dari triangle intinya 2D cari yang MID kompleks



## Preview Gambar Object Yang Dipilih :

<div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 20px 0;">
<div style="text-align: center;">

![Tempat Sampah - Jarak Jauh](/assets/image/1-garbage-far.jpg)
<p><em>Gambar 1.1 - Tempat sampah dari jarak jauh</em></p>
</div>
<div style="text-align: center;">

![Tempat Sampah - Jarak Dekat](/assets/image/2-garbage-near.jpg)
<p><em>Gambar 1.2 - Tempat sampah dari jarak dekat</em></p>
</div>
</div>


## Penjelasan Penerapan VBO, IBO, Vertex Shader, dan Fragment Shader


### 1. Vertex Buffer Object (VBO)
VBO digunakan untuk menyimpan data vertex (posisi dan warna) di GPU untuk akses yang efisien.

```javascript
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
```

### 2. Index Buffer Object (IBO)
IBO menyimpan indeks vertex untuk mengurangi duplikasi data dan meningkatkan efisiensi rendering.

```javascript
// Membuat buffer indeks
var iBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
```

### 3. Vertex Shader
Memproses setiap vertex dan menerapkan transformasi geometris.

```glsl
#version 300 es
in vec4 aPosition;
in vec4 aColor;
out vec4 vColor;

uniform vec3 uTheta;    // Sudut rotasi untuk X, Y, Z
uniform vec2 uTranslation; // Translasi X, Y

void main() {
    // Matriks rotasi X
    mat3 rx = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(uTheta.x), -sin(uTheta.x),
        0.0, sin(uTheta.x), cos(uTheta.x)
    );
    
    // Matriks rotasi Y
    mat3 ry = mat3(
        cos(uTheta.y), 0.0, sin(uTheta.y),
        0.0, 1.0, 0.0,
        -sin(uTheta.y), 0.0, cos(uTheta.y)
    );
    
    // Matriks rotasi Z
    mat3 rz = mat3(
        cos(uTheta.z), -sin(uTheta.z), 0.0,
        sin(uTheta.z), cos(uTheta.z), 0.0,
        0.0, 0.0, 1.0
    );
    
    // Aplikasikan transformasi
    vec3 rotatedPos = rz * ry * rx * aPosition.xyz;
    
    // Aplikasikan translasi
    vec4 finalPos = vec4(rotatedPos + vec3(uTranslation, 0.0), 1.0);
    
    vColor = aColor;
    gl_Position = finalPos;
}
```

### 4. Fragment Shader
Menentukan warna akhir setiap pixel berdasarkan interpolasi warna vertex.

```glsl
#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 fColor;

void main() {
    fColor = vColor;
}
```

### 5. Rendering dengan IBO
Menggunakan `gl.drawElements()` untuk merender objek berdasarkan indeks.

```javascript
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
```