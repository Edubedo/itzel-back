// src/routes/operaciones/turnos/notificaciones.router.ts
import { Router } from "express";
import Turno from "../../models/operacion_turnos.model";

const router = Router();

// GET /api/notificaciones
router.get("/", async (req, res) => {
  try {
    const { rol, area, sucursal } = req.query;

    // Trae todos los turnos pendientes
    const turnos = await Turno.findAll({
      order: [["fecha", "ASC"]],
      where: { estado: "espera" }, // solo pendientes
    });

    const ahora = new Date();
    const notificaciones: any[] = [];

    turnos.forEach((t) => {
      // Notificación de nuevo turno
      notificaciones.push({
        id: t.id,
        mensaje: `Nuevo turno: ${t.numero}`,
        area: t.area,
        servicio: t.servicio,
        sucursal: t.sucursal,
        fecha: t.fecha,
        leida: false,
      });

      // Recordatorio: simulamos que todos tienen >10 min
      // Cambiar 15 a cálculo real cuando quieras producción
      const minutosPendientes = 15; // temporal para prueba
      if (minutosPendientes > 10) {
        notificaciones.push({
          id: t.id + 100000, // id único para recordatorio
          mensaje: `Recuerda atender al turno: ${t.numero}`,
          area: t.area,
          servicio: t.servicio,
          sucursal: t.sucursal,
          fecha: t.fecha,
          leida: false,
        });
      }
    });

    // Filtrado según rol
    let filtradas = notificaciones;
    if (rol === "4") {
      // Asesor: solo su área y sucursal
      filtradas = filtradas.filter(
        (n) =>
          (!area || n.area === area) &&
          (!sucursal || n.sucursal === sucursal)
      );
    } else if (rol === "2") {
      // Ejecutivo: solo su área y sucursal
      filtradas = filtradas.filter(
        (n) =>
          (!area || n.area === area) &&
          (!sucursal || n.sucursal === sucursal)
      );
    } else if (rol === "1") {
      // Admin: todas de la sucursal
      filtradas = filtradas.filter((n) => !sucursal || n.sucursal === sucursal);
    }

    res.json({ success: true, notificaciones: filtradas });
  } catch (err) {
    console.error("Error al obtener notificaciones:", err);
    res.status(500).json({ success: false, error: "Error al obtener notificaciones" });
  }
});

export default router;
