    // Router para clientes
    // Router para clientes
const express = require("express");
const router = express.Router();
const { getAreas } = require("./areas.controller");

router.get("/getAreas", getAreas);

const routerAuth = router; // Asignamos el router a la constante routerAuth

module.exports = routerAuth; // Exportamos como routerAuth