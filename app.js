const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const routerGlobal = require('./routes/routes.js'); // Correct path to the router file 
const { ConnectionDatabaseAuthenticated } = require('./config/connectDatabase.js');
const cookieParser = require('cookie-parser');

// Importar modelos para establecer asociacione
require('./src/models/index.js'); // modelo de prodyctis

config();
const app = express();

app.use(cookieParser());

// Configuración CORS mejoradas
const corsOptions = {
    credentials: true,
    origin: process.env.ORIGIN || 'http://localhost:5173', // Usar valor de .env o por defecto localhost:4000
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors());

app.use(express.json()); // Poder obtener JSON de las peticiones
app.use(express.text()); // Poder obtener texto de las peticiones
app.use(express.urlencoded({ extended: true })); // Poder obtener datos de formularios
app.use(express.static('storage')); // Para poder acceder a la carpeta storage directamente
app.use('/usuarios', express.static('storage/usuarios')); // Servir imágenes de usuarios

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
});

// Verificar conexión a la base de datos
ConnectionDatabaseAuthenticated();

module.exports = { app };