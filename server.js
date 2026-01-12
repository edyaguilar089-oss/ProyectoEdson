const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
// Railway asigna el puerto automáticamente
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'novastore_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/auth', require('./routes/auth.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('/products', require('./routes/products.routes'));
app.use('/categories', require('./routes/categories.routes'));
app.use('/cart', require('./routes/cart.routes'));
app.use('/orders', require('./routes/orders.routes'));
app.use('/payments', require('./routes/payments.routes'));
app.use('/ratings', require('./routes/rating.routes'));

// Landing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Ruta de salud para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});