const { DataTypes, Sequelize, QueryTypes } = require('sequelize');
const { ConnectionDatabase } = require('../../config/connectDatabase');

let OrdenesCargaModel = ConnectionDatabase.define('ordenes_carga', {
    uk_orden_carga: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
    },
    folio_maniobra: {
        type: DataTypes.CHAR(16),
        allowNull: true,
    },
    uk_cliente: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
    uk_buque: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
    uk_maniobra: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
    uk_producto: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
    s_conductor: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    s_marca: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    s_modelo: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    s_placas: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    s_ordencarga: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    s_destino: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    s_linea: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    s_ciudad: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    d_fecha: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    t_hora: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    s_cporte: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    uk_producto_maniobra: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
    s_documento: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: 'J.R.T.M'
    },
    s_recibio_cliente: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    s_observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    s_celular_operador: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    s_logo: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    s_remision: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ck_estado: {
        type: DataTypes.CHAR(6),
        allowNull: true,
        defaultValue: 'ACTIVO'
    },
    d_fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    d_fecha_modificacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    s_color: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    s_tipo: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    i_patio: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    i_vuelta: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    i_en_trafico: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }

}, {
    tableName: 'ordenes_carga',
    timestamps: false
});


module.exports = OrdenesCargaModel;