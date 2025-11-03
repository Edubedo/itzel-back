const express = require("express");
const router = express.Router();
const { 
    getAllUsuarios, 
    getUsuarioById, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario, 
    getUsuariosStats,
    verifyEmail,
    upload 
} = require("./usuarios.controller");
const authMiddleware = require("../../../middlewares/authMiddleware");

// Ruta pública de verificación de email (NO requiere autenticación)
router.get("/verify-email", verifyEmail);

// Aplicar middleware de autenticación a todas las rutas siguientes
router.use(authMiddleware);

// Rutas para usuarios
router.get("/", getAllUsuarios);
router.get("/stats", getUsuariosStats);
router.get("/:id", getUsuarioById);
router.post("/", upload.single('s_foto'), createUsuario);
router.put("/:id", upload.single('s_foto'), updateUsuario);
router.delete("/:id", deleteUsuario);

module.exports = router; 
