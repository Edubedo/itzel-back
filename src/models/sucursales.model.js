const { ConnectionDatabase } = require('../../config/connectDatabase');
const { DataTypes } = require('sequelize');

const Sucursal = ConnectionDatabase.define('Sucursal', {
  ck_sucursal: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
  },
  ck_estatus: {
    type: DataTypes.CHAR(6),
    allowNull: false,
  },
  ck_area: {
    type: DataTypes.STRING(50),
  },
  i_seccion: {
    type: DataTypes.INTEGER,
  },
  ck_cliente: {
    type: DataTypes.STRING(36),
  },
  i_numero_turno: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'catalogo_sucursales', // la tabla
  timestamps: false,
});

module.exports = { Sucursal };
