const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const RelacionAsesoresSucursalesModel = ConnectionDatabase.define('RelacionAsesoresSucursalesModel', {
    ck_asesor_sucursal: {
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
    ck_usuario: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    ck_sucursal: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
}, {
    tableName: 'relacion_asesores_sucursales',
    timestamps: false,
});

module.exports = RelacionAsesoresSucursalesModel;
