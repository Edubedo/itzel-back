const ConfiguracionUsuariosModel = require('../../models/configuracion_usuarios.model');
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SALT_ROUNDS = 10;

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../../storage/usuarios/');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'usuario-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
});

// Obtener todos los usuarios con filtros y paginación
const getAllUsuarios = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            tipo_usuario = '', 
            estatus = '' 
        } = req.query;

        const offset = (page - 1) * limit;

        // Construir condiciones de búsqueda
        let whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                { s_nombre: { [Op.like]: `%${search}%` } },
                { s_correo_electronico: { [Op.like]: `%${search}%` } },
                { s_apellido_paterno: { [Op.like]: `%${search}%` } },
                { s_apellido_materno: { [Op.like]: `%${search}%` } }
            ];
        }

        if (tipo_usuario) {
            whereCondition.i_tipo_usuario = tipo_usuario;
        }

        if (estatus) {
            whereCondition.ck_estatus = estatus;
        }

        const { count, rows } = await ConfiguracionUsuariosModel.findAndCountAll({
            where: whereCondition,
            attributes: [
                'ck_usuario',
                's_nombre',
                's_apellido_paterno',
                's_apellido_materno',
                's_correo_electronico',
                's_telefono',
                's_foto',
                'i_tipo_usuario',
                'ck_estatus',
                'd_fecha_nacimiento',
                's_rfc',
                's_curp'
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['s_nombre', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: {
                usuarios: rows,
                pagination: {
                    total: count,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    hasNext: page < Math.ceil(count / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener usuario por ID
const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await ConfiguracionUsuariosModel.findOne({
            where: { ck_usuario: id },
            attributes: [
                'ck_usuario',
                's_nombre',
                's_apellido_paterno',
                's_apellido_materno',
                's_correo_electronico',
                's_telefono',
                's_foto',
                'i_tipo_usuario',
                'ck_estatus',
                'd_fecha_nacimiento',
                's_rfc',
                's_curp',
                's_domicilio'
            ]
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: usuario
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Crear nuevo usuario
const createUsuario = async (req, res) => {
    try {
        const {
            s_nombre,
            s_apellido_paterno,
            s_apellido_materno,
            s_correo_electronico,
            s_telefono,
            s_password,
            i_tipo_usuario,
            d_fecha_nacimiento,
            s_rfc,
            s_curp,
            s_domicilio
        } = req.body;

        // Validar campos requeridos
        if (!s_nombre || !s_correo_electronico || !s_password || !s_rfc || !s_curp || !s_domicilio) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Verificar si el correo ya existe
        const existingUser = await ConfiguracionUsuariosModel.findOne({
            where: { s_correo_electronico }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(s_password, SALT_ROUNDS);

        // Manejar imagen si existe
        let s_foto = null;
        if (req.file) {
            s_foto = req.file.filename;
        }

        const newUsuario = await ConfiguracionUsuariosModel.create({
            s_nombre,
            s_apellido_paterno,
            s_apellido_materno,
            s_correo_electronico,
            s_telefono,
            s_password: hashedPassword,
            s_foto,
            i_tipo_usuario: i_tipo_usuario || 3,
            d_fecha_nacimiento: d_fecha_nacimiento || null,
            s_rfc,
            s_curp,
            s_domicilio,
            ck_sistema: '00000000-0000-0000-0000-000000000000'
        });

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                ck_usuario: newUsuario.ck_usuario,
                s_nombre: newUsuario.s_nombre,
                s_correo_electronico: newUsuario.s_correo_electronico
            }
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar usuario
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            s_nombre,
            s_apellido_paterno,
            s_apellido_materno,
            s_correo_electronico,
            s_telefono,
            s_password,
            i_tipo_usuario,
            ck_estatus,
            d_fecha_nacimiento,
            s_rfc,
            s_curp,
            s_domicilio
        } = req.body;

        const usuario = await ConfiguracionUsuariosModel.findOne({
            where: { ck_usuario: id }
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Preparar datos de actualización
        let updateData = {
            s_nombre,
            s_apellido_paterno,
            s_apellido_materno,
            s_correo_electronico,
            s_telefono,
            i_tipo_usuario,
            ck_estatus,
            d_fecha_nacimiento,
            s_rfc,
            s_curp,
            s_domicilio
        };

        // Si hay nueva contraseña, encriptarla
        if (s_password && s_password.trim() !== '') {
            updateData.s_password = await bcrypt.hash(s_password, SALT_ROUNDS);
        }

        // Manejar nueva imagen
        if (req.file) {
            // Eliminar imagen anterior si existe
            if (usuario.s_foto) {
                const oldImagePath = path.join(__dirname, '../../../storage/usuarios/', usuario.s_foto);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.s_foto = req.file.filename;
        }

        await ConfiguracionUsuariosModel.update(updateData, {
            where: { ck_usuario: id }
        });

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar usuario (soft delete)
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await ConfiguracionUsuariosModel.findOne({
            where: { ck_usuario: id }
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Soft delete - cambiar estatus a INACTI
        await ConfiguracionUsuariosModel.update(
            { ck_estatus: 'INACTI' },
            { where: { ck_usuario: id } }
        );

        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener estadísticas de usuarios
const getUsuariosStats = async (req, res) => {
    try {
        const totalUsuarios = await ConfiguracionUsuariosModel.count();
        const usuariosActivos = await ConfiguracionUsuariosModel.count({
            where: { ck_estatus: 'ACTIVO' }
        });
        const usuariosInactivos = await ConfiguracionUsuariosModel.count({
            where: { ck_estatus: 'INACTI' }
        });

        const adminCount = await ConfiguracionUsuariosModel.count({
            where: { i_tipo_usuario: 1, ck_estatus: 'ACTIVO' }
        });
        const ejecutivoCount = await ConfiguracionUsuariosModel.count({
            where: { i_tipo_usuario: 2, ck_estatus: 'ACTIVO' }
        });
        const asesorCount = await ConfiguracionUsuariosModel.count({
            where: { i_tipo_usuario: 3, ck_estatus: 'ACTIVO' }
        });

        res.status(200).json({
            success: true,
            data: {
                total: totalUsuarios,
                activos: usuariosActivos,
                inactivos: usuariosInactivos,
                porTipo: {
                    administradores: adminCount,
                    ejecutivos: ejecutivoCount,
                    asesores: asesorCount
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuariosStats,
    upload
}; 
