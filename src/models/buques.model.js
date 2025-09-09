const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");

const BuquesModel = ConnectionDatabase.define('BuquesModel', {
    uk_buque: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    d_fecha: {
        type: DataTypes.TIME,
        allowNull: false
    },
    s_remitente: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_puerto: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_buque: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_procedencia: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_referencia: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    s_patenteh: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    s_nombreh: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    s_rfch: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ck_estado: {
        type: DataTypes.CHAR(6),
        allowNull: true,
        defaultValue: 'ACTIVO'
    },
    d_fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    uk_usuario_creacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    d_fecha_modificacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    uk_usuario_modificacion: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
    i_numero_maniobra: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    folio_maniobra: {
        type: DataTypes.CHAR(16),
        allowNull: true
    },
    d_fecha_expedicion_regla: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de expedición de regla - Campo para código de barras'
    },
    s_numero_expedicion_regla: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Número de expedición de regla - Campo para código de barras'
    }
}, {
    tableName: 'buques',
    timestamps: true,
    createdAt: 'd_fecha_creacion',
    updatedAt: 'd_fecha_modificacion',
});

module.exports = BuquesModel;
