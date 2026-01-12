// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware de autenticación
const isAuth = (req, res, next) => {
    if (!req.session.user) return res.status(401).send('No autorizado');
    next();
};

// ============================================
// 1. OBTENER MÉTODOS DE PAGO DEL USUARIO
// ============================================
router.get('/', isAuth, (req, res) => {
    const userId = req.session.user.id;
    
    db.query(
        'SELECT id, tipo, nombre_titular, ultimos_digitos, fecha_expiracion, es_principal FROM payment_methods WHERE user_id = ? ORDER BY es_principal DESC',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error obteniendo métodos de pago:', err);
                return res.status(500).json({ error: 'Error en BD' });
            }
            res.json(results);
        }
    );
});

// ============================================
// 2. AGREGAR MÉTODO DE PAGO
// ============================================
router.post('/add', isAuth, (req, res) => {
    const userId = req.session.user.id;
    const { tipo, nombre_titular, numero_tarjeta, fecha_expiracion, cvv, es_principal } = req.body;

    // Validaciones básicas
    if (!tipo || !nombre_titular || !numero_tarjeta || !fecha_expiracion || !cvv) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar formato de tarjeta (16 dígitos)
    if (!/^\d{16}$/.test(numero_tarjeta.replace(/\s/g, ''))) {
        return res.status(400).json({ error: 'Número de tarjeta inválido' });
    }

    // Validar CVV (3-4 dígitos)
    if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ error: 'CVV inválido' });
    }

    // Solo guardamos los últimos 4 dígitos por seguridad
    const ultimos_digitos = numero_tarjeta.slice(-4);

    // Si es principal, quitamos el flag de los demás
    if (es_principal) {
        db.query(
            'UPDATE payment_methods SET es_principal = FALSE WHERE user_id = ?',
            [userId],
            (err) => {
                if (err) console.error('Error actualizando principal:', err);
            }
        );
    }

    // Insertar nuevo método
    db.query(
        'INSERT INTO payment_methods (user_id, tipo, nombre_titular, ultimos_digitos, fecha_expiracion, es_principal) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, tipo, nombre_titular, ultimos_digitos, fecha_expiracion, es_principal || false],
        (err, result) => {
            if (err) {
                console.error('Error agregando método de pago:', err);
                return res.status(500).json({ error: 'Error guardando método de pago' });
            }
            res.status(201).json({ 
                msg: 'Método de pago agregado',
                id: result.insertId 
            });
        }
    );
});

// ============================================
// 3. ELIMINAR MÉTODO DE PAGO
// ============================================
router.delete('/:id', isAuth, (req, res) => {
    const userId = req.session.user.id;
    const paymentId = req.params.id;

    db.query(
        'DELETE FROM payment_methods WHERE id = ? AND user_id = ?',
        [paymentId, userId],
        (err, result) => {
            if (err) {
                console.error('Error eliminando método:', err);
                return res.status(500).json({ error: 'Error en BD' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Método no encontrado' });
            }

            res.json({ msg: 'Método eliminado' });
        }
    );
});

// ============================================
// 4. ESTABLECER COMO PRINCIPAL
// ============================================
router.put('/:id/principal', isAuth, (req, res) => {
    const userId = req.session.user.id;
    const paymentId = req.params.id;

    // Primero quitar el flag de todos
    db.query(
        'UPDATE payment_methods SET es_principal = FALSE WHERE user_id = ?',
        [userId],
        (err) => {
            if (err) {
                console.error('Error actualizando:', err);
                return res.status(500).json({ error: 'Error en BD' });
            }

            // Luego establecer el nuevo principal
            db.query(
                'UPDATE payment_methods SET es_principal = TRUE WHERE id = ? AND user_id = ?',
                [paymentId, userId],
                (err2, result) => {
                    if (err2) {
                        console.error('Error:', err2);
                        return res.status(500).json({ error: 'Error en BD' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Método no encontrado' });
                    }

                    res.json({ msg: 'Método principal actualizado' });
                }
            );
        }
    );
});

module.exports = router;