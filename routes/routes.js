
const express = require("express");
const router = express.Router();

// Importar router de autenticación
router.use("/auth", require("../src/core/auth/auth.router")); // rutas de autenticacion

// RUTA PARA AREAS // api/catalogos/areas/getAreas 
router.use("/catalogos/areas", require("../src/catalogos/areas/areas.router")); // AREAS


// ROUTER DE SECCIONES  
module.exports = router;