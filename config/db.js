const { Pool } = require('pg');

// Conexión simple usando Connection Pooler de Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL (Supabase Pooler)');
});

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err);
});

module.exports = pool;