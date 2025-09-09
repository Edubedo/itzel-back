const { DataTypes } = require('sequelize');
const { ConnectionDatabase } = require("../../config/connectDatabase");

const ProductosManiobraModel = ConnectionDatabase.define('ProductosManiobra', {
    uk_producto_maniobra: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    uk_maniobra: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    uk_producto: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    uk_unidad_medida: {
        type: DataTypes.CHAR(4),
    },
    f_cantidad: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    s_pedimento: {
        type: DataTypes.STRING(50),
    },
    s_presentacion: {
        type: DataTypes.STRING(100),
    },
    s_remision: {
        type: DataTypes.STRING(100),
    },
    s_agenteaduanal: {
        type: DataTypes.STRING(100),
    },
    s_recintofiscalizado: {
        type: DataTypes.STRING(100),
    },
    s_rfc: {
        type: DataTypes.STRING(20),
    },
    s_contenedor: {
        type: DataTypes.STRING(50),
    },
    s_validacion: {
        type: DataTypes.STRING(100),
    },
    f_importe: {
        type: DataTypes.FLOAT,
    },
    s_acuse_electronico_validacion: {
        type: DataTypes.STRING(200),
    },
    d_fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    uk_usuario_creacion: {
        type: DataTypes.CHAR(36),
    },
    d_fecha_modificacion: {
        type: DataTypes.DATE,
    },
    uk_usuario_modificacion: {
        type: DataTypes.CHAR(36),
    },
    ck_estado: {
        type: DataTypes.CHAR(6),
        allowNull: true,
        defaultValue: 'ACTIVO'
    },
    folio_maniobra: {
        type: DataTypes.CHAR(16),
    },
    s_ordencarga: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    i_total_presentaciones: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Total de presentaciones para sacos y superbolsas'
    },
    ck_unidad_medida_comercializacion: {
        type: DataTypes.CHAR(4),
        allowNull: true,
        defaultValue: 'TONE',
        comment: 'Unidad de medida para cantidad en unidades de comercializacion (TONE/KILO)'
    },
    ck_unidad_medida_tarifa: {
        type: DataTypes.CHAR(4),
        allowNull: true,
        defaultValue: 'TONE',
        comment: 'Unidad de medida para cantidad en unidades de tarifa (TONE/KILO)'
    },
    s_codigo_cita: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    s_nombreh: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Nombre del agente aduanal'
    }
}, {
    tableName: 'productos_maniobra',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion',
});

module.exports = ProductosManiobraModel;