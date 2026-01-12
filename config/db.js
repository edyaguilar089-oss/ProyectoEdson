const { Pool } = require('pg');

// Configuración para Supabase con IPv4 forzado
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // IMPORTANTE: Forzar IPv4
  host: process.env.DB_HOST || extractHostFromUrl(process.env.DATABASE_URL),
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Configuración adicional
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Función para extraer el host de la URL
function extractHostFromUrl(url) {
  if (!url) return null;
  const match = url.match(/@([^:]+):/);
  return match ? match[1] : null;
}

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err);
});

module.exports = pool;