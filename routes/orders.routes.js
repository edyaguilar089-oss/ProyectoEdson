const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); // Importamos el controlador

// Middleware de Auth (Puedes dejarlo aquí o moverlo a un archivo aparte)
const isAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).send('No autorizado');
  next();
};

// --- RUTAS ---

// 1. Checkout (Ahora incluye resta de stock)
router.post('/checkout', isAuth, orderController.checkout);

// 2. Historial
router.get('/history', isAuth, orderController.getHistory);

// 3. Detalle de una orden
router.get('/:orderId', isAuth, orderController.getOrderDetails);

module.exports = router;