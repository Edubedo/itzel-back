const { Router } = require("express");
const { getTurnos, eliminarTurno, crearTurno, updateTurno } = require("./turnos.controller");

const router = Router();

// GET turnos por sucursal
router.get("/obtenerTurnos", getTurnos);

// POST crear turno

router.post("/crearTurnos", crearTurno);
// POST eliminar turno
router.post("/eliminarTurno", eliminarTurno);

// PUT actualizar estado turno
router.put("/actualizarTurno/:id", updateTurno);


module.exports = router;
