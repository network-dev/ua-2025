const jwt = require('jsonwebtoken');
const JWT_SECRET = "supersecreto"; // Aquí es importante elegir un token seguro
  
// **MIDDLEWARE PARA AUTENTICACIÓN**
function verificarToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token inválido." });
        req.userID = decoded.id;
        next();
    });
}

function verificarTokenOpcional(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(); // Sin token

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err && decoded) {
            req.userID = decoded.id;
        } 
        next();
    });
}

module.exports = {
    jwt,
    JWT_SECRET,
    verificarToken,
    verificarTokenOpcional
};