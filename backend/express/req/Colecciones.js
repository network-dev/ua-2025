const express = require('express');
const router = express.Router();

const { verificarToken } = require('../jwt.js');
const db = require('../db.js');

/**
 * Estructura de una colección:
 * {
 *   name: String (requerido),
 *   description: String (opcional),
 *   userId: String (requerido),
 *   assets: Array (default: []),
 *   createdAt: Date (default: Date.now())
 * }
 */

// Función para validar una colección
const validateCollection = (collection) => {
    if (!collection.name) {
        throw new Error('El nombre de la colección es requerido y debe ser un string');
    }

    if (!collection.userId) {
        throw new Error('El ID de usuario es requerido y debe ser un string');
    }

    return true;
};
  
// Función para crear un nuevo objeto de colección
const createCollection = (data) => {
    const collection = {
        name: data.name,
        description: data.description ? data.description : '',
        userId: data.userId,
        assets: data.assets || [],
        createdAt: data.createdAt || new Date()
    };

    validateCollection(collection);
    return collection;
};

// @route   GET /colecciones/mis-colecciones
// @desc    Obtener todas las colecciones de un usuario específico
// @access  Private
router.get('/mis-colecciones', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.userID;
        if (!usuarioId) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const limite = Math.min(parseInt(req.query.limite) || 20, 100); // Máximo 100
        const pagina = parseInt(req.query.pagina) || 1;
        const skip = (pagina - 1) * limite;

        const assets = await db.colecciones
            .find({ userId: usuarioId })
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(limite)
            .toArray();

        res.status(200).json(assets); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   GET /colecciones/user/:userId
// @desc    Obtener todas las colecciones de un usuario específico
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        console.log(req.params.userId);
        const collections = await db.colecciones.find({ userId: req.params.userId }).toArray();
        res.json(collections);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   GET /colecciones/:id
// @desc    Obtener una colección por su ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        
        try {
            const objectId = new ObjectId(req.params.id);
            const collection = await db.colecciones.findOne({ _id: objectId });
            
            if (!collection) {
                return res.status(404).json({ msg: 'Colección no encontrada' });
            }
            
            res.json(collection);
        } catch (error) {
            return res.status(404).json({ msg: 'ID de colección inválido' });
        }
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Colección no encontrada' });
        }
        res.status(500).send('Error en el servidor');
    }
});

// @route   POST /colecciones
// @desc    Crear una nueva colección
// @access  Private
router.post('/', verificarToken, async (req, res) => {
    const { name, description } = req.body;

    try {
        const newCollection = createCollection({
            name,
            description,
            userId: req.userID, // El middleware verificarToken agrega el usuario a req
            assets: [],
        });

        const result = await db.colecciones.insertOne(newCollection);

        if (result.acknowledged) {
            res.status(201).json({ enmsaje: 'Colección creado con éxito', collection: newCollection });
        } else {
            throw new Error('Error al crear la colección');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// @route   POST /colecciones/:id/assets
// @desc    Añadir un asset a una colección
// @access  Private
router.post('/:id/assets', verificarToken, async (req, res) => {
    try {
        
        const { ObjectId } = require('mongodb');
        
        try {
            const objectId = new ObjectId(req.params.id);
            const collection = await db.colecciones.findOne({ _id: objectId });
            
            if (!collection) {
                return res.status(404).json({ msg: 'Colección no encontrada' });
            }
            
            // Verificar si el usuario es propietario de la colección
            if (collection.userId !== req.userID) {
                return res.status(401).json({ msg: 'No autorizado' });
            }
            
            const { assetId } = req.body;

            const asset = await db.assets.findOne({ _id: assetId });
            if (!asset) {
                return res.status(400).json({ msg: 'El id del asset es incorrecto' });
            }
            
            // Verificar si el asset ya está en la colección
            if (collection.assets.includes(assetId)) {
                return res.status(400).json({ msg: 'El asset ya está en la colección' });
            }
            
            const result = await db.colecciones.updateOne(
                { _id: objectId },
                { $push: { assets: assetId } }
            );
            
            if (result.modifiedCount === 1) {
                const updatedCollection = await db.colecciones.findOne({ _id: objectId });
                res.json(updatedCollection);
            } else {
                throw new Error('Error al actualizar la colección');
            }
        } catch (error) {
            throw error;
        }
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Colección o asset no encontrado' });
        }
        res.status(500).send('Error en el servidor');
    }
});

// @route   PUT /colecciones/:id
// @desc    Actualizar una colección
// @access  Private
router.put('/:id', verificarToken, async (req, res) => {
    const { name, description } = req.body;

    // Crear objeto con los campos a actualizar
    const collectionFields = {};
    if (name) collectionFields.name = name;
    if (description !== undefined) collectionFields.description = description;

    try {
        const { ObjectId } = require('mongodb');
        
        try {
            const objectId = new ObjectId(req.params.id);
            const collection = await db.colecciones.findOne({ _id: objectId });
            
            if (!collection) {
                return res.status(404).json({ msg: 'Colección no encontrada' });
            }
            
            // Verificar si el usuario es propietario de la colección
            if (collection.userId !== req.userID) {
                return res.status(401).json({ msg: 'No autorizado' });
            }
            
            const result = await db.colecciones.updateOne(
                { _id: objectId },
                { $set: collectionFields }
            );
            
            if (result.modifiedCount === 1) {
                const updatedCollection = await db.colecciones.findOne({ _id: objectId });
                res.json(updatedCollection);
            } else {
                res.json(collection); // No hubo cambios pero todo está bien
            }
        } catch (error) {
            if (error.message === 'ID de colección inválido') {
                return res.status(404).json({ msg: 'ID de colección inválido' });
            }
            throw error;
        }
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Colección no encontrada' });
        }
        res.status(500).send('Error en el servidor');
    }
});

// @route   PUT /colecciones/:id/assets/:assetId
// @desc    Borrar un asset de una colección
// @access  Private
router.delete('/:id/assets/:assetId', verificarToken, async (req, res) => {
    try {
        
        const { ObjectId } = require('mongodb');
        
        try {
            const objectId = new ObjectId(req.params.id);
            const collection = await db.colecciones.findOne({ _id: objectId });
            
            if (!collection) {
                return res.status(404).json({ msg: 'Colección no encontrada' });
            }
            
            // Verificar si el usuario es propietario de la colección
            if (collection.userId !== req.userID) {
                return res.status(401).json({ msg: 'No autorizado' });
            }
            
            // Verificar si el asset está en la colección
            if (!collection.assets.includes(req.params.assetId)) {
                return res.status(404).json({ msg: 'Asset no encontrado en la colección' });
            }
            
            const result = await db.colecciones.updateOne(
                { _id: objectId },
                { $pull: { assets: req.params.assetId } }
            );
            
            if (result.modifiedCount === 1) {
                const updatedCollection = await db.colecciones.findOne({ _id: objectId });
                res.json(updatedCollection);
            } else {
                throw new Error('Error al actualizar la colección');
            }
        } catch (error) {
            if (error.message === 'ID de colección inválido') {
                return res.status(404).json({ msg: 'ID de colección inválido' });
            }
            throw error;
        }
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Colección o asset no encontrado' });
        }
        res.status(500).send('Error en el servidor');
    }
});

// @route   DELETE /colecciones/:id
// @desc    Eliminar una colección
// @access  Private
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        
        try {
            const objectId = new ObjectId(req.params.id);
            const collection = await db.colecciones.findOne({ _id: objectId });
            
            if (!collection) {
                return res.status(404).json({ msg: 'Colección no encontrada' });
            }
            
            // Verificar si el usuario es propietario de la colección
            if (collection.userId !== req.userID) {
                return res.status(401).json({ msg: 'No autorizado' });
            }
            
            const result = await db.colecciones.deleteOne({ _id: objectId });
            
            if (result.deletedCount === 1) {
                res.json({ msg: 'Colección eliminada' });
            } else {
                throw new Error('Error al eliminar la colección');
            }
        } catch (error) {
            if (error.message === 'ID de colección inválido') {
                return res.status(404).json({ msg: 'ID de colección inválido' });
            }
        throw error;
        }
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Colección no encontrada' });
        }
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;