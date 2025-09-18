const express = require("express");
const router = express.Router();
const { 
    getAllAreas, 
    getAreaById, 
    createArea, 
    updateArea, 
    deleteArea, 
    getAreasStats,
    getSucursales 
} = require("./areas.controller");
const authMiddleware = require("../../../middlewares/authMiddleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para áreas
router.get("/", getAllAreas);
router.get("/stats", getAreasStats);
router.get("/sucursales", getSucursales);
router.get("/:id", getAreaById);
router.post("/", createArea);
router.put("/:id", updateArea);
router.delete("/:id", deleteArea);

module.exports = router;