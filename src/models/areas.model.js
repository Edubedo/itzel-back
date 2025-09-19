const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");


const CatalogoAreasModel = ConnectionDatabase.define('CatalogoAreasModel', {
    
    ck_area: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    ck_estatus: {
        type: DataTypes.CHAR(6),
        allowNull: false,
        defaultValue: 'ACTIVO'
    },
    s_area: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_descripcion_area: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    c_codigo_area: {
        type: DataTypes.CHAR(6),
        allowNull: false,
        unique: true
    },
    ck_sucursal: {
        type: DataTypes.CHAR(36),
        allowNull: true
    }
}, {
    tableName: 'catalogo_area', 
    timestamps: false, // Deshabilitar timestamps automáticos
});

module.exports = CatalogoAreasModel;