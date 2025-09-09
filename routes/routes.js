
const express = require("express");
const router = express.Router();

// router.use("/auth", require("../src/core/auth/auth.router")); // rutas de autenticacion

// RUTA PARA AREAS
router.use("/catalogos/areas", require("../src/catalogos/areas/areas.router")); // AREAS


// ROUTER DE SECCIONES  
module.exports = router;