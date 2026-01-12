const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      console.error('DB error categories:', err);
      return res.status(500).json({ error: 'Error en BD' });
    }
    res.json(results);
  });
});

module.exports = router;
