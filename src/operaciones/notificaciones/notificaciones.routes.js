import { Router } from "express";
const router = Router();

// Obtener todas las notificaciones
router.get("/", getNotificaciones);

// Marcar una notificación como leída
router.put("/:id/leida", marcarComoLeida);

export default router;
