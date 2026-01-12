const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware de autenticación
const isAuth = (req, res, next) => {
    if (!req.session.user) return res.status(401).send('No autorizado');
    next();
};

// 1. OBTENER MÉTODOS DE PAGO DEL USUARIO
router.get('/', isAuth, async (req, res) => {
    const userId = req.session.user.id;
    
    try {
        const result = await db.query(
            'SELECT id, tipo, nombre_titular, ultimos_digitos, fecha_expiracion, es_principal FROM payment_methods WHERE user_id = $1 ORDER BY es_principal DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error obteniendo métodos de pago:', err);
        res.status(500).json({ error: 'Error en BD' });
    }
});

// 2. AGREGAR MÉTODO DE PAGO
router.post('/add', isAuth, async (req, res) => {
    const userId = req.session.user.id;
    const { tipo, nombre_titular, numero_tarjeta, fecha_expiracion, cvv, es_principal } = req.body;

    // Validaciones
    if (!tipo || !nombre_titular || !numero_tarjeta || !fecha_expiracion || !cvv) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!/^\d{16}$/.test(numero_tarjeta.replace(/\s/g, ''))) {
        return res.status(400).json({ error: 'Número de tarjeta inválido' });
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ error: 'CVV inválido' });
    }

    const ultimos_digitos = numero_tarjeta.slice(-4);

    try {
        // Si es principal, quitar el flag de los demás
        if (es_principal) {
            await db.query(
                'UPDATE payment_methods SET es_principal = FALSE WHERE user_id = $1',
                [userId]
            );
        }

        // Insertar nuevo método
        const result = await db.query(
            'INSERT INTO payment_methods (user_id, tipo, nombre_titular, ultimos_digitos, fecha_expiracion, es_principal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [userId, tipo, nombre_titular, ultimos_digitos, fecha_expiracion, es_principal || false]
        );

        res.status(201).json({ 
            msg: 'Método de pago agregado',
            id: result.rows[0].id 
        });
    } catch (err) {
        console.error('Error agregando método de pago:', err);
        res.status(500).json({ error: 'Error guardando método de pago' });
    }
});

// 3. ELIMINAR MÉTODO DE PAGO
router.delete('/:id', isAuth, async (req, res) => {
    const userId = req.session.user.id;
    const paymentId = req.params.id;

    try {
        const result = await db.query(
            'DELETE FROM payment_methods WHERE id = $1 AND user_id = $2',
            [paymentId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Método no encontrado' });
        }

        res.json({ msg: 'Método eliminado' });
    } catch (err) {
        console.error('Error eliminando método:', err);
        res.status(500).json({ error: 'Error en BD' });
    }
});

// 4. ESTABLECER COMO PRINCIPAL
router.put('/:id/principal', isAuth, async (req, res) => {
    const userId = req.session.user.id;
    const paymentId = req.params.id;

    try {
        // Quitar flag de todos
        await db.query(
            'UPDATE payment_methods SET es_principal = FALSE WHERE user_id = $1',
            [userId]
        );

        // Establecer nuevo principal
        const result = await db.query(
            'UPDATE payment_methods SET es_principal = TRUE WHERE id = $1 AND user_id = $2',
            [paymentId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Método no encontrado' });
        }

        res.json({ msg: 'Método principal actualizado' });
    } catch (err) {
        console.error('Error actualizando principal:', err);
        res.status(500).json({ error: 'Error en BD' });
    }
});

module.exports = router;