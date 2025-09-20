
const express = require("express");
const router = express.Router();

// Importar router de autenticación
router.use("/auth", require("../src/core/auth/auth.router")); // rutas de autenticacion
// RUTA PARA AREAS
router.use("/catalogos/areas", require("../src/catalogos/areas/areas.router")); // AREAS

<<<<<<< HEAD
// RUTA PARA SERVICIOS
router.use("/catalogos/servicios", require("../src/catalogos/servicios/servicios.router")); // SERVICIOS

// RUTA PARA USUARIOS
router.use("/catalogos/usuarios", require("../src/catalogos/usuarios/usuarios.router")); // USUARIOS

// ROUTER DE SECCIONES 

router.use("/operaciones/turnos", require("../src/operaciones/turnos/turnos.routes")); // rutas de autenticacion

//ROUTER PARA SUCURSALES

router.use("/sucursales", require("../src/catalogos/sucursales/sucursales.router"));
=======
// RUTA PARA USUARIOS // api/catalogos/usuarios/getUsuarios 
router.use("/catalogos/usuarios", require("../src/catalogos/usuarios/usuarios.router")); // USUARIOS




>>>>>>> 9a1d9348dc1e30f31e01f64cc56a6e8501da84b1

module.exports = router;