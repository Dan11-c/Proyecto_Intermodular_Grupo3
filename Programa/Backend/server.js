const express = require('express');
const bcrypt  = require('bcrypt');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;


const USUARIOS_FILE = path.join(__dirname, 'usuarios.json');


if (!fs.existsSync(USUARIOS_FILE)) {
  fs.writeFileSync(USUARIOS_FILE, '[]');
}

function leerUsuarios() {
  return JSON.parse(fs.readFileSync(USUARIOS_FILE, 'utf-8'));
}

function guardarUsuarios(usuarios) {
  fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.post('/registro', async (req, res) => {
  const { username, email, edad, password } = req.body;

  if (!username || !email || !edad || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan campos obligatorios' });
  }

  const usuarios = leerUsuarios();

  const yaExiste = usuarios.find(u => u.username === username || u.email === email);
  
  if (yaExiste) {
    return res.status(409).json({ ok: false, mensaje: 'Usuario o email ya registrado' });
  }

  const hash = await bcrypt.hash(password, 10);
  usuarios.push({
    id: Date.now(),
    username,
    email,
    edad: parseInt(edad),
    password_hash: hash,
    fecha_registro: new Date().toISOString()
  });

  guardarUsuarios(usuarios);
  res.json({ ok: true, mensaje: 'Cuenta creada correctamente' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan campos obligatorios' });
  }

  const usuarios = leerUsuarios();
  const usuario  = usuarios.find(u => u.username === username);

  if (!usuario) {
    return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
  }

  const passwordOk = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordOk) {
    return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
  }

  res.json({ ok: true, mensaje: `Bienvenido, ${usuario.username}!` });
});

app.listen(PORT, () => {
  console.log(`TodoBit server corriendo en http://localhost:${PORT}`);
});