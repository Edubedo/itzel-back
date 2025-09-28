
const express = require("express");
const router = express.Router();

const { 
  getEstadisticasTurnosMensuales,
  getSucursales,
  getAreasPorSucursal,
  getServiciosPorArea,
  crearTurno,
  getTurnos, 
  atenderTurno,
  finalizarTurno,
  getEstadisticasTurnos,
  descargarTicketPDF
} = require("./turnos.controller");



console.log("¿Función definida?", typeof getEstadisticasTurnosMensuales);
router.get("/estadisticas-mensuales", getEstadisticasTurnosMensuales);



// Rutas para obtener catálogos
router.get('/sucursales', getSucursales);
router.get('/areas/:sucursalId', getAreasPorSucursal);
router.get('/servicios/:areaId', getServiciosPorArea);

// Rutas para turnos
router.get('/obtenerTurnos', getTurnos);
router.post('/crear', crearTurno);
router.put('/atender/:turnoId', atenderTurno);
router.put('/finalizar/:turnoId', finalizarTurno);

// Rutas para estadísticas
router.get('/estadisticas', getEstadisticasTurnos);

// Ruta para descargar ticket PDF
router.get('/ticket/:turnoId/pdf', descargarTicketPDF);



module.exports = router;
