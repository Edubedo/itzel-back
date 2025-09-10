const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const CatalogoEstatusModel = ConnectionDatabase.define('CatalogoEstatusModel', {
    ck_estatus: {
        type: DataTypes.CHAR(6),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    s_nombre_estatus: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_descripcion_estatus: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
}, {
    tableName: 'catalogo_estatus',
    timestamps: false,
});

module.exports = CatalogoEstatusModel;
