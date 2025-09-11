const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UsuariosModel = require("../../models/usuarios.model")

const SECRET_KEY = process.env.JWT_SECRET || "SECRET";
const SALT_ROUNDS = 10; // Número de rondas para bcrypt

const loginUsuario = async (req, res) => {
    const { s_usuario, s_contrasena } = req.body;
    try {
        // Detectar si s_usuario es un email (contiene @) o un nombre de usuario
        const isEmail = s_usuario.includes('@');
        const whereCondition = isEmail ? 
            { s_correo_electronico: s_usuario } : 
            { s_usuario: s_usuario };

        const usuario = await UsuariosModel.findOne({ 
            where: whereCondition,
            attributes: [
                'uk_usuario', 
                's_usuario', 
                's_nombre', 
                's_contrasena', 
                's_correo_electronico',
                'tipo_usuario',
                'uk_cliente'
            ]
        });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario o correo electrónico no encontrado" });
        }

        // Comparar la contraseña encriptada
        const isPasswordValid = await bcrypt.compare(s_contrasena, usuario.s_contrasena);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Generar token JWT incluyendo tipo_usuario y uk_cliente en el payload
        const tokenPayload = { 
            uk_usuario: usuario.uk_usuario, 
            s_usuario: usuario.s_usuario, 
            s_nombre: usuario.s_nombre,
            tipo_usuario: usuario.tipo_usuario || 3 // Por defecto Cliente
        };
        
        // Incluir uk_cliente en el token si el usuario es Cliente
        if (usuario.tipo_usuario === 3 && usuario.uk_cliente) {
            tokenPayload.uk_cliente = usuario.uk_cliente;
        }
        
        const token = jwt.sign(
            tokenPayload,
            SECRET_KEY,
            { expiresIn: "3d" }
        );

        let dataRetornarUsuario = {
            uk_usuario: usuario.uk_usuario,
            s_nombre: usuario.s_nombre,
            s_usuario: usuario.s_usuario,
            s_correo_electronico: usuario.s_correo_electronico,
            tipo_usuario: usuario.tipo_usuario || 3, // Incluir tipo_usuario en la respuesta
            token
        }

        return res.status(200).json({ message: "Login exitoso", ...dataRetornarUsuario });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor", error });
    }
};

const registerUsuario = async (req, res) => {
    const { s_usuario, s_contrasena, s_correo_electronico, s_nombre } = req.body;
    try {
        const existingUser = await UsuariosModel.findOne({ where: { s_usuario } });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(s_contrasena, SALT_ROUNDS);

        const newUser = await UsuariosModel.create({
            s_usuario,
            s_contrasena: hashedPassword,
            s_correo_electronico,
            s_nombre
        });

        // Generar token JWT para el nuevo usuario
        const token = jwt.sign(
            { id: newUser.id, s_usuario: newUser.s_usuario },
            SECRET_KEY,
            { expiresIn: "3d" }
        );

        return res.status(201).json({ message: "Usuario registrado exitosamente", token });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor", error });
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
        const usuario = await UsuariosModel.findOne({
            where: { 
                uk_usuario: decoded.uk_usuario,
                ck_estado: 'ACTIVO'
            },
            attributes: [
                'uk_usuario', 
                's_usuario', 
                's_nombre', 
                's_correo_electronico',
                'tipo_usuario',
                'uk_cliente'
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
            uk_usuario: usuario.uk_usuario, 
            s_usuario: usuario.s_usuario, 
            s_nombre: usuario.s_nombre,
            tipo_usuario: usuario.tipo_usuario || 3
        };
        
        // Incluir uk_cliente en el token si el usuario es Cliente
        if (usuario.tipo_usuario === 3 && usuario.uk_cliente) {
            tokenPayload.uk_cliente = usuario.uk_cliente;
        }
        
        const newToken = jwt.sign(
            tokenPayload,
            SECRET_KEY,
            { expiresIn: "3d" }
        );

        const dataRetornarUsuario = {
            uk_usuario: usuario.uk_usuario,
            s_nombre: usuario.s_nombre,
            s_usuario: usuario.s_usuario,
            s_correo_electronico: usuario.s_correo_electronico,
            tipo_usuario: usuario.tipo_usuario || 3,
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