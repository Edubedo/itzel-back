const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const OperacionTurnosModel = ConnectionDatabase.define('OperacionTurnosModel', {
    ck_turno: {
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
    ck_area: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    ck_servicio: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    i_seccion: {
        type: DataTypes.INTEGER(16),
        allowNull: true
    },
    ck_cliente: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    ck_sucursal: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    i_numero_turno: {
        type: DataTypes.INTEGER(16),
        allowNull: true
    },
    c_codigo_turno: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Código especial del turno basado en el código del servicio con contador consecutivo'
    },
    t_tiempo_espera: {
        type: DataTypes.TIME(),
        allowNull: true
    },
    t_tiempo_atendido: {
        type: DataTypes.TIME(6),
        allowNull: true
    },
    d_fecha_atendido: {
        type: DataTypes.DATE(6),
        allowNull: true
    },
    ck_usuario_atendio: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    ck_usuario_atendiendo: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    d_fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    ck_usuario_creacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
}, {
    tableName: 'operacion_turnos',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: false
});

module.exports = OperacionTurnosModel;
