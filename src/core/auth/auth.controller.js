const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ConfiguracionUsuariosModel = require('../../models/configuracion_usuarios.model');

const SECRET_KEY = process.env.JWT_SECRET || "SECRET";
const SALT_ROUNDS = 10; // Número de rondas para bcrypt

const loginUsuario = async (req, res) => {
    console.log("req.body: ", req.body)
    const { s_usuario, s_contrasena } = req.body;
    try {
        // Detectar si s_usuario es un email (contiene @) o un nombre de usuario
        const isEmail = s_usuario.includes('@');
        const whereCondition = isEmail ?
            { s_correo_electronico: s_usuario } :
            { s_nombre: s_usuario }; // Buscar por nombre si no es email

        console.log("whereCondition: ", whereCondition)
        const usuario = await ConfiguracionUsuariosModel.findOne({
            where: whereCondition,
            attributes: [
                'ck_usuario',
                's_nombre',
                's_correo_electronico',
                's_password',
                'i_tipo_usuario'
            ]
        });

        if (!usuario) {
            console.log("Usuario no encontrado");
            return res.status(404).json({ message: "Usuario o correo electrónico no encontrado", code: "USER_NOT_FOUND" });
        }

        console.log("Usuario encontrado:", usuario.s_nombre);

        // Comparar la contraseña encriptada
        const isPasswordValid = await bcrypt.compare(s_contrasena, usuario.s_password);
        console.log("Contraseña válida:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("Contraseña incorrecta");
            return res.status(401).json({ message: "Contraseña incorrecta", code: "WRONG_PASSWORD" });
        }

        // Generar token JWT incluyendo tipo_usuario en el payload
        const tokenPayload = {
            uk_usuario: usuario.ck_usuario,
            s_usuario: usuario.s_nombre, // Usar nombre como identificador de usuario
            s_nombre: usuario.s_nombre,
            tipo_usuario: usuario.i_tipo_usuario || 3 // Por defecto Asesor
        };

        const token = jwt.sign(
            tokenPayload,
            SECRET_KEY,
            { expiresIn: "3d" }
        );

        let dataRetornarUsuario = {
            uk_usuario: usuario.ck_usuario,
            s_nombre: usuario.s_nombre,
            s_usuario: usuario.s_nombre,
            s_correo_electronico: usuario.s_correo_electronico,
            tipo_usuario: usuario.i_tipo_usuario || 3, // Incluir tipo_usuario en la respuesta
            token
        }

        return res.status(200).json({ message: "Login exitoso", ...dataRetornarUsuario });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

const registerUsuario = async (req, res) => {
    const { s_usuario, s_contrasena, s_correo_electronico, s_nombre } = req.body;
    try {
        const existingUser = await ConfiguracionUsuariosModel.findOne({
            where: { s_correo_electronico }
        });
        if (existingUser) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado" });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(s_contrasena, SALT_ROUNDS);

        const newUser = await ConfiguracionUsuariosModel.create({
            s_nombre,
            s_password: hashedPassword,
            s_correo_electronico,
            i_tipo_usuario: 3, // Por defecto es cliente
            s_rfc: 'TEMP000000000', // Valor temporal
            s_curp: 'TEMP000000000', // Valor temporal
            s_domicilio: 'No especificado', // Valor temporal
            ck_sistema: '00000000-0000-0000-0000-000000000000' // UUID temporal
        });

        // Generar token JWT para el nuevo usuario
        const tokenPayload = {
            uk_usuario: newUser.ck_usuario,
            s_usuario: newUser.s_nombre,
            s_nombre: newUser.s_nombre,
            tipo_usuario: newUser.i_tipo_usuario || 3
        };

        const token = jwt.sign(
            tokenPayload,
            SECRET_KEY,
            { expiresIn: "3d" }
        );

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            uk_usuario: newUser.ck_usuario,
            s_nombre: newUser.s_nombre,
            s_usuario: newUser.s_nombre,
            s_correo_electronico: newUser.s_correo_electronico,
            tipo_usuario: newUser.i_tipo_usuario,
            token
        });
    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

const logoutUsuario = async (req, res) => {
    return res.status(200).json({ message: "Logout exitoso" });
};

const protectedInUsuario = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Verificar el token
        return res.status(200).json({ message: "Acceso permitido", user: decoded });
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado", error });
    }
};

const refreshToken = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token no proporcionado",
            error: "UNAUTHORIZED"
        });
    }

    try {
        // Verificar el token actual (aunque esté desactualizado, debe ser válido)
        const decoded = jwt.verify(token, SECRET_KEY);

        // Obtener datos actualizados del usuario desde la base de datos
        const usuario = await ConfiguracionUsuariosModel.findOne({
            where: {
                ck_usuario: decoded.uk_usuario,
                ck_estatus: 'ACTIVO'
            },
            attributes: [
                'ck_usuario',
                's_nombre',
                's_correo_electronico',
                'i_tipo_usuario'
            ]
        });

        if (!usuario) {
            return res.status(404).json({
                message: "Usuario no encontrado o inactivo",
                error: "USER_NOT_FOUND"
            });
        }

        // Generar nuevo token con datos actualizados
        const tokenPayload = {
            uk_usuario: usuario.ck_usuario,
            s_usuario: usuario.s_nombre,
            s_nombre: usuario.s_nombre,
            tipo_usuario: usuario.i_tipo_usuario || 3
        };

        const newToken = jwt.sign(
            tokenPayload,
            SECRET_KEY,
            { expiresIn: "3d" }
        );

        const dataRetornarUsuario = {
            uk_usuario: usuario.ck_usuario,
            s_nombre: usuario.s_nombre,
            s_usuario: usuario.s_nombre,
            s_correo_electronico: usuario.s_correo_electronico,
            tipo_usuario: usuario.i_tipo_usuario || 3,
            token: newToken
        };

        return res.status(200).json({
            message: "Token actualizado exitosamente",
            ...dataRetornarUsuario
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expirado. Inicie sesión nuevamente",
                error: "TOKEN_EXPIRED"
            });
        }

        return res.status(401).json({
            message: "Token inválido",
            error: "INVALID_TOKEN"
        });
    }
};

module.exports = {
    loginUsuario,
    registerUsuario,
    logoutUsuario,
    protectedInUsuario,
    refreshToken
};