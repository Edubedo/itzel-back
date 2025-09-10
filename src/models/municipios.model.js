const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const CatalogoMunicipiosModel = ConnectionDatabase.define('CatalogoMunicipiosModel', {
    ck_municipio: {
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
    s_municipio: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_descripcion_municipio: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    c_codigo_municipio: {
        type: DataTypes.CHAR(6),
        allowNull: true
    },
    ck_estado: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
}, {
    tableName: 'catalogo_municipios',
    timestamps: false,
});

module.exports = CatalogoMunicipiosModel;
