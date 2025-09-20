const express = require('express');
const router = express.Router();

const {
  getTurnosPorSucursal,
  getTurnoActual,
  getProximosTurnos,
  atenderTurnoActual,
  terminarTurnoActual,
  finalizarAtencion,
} = require('./turnos.controller');

// Obtener todos los turnos de una sucursal
router.get('/:sucursalId', getTurnosPorSucursal);

// Obtener turno actual
router.get('/actual/:sucursalId', getTurnoActual);

// Obtener próximos turnos
router.get('/proximos/:sucursalId', getProximosTurnos);

// Acciones sobre el turno
router.post('/atenderTurnoActual/:id', atenderTurnoActual);
router.post('/terminarTurnoActual/:id', terminarTurnoActual);
router.post('/finalizarAtencion/:id', finalizarAtencion);

module.exports = router;
