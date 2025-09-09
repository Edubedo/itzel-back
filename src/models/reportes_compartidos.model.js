const { DataTypes } = require('sequelize')
const { ConnectionDatabase } = require('../../config/connectDatabase')

// Mapea la tabla existente reportes_compartidos (Railway/Postgres)
const ReportesCompartidosModel = ConnectionDatabase.define(
  'reportes_compartidos',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    nombre_reporte: { type: DataTypes.STRING(255), allowNull: false },
    archivo_path: { type: DataTypes.STRING(255), allowNull: false },
    fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_expiracion: { type: DataTypes.DATE, allowNull: false },
    cliente: { type: DataTypes.STRING(255), allowNull: true },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'activo' },
  },
  { tableName: 'reportes_compartidos', timestamps: false }
)

module.exports = ReportesCompartidosModel


