const db = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo categorías:', err);
    res.status(500).send('Error categorías');
  }
};