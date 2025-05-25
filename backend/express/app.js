const db = require('./db.js');

const express = require('express'); 
const fs = require('fs');
const path = require('path');
const cors = require('cors');  

const rutaLogin = require('./req/Login.js');
const rutaRegistro = require('./req/Registro.js');
const rutaUsuario = require('./req/Usuario.js');
const rutaAssets = require('./req/Assets.js');
const rutaColecciones = require('./req/Colecciones.js')
const rutaComentarios = require('./req/Comentarios.js')
const rutaMegustas = require('./req/Megustas.js')

const { verificarToken } = require('./jwt.js');

const app = express();
const port = 4000;
  
// Desactivar CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
  
app.use(express.json());

app.use('/login', rutaLogin);
app.use('/register', rutaRegistro);
app.use('/user', rutaUsuario);
app.use('/assets', rutaAssets);
app.use('/colecciones', rutaColecciones);
app.use('/megustas', rutaMegustas);
app.use('/comentarios', rutaComentarios);

// Permitir acceso a fotos pero no archivos
app.use('/uploads/assets/:id/fotos', (req, res, next) => {
  const fotosPath = path.join(__dirname, 'uploads', 'assets', req.params.id, 'fotos');

  fs.access(fotosPath, fs.constants.F_OK, (err) => {
    if (err) {
      // No existe la ruta
      return res.status(404).send('Fotos no encontradas');
    }

    // Servir archivos estáticos
    express.static(fotosPath)(req, res, next);
  });
});

// Permitir acceso a archivos con token
app.use('/uploads/assets/:id/archivos', verificarToken, async (req, res, next) => {
    try {
        // Buscar el asset por su ID
        const asset = await db.assets.findOne({ _id: req.params.id });

        // Verificar si el asset existe
        if (!asset) {
            return res.status(404).json({ error: 'Asset no encontrado' });
        }

        // Obtener el usuario autenticado desde el middleware
        const usuarioAutenticado = req.usuario?.id;

        // Si el asset es privado y el usuario no es el propietario, denegar acceso
        if (asset.privado && asset.usuarioId !== usuarioAutenticado) {
            return res.status(403).json({
                error: 'No tienes permiso para acceder a este asset',
                detalles: `${usuarioAutenticado} != ${asset.usuarioId}`
            });
        } 

        const archivo = decodeURIComponent(req.path.split('/').pop());
        const archivoPath = path.join(__dirname, 'uploads', 'assets', req.params.id, 'archivos', archivo);
        
        res.sendFile(archivoPath);
    } catch (error) {
        console.error('Error al acceder a los archivos del asset:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
}); 

async function conectarDB() {
    await db.conectarDB();
}

// Después de cargar todas tus rutas (importarlas y usarlas con app.use)
app._router.stack.forEach((middleware) => {
    if (middleware.route) { // Rutas normales
      console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // Rutas en un router separado
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route) {
          console.log(`${Object.keys(route.methods).join(', ').toUpperCase()} ${route.path}`);
        }
      });
    }
  });


app.listen(port, () => {
    conectarDB(); // Conectar base de datos antes de exportar la app
    console.log(`🚀 Servidor escuchando en http://localhost:${port}`); 
})
 
module.exports = app;
