const OperacionTurnosModel = require("../../models/operacion_turnos.model");

// Obtener todos los turnos de una sucursal
const getTurnos = async (req, res) => {
  try {
    const turnos = await OperacionTurnosModel.findAll({
      order: [["i_numero_turno", "ASC"]],
    });
    res.json(turnos);
  } catch (error) {
    console.error("Error en getTurnos:", error);
    res.status(500).json({ error: "Error al obtener los turnos" });
  }
};

// Crear un nuevo turno
const crearTurno = async (req, res) => {
  try {
    const nuevoTurno = await OperacionTurnosModel.create(req.body);
    res.json(nuevoTurno);
  } catch (error) {
    console.error("Error en crearTurno:", error);
    res.status(500).json({ error: "Error al crear el turno" });
  }
};

// Actualizar estado de un turno
const updateTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { ck_estatus } = req.body;

    const turno = await OperacionTurnosModel.findByPk(id);
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    turno.ck_estatus = ck_estatus;
    await turno.save();

    res.json(turno);
  } catch (error) {
    console.error("Error en updateTurno:", error);
    res.status(500).json({ error: "Error al actualizar el turno" });
  }
};

const eliminarTurno = (req, res) => {
  res.send("Hola")
}

module.exports = { getTurnos, crearTurno, eliminarTurno };
