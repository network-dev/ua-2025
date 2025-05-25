const express = require('express');
const router = express.Router();

const { verificarToken, verificarTokenOpcional } = require('../jwt.js');
const db = require('../db.js');

/**
 * Estructura de un me gusta:
 * {
 *   UserId: String (requerido),
 *   assetId: String (requerido),
 *   text: String (requerido),
 *   createdAt: Date (default: Date.now())
 * }
 */
  
  // Función para crear un nuevo objeto de me gusta
const createLike = (data) => {
    data = data || {};
    const like = {
        UserId: data.UserId ,
        assetId: data.assetId
    };
    return like;
};

// @route   POST /megusta
// @desc    Crear un nuevo me gusta
// @access  Private
router.post('/', verificarToken, async (req, res) => {
    try {
        const { assetId } = req.body;
        
        if (!assetId) {
            return res.status(400).json({ msg: 'Por favor incluye el ID del asset' });
        }

        const like = await db.megustas
        .findOne({ assetId: req.params.assetId, UserId: req.userID })

        if(like){
            return res.status(401).json({ msg: 'El like ya existe.' });
        }
        else{
            const newLike = createLike({
                UserId: req.userID,
                assetId
            });
            
            const result = await db.megustas.insertOne(newLike);
            
            if (result.acknowledged) {
                const insertedLike = await db.megustas.findOne({ _id: result.insertedId });
                res.json(insertedLike);
            } else {
                throw new Error('Error al crear el me gusta');
            }
        }
        
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   GET /megustas/asset/:assetId
// @desc    Obtener me gustas de un asset específico
// @access  Public
router.get('/asset/:assetId', verificarTokenOpcional, async (req, res) => {
    try {
        const likes = await db.megustas
        .find({ assetId: req.params.assetId })
        .toArray();
        
        res.json(likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   GET /megustas/user/:assetId
// @desc    Obtener me gustas de un usuario específico
// @access  Public
router.get('/user/:assetId', verificarToken, async (req, res) => {
    try {
        const like = await db.megustas
        .findOne({ assetId: req.params.assetId, UserId: req.userID })
        
        if(!like)
            return res.status(404).json({msg: 'Este usuario no ha puesto like a este asset.'})
        else
            res.json(like);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   DELETE /megustas/
// @desc    Eliminar un me gusta
// @access  Private
router.delete('/', verificarToken, async (req, res) => {
    try {
        const { assetId } = req.body;
        
        if (!assetId) {
            return res.status(400).json({ msg: 'Por favor incluye el ID del asset' });
        }
        
        const result = await db.megustas.deleteOne({ UserId: req.userID, assetId: assetId });
        
        if (result.deletedCount === 1) {
            res.json({ msg: 'Me gusta eliminado' });
        } else {
            return res.status(404).json({ msg: 'El me gusta no existe' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;