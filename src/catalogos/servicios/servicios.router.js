
const express = require("express");
const router = express.Router();
const {
  getServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
  getServiciosStats,
} = require("./servicios.controller");


// Rutas para servicios
router.get("/", getServicios);                 // GET /api/servicios?page=1&limit=10...
router.get("/stats", getServiciosStats);       // GET /api/servicios/stats
router.get("/:id", getServicioById);           // GET /api/servicios/:id
router.post("/", createServicio);              // POST /api/servicios
router.put("/:id", updateServicio);            // PUT /api/servicios/:id
router.delete("/:id", deleteServicio);         // DELETE /api/servicios/:id

module.exports = router;
