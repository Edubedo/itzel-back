const OperacionTurnosModel = require("../../models/operacion_turnos.model");

// Arreglo en memoria para mantener las notificaciones y su estado
let notificaciones = [];

// Obtener notificaciones
const getNotificaciones = async (req, res) => {
  try {
    const { uk_usuario, ck_sucursal } = req.query;

    if (!uk_usuario) {
      return res.status(400).json({ success: false, message: "Falta uk_usuario" });
    }

    // Buscar turnos activos
    let turnos = [];
    try {
      turnos = await OperacionTurnosModel.findAll({
        where: { ck_estatus: "ACTIVO" },
        order: [["d_fecha_creacion", "ASC"]],
      });
    } catch (dbError) {
      console.warn("Error al consultar DB, usando datos de prueba:", dbError.message);
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

    // Actualizar lista de notificaciones sin duplicar
    turnos.forEach((t) => {
      const existe = notificaciones.find((n) => n.id === t.ck_turno);
      if (!existe) {
        notificaciones.push({
          id: t.ck_turno,
          mensaje: `Nuevo turno: ${t.i_numero_turno}`,
          area: t.ck_area,
          servicio: t.ck_servicio,
          sucursal: t.ck_sucursal,
          sucursalId: t.ck_sucursal,
          fecha: t.d_fecha_creacion,
          leida: false,
        });
      }
    });

    // 🔹 Filtrar notificaciones por sucursal
    let notisFiltradas = notificaciones;
    if (ck_sucursal) {
      notisFiltradas = notificaciones.filter(
        (n) => String(n.sucursalId) === String(ck_sucursal)
      );
    }

    res.json({ success: true, notificaciones: notisFiltradas });
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
    const noti = notificaciones.find((n) => n.id === id);
    if (!noti) {
      return res.status(404).json({ success: false, message: "Notificación no encontrada" });
    }

    noti.leida = true;

    res.json({ success: true, message: "Notificación marcada como leída", notificacion: noti });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res.status(500).json({
      success: false,
      message: "Error al marcar notificación como leída",
      error: error.message,
    });
  }
};

module.exports = { getNotificaciones, marcarComoLeida };
