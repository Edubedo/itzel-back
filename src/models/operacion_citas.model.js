const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const OperacionCitasModel = ConnectionDatabase.define('OperacionCitasModel', {
    ck_cita: {
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
    ck_turno: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    c_codigo_cita: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    s_nombre_citado: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    s_apellido_paterno_citado: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    s_apellido_materno_citado: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

}, {
    tableName: 'operacion_citas',
    timestamps: false,
});

module.exports = OperacionCitasModel;
