
const express = require("express");
const router = express.Router();

// Ruta de prueba para verificar que las rutas funcionen
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Las rutas están funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Importar router de autenticación
router.use("/auth", require("../src/core/auth/auth.router"));

// RUTA PARA AREAS
router.use("/catalogos/areas", require("../src/catalogos/areas/areas.router"));

// RUTA PARA SERVICIOS
router.use("/catalogos/servicios", require("../src/catalogos/servicios/servicios.router"));

// RUTA PARA USUARIOS
router.use("/catalogos/usuarios", require("../src/catalogos/usuarios/usuarios.router"));

// ROUTER DE TURNOS
router.use("/operaciones/turnos", require("../src/operaciones/turnos/turnos.routes"));

//ROUTER PARA SUCURSALES
router.use("/sucursales", require("../src/catalogos/sucursales/sucursales.router"));

module.exports = router;