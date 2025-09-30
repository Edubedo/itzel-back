const { ConnectionDatabase } = require('../../config/connectDatabase');
const { DataTypes } = require('sequelize');

const Sucursal = ConnectionDatabase.define('Sucursal', {
  ck_sucursal: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  ck_estatus: {
    type: DataTypes.CHAR(6),
    allowNull: false,
    defaultValue: 'ACTIVO'
  },
  s_nombre_sucursal: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  s_domicilio: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  ck_municipio: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
  s_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  s_codigo_postal: {
    type: DataTypes.STRING(10),
    allowNull: true,
  }
}, {
  tableName: 'catalogo_sucursales',
  timestamps: false,
});

// Establecer asociaciones
const CatalogoMunicipiosModel = require('./municipios.model');
const CatalogoEstadosModel = require('./estados.model');

// Sucursal pertenece a un municipio
Sucursal.belongsTo(CatalogoMunicipiosModel, {
  foreignKey: 'ck_municipio',
  as: 'municipio'
});

// Municipio pertenece a un estado
CatalogoMunicipiosModel.belongsTo(CatalogoEstadosModel, {
  foreignKey: 'ck_estado',
  as: 'estado'
});

// Estado tiene muchos municipios
CatalogoEstadosModel.hasMany(CatalogoMunicipiosModel, {
  foreignKey: 'ck_estado',
  as: 'municipios'
});

// Municipio tiene muchas sucursales
CatalogoMunicipiosModel.hasMany(Sucursal, {
  foreignKey: 'ck_municipio',
  as: 'sucursales'
});

module.exports = { Sucursal };
