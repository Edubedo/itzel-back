<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const { 
    getAllUsuarios, 
    getUsuarioById, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario, 
    getUsuariosStats,
    upload 
} = require("./usuarios.controller");
const authMiddleware = require("../../../middlewares/authMiddleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para usuarios
router.get("/", getAllUsuarios);
router.get("/stats", getUsuariosStats);
router.get("/:id", getUsuarioById);
router.post("/", upload.single('s_foto'), createUsuario);
router.put("/:id", upload.single('s_foto'), updateUsuario);
router.delete("/:id", deleteUsuario);

module.exports = router; 
=======
    // Router para clientes
    // Router para clientes
const express = require("express");
const router = express.Router();
const { getUsuarios } = require("./usuarios.controller");

router.get("/getUsuarios", getUsuarios);

const routerAuth = router; // Asignamos el router a la constante routerAuth

module.exports = routerAuth; // Exportamos como routerAuth
>>>>>>> 9a1d9348dc1e30f31e01f64cc56a6e8501da84b1
