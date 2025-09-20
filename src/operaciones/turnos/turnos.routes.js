
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
  getEstadisticasTurnos
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

// Rutas para estadísticas
router.get('/estadisticas', getEstadisticasTurnos);

module.exports = router;
