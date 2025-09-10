const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const CatalogoSucursalesModel = ConnectionDatabase.define('CatalogoSucursalesModel', {
    ck_sucursal: {
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
    ck_municipio: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    s_domicilio: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
}, {
    tableName: 'catalogo_sucursales',
    timestamps: false,
});

module.exports = CatalogoSucursalesModel;
