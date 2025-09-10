const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const CatalogoEstadosModel = ConnectionDatabase.define('CatalogoEstadosModel', {
    ck_estado: {
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
    s_estado: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_descripcion_estado: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    c_codigo_estado: {
        type: DataTypes.CHAR(6),
        allowNull: true
    },
}, {
    tableName: 'catalogo_estados',
    timestamps: false,
});

module.exports = CatalogoEstadosModel;
