const { Router } = require("express");
const { getTurnos, eliminarTurno, crearTurno } = require("./turnos.controller");

const router = Router();

// GET turnos por sucursal
router.get("/obtenerTurnos", getTurnos);

// POST crear turno

router.post("/crearTurnos", crearTurno);
// POST eliminar turno
router.post("/eliminarTurno", eliminarTurno);


module.exports = router;
