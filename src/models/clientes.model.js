// models/Cliente.js
const { DataTypes } = require('sequelize');
const { ConnectionDatabase } = require('../../config/connectDatabase');

const ClientesModel = ConnectionDatabase.define('ClientesModel', {
    uk_cliente: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    s_nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_domicilio: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    s_ciudad: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_estado: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_telefono: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    s_correo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    ck_estado: {
        type: DataTypes.CHAR(6),
        allowNull: false,
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
    tableName: 'clientes',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion'
});

module.exports = ClientesModel;
