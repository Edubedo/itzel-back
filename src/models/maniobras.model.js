const { DataTypes } = require('sequelize');
const { ConnectionDatabase } = require('../../config/connectDatabase'); // Ajusta la ruta según tu configuración

const ManiobrasModel = ConnectionDatabase.define('ManiobrasModel', {
    uk_maniobra: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    uk_buque: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    ck_estado: {
        type: DataTypes.CHAR(6),
        allowNull: true,
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
        allowNull: true
    },
    i_total_ordenes_carga: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    s_ordencarga: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    i_total_bodegas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
}, {
    tableName: 'maniobras',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion'
});

module.exports = ManiobrasModel;