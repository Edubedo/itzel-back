const { DataTypes } = require('sequelize')
const { ConnectionDatabase } = require('../../config/connectDatabase')

// Enlaces de reportes compartidos (dinámicos por tipo/maniobra)
const LinksReportesCompartidosModel = ConnectionDatabase.define(
  'links_reportes_compartidos',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    tipo_reporte: { type: DataTypes.STRING(30), allowNull: false }, // 'acomulados' | 'clientes_maniobra' | 'bodega_buque'
    folio_maniobra: { type: DataTypes.STRING(100), allowNull: false },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'activo' }, // activo | inactivo
    fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_expiracion: { type: DataTypes.DATE, allowNull: false },
    uk_usuario_creacion: { type: DataTypes.STRING(64), allowNull: true },
    clicks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ultimo_acceso: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'links_reportes_compartidos', timestamps: false }
)

module.exports = LinksReportesCompartidosModel


