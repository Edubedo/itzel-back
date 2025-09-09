const { DataTypes, Sequelize, QueryTypes } = require('sequelize');
const { ConnectionDatabase } = require('../../config/connectDatabase');

let CapturaCamionesModel = ConnectionDatabase.define('captura_camiones', {
    uk_captura: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    s_folio: {
        type: DataTypes.STRING(50),
    },
    s_remision: {
        type: DataTypes.INTEGER,
    },
    uk_cliente: {
        type: DataTypes.CHAR(36),
    },
    uk_buque: {
        type: DataTypes.CHAR(36),
    },
    uk_maniobra: {
        type: DataTypes.CHAR(36),
    },
    uk_producto: {
        type: DataTypes.CHAR(36),
    },
    uk_producto_maniobra: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
    s_conductor: {
        type: DataTypes.STRING(100),
    },
    s_marca: {
        type: DataTypes.STRING(50),
    },
    s_modelo: {
        type: DataTypes.STRING(50),
    },
    s_placas: {
        type: DataTypes.STRING(20),
    },
    s_ordencarga: {
        type: DataTypes.STRING(100),
    },
    s_ticketdebas: {
        type: DataTypes.STRING(100),
    },
    f_pesobruto: {
        type: DataTypes.FLOAT,
    },
    f_pesotara: {
        type: DataTypes.FLOAT,
    },
    f_peso_neto: {
        type: DataTypes.FLOAT,
    },
    s_destino: {
        type: DataTypes.STRING(100),
    },
    s_linea: {
        type: DataTypes.STRING(100),
    },
    s_comentario: {
        type: DataTypes.TEXT,
    },
    s_ciudad: {
        type: DataTypes.STRING(100),
    },
    s_bodega: {
        type: DataTypes.STRING(100),
    },
    s_tipo: {
        type: DataTypes.STRING(50),
    },
    d_fecha: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
    t_hora: {
        type: DataTypes.TIME(6),
    },
    s_turno: {
        type: DataTypes.STRING(50),
    },
    s_cporte: {
        type: DataTypes.STRING(100),
    },
    d_fecha_creacion: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW,
    },
    uk_usuario_creacion: {
        type: DataTypes.CHAR(36),
    },
    d_fecha_modificacion: {
        type: DataTypes.TIME,
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
}, {
    tableName: 'captura_camiones',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion',
});


module.exports = CapturaCamionesModel;