const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware: usuario logeado
const isAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).send('No autorizado');
  next();
};

// Ver carrito
router.get('/', isAuth, (req, res) => {
  res.json(req.session.cart || []);
});

// Agregar producto
router.post('/add', isAuth, async (req, res) => {
  const { productId, cantidad } = req.body;

  if (!req.session.cart) req.session.cart = [];

  try {
    const result = await db.query(
      'SELECT id, nombre, precio FROM products WHERE id = $1',
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Producto no existe');
    }

    const prod = result.rows[0];
    const item = req.session.cart.find(p => p.productId === productId);

    if (item) {
      item.cantidad += cantidad;
    } else {
      req.session.cart.push({
        productId: prod.id,
        nombre: prod.nombre,
        precio: parseFloat(prod.precio),
        cantidad
      });
    }

    res.json(req.session.cart);
  } catch (err) {
    console.error('Error agregando al carrito:', err);
    res.status(500).send('Error');
  }
});

// Eliminar producto
router.post('/remove', isAuth, (req, res) => {
  const { productId } = req.body;
  req.session.cart = (req.session.cart || []).filter(p => p.productId !== productId);
  res.json(req.session.cart);
});

module.exports = router;