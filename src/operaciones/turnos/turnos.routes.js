
const express = require("express");
const router = express.Router();

const { 
  getSucursales,
  getSucursalesPorUsuario,
  getAreasPorSucursal,
  getServiciosPorArea,
  crearTurno,
  getTurnos, 
  atenderTurno,
  finalizarTurno,
  getEstadisticasTurnos,
  descargarTicketPDF,
  notificaciones,
  marcarLeida,
  cancelarTurno
} = require("./turnos.controller");
const authMiddleware = require("../../../middlewares/authMiddleware");

//arreglo dash



// Rutas para obtener catálogos
router.get('/sucursales', getSucursales);
// Sucursales filtradas por usuario autenticado y rol
router.get('/sucursales-usuario', authMiddleware, getSucursalesPorUsuario);
router.get('/areas/:sucursalId', getAreasPorSucursal);
router.get('/servicios/:areaId', getServiciosPorArea);

// Rutas para turnos
router.get('/obtenerTurnos', getTurnos);
router.post('/crear', crearTurno);
router.put('/atender/:turnoId', atenderTurno);
router.put('/finalizar/:turnoId', finalizarTurno);
router.delete('/cancelar/:id', cancelarTurno);

// Ruta para descargar ticket PDF
router.get('/ticket/:turnoId/pdf', descargarTicketPDF);


router.get('/notificaciones', notificaciones);
router.put('/leer/:id', marcarLeida );


module.exports = router;
