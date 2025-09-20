const { Sequelize, QueryTypes } = require("sequelize");
const OperacionTurnosModel = require("../../models/operacion_turnos.model");
const { ConnectionDatabase } = require("../../../config/connectDatabase");
// Obtener todos los turnos de una sucursal
const getTurnos = async (req, res) => {
  console.log("messi")
  try {
    //const turnos = await OperacionTurnosModel.findAll({
      //order: [["i_numero_turno", "ASC"]],
    //});

    const turnos = await ConnectionDatabase.query(`
      SELECT 
opeturn.ck_turno,
opeturn.ck_area,
caarea.s_area,
opeturn.i_seccion,
opeturn.ck_estatus,
opeturn.ck_cliente,
CONCAT(catalogo_clientes.s_nombre, ' ', catalogo_clientes.s_apellido_paterno_cliente,' ', catalogo_clientes.s_apellido_materno_cliente ) AS nombre_cliente,
opeturn.ck_sucursal,
catasuc.s_domicilio,
estado.s_estado,
muni.s_municipio,
opeturn.i_numero_turno,
opeturn.t_tiempo_espera,
opeturn.t_tiempo_atendido
FROM operacion_turnos opeturn
LEFT JOIN catalogo_area caarea  ON caarea.ck_area = opeturn.ck_area
LEFT JOIN catalogo_clientes ON catalogo_clientes.ck_cliente = opeturn.ck_cliente
LEFT JOIN catalogo_sucursales catasuc ON catasuc.ck_sucursal = opeturn.ck_sucursal
LEFT JOIN catalogo_municipios muni ON muni.ck_municipio = catasuc.ck_municipio
LEFT JOIN catalogo_estados estado ON estado.ck_estado = muni.ck_estado
WHERE opeturn.ck_sucursal = '249c36c6-ad6f-404f-b5ac-914c71d7c67b'

      `, {
      type: QueryTypes.SELECT,
    });

    console.log("turnos. ", turnos)

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


module.exports = { getTurnos, crearTurno, eliminarTurno, updateTurno };
  

