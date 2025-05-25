const express = require('express');
const router = express.Router();

const { verificarToken, verificarTokenOpcional } = require('../jwt.js');
const db = require('../db.js');

/**
 * Estructura de un comentario:
 * {
 *   userId: String (requerido),
 *   assetId: String (requerido),
 *   text: String (requerido),
 *   createdAt: Date (default: Date.now())
 * }
 */

// Función para validar un comentario
const validateComment = (comment) => {
    if (!comment.userId) {
      throw new Error('El ID de usuario es requerido');
    }
    
    if (!comment.assetId) {
      throw new Error('El ID del asset es requerido');
    }
    
    if (!comment.text) {
      throw new Error('El texto del comentario es requerido');
    }
    
    return true;
  };
  
  // Función para crear un nuevo objeto de comentario
const createComment = (data) => {
    data = data || {};
    const comment = {
        userId: data.userId ,
        assetId: data.assetId ,
        text: data.text,
        createdAt: data.createdAt || new Date()
    };

    validateComment(comment);
    return comment;
};

  
// @route   POST /api/comentarios
// @desc    Crear un nuevo comentario
// @access  Private
router.post('/', verificarToken, async (req, res) => {
    try {
        const { assetId, text } = req.body;
        
        if (!assetId || !text) {
            return res.status(400).json({ msg: 'Por favor incluye el ID del asset y el texto del comentario' });
        }
        
        const newComment = createComment({
            userId: req.userID,
            assetId,
            text
        });
        
        const result = await db.comentarios.insertOne(newComment);
        
        if (result.acknowledged) {
            const insertedComment = await db.comentarios.findOne({ _id: result.insertedId });
            res.json(insertedComment);
        } else {
            throw new Error('Error al crear el comentario');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   GET /api/comentarios/asset/:assetId
// @desc    Obtener comentarios de un asset específico
// @access  Public
router.get('/asset/:assetId', verificarTokenOpcional, async (req, res) => {
    try {
        // Buscar todos los comentarios para un asset específico
        const comentarios = await db.comentarios
        .find({ assetId: req.params.assetId })
        .sort({ createdAt: -1 }) // Ordenar por fecha, más recientes primero
        .toArray();
        
        res.json(comentarios);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   PUT /comentarios/:id
// @desc    Actualizar un comentario
// @access  Private
router.put('/:id', verificarToken, async (req, res) => {
    const { text } = req.body;

    // Crear objeto con los campos a actualizar
    const comentarioFields = {};
    if (text) comentarioFields.text = text;   
         
    try {
        const comentario = await db.comentarios.findOne({ _id: req.params.id });
        
        if (!comentario) {
            return res.status(404).json({ msg: 'Comentario no encontrada' });
        }
        
        // Verificar si el usuario es propietario de la comentario
        if (comentario.userId !== req.userID) {
            return res.status(401).json({ msg: 'No autorizado' });
        }
        
        const result = await db.comentarios.updateOne(
            { _id: req.params.id },
            { $set: comentarioFields }
        );
        
        if (result.modifiedCount === 1) {
            const updatedCollection = await db.comentarios.findOne({ _id: req.params.id });
            res.json(updatedCollection);
        } else {
            res.json(comentario); // No hubo cambios pero todo está bien
        }
    } catch (error) {
        if (error.message === 'ID de comentario inválido') {
            return res.status(404).json({ msg: 'ID de comentario inválido' });
        }
        res.status(500).send('Error en el servidor');
    }
});

// @route   DELETE /api/comentarios/:id
// @desc    Eliminar una comentario
// @access  Private
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const comentario = await db.comentarios.findOne({ _id: req.params.id });
        
        if (!comentario) {
            return res.status(404).json({ msg: 'El comentario no existe' });
        }
        
        // Verificar si el usuario es propietario de la comentario
        if (comentario.userId !== req.userID) {
            return res.status(401).json({ msg: 'No autorizado' });
        }
        
        const result = await db.comentarios.deleteOne({ _id: req.params.id });
        
        if (result.deletedCount === 1) {
            res.json({ msg: 'Comentario eliminado' });
        } else {
            throw new Error('Error al eliminar el comentario');
        }
    } catch (error) {
        if (error.message === 'ID de comentario inválido') {
            return res.status(404).json({ msg: 'ID de comentario inválido' });
        }
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
