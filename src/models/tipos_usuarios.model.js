const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const CatalogoUsuariosModel = ConnectionDatabase.define('CatalogoUsuariosModel', {
    ck_tipo_usuario: {
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
    s_tipo_usuario: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_descripcion_tipo_usuario: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    c_codigo_tipo_usuario: {
        type: DataTypes.CHAR(6),
        allowNull: true
    },
}, {
    tableName: 'catalogo_tipos_usuarios',
    timestamps: false,
});

module.exports = CatalogoUsuariosModel;
