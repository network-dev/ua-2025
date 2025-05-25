
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://"; // Aquí se escribe la dirección al cluster de DB Mongo
const client = new MongoClient(uri);

const db = {
    conectarDB,
    con: null,
    usuarios: null,
    colecciones: null,
    ajustes: null,
    assets: null,
    descargas: null
}; 
 
async function conectarDB() {
    try {
        await client.connect();
        db.con = client.db('miBaseDeDatos');
        
        if(!db.con) { 
            console.log("No se puede establecer conexión con mongo");
            return;
        }
        console.log("✅ Conectado a MongoDB");

        db.usuarios = db.con.collection('usuarios');
        db.colecciones = db.con.collection('colecciones');
        db.comentarios = db.con.collection('comentarios');
        db.megustas = db.con.collection('megustas');
        db.ajustes = db.con.collection('ajustes');
        db.assets = db.con.collection('assets');
        db.descargas = db.con.collection('descargas');

        if(!db.usuarios) console.log("Tabla usuarios no encontrada");
        if(!db.colecciones) console.log("Tabla colecciones no encontrada");
        if(!db.comentarios) console.log("Tabla comentarios no encontrada");
        if(!db.megustas) console.log("Tabla megustas no encontrada");
        if(!db.ajustes) console.log("Tabla ajustes no encontrada");  
        if(!db.assets) console.log("Tabla assets no encontrada");  
        if(!db.descargas) console.log("Tabla descargas no encontrada");
    } catch (error) {
        console.error("❌ Error al conectar a MongoDB", error);
    }
}
  
module.exports = db;