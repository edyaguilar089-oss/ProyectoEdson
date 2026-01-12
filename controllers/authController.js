const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ msg: 'Campos incompletos' });
    }

    const hash = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (nombre, email, password, rol) VALUES (?,?,?,?)',
      [nombre, email, hash, 'cliente'],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ msg: 'Error al registrar' });
        }
        res.sendStatus(201);
      }
    );
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, result) => {
      if (result.length === 0) {
        return res.status(401).json({ msg: 'Usuario no existe' });
      }

      const user = result[0];
      const ok = await bcrypt.compare(password, user.password);

      if (!ok) {
        return res.status(401).json({ msg: 'Credenciales incorrectas' });
      }

      req.session.user = {
        id: user.id,
        rol: user.rol,
        nombre: user.nombre
      };

      if (user.rol === 'admin') {
        res.redirect('/html/admin.html');
      } else if(user.rol === 'vendedor'){
        res.redirect('/html/vendedor.html');
      } else
        {
          res.redirect('/html/cliente.html');
        }
    }
  );
};
