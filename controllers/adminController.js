const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. LEER USUARIOS (GET)
exports.getUsers = async (req, res) => {
    const { rol } = req.query;
    
    try {
        let sql = 'SELECT id, nombre, email, rol FROM users';
        let params = [];

        if (rol) {
            sql += ' WHERE rol = $1';
            params.push(rol);
        }

        const result = await db.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error obteniendo usuarios:', err);
        res.status(500).send('Error DB');
    }
};

// 2. CREAR USUARIO (POST)
exports.createUser = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).send('Faltan datos obligatorios');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id';
        
        const result = await db.query(sql, [nombre, email, hashedPassword, rol]);
        res.status(201).json({ msg: 'Usuario creado', userId: result.rows[0].id });
    } catch (error) {
        console.error('Error creando usuario:', error);
        if (error.code === '23505') { // Duplicate key
            return res.status(400).send('Correo duplicado');
        }
        res.status(500).send('Error al crear usuario');
    }
};

// 3. ACTUALIZAR USUARIO (PUT)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;

    try {
        let sql = '';
        let params = [];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql = 'UPDATE users SET nombre = $1, email = $2, password = $3, rol = $4 WHERE id = $5';
            params = [nombre, email, hashedPassword, rol, id];
        } else {
            sql = 'UPDATE users SET nombre = $1, email = $2, rol = $3 WHERE id = $4';
            params = [nombre, email, rol, id];
        }

        await db.query(sql, params);
        res.send('Usuario actualizado');
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).send('Error al actualizar');
    }
};

// 4. ELIMINAR USUARIO (DELETE)
exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error eliminando usuario:', err);
        res.status(500).send('Error al eliminar');
    }
};

// 5. REPORTE DE VENTAS
exports.getSalesReport = async (req, res) => {
    try {
        // Historial de ventas (PostgreSQL usa TO_CHAR en lugar de DATE_FORMAT)
        const sqlVentas = `
            SELECT 
                o.id as folio,
                TO_CHAR(o.fecha, 'DD/MM/YYYY HH24:MI') as fecha,
                p.nombre as producto,
                oi.cantidad,
                p.precio,
                (oi.cantidad * p.precio) as total,
                u.email as cliente
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            JOIN users u ON o.user_id = u.id
            ORDER BY o.fecha DESC
        `;

        // Ranking de productos
        const sqlRanking = `
            SELECT p.nombre, SUM(oi.cantidad) as total_vendido
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY total_vendido DESC
        `;

        const ventasResult = await db.query(sqlVentas);
        const rankingResult = await db.query(sqlRanking);

        const ventas = ventasResult.rows;
        const ranking = rankingResult.rows;

        const masVendido = ranking.length > 0 ? ranking[0] : null;
        const menosVendido = ranking.length > 0 ? ranking[ranking.length - 1] : null;

        res.json({
            historial: ventas,
            estadisticas: { masVendido, menosVendido }
        });
    } catch (err) {
        console.error('Error en reporte de ventas:', err);
        res.status(500).send('Error obteniendo reporte');
    }
};