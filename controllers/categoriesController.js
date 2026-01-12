const db = require('../config/db');

exports.getCategories = (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).send('Error categorías');
    res.json(results);
  });
};
