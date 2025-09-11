const express = require("express");
const router = express.Router();
const { loginUsuario, registerUsuario, logoutUsuario, protectedInUsuario, refreshToken } = require("./auth.controller");
const authMiddleware = require("../../../middlewares/authMiddleware");

router.post("/login", loginUsuario);
router.post("/register", registerUsuario);
router.post("/logout", logoutUsuario);
router.post("/protected", authMiddleware, protectedInUsuario);
router.post("/refresh-token", refreshToken);

const routerAuth = router; // Asignamos el router a la constante routerAuth

module.exports = routerAuth; // Exportamos como routerAuth