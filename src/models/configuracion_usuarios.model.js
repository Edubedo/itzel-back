const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const ConfiguracionUsuariosModel = ConnectionDatabase.define('ConfiguracionUsuariosModel', {
    ck_usuario: {
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
    s_nombre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    s_apellido_paterno: {
        type: DataTypes.STRING(200), 
        allowNull: true
    },
    s_apellido_materno: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    s_foto: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    d_fecha_nacimiento: {
        type: DataTypes.DATE(6),
        allowNull: true
    },
    s_telefono: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    s_correo_electronico: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    s_password: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    i_tipo_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    s_rfc: {
        type: DataTypes.STRING(13),
        allowNull: false
    },
    s_curp: {
        type: DataTypes.STRING(18),
        allowNull: false
    },
    s_domicilio: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    ck_sistema: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },

}, {
    tableName: 'configuracion_usuarios',
    timestamps: false,
});

module.exports = ConfiguracionUsuariosModel;

