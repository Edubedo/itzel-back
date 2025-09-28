const express = require("express");
const router = express.Router();
const { loginUsuario, registerUsuario, logoutUsuario, protectedInUsuario, refreshToken } = require("./auth.controller");
const passwordController = require("./password.controller");
const authMiddleware = require("../../../middlewares/authMiddleware");

router.post("/login", loginUsuario);
router.post("/register", registerUsuario);
router.post("/logout", logoutUsuario);
router.post("/protected", authMiddleware, protectedInUsuario);
router.post("/refresh-token", refreshToken);

//Rutas de recuperación de contraseña
router.post("/forgot-password", passwordController.forgotPassword);
router.post("/verify-code", passwordController.verifyCode);


module.exports = router;