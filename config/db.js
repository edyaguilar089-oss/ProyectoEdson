const mysql = require('mysql2');

// Railway inyecta las variables de entorno automáticamente
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'novastore',
  // Configuraciones adicionales para producción
  connectTimeout: 60000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect(err => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
    throw err;
  }
  console.log('✅ Conectado a MySQL');
});

module.exports = db;