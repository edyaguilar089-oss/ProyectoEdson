const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. LEER USUARIOS (GET)
exports.getUsers = (req, res) => {
    const { rol } = req.query; 
    let sql = 'SELECT id, nombre, email, rol FROM users';
    let params = [];

    if (rol) {
        sql += ' WHERE rol = ?';
        params.push(rol);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error DB');
        }
        res.json(results);
    });
};

// 2. CREAR USUARIO (POST) <--- ¡ESTA ES LA QUE PROBABLEMENTE TE FALTA!
exports.createUser = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).send('Faltan datos obligatorios');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
        
        db.query(sql, [nombre, email, hashedPassword, rol], (err, result) => {
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).send('Correo duplicado');
                return res.status(500).send('Error al crear usuario');
            }
            res.status(201).send('Usuario creado');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error servidor');
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
            sql = 'UPDATE users SET nombre = ?, email = ?, password = ?, rol = ? WHERE id = ?';
            params = [nombre, email, hashedPassword, rol, id];
        } else {
            sql = 'UPDATE users SET nombre = ?, email = ?, rol = ? WHERE id = ?';
            params = [nombre, email, rol, id];
        }

        db.query(sql, params, (err, result) => {
            if (err) return res.status(500).send('Error al actualizar');
            res.send('Usuario actualizado');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en servidor');
    }
};

// 4. ELIMINAR USUARIO (DELETE)
exports.deleteUser = (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
        if(err) return res.status(500).send('Error al eliminar');
        res.sendStatus(200);
    });
};

// --- 5. REPORTE DE VENTAS (NUEVO) ---
exports.getSalesReport = (req, res) => {
    // Consulta 1: Historial de ventas detallado (Tabla)
    const sqlVentas = `
        SELECT 
            o.id as folio,
            DATE_FORMAT(o.fecha, '%d/%m/%Y %H:%i') as fecha,
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

    // Consulta 2: Ranking (Más y Menos vendido)
    const sqlRanking = `
        SELECT p.nombre, SUM(oi.cantidad) as total_vendido
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY total_vendido DESC
    `;

    db.query(sqlVentas, (err, ventas) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error obteniendo ventas');
        }

        db.query(sqlRanking, (err2, ranking) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send('Error obteniendo ranking');
            }

            // Identificar extremos
            const masVendido = ranking.length > 0 ? ranking[0] : null;
            const menosVendido = ranking.length > 0 ? ranking[ranking.length - 1] : null;

            res.json({
                historial: ventas,
                estadisticas: { masVendido, menosVendido }
            });
        });
    });
};