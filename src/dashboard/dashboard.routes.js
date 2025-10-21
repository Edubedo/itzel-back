// src/dashboard/dashboard.routes.js
const express = require("express");
const router = express.Router();
const {
  getTurnosDelDia,
  getServiciosMensuales,
  getClientesDelDia,
  getEstadisticasTurnosMensuales
} = require("./dashboard.controller");


router.get("/turnos/estadisticas/hoy", getTurnosDelDia);
router.get("/servicios-mensuales", getServiciosMensuales);
router.get("/clientes/del-dia", getClientesDelDia);
router.get("/turnos/estadisticas-mensuales", getEstadisticasTurnosMensuales);


module.exports = router;
