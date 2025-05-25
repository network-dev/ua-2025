const express = require('express');
const router = express.Router();

const { jwt, JWT_SECRET } = require('../jwt.js');
const db = require('../db.js');

// Configuración de multer para guardar los archivos en memoria
const multer = require('multer'); 
const storage = multer.memoryStorage();  // Guarda los archivos en memoria
const upload = multer({ storage, defParamCharset: 'utf8' });  // Configuración de multer con la opción de almacenamiento

const bcrypt = require('bcrypt');

// **REGISTRO**
router.post('/', upload.single('FotoPerfil'), async (req, res) => {
  try {
        const { Nombre, Apellidos, Email, Password } = req.body;

        // Verificar que todos los campos requeridos estén presentes
        if (!Nombre) return res.status(400).json({ error: "El campo 'Nombre' es obligatorio" });
        if (!Apellidos) return res.status(400).json({ error: "El campo 'Apellidos' es obligatorio" });
        if (!Email) return res.status(400).json({ error: "El campo 'Email' es obligatorio" });
        if (!Password) return res.status(400).json({ error: "El campo 'Password' es obligatorio" });

        const FotoPerfil = req.file;  // Accedemos al archivo subido
        let FotoPerfil64 = "";
        if (FotoPerfil) {
            const mimeType = FotoPerfil.mimetype; // por ejemplo, 'image/jpeg'
            const base64Data = FotoPerfil.buffer.toString('base64');
            FotoPerfil64 = `data:${mimeType};base64,${base64Data}`;
        }

        // Verificar si el email ya está registrado
        const existe = await db.usuarios.findOne({ Email });
        if (existe) return res.status(400).json({ error: "El email ya está en uso" });

        // Generar hash y salt de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(Password, salt);

        // Almacenar el usuario en la base de datos
        const resultado = await db.usuarios.insertOne({
            Nombre, Apellidos, Email,
            HashPassword: hashPassword,
            SaltPassword: salt,
            FotoPerfil: FotoPerfil ? FotoPerfil64 : null
        });

        await db.ajustes.insertOne({
            UserID: resultado.insertedId,
            Theme: 0,
            Font: 0,
        });
 
        // Generar token JWT y devolverlo
        const token = jwt.sign({ id: resultado.insertedId }, JWT_SECRET, { expiresIn: "2h" });

        res.status(201).json({ token, mensaje: "Usuario registrado. Verifique su email." });

    } catch (error) {
        res.status(400).json({ error: "Error al registrar usuario", detalle: error.message });
    }
});

module.exports = router;