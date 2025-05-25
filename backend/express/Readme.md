 # Guía de uso del proyecto
 
 Este proyecto incluye un servidor que puede ejecutarse con Node.js. A continuación se detallan los comandos disponibles y cómo ponerlo en marcha.
 
 ---
 
## Importante

Para que el backend funcione correctamente será necesario modificar el archivo db.js con la dirección a la base de datos y el archivo jwt.js con el secreto.

## Comandos disponibles
 
 ### `npm install` o `npm i`
 
 Instala todas las dependencias necesarias del servidor indicadas en el archivo `package.json`.
 
 ```bash
 npm install
 ```
 
 ---
 
 ### `npm start` o `node app.js`
 
 Inicia el servidor. Asegúrate de haber instalado primero las dependencias.
 
 ```bash
 npm start
 # o también
 node app.js
 ```
 
 ---
 
 ### Nota sobre tests
 
 Actualmente no hay pruebas configuradas. Si planeas añadir tests, puedes actualizar el script `"test"` en el `package.json` con el framework que prefieras (como Jest, Mocha, etc.).
 
 ```json
 "scripts": {
   "test": "echo \\"Error: no test specified\\" && exit 1"
 }
 ```
 
 Puedes reemplazar esa línea por un comando real más adelante.
 
 ---
 
 ## Requisitos
 
 - Node.js instalado en tu sistema.
 - Acceso a terminal o consola para ejecutar los comandos.
 
 ---
 
 Si necesitas personalizar más el proyecto o añadir nuevos scripts, puedes modificar el archivo `package.json` según tus necesidades.
