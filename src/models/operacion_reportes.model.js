const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const OperacionReportesModel = ConnectionDatabase.define('OperacionReportesModel', {
    ck_reporte: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    s_estatus: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    s_reporte: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    ck_servicio: {
        type: DataTypes.CHAR(6),
        allowNull: true
    },
}, {
    tableName: 'operacion_reportes',
    timestamps: false,
});

module.exports = OperacionReportesModel;
