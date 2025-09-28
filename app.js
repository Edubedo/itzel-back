const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const routerGlobal = require('./routes/routes.js'); // Correct path to the router file 
const { ConnectionDatabaseAuthenticated } = require('./config/connectDatabase.js');
const cookieParser = require('cookie-parser');

// Importar modelos para establecer asociaciones
require('./src/models/index.js');

config();
const app = express();

// Configuración de CORS CORRECTA para desarrollo
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests desde el frontend y sin origin (Postman, etc.)
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            callback(null, true); // En desarrollo permitir todo
        }
    },
    credentials: true, // IMPORTANTE: Permitir cookies y credenciales
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(cookieParser());

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json()); // Poder obtener JSON de las peticiones
app.use(express.text()); // Poder obtener texto de las peticiones
app.use(express.urlencoded({ extended: true })); // Poder obtener datos de formularios
app.use(express.static('storage')); // Para poder acceder a la carpeta storage directamente
app.use('/usuarios', express.static('storage/usuarios')); // Servir imágenes de usuarios
app.use('/public', express.static('public')); // Servir archivos públicos (logos, etc.)
app.use('/api/configuracion_sistema', require('./src/configuracion/configuracion_sistema.router'));

// Rutas
app.use('/api', routerGlobal); // Llamas a las rutas


// Middleware de manejo de errores
app.use((err, req, res, next) => {
    if (!res.headersSent) {
        res.status(500).json({ error: "Error del servidor" });
    }
});


process.on('unhandledRejection', (reason, promise) => {
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${port}`);
    console.log(`📡 CORS configurado correctamente para desarrollo`);
});

// Verificar conexión a la base de datos
ConnectionDatabaseAuthenticated();

module.exports = { app };