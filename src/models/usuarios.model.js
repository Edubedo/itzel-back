const Sequelize = require('sequelize');
const { ConnectionDatabase } = require('../../config/connectDatabase');
const { DataTypes } = Sequelize;

const UsuariosModel = ConnectionDatabase.define('UsuariosModel', {
    uk_usuario: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    s_nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    s_correo_electronico: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    s_contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    s_usuario: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    c_telefono: {
        type: DataTypes.CHAR(10),
        allowNull: true
    },
    uk_perfil: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    tipo_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3, // Por defecto Cliente
        validate: {
            isIn: [[1, 2, 3, 4, 5]] // 1=Administrador, 2=Capturista, 3=Cliente, 4=Documentación, 5=Patio
        }
    },
    uk_cliente: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    maniobras_asignadas: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Array JSON con los uk_maniobra asignados específicamente a este usuario'
    },
    ck_estado: {
        type: DataTypes.CHAR(6),
        allowNull: true,
        defaultValue: 'ACTIVO'
    },
    d_fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    uk_usuario_creacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    d_fecha_modificacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    uk_usuario_modificacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion',
});

module.exports = UsuariosModel;
