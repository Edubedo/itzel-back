    // Router para clientes
    // Router para clientes
const express = require("express");
const router = express.Router();
const { getServicios } = require("./servicios.controller");

router.get("/getServicios", getServicios);

const routerAuth = router; // Asignamos el router a la constante routerAuth

module.exports = routerAuth; // Exportamos como routerAuth