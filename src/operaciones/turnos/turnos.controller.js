const { ConnectionDatabase } = require('../../../config/connectDatabase');
const { DataTypes } = require('sequelize');

// Modelo simple de turnos
const Turno = ConnectionDatabase.define('Turno', {
  ck_turno: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  i_numero_turno: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ck_area: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  ck_sucursal: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  ck_estatus: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'PENDI',
  },
}, {
  tableName: 'operacion_turnos',
  timestamps: false,
});

// Obtener todos los turnos de una sucursal
const getTurnosPorSucursal = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const turnos = await Turno.findAll({ where: { ck_sucursal: sucursalId }, order: [['i_numero_turno', 'ASC']] });
    res.json(turnos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener turnos' });
  }
};

// Turno actual (primer turno PENDI)
const getTurnoActual = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const turno = await Turno.findOne({
      where: { ck_sucursal: sucursalId, ck_estatus: 'PENDI' },
      order: [['i_numero_turno', 'ASC']],
    });
    res.json(turno || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener turno actual' });
  }
};

// Próximos turnos
const getProximosTurnos = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const turnos = await Turno.findAll({
      where: { ck_sucursal: sucursalId, ck_estatus: 'PENDI' },
      order: [['i_numero_turno', 'ASC']],
    });
    res.json(turnos.slice(1)); // quitar turno actual
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener próximos turnos' });
  }
};

// Atender turno
const atenderTurnoActual = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id);
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

    turno.ck_estatus = 'ATENDI';
    await turno.save();
    res.json({ message: 'Turno atendido', turno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al atender turno' });
  }
};

// Terminar turno
const terminarTurnoActual = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id);
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

    turno.ck_estatus = 'TERMI';
    await turno.save();
    res.json({ message: 'Turno terminado', turno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al terminar turno' });
  }
};

// Finalizar atención
const finalizarAtencion = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id);
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

    turno.ck_estatus = 'FINAL';
    await turno.save();
    res.json({ message: 'Atención finalizada', turno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al finalizar atención' });
  }
};

module.exports = {
  getTurnosPorSucursal,
  getTurnoActual,
  getProximosTurnos,
  atenderTurnoActual,
  terminarTurnoActual,
  finalizarAtencion,
};
