const { DataTypes } = require('sequelize');
const { ConnectionDatabase } = require('../../config/connectDatabase');

const UnidadesMedidaModel = ConnectionDatabase.define('unidades_medida', {
    uk_unidad_medida: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    s_nombre: {
        type: DataTypes.STRING(50),
    },
    s_abreviatura: {
        type: DataTypes.STRING(10),
    },
}, {
    tableName: 'unidades_medida',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion',
});

module.exports = UnidadesMedidaModel;