    // Router para clientes
    // Router para clientes
const express = require("express");
const router = express.Router();
const { getUsuarios } = require("./usuarios.controller");

router.get("/getUsuarios", getUsuarios);

const routerAuth = router; // Asignamos el router a la constante routerAuth

module.exports = routerAuth; // Exportamos como routerAuth