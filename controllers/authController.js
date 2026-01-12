const bcrypt = require('bcrypt');
const db = require('../config/db');

// REGISTRO
exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ msg: 'Campos incompletos' });
    }

    const hash = await bcrypt.hash(password, 10);

    // PostgreSQL usa $1, $2, $3 y RETURNING
    const sql = 'INSERT INTO users (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id';
    const result = await db.query(sql, [nombre, email, hash, 'cliente']);
    
    res.status(201).json({ msg: 'Usuario registrado', userId: result.rows[0].id });
  } catch (e) {
    console.error('Error en registro:', e);
    if (e.code === '23505') { // Duplicate key en PostgreSQL
      return res.status(400).json({ msg: 'El email ya está registrado' });
    }
    res.status(500).json({ msg: 'Error al registrar' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(sql, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ msg: 'Usuario no existe' });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ msg: 'Credenciales incorrectas' });
    }

    req.session.user = {
      id: user.id,
      rol: user.rol,
      nombre: user.nombre
    };

    // Redireccionar según rol
    if (user.rol === 'admin') {
      res.redirect('/html/admin.html');
    } else if (user.rol === 'vendedor') {
      res.redirect('/html/vendedor.html');
    } else {
      res.redirect('/html/cliente.html');
    }
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
    res.redirect('/');
  });
};