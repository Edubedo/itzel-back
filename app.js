const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const routerGlobal = require('./routes/routes.js'); // Correct path to the router file 
const { ConnectionDatabaseAuthenticated } = require('./config/connectDatabase.js');
const cookieParser = require('cookie-parser');
const dashboardRoutes = require('./src/dashboard/dashboard.routes.js'); // Ruta al archivo de rutas



// Importar modelos para establecer asociaciones
require('./src/models/index.js');

config();
const app = express();



// Configuración de CORS para desarrollo y producción
const allowedOrigins = [
    'http://localhost:5173', // Frontend local
    'http://127.0.0.1:5173', // Frontend local alternativo
    'https://www.sistemaitzel.site', // Frontend producción
    'https://sistemaitzel.site' // Frontend producción sin www
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, mobile apps, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }
        
        // Permitir si está en la lista de orígenes permitidos
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // En desarrollo, permitir localhost
            if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
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

app.use(express.json({ limit: '10mb' })); 
app.use(express.text({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('storage')); // Para poder acceder a la carpeta storage directamente
app.use('/usuarios', express.static('storage/usuarios')); // Servir imágenes de usuarios
app.use('/public', express.static('public')); // Servir archivos públicos (logos, etc.)
app.use('/api/configuracion_sistema', require('./src/configuracion/configuracion_sistema.router'));

// Rutas
app.use('/api', routerGlobal); // Llamas a las rutas
app.use('/api/operaciones',dashboardRoutes);


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
    console.log(`📡 CORS configurado para desarrollo y producción`);
    console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

const serviciosRouter = require("./src/catalogos/servicios/servicios.router");
app.use("/api/servicios", serviciosRouter);



// Verificar conexión a la base de datos
ConnectionDatabaseAuthenticated();

// Middleware de debug para todas las rutas
app.use('/api/configuracion_sistema', (req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

module.exports = { app };
