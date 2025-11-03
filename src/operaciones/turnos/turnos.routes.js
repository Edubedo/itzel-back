
const express = require("express");
const router = express.Router();

const { 
  getSucursales,
  getSucursalesPorUsuario,
  getAreasPorSucursal,
  getAreasPorUsuario,
  getServiciosPorArea,
  crearTurno,
  getTurnos, 
  atenderTurno,
  finalizarTurno,
  getEstadisticasTurnos,
  descargarTicketPDF,
  notificaciones,
  marcarLeida,
  cancelarTurno,
  getTurnosPorArea
} = require("./turnos.controller");
const authMiddleware = require("../../../middlewares/authMiddleware");

//arreglo dash



// Rutas para obtener catálogos
router.get('/sucursales', getSucursales);
// Sucursales filtradas por usuario autenticado y rol
router.get('/sucursales-usuario', authMiddleware, getSucursalesPorUsuario);
router.get('/areas/:sucursalId', getAreasPorSucursal);
router.get('/areas-usuario/:sucursalId', authMiddleware, getAreasPorUsuario);
router.get('/turnos-por-area/:sucursalId', authMiddleware, getTurnosPorArea);
router.get('/servicios/:areaId', getServiciosPorArea);

// Rutas para turnos
router.get('/obtenerTurnos', authMiddleware, getTurnos);
router.post('/crear', crearTurno);
router.put('/atender/:turnoId', authMiddleware, atenderTurno);
router.put('/finalizar/:turnoId', authMiddleware, finalizarTurno);
router.delete('/cancelar/:id', cancelarTurno);

// Ruta para descargar ticket PDF
router.get('/ticket/:turnoId/pdf', descargarTicketPDF);


router.get('/notificaciones', notificaciones);
router.put('/leer/:id', marcarLeida );

//Estadisticas 
router.get('/estadisticas', getEstadisticasTurnos);


module.exports = router;
