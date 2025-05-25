const { ObjectId } = require("mongodb");
const { verificarToken } = require('../jwt.js');

const express = require('express');
const router = express.Router();

const db = require('../db.js');

// Configuración de multer para guardar los archivos en memoria
const multer = require('multer'); 
const storage = multer.memoryStorage();  // Guarda los archivos en memoria
const upload = multer({ storage, defParamCharset: 'utf8' });  // Configuración de multer con la opción de almacenamiento

const bcrypt = require('bcrypt');

// OBTENER FOTO DEL USUARIO AUTENTICADO
router.get('/foto', verificarToken, async (req, res) => {
    try { 
        const usuario = await db.usuarios.findOne(
            { _id: new ObjectId(req.userID) },
            { projection: { FotoPerfil: 1 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        // Devolver el usuario
        res.json({
            FotoPerfil: usuario.FotoPerfil // esto es base64
        });
    } catch (error) { 
        res.status(500).json({ error: "Error al obtener foto de usuario" });
    }
});

// OBTENER DATOS DEL USUARIO AUTENTICADO
router.get('/', verificarToken, async (req, res) => {
    try { 
        const usuario = await db.usuarios.findOne(
            { _id: new ObjectId(req.userID) },
            { projection: { Nombre: 1, Apellidos: 1, Email: 1 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        // Devolver el usuario
        res.json({
            Nombre: usuario.Nombre,
            Apellidos: usuario.Apellidos,
            Email: usuario.Email,
        });
    } catch (error) { 
        res.status(500).json({ error: "Error al obtener usuario" });
    }
});

// EDITAR DATOS USUARIO AUTENTICADO
router.put('/', verificarToken, upload.single('FotoPerfil'), async (req, res) => {
    try {  
        const { Nombre, Apellidos, Email, Password, OldPassword} = req.body;

        // Verificar que todos los campos requeridos estén presentes
        const usuariosFields = {};
        if (Nombre) usuariosFields.Nombre = Nombre;
        if (Apellidos) usuariosFields.Apellidos = Apellidos;
        if (Email) usuariosFields.Email = Email;

        const FotoPerfil = req.file;  // Accedemos al archivo subido 
        if (FotoPerfil) {
            const mimeType = FotoPerfil.mimetype; // por ejemplo, 'image/jpeg'
            const base64Data = FotoPerfil.buffer.toString('base64');
            usuariosFields.FotoPerfil = `data:${mimeType};base64,${base64Data}`;
        }
  
        if (Password && OldPassword){
            const usuario = await db.usuarios.findOne({ _id: new ObjectId(req.userID) },);
            const esValida = await bcrypt.compare(OldPassword, usuario.HashPassword);
            if(esValida){
                if (Password != OldPassword) { 
                    // Generar hash y salt de la contraseña
                    const SaltPassword = await bcrypt.genSalt(10);
                    const HashPassword = await bcrypt.hash(Password, SaltPassword); 
                    usuariosFields.HashPassword = HashPassword;
                    usuariosFields.SaltPassword = SaltPassword;
                } else {
                    res.status(400).json({ error: "La nueva contraseña no puede ser la misma que la anterior." });
                    return;
                }
            } else {
                res.status(403).json({ error: "Contraseña incorrecta"});
                return;
            }
        } 

        const result = await db.usuarios.updateOne(
            { _id: new ObjectId(req.userID) },
            { $set: usuariosFields }
        );
        
        if (result.modifiedCount === 1) {
            const updatedUser = await db.usuarios.findOne({ _id: new ObjectId(req.userID) });
            res.json(updatedUser);
        } else {
            res.json({msg: "No hubo cambios"}); // No hubo cambios pero todo está bien
        }

    } catch (error) {
        res.status(500).json({ error: "Error al editar los datos del usuario", detalle: error.message });
    }
});

// ELIMINAR EL USUARIO AUTENTICADO
router.delete('/', verificarToken, async (req, res) => {        
    try {
        const usuarios = await db.usuarios.findOne({ _id: new ObjectId(req.params.id)});
        
        if (!usuarios) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        
        // Verificar si el usuario es propietario de la usuario
        if (usuarios.userId !== new ObjectId(req.userID)) {
            return res.status(401).json({ msg: 'No autorizado' });
        }
        
        const result = await db.usuarios.deleteOne({ _id: req.params.id });
        
        if (result.deletedCount === 1) {
            await db.ajustes.deleteOne({ UserID: new ObjectId(req.params.id) });
            res.json({ msg: 'Usuario eliminado' });
        } else {
            throw new Error('Error al eliminar el usuario');
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para obtener historial de descargas del usuario autenticado
router.get('/descargas', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.userID;

        // Opcional: soporte para paginación con query params
        const limite = Math.min(parseInt(req.query.limite) || 20, 100);
        const pagina = parseInt(req.query.pagina) || 1;
        const skip = (pagina - 1) * limite;

        const [historial, total] = await Promise.all([
            db.descargas
                .find({ usuarioId })
                .sort({ fecha: -1 })
                .skip(skip)
                .limit(limite)
                .toArray(),
            db.descargas.countDocuments({ usuarioId })
        ]);
 
        res.status(200).json({
            historial: historial, 
            paginas: Math.ceil(total / limite)
        });  
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial de descargas' });
    }
});

/////////////////////////////////////////////////////////
// ENDPOINTS PARA LOS AJUSTES VISUALES DE LOS USUARIOS //
/////////////////////////////////////////////////////////

// OBTENER AJUSTES DEL USUARIO AUTENTICADO
router.get('/settings', verificarToken, async (req, res) => {
    try {
        const ajustesUsuario = await db.ajustes.findOne({ UserID: req.userID });

        if (!ajustesUsuario) {
            return res.status(404).json({ error: "Ajustes no encontrados" });
        }

        res.json(ajustesUsuario);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los ajustes" });
    }
});

// CREAR AJUSTES DEL USUARIO AUTENTICADO
router.post('/settings', verificarToken, async (req, res) => {
    try {
        const ajustesUsuario = await db.ajustes.insertOne({
            UserID: req.userID,
            Theme: 0,
            Font: 0,
        });

        res.json(ajustesUsuario);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los ajustes" });
    }
});

// EDITAR AJUSTES DEL USUARIO AUTENTICADO
router.put('/settings', verificarToken, async (req, res) => {
    try { 
        // Convertir explícitamente los valores a números
        const updatedTheme = req.body.Theme ? Number(req.body.Theme) : null;
        const updatedFont = req.body.Font ? Number(req.body.Font) : null;
      
        const updatedSettings = await db.ajustes.updateOne(
            { UserID: new ObjectId(req.userID) }, 
            { $set: {
                Theme: updatedTheme,
                Font: updatedFont, 
            }
            }
        );
        
        if (updatedSettings.matchedCount === 0) {
            return res.status(404).json({ error: "Ajustes no encontrados" });
        }
        
        // Obtener los ajustes actualizados para devolver
        const settings = await db.ajustes.findOne({ UserID: req.userID });
        res.json(settings);
    
    } catch (error) {
        res.status(500).json({ error: "Error al editar los ajustes", details: error.message });
    }
});


// **OBTENER DATOS DE UN USUARIO ESPECÍFICO POR ID**
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "ID de usuario no válido" });
        }
        
        const usuario = await db.usuarios.findOne(
            { _id: new ObjectId(userId) },
            { projection: { Nombre: 1, Apellidos: 1 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
  
        // Devolver el usuario sin incluir el email por privacidad
        res.json({
            _id: usuario._id,
            Nombre: usuario.Nombre,
            Apellidos: usuario.Apellidos, 
        });
 
    } catch (error) { 
        console.error("Error al obtener datos del usuario:", error);
        res.status(500).json({ error: "Error al obtener datos del usuario" });
    }
});

// **OBTENER FOTO DE UN USUARIO ESPECÍFICO POR ID**
router.get('/foto/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "ID de usuario no válido" });
        }
        
        const usuario = await db.usuarios.findOne(
            { _id: new ObjectId(userId) },
            { projection: { FotoPerfil: 1 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
  
        // Devolver el usuario sin incluir el email por privacidad
        res.json({
            FotoPerfil: usuario.FotoPerfil
        });
 
    } catch (error) { 
        console.error("Error al obtener foto del usuario:", error);
        res.status(500).json({ error: "Error al obtener foto del usuario" });
    }
});

module.exports = router;