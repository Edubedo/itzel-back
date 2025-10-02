const { ConnectionDatabase } = require("../../config/connectDatabase");
const { DataTypes } = require("sequelize");
const CatalogoAreasModel = require("../models/areas.model");

const VisitasAreaModel = ConnectionDatabase.define("VisitasAreaModel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ck_area: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: CatalogoAreasModel,
      key: "ck_area"
    }
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "visitas_area",
  timestamps: false
});

// Relación: un área tiene muchas visitas
CatalogoAreasModel.hasMany(VisitasAreaModel, { foreignKey: "ck_area" });
VisitasAreaModel.belongsTo(CatalogoAreasModel, { foreignKey: "ck_area" });

module.exports = VisitasAreaModel;
