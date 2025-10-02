import { Router } from "express";
import { getNotificaciones, marcarComoLeida } from "../controllers/notificaciones.controller.js";

const router = Router();

// Obtener todas las notificaciones
router.get("/", getNotificaciones);

// Marcar una notificación como leída
router.put("/:id/leida", marcarComoLeida);

export default router;
