const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const CatalogoServiciosModel = ConnectionDatabase.define('CatalogoServiciosModel', {
    ck_servicio: {
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
    s_servicio: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    s_descripcion_servicio: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    c_codigo_servicio: {
        type: DataTypes.CHAR(6),
        allowNull: true
    },
    i_es_para_clientes: {
        type: DataTypes.INTEGER(16),
        allowNull: true,
        defaultValue: 1
    },
}, {
    tableName: 'catalogo_servicios',
    timestamps: false,
});

module.exports = CatalogoServiciosModel;
