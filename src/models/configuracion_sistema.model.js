const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const ConfiguracionSistemaModel = ConnectionDatabase.define('ConfiguracionSistemaModel', {
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
    s_nombre_empresa: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_nombre_sistema: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    s_logo: {
        type: DataTypes.STRING(),
        allowNull: true
    },
}, {
    tableName: 'configuracion_sistema',
    timestamps: false,
});

module.exports = ConfiguracionSistemaModel;
