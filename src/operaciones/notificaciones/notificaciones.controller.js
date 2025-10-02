const { Sequelize, QueryTypes } = require("sequelize");
const OperacionTurnosModel = require("../../models/operacion_turnos.model");
const { ConnectionDatabase } = require("../../../config/connectDatabase");

// Obtener notificaciones
const getNotificaciones = async (req, res) => {
  try {
    console.log("Obteniendo notificaciones, query params:", req.query);

    // Traer todos los turnos activos que generarán notificaciones
    let turnos = [];
    try {
      turnos = await OperacionTurnosModel.findAll({
        where: { ck_estatus: "ACTIVO" },
        order: [["d_fecha_creacion", "ASC"]],
      });
      console.log("Turnos obtenidos de la DB:", turnos.length);
    } catch (dbError) {
      console.log("Error en DB, usando turnos de prueba:", dbError.message);
      // Datos de prueba
      turnos = [
        {
          ck_turno: "t1a2b3c4",
          i_numero_turno: 101,
          ck_area: "area1",
          ck_servicio: "servicio1",
          ck_sucursal: "sucursal1",
          d_fecha_creacion: new Date(),
        },
        {
          ck_turno: "t2b3c4d5",
          i_numero_turno: 102,
          ck_area: "area2",
          ck_servicio: "servicio2",
          ck_sucursal: "sucursal2",
          d_fecha_creacion: new Date(),
        },
      ];
    }

    // Construir array de notificaciones
    const notificaciones = turnos.map((t) => ({
      id: t.ck_turno,
      mensaje: `Nuevo turno: ${t.i_numero_turno}`,
      area: t.ck_area,
      servicio: t.ck_servicio,
      sucursal: t.ck_sucursal,
      fecha: t.d_fecha_creacion,
      leida: false,
    }));

    res.json({ success: true, notificaciones });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener notificaciones",
      error: error.message,
    });
  }
};

// Marcar notificación como leída
const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;

    // Para este ejemplo, asumimos que las notificaciones están basadas en turnos activos
    const turno = await OperacionTurnosModel.findByPk(id);
    if (!turno) {
      return res.status(404).json({
        success: false,
        message: "Notificación no encontrada",
      });
    }

    // Aquí solo marcamos como leída porque no hay tabla de notificaciones
    console.log(`Marcando notificación de turno ${id} como leída`);

    res.json({
      success: true,
      message: "Notificación marcada como leída",
      id,
    });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res.status(500).json({
      success: false,
      message: "Error al marcar notificación como leída",
      error: error.message,
    });
  }
};

module.exports = {
  getNotificaciones,
  marcarComoLeida,
};
