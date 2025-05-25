const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const archiver = require('archiver'); 

const { verificarToken, verificarTokenOpcional } = require('../jwt.js');
 
const db = require('../db.js');
const router = express.Router();

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage, defParamCharset: 'utf8' });

// Devuelve un id unico 
function randuuid(length = 36) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
} 

//Ruta para obtener los últimos 5 assets añadidos
router.get('/ultimos', async (req, res) => {
  try {
    const ultimosAssets = await db.assets
      .find({})
      .sort({ fecha: -1 }) // Orden descendente por fecha
      .limit(5)
      .toArray();

    res.json(ultimosAssets);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los últimos assets');
  }
});

// Ruta para obtener los 5 assets con más likes
router.get('/topLikes', async (req, res) => {
  try {
    const topAssets = await db.megustas.aggregate([
      {
        $group: {
          _id: "$assetId",
          totalLikes: { $sum: 1 }
        }
      },
      { $sort: { totalLikes: -1 } },
      { $limit: 5 },
      {
        $addFields: {
          assetObjId: { $toObjectId: "$_id" }
        }
      },
      {
        $lookup: {
          from: "assets",
          localField: "assetObjId",  // FIX aquí
          foreignField: "_id",
          as: "assetDetails"
        }
      },
      {
        $unwind: "$assetDetails"
      },
      {
        $project: {
          assetId: "$_id",
          totalLikes: 1,
          assetDetails: 1,
          _id: 0
        }
      }
    ]).toArray();

    res.json(topAssets);
  } catch (err) {
    console.error("Error en el endpoint /assets/topLikes:", err);
    res.status(500).send('Error al obtener los assets con más likes');
  }
});



// Ruta para crear un nuevo asset
router.post('/', verificarToken, upload.fields([
    { name: 'fotos' },
    { name: 'archivos' }
]), async (req, res) => {
    try {
        const assetId = randuuid(20); // Generar un ID único para el asset
        const assetDir = path.join(__dirname, '..', 'uploads', 'assets', assetId);
        const fotosDir = path.join(assetDir, 'fotos');
        const archivosDir = path.join(assetDir, 'archivos');

        // Crear carpetas
        await fs.ensureDir(fotosDir);
        await fs.ensureDir(archivosDir);

        const usuarioId = req.userID;
        const { titulo, descripcion, categoria, etiquetas = '', compatibilidad = '', privado, propiedades } = req.body;
 
        // Convertir cadenas en listas
        const listaEtiquetas = etiquetas.split(',').map(t => t.trim());
        const listaCompatibilidad = compatibilidad.split(',').map(c => c.trim());

        // Parsear las propiedades que vienen como una cadena JSON
        const propiedadesParsed = propiedades ? JSON.parse(propiedades) : [];

        // Inicializar metadatos
        const archivos = [];
        let totalPesoArchivos = 0;
        let totalArchivos = 0;
        const fecha = new Date().toISOString();

        // Guardar archivos
        if (req.files['archivos']) {
            for (let i = 0; i < req.files['archivos'].length; i++) {
                const archivo = req.files['archivos'][i]; 
                archivo.originalname = Buffer.from(archivo.originalname, 'latin1').toString('utf8');

                const rutaArchivo = path.join(archivosDir, archivo.originalname);
                await fs.writeFile(rutaArchivo, archivo.buffer);
                 
                // Obtener las propiedades correspondientes a este archivo (si existe)
                const propiedadesArchivo = propiedadesParsed[i] ? propiedadesParsed[i].propiedades : {};

                const archivoId = randuuid(20);
                archivos.push({
                    _id: archivoId,
                    nombre: archivo.originalname,
                    ruta: `/uploads/assets/${assetId}/archivos/${archivo.originalname}`,
                    peso: archivo.size,
                    formato: path.extname(archivo.originalname),
                    propiedades: propiedadesArchivo, // Asignar las propiedades al archivo
                });

                totalPesoArchivos += archivo.size;
                totalArchivos += 1;
            }
        }

        // Guardar fotos
        const fotos = [];
        if (req.files['fotos']) {
            for (const archivo of req.files['fotos']) {
                const fotoId = randuuid(20);
 
                archivo.originalname = Buffer.from(archivo.originalname, 'latin1').toString('utf8');
 
                const extension = path.extname(archivo.originalname);
                const nombreArchivo = `${fotoId}${extension}`;
                const rutaFoto = path.join(fotosDir, nombreArchivo);
                await fs.writeFile(rutaFoto, archivo.buffer);
                fotos.push({
                    _id: fotoId,
                    nombre: archivo.originalname,
                    ruta: `/uploads/assets/${assetId}/fotos/${nombreArchivo}`,
                    peso: archivo.size,
                    formato: extension,
                });
            }
        }
 
        // Crear documento en la base de datos
        const nuevoAsset = {
            _id: assetId,
            usuarioId,
            titulo,
            descripcion,
            categoria,
            etiquetas: listaEtiquetas,
            compatibilidad: listaCompatibilidad,
            privado: (privado === "false") ? false : true,
            archivos,
            fotos,
            fecha,
            totalArchivos: totalArchivos,
            pesoTotal: totalPesoArchivos,
        };

        await db.assets.insertOne(nuevoAsset);
        res.status(201).json({ mensaje: 'Asset creado con éxito', asset: nuevoAsset });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir asset' });
    }
});

// Ruta para eliminar un asset por ID
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const assetId = req.params.id;
        const usuarioId = req.userID;

        // Buscar el asset en la base de datos
        const asset = await db.assets.findOne({ _id: assetId });
        if (!asset) {
            return res.status(404).json({ error: 'Asset no encontrado' });
        }

        // Verificar si el asset pertenece al usuario
        if (asset.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este asset' });
        }

        // Eliminar los archivos asociados
        const assetDir = path.join(__dirname, '..', 'uploads', 'assets', assetId);
        await fs.remove(assetDir);  // Elimina todo el directorio y su contenido

        // Eliminar el asset de la base de datos
        await db.assets.deleteOne({ _id: assetId });

        res.status(200).json({ mensaje: 'Asset eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el asset' });
    }
});


// Ruta para editar un asset
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, categoria, etiquetas, compatibilidad, privado } = req.body;
        const usuarioId = req.userID;

        // Buscar el asset y validar que sea del usuario
        const asset = await db.assets.findOne({ _id: id });
        if (!asset) {
            return res.status(404).json({ error: 'Asset no encontrado' });
        }

        if (asset.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para editar este asset' });
        }

        // Construir datos actualizables
        const datosActualizados = {};

        if (titulo) datosActualizados.titulo = titulo;
        if (descripcion) datosActualizados.descripcion = descripcion;
        if (categoria) datosActualizados.categoria = categoria;
        if (typeof privado !== 'undefined') datosActualizados.privado = privado;
        if (etiquetas) {
            datosActualizados.etiquetas = etiquetas.split(',').map(e => e.trim());
        }
        if (compatibilidad) {
            datosActualizados.compatibilidad = compatibilidad.split(',').map(e => e.trim());
        }

        // Actualizar en la base de datos
        await db.assets.updateOne({ _id: id }, { $set: datosActualizados });

        // Devolver asset actualizado
        const assetActualizado = await db.assets.findOne({ _id: id });
        res.status(200).json({ mensaje: 'Asset actualizado con éxito', asset: assetActualizado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar asset' });
    }
});

// Ruta para obtener un asset por su ID
router.get('/:id/info', verificarTokenOpcional, async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del asset desde los parámetros de la URL
        const usuarioAutenticado = req.userID || null;

        // Buscar el asset por su ID
        const asset = await db.assets.findOne({ _id: id });

        // Verificar si el asset existe
        if (!asset) {
            return res.status(404).json({ error: 'Asset no encontrado' });
        }

        // Si el asset es privado y el usuario no es el propietario, denegar acceso
        if (asset.privado && asset.usuarioId !== usuarioAutenticado) {
            return res.status(403).json({ error: 'No tienes permiso para acceder a este asset, ' + usuarioAutenticado + " " + asset.usuarioId });
        }

        // Devolver el asset encontrado
        res.status(200).json(asset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el asset' });
    }
});

// Ruta para descargar un asset comprimido
router.get('/:id/descargar', verificarTokenOpcional, async (req, res) => {
    try {
        const assetId = req.params.id;
        const usuarioAutenticado = req.userID || null;

        // Buscar el asset
        const asset = await db.assets.findOne({ _id: assetId });
        if (!asset) {
            return res.status(404).json({ error: 'Asset no encontrado' });
        }

        // Validar permisos
        if (asset.privado && asset.usuarioId !== usuarioAutenticado) {
            return res.status(403).json({ error: 'No tienes permiso para descargar este asset' });
        }
 
        // Validar si hay archivos
        if (!asset.archivos || asset.archivos.length === 0) {
            return res.status(400).json({ error: 'Este asset no contiene archivos para descargar' });
        }

        // Registrar descarga si usuario está autenticado
        if (usuarioAutenticado) {
            try {
                await db.descargas.insertOne({
                    usuarioId: usuarioAutenticado,
                    titulo: asset.titulo,
                    assetId,
                    fecha: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error guardando la descarga:', err);
                // No cortamos la descarga si falla esto
            }
        }

        // Nombre del zip
        const nombreZip = `${asset.titulo || 'asset'}-${assetId}.zip`;

        res.setHeader('Content-Disposition', `attachment; filename="${nombreZip}"`);
        res.setHeader('Content-Type', 'application/zip');

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        // Añadir archivos al zip
        for (const archivo of asset.archivos) {
            const filePath = path.join(__dirname, '..', archivo.ruta);
            const nombreEnZip = path.basename(archivo.ruta);
            if (await fs.pathExists(filePath)) {
                archive.file(filePath, { name: nombreEnZip });
            }
        }

        archive.finalize();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar la descarga del asset' });
    }
});

// Ruta para obtener múltiples assets con filtros
router.get('/', verificarTokenOpcional, async (req, res) => {
    try {
        const usuarioAutenticado = req.userID || null;

        const limite = Math.min(parseInt(req.query.limite) || 12, 100); // Máximo 100
        const pagina = parseInt(req.query.pagina) || 1;
        const skip = (pagina - 1) * limite;
        
        const {
            categoria,
            etiquetas,
            titulo,
            compatibilidad,
            descripcion,
            usuario,
            // Los filtros extras que ahora recibiremos como arrays separados por coma
            calidad,
            canales,
            formatos,
            textura, 
            resolucion,
        } = req.query;

        const condicionesAND = [];

        // Filtro base según autenticación
        if (usuario) {
            condicionesAND.push({ usuarioId: usuario });
            condicionesAND.push({ privado: false });
        } else if (usuarioAutenticado) {
            condicionesAND.push({
                $or: [
                    { privado: false },
                    { usuarioId: usuarioAutenticado }
                ]
            });
        } else {
            condicionesAND.push({ privado: false });
        }

        // Categoria - parcial y case-insensitive
        if (categoria) {
            const categoriasArr = categoria.split(',').map(c => c.trim()).filter(Boolean);
            if (categoriasArr.length) {
                condicionesAND.push({
                    categoria: { $in: categoriasArr.map(c => new RegExp(c, 'i')) }
                });
            }
        }

        // Etiquetas - cada etiqueta debe encontrarse parcial y case-insensitive dentro del array etiquetas
        if (etiquetas) {
            const etiquetasArr = etiquetas.split(',').map(e => e.trim()).filter(Boolean);
            if (etiquetasArr.length) {
                condicionesAND.push({
                    $and: etiquetasArr.map(etq => ({
                        etiquetas: { $elemMatch: { $regex: new RegExp(etq, 'i') } }
                    }))
                });
            }
        }

        // Compatibilidad - es un array, se usa $in directo
        if (compatibilidad) {
            const compatibilidadArr = compatibilidad.split(',').map(c => c.trim()).filter(Boolean);
            if (compatibilidadArr.length) {
                condicionesAND.push({
                    compatibilidad: { $in: compatibilidadArr }
                });
            }
        }

        // Título o descripción - parcial y case-insensitive
        if (titulo) {
            const regexTitulo = new RegExp(titulo, 'i');
            condicionesAND.push({
                $or: [
                    { titulo: { $regex: regexTitulo } },
                    { descripcion: { $regex: regexTitulo } }
                ]
            });
        }

        // Si mandan descripción aparte, también lo buscamos parcialmente
        if (descripcion && !titulo) {
            const regexDescripcion = new RegExp(descripcion, 'i');
            condicionesAND.push({
                descripcion: { $regex: regexDescripcion }
            });
        }
 
        // Filtro calidad (en archivos.propiedades.calidad)
        if (calidad) { 
            condicionesAND.push({
                "archivos.propiedades.calidad": { $gte: calidad }
            }); 
        }
 
        // Filtro resolucion (en archivos.propiedades.resolucion)
        if (resolucion) {
            condicionesAND.push({
                archivos: {
                    $elemMatch: {
                        $or: [
                            { "propiedades.resolucionW": { $gt: Number(resolucion) } },
                            { "propiedades.resolucionH": { $gt: Number(resolucion) } }
                        ]
                    }
                }
            });
        } 

        // Filtro canales (en archivos.propiedades.canales)
        if (canales) {
            const canalesArr = canales.split(',').map(c => c.trim()).filter(Boolean);
            if (canalesArr.length) {
                condicionesAND.push({
                    archivos: {
                        $elemMatch: {
                            'propiedades.canales': { $in: canalesArr }
                        }
                    }
                });
            }
        }

        // Filtro formatos (en archivos.formato)
        if (formatos) {
            const formatosArr = formatos.split(',').map(f => f.trim()).filter(Boolean);
            if (formatosArr.length) {
                condicionesAND.push({
                    archivos: {
                        $elemMatch: {
                            formato: { $in: formatosArr }
                        }
                    }
                });
            }
        }

        // Filtro textura (en archivos.propiedades.textura)
        if (textura) {
            const texturaArr = textura.split(',').map(t => t.trim()).filter(Boolean);
            if (texturaArr.length) {
                condicionesAND.push({
                    archivos: {
                        $elemMatch: {
                            'propiedades.textura': { $in: texturaArr }
                        }
                    }
                });
            }
        }
 
        // Construcción filtro final
        const filtro = condicionesAND.length > 0 ? { $and: condicionesAND } : {};

        // Limitar resultados
        const limiteConsulta = Math.min(parseInt(limite) || 20, 100);

        // Consulta a DB 
        const [assets, total] = await Promise.all([
            db.assets
                .find(filtro)
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limiteConsulta)
                .toArray(),
            db.assets.countDocuments(filtro)
        ]);


        if (assets.length === 0) {
            return res.status(200).json({ mensaje: 'No se encontraron assets con los filtros especificados.' });
        }

        if (req.query.pagina) {
            return res.status(200).json({
                assets,
                paginas: Math.ceil(total / limite)
            });
        }
        res.status(200).json(assets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los assets' });
    }
});  

// Ruta para obtener solamente los assets del usuario autenticado
router.get('/mis-assets', verificarToken, async (req, res) => { 
    try {
        const usuarioId = req.userID;
        if (!usuarioId) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const limite = Math.min(parseInt(req.query.limite) || 12, 100); // Máximo 100
        const pagina = parseInt(req.query.pagina) || 1;
        const skip = (pagina - 1) * limite;
 
        const [assets, total] = await Promise.all([
            db.assets
                .find({ usuarioId })
                .sort({ fecha: -1 })
                .skip(skip)
                .limit(limite)
                .toArray(),
            db.assets.countDocuments({ usuarioId })
        ]);

        res.status(200).json({
            assets: assets, 
            paginas: Math.ceil(total / limite)
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tus assets' });
    }
});

// Ruta para obtener solamente los assets del usuario
router.get('/:userId', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.params.userId;
        if (!usuarioId) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const limite = Math.min(parseInt(req.query.limite) || 12, 100); // Máximo 100
        const pagina = parseInt(req.query.pagina) || 1;
        const skip = (pagina - 1) * limite;

        const [assets, total] = await Promise.all([
            db.assets
                .find({ usuarioId })
                .sort({ fecha: -1 })
                .skip(skip)
                .limit(limite)
                .toArray(),
            db.assets.countDocuments({ usuarioId })
        ]);
 
        res.status(200).json({
            assets: assets, 
            paginas: Math.ceil(total / limite)
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tus assets' });
    }
});

// Ruta para agregar nuevos archivos a un asset
router.post('/:id/archivos', verificarToken, upload.array('archivos'), async (req, res) => {
    try {
        const assetId = req.params.id;        
        const usuarioId = req.userID; 
        const { propiedades } = req.body; 
        const nuevosArchivos = [];

        const asset = await db.assets.findOne({ _id: assetId });
        if (!asset) {
            return res.status(404).json({ error: 'Asset no encontrado' });
        }

        if (asset.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este asset' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se subieron archivos' });
        }

        // Parsear las propiedades que vienen como una cadena JSON
        const propiedadesParsed = propiedades ? JSON.parse(propiedades) : [];

        const assetDir = path.join(__dirname, '..', 'uploads', 'assets', assetId);
        const archivosDir = path.join(assetDir, 'archivos');
        await fs.ensureDir(archivosDir);

        let nuevoPesoTotal = 0;
 
        // Guardar archivos 
        for (let i = 0; i < req.files.length; i++) {  
            const file = req.files[i];
 
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');


            const rutaArchivo = path.join(archivosDir, file.originalname);

            await fs.writeFile(rutaArchivo, file.buffer);

            // Obtener las propiedades correspondientes a este archivo (si existe)
            const propiedadesArchivo = propiedadesParsed[i] ? propiedadesParsed[i].propiedades : {};
  
            const archivoId = randuuid(20);
            const archivo = { 
                _id: archivoId,
                nombre: file.originalname,
                ruta: `/uploads/assets/${assetId}/archivos/${file.originalname}`,
                peso: file.size,
                formato: path.extname(file.originalname),
                propiedades: propiedadesArchivo, // Asignar las propiedades al archivo
            };

            nuevosArchivos.push(archivo);
            nuevoPesoTotal += file.size;
        }  

        // Actualizar asset: agregar archivos + actualizar metadatos
        await db.assets.updateOne(
            { _id: assetId },
            {
                $push: { archivos: { $each: nuevosArchivos } },
                $inc: {
                    pesoTotal: nuevoPesoTotal,
                    totalArchivos: nuevosArchivos.length
                }
            }
        );

        res.status(200).json({ mensaje: 'Archivos agregados correctamente', archivos: nuevosArchivos });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al agregar archivos al asset' });
    }
});

// Ruta para cambiar la visibilidad de un asset
router.post('/:id/visibilidad', verificarToken, async (req, res) => {
    try {
      const assetId = req.params.id; // usamos el id desde los params
      const usuarioId = req.userID;
  
      const asset = await db.assets.findOne({ _id: assetId });
      if (!asset) {
        return res.status(404).json({ error: 'Asset no encontrado' });
      }
  
      if (asset.usuarioId !== usuarioId) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este asset' });
      }
  
      const nuevoEstado = !asset.privado;
  
      await db.assets.updateOne(
        { _id: assetId },
        { $set: { privado: nuevoEstado } }
      );
  
      res.status(200).json({
        mensaje: nuevoEstado ? 'Asset ocultado correctamente' : 'Asset publicado correctamente',
        privado: nuevoEstado
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al cambiar la visibilidad del asset' });
    }
}); 

// Ruta para eliminar un archivo por ID
router.delete('/:id/archivos/:archivoId', verificarToken, async (req, res) => {
    try {
        const { id: assetId, archivoId } = req.params;
        const usuarioId = req.userID;

        // Buscar el asset con el archivo específico
        const asset = await db.assets.findOne(
            { _id: assetId, "archivos._id": archivoId },
            { projection: { usuarioId: 1, "archivos.$": 1 } }
        );

        if (!asset || !asset.archivos || asset.archivos.length === 0) {
            return res.status(404).json({ error: 'Archivo no encontrado en el asset' });
        }

        if (asset.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este asset' });
        }

        const archivo = asset.archivos[0];
        const filePath = path.join(__dirname, '..', archivo.ruta);

        // Eliminar el archivo del sistema de archivos
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
        }

        // Actualizar documento: quitar archivo y restar metadatos
        await db.assets.updateOne(
            { _id: assetId },
            {
                $pull: { archivos: { _id: archivoId } },
                $inc: {
                    pesoTotal: -archivo.peso,
                    totalArchivos: -1
                }
            }
        );

        res.status(200).json({
            mensaje: 'Archivo eliminado correctamente',
            archivoEliminado: {
                _id: archivoId,
                nombre: archivo.nombre,
                ruta: archivo.ruta
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el archivo del asset' });
    }
});

// Ruta para agregar fotos a un asset
router.post('/:id/fotos', verificarToken, upload.array('fotos'), async (req, res) => {
    try {
        const assetId = req.params.id;
        const usuarioId = req.userID;
        const nuevasFotos = [];

        const asset = await db.assets.findOne({ _id: assetId });
        if (!asset) {
            return res.status(404).json({ error: 'Asset no encontrado' });
        }

        if (asset.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este asset' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se subieron fotos' });
        }

        const assetDir = path.join(__dirname, '..', 'uploads', 'assets', assetId);
        const fotosDir = path.join(assetDir, 'fotos');
        await fs.ensureDir(fotosDir);

        let pesoTotalNuevas = 0;

        for (const file of req.files) {
            const fotoId = randuuid(20);
 
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
 
            const ext = path.extname(file.originalname);
            const nombreArchivo = `${fotoId}${ext}`;
            const rutaCompleta = path.join(fotosDir, nombreArchivo);

            await fs.writeFile(rutaCompleta, file.buffer);

            const foto = {
                _id: fotoId,
                nombre: file.originalname,
                ruta: `/uploads/assets/${assetId}/fotos/${nombreArchivo}`,
                peso: file.size,
                formato: ext
            };

            nuevasFotos.push(foto);
            pesoTotalNuevas += file.size;
        }

        await db.assets.updateOne(
            { _id: assetId },
            {
                $push: { fotos: { $each: nuevasFotos } },
                $inc: {
                    pesoTotal: pesoTotalNuevas,
                    totalArchivos: nuevasFotos.length
                }
            }
        );

        res.status(200).json({ mensaje: 'Fotos agregadas correctamente', fotos: nuevasFotos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al agregar fotos al asset' });
    }
});

// Ruta para eliminar una foto por ID
router.delete('/:id/fotos/:fotoId', verificarToken, async (req, res) => {
    try {
        const { id: assetId, fotoId } = req.params;
        const usuarioId = req.userID;

        const asset = await db.assets.findOne(
            { _id: assetId, "fotos._id": fotoId },
            { projection: { usuarioId: 1, "fotos.$": 1 } }
        );

        if (!asset || !asset.fotos || asset.fotos.length === 0) {
            return res.status(404).json({ error: 'Foto no encontrada en el asset' });
        }

        if (asset.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este asset' });
        }

        const foto = asset.fotos[0];
        const filePath = path.join(__dirname, '..', foto.ruta);

        // Eliminar del sistema de archivos
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
        }

        // Actualizar documento: quitar foto y restar metadatos
        await db.assets.updateOne(
            { _id: assetId },
            {
                $pull: { fotos: { _id: fotoId } },
                $inc: {
                    pesoTotal: -foto.peso,
                    totalArchivos: -1
                }
            }
        );

        res.status(200).json({
            mensaje: 'Foto eliminada correctamente',
            fotoEliminada: {
                _id: fotoId,
                nombre: foto.nombre,
                ruta: foto.ruta
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar la foto del asset' });
    }
});


module.exports = router;
