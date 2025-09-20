
const { Router } = require("express");
const { getTurnos, eliminarTurno, crearTurno, updateTurno } = require("./turnos.controller");

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


// PUT actualizar estado turno
router.put("/actualizarTurno/:id", updateTurno);


module.exports = router;
