const express = require('express');
const router = express.Router();

const db = require('../db.js');
const bcrypt = require('bcrypt');

const { jwt, JWT_SECRET } = require('../jwt.js');

// **LOGIN** 
router.post('/', async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Buscar usuario en la base de datos
        const usuario = await db.usuarios.findOne({ Email });
        if (!usuario) return res.status(401).json({ error: "Credenciales incorrectas" });

        // Comparar hash de contraseña
        const esValida = await bcrypt.compare(Password, usuario.HashPassword);
        if (!esValida) return res.status(401).json({ error: "Credenciales incorrectas" });

        // Generar token JWT y devolverlo
        const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "2h" });
        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión"});
    }
});

module.exports = router;