
const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const CatalogoClientesModel = ConnectionDatabase.define('CatalogoClientesModel', {
    ck_cliente: {
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
    s_tipo_contrato: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    i_cliente_premium: {
        type: DataTypes.INTEGER(1000), 
        allowNull: true
    },
    c_codigo_contrato: {
        type: DataTypes.CHAR(10),
        allowNull: true
    },
    s_descripcion_cliente: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    c_codigo_cliente: {
        type: DataTypes.CHAR(6),
        allowNull: true
    },
    s_nombre: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    s_apellido_paterno_cliente: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    s_apellido_materno_cliente: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    s_domicilio: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
}, {
    tableName: 'catalogo_clientes',
    timestamps: false,
});

module.exports = CatalogoClientesModel;
