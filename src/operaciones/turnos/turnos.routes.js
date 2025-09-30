
const express = require("express");
const router = express.Router();

const { 
  getSucursales,
  getAreasPorSucursal,
  getServiciosPorArea,
  crearTurno,
  getTurnos, 
  atenderTurno,
  finalizarTurno,
  descargarTicketPDF
} = require("./turnos.controller");

// Rutas para obtener catálogos
router.get('/sucursales', getSucursales);
router.get('/areas/:sucursalId', getAreasPorSucursal);
router.get('/servicios/:areaId', getServiciosPorArea);

// Rutas para turnos
router.get('/obtenerTurnos', getTurnos);
router.post('/crear', crearTurno);
router.put('/atender/:turnoId', atenderTurno);
router.put('/finalizar/:turnoId', finalizarTurno);


// Ruta para descargar ticket PDF
router.get('/ticket/:turnoId/pdf', descargarTicketPDF);

module.exports = router;
