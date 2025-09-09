const { DataTypes } = require('sequelize');
const { ConnectionDatabase } = require('../../config/connectDatabase');

const ClientesProductosManiobraModel = ConnectionDatabase.define('ClientesProductosManiobraModel', {
    uk_cliente_producto_maniobra: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    uk_cliente: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    uk_producto_maniobra: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    f_cantidad_asignada: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    ck_estado: {
        type: DataTypes.CHAR(6),
        allowNull: false,
        defaultValue: 'ACTIVO'
    },
    d_fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
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
    },
    folio_maniobra: {
        type: DataTypes.CHAR(16),
    },
}, {
    tableName: 'clientes_productos_maniobra',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion'
});

module.exports = ClientesProductosManiobraModel; 