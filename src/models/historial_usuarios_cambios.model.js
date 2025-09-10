const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const HistorialUsuariosModel = ConnectionDatabase.define('HistorialUsuariosModel', {
    ck_sistema: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    ck_estatus: {
        type: DataTypes.CHAR(6),
        allowNull: false,
        defaultValue: 'ACTIVO'
    },
    d_fecha_creacion: {
        type: DataTypes.DATE(6),
        allowNull: false
    },
    ck_usuario_creacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    d_fecha_modificacion: {
        type: DataTypes.DATE(6),
        allowNull: true
    },
    ck_usuario_modificacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    d_fecha_eliminacion: {
        type: DataTypes.DATE(6),
        allowNull: true
    },
    ck_usuario_eliminacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    s_motivo_cancelacion: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    ck_campo_relacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
}, {
    tableName: 'historial_usuarios_cambios',
    timestamps: false,
});

module.exports = HistorialUsuariosModel;
