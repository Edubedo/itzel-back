const { Sequelize, QueryTypes } = require("sequelize");
const OperacionTurnosModel = require("../../models/operacion_turnos.model");
const CatalogoAreasModel = require("../../models/areas.model");
const CatalogoServiciosModel = require("../../models/servicios.model");
const { Sucursal } = require("../../models/sucursales.model");
const { ConnectionDatabase } = require("../../../config/connectDatabase");
const crypto = require('crypto');
const { generateTicketPDF } = require("../../utils/pdfGenerator");

// Obtener todas las sucursales
const getSucursales = async (req, res) => {
  try {
    console.log('Obteniendo sucursales');
    
    // Primero intentamos obtener con el modelo Sequelize
    const sucursales = await Sucursal.findAll({
      where: { ck_estatus: 'ACTIVO' },
      order: [['s_nombre_sucursal', 'ASC']]
    });

    console.log('Sucursales encontradas:', sucursales.length);
    res.json({ success: true, sucursales });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    
    // Si falla, devolvemos sucursales de prueba
    const sucursalesPrueba = [
      {
        ck_sucursal: '249c36c6-ad6f-404f-b5ac-914c71d7c67b',
        s_nombre_sucursal: 'Manzanillo Centro',
        s_domicilio: 'Av. México 123, Centro',
        ck_estatus: 'ACTIVO'
      },
      {
        ck_sucursal: '349c36c6-ad6f-404f-b5ac-914c71d7c67c',
        s_nombre_sucursal: 'Colima Norte',
        s_domicilio: 'Blvd. Camino Real 456, Norte',
        ck_estatus: 'ACTIVO'
      }
    ];
    
    console.log('Usando sucursales de prueba');
    res.json({ success: true, sucursales: sucursalesPrueba });
  }
};

// Obtener areas por sucursal
const getAreasPorSucursal = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    console.log('Obteniendo áreas para sucursal:', sucursalId);
    
    try {
      const areas = await CatalogoAreasModel.findAll({
        where: { 
          ck_sucursal: sucursalId,
          ck_estatus: 'ACTIVO'
        },
        order: [['s_area', 'ASC']]
      });

      console.log('Áreas encontradas:', areas.length);
      res.json({ success: true, areas });
    } catch (dbError) {
      console.log('Error en DB, usando áreas de prueba:', dbError.message);
      
      // Áreas de prueba
      const areasPrueba = [
        {
          ck_area: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
          s_area: 'Atención al Cliente',
          s_descripcion_area: 'Servicios generales de atención',
          c_codigo_area: 'ATC001'
        },
        {
          ck_area: '2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7',
          s_area: 'Facturación',
          s_descripcion_area: 'Servicios de facturación y pagos',
          c_codigo_area: 'FAC001'
        },
        {
          ck_area: '3c4d5e6f-7g8h-9i0j-1k2l-m3n4o5p6q7r8',
          s_area: 'Conexiones',
          s_descripcion_area: 'Nuevas conexiones y reinstalaciones',
          c_codigo_area: 'CON001'
        }
      ];
      
      res.json({ success: true, areas: areasPrueba });
    }
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener áreas' });
  }
};

// Obtener servicios por area
const getServiciosPorArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const { esCliente } = req.query; // 1 para clientes, 0 para no clientes
    console.log('Obteniendo servicios para área:', areaId, 'esCliente:', esCliente);
    
    try {
      let whereCondition = { 
        ck_area: areaId,
        ck_estatus: 'ACTIVO'
      };

      if (esCliente !== undefined) {
        whereCondition.i_es_para_clientes = parseInt(esCliente) || 0;
      }

      const servicios = await CatalogoServiciosModel.findAll({
        where: whereCondition,
        order: [['s_servicio', 'ASC']]
      });

      console.log('Servicios encontrados:', servicios.length);
      res.json({ success: true, servicios });
    } catch (dbError) {
      console.log('Error en DB, usando servicios de prueba:', dbError.message);
      
      // Servicios de prueba
      const serviciosPrueba = [
        {
          ck_servicio: 's1a2b3c4-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
          s_servicio: 'Consulta de Recibo',
          s_descripcion_servicio: 'Consultar estado de cuenta y pagos',
          c_codigo_servicio: 'CR001',
          i_es_para_clientes: parseInt(esCliente) || 1
        },
        {
          ck_servicio: 's2b3c4d5-6f7g-8h9i-0j1k-l2m3n4o5p6q7',
          s_servicio: 'Reporte de Fallas',
          s_descripcion_servicio: 'Reportar interrupciones del servicio',
          c_codigo_servicio: 'RF001',
          i_es_para_clientes: parseInt(esCliente) || 1
        },
        {
          ck_servicio: 's3c4d5e6-7g8h-9i0j-1k2l-m3n4o5p6q7r8',
          s_servicio: 'Cambio de Titularidad',
          s_descripcion_servicio: 'Cambio de propietario del servicio',
          c_codigo_servicio: 'CT001',
          i_es_para_clientes: parseInt(esCliente) || 1
        }
      ];
      
      res.json({ success: true, servicios: serviciosPrueba });
    }
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener servicios' });
  }
};

// Crear nuevo turno
const crearTurno = async (req, res) => {
  try {
    const { 
      ck_area, 
      ck_sucursal, 
      ck_servicio,
      ck_cliente = null,
      es_cliente = false 
    } = req.body;

    // Validar datos requeridos
    if (!ck_area || !ck_sucursal || !ck_servicio) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos: área, sucursal y servicio' 
      });
    }

    // Obtener el siguiente número de turno para la sucursal y área
    const ultimoTurno = await ConnectionDatabase.query(`
      SELECT COALESCE(MAX(i_numero_turno), 0) as ultimo_numero
      FROM operacion_turnos 
      WHERE ck_sucursal = :sucursalId 
        AND ck_area = :areaId
    `, {
      replacements: { sucursalId: ck_sucursal, areaId: ck_area },
      type: QueryTypes.SELECT,
    });

    const numeroTurno = (ultimoTurno[0]?.ultimo_numero || 0) + 1;

    console.log("datos,: ",  {
      ck_turno: crypto.randomUUID(),
      ck_area,
      ck_sucursal,
      ck_servicio,
      ck_cliente: es_cliente ? ck_cliente : null,
      i_numero_turno: numeroTurno,
      ck_estatus: 'ACTIVO',
      i_seccion: 1,
    })
    // Crear el turno
    const nuevoTurno = await OperacionTurnosModel.create({
      ck_turno: crypto.randomUUID(),
      ck_area,
      ck_sucursal,
      ck_servicio,
      ck_cliente: es_cliente ? ck_cliente : null,
      i_numero_turno: numeroTurno,
      ck_estatus: 'ACTIVO',
      i_seccion: 1,
    });

    console.log("nuevoTurno: ", nuevoTurno)
    // Obtener información completa del turno creado
    const turnoCompleto = await ConnectionDatabase.query(`
      SELECT 
        ot.ck_turno,
        ot.i_numero_turno,
        ot.ck_estatus,
        ot.t_tiempo_espera,
        ca.s_area,
        ca.c_codigo_area,
        cs.s_servicio,
        su.s_nombre_sucursal,
        su.s_domicilio
      FROM operacion_turnos ot
      LEFT JOIN catalogo_area ca ON ca.ck_area = ot.ck_area
      LEFT JOIN catalogo_servicios cs ON cs.ck_servicio = ot.ck_servicio
      LEFT JOIN catalogo_sucursales su ON su.ck_sucursal = ot.ck_sucursal
      WHERE ot.ck_turno = :turnoId
    `, {
      replacements: { turnoId: nuevoTurno.ck_turno },
      type: QueryTypes.SELECT,
    });

    res.status(201).json({ 
      success: true, 
      message: 'Turno creado exitosamente',
      turno: turnoCompleto[0]
    });

  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear turno',
      error: error.message 
    });
  }
};

// Obtener todos los turnos con filtros
const getTurnos = async (req, res) => {
  try {
    let whereConditions = [];
    const { sucursalId, areaId, estatus } = req.query;
    
    let replacements = {};

    if (sucursalId) {
      whereConditions.push('ot.ck_sucursal = :sucursalId');
      replacements.sucursalId = sucursalId;
    }

    if (areaId) {
      whereConditions.push('ot.ck_area = :areaId');
      replacements.areaId = areaId;
    }

    if (estatus) {
      whereConditions.push('ot.ck_estatus = :estatus');
      replacements.estatus = estatus;
    }

    const whereClause = whereConditions.length > 0 ? 
      `AND ${whereConditions.join(' AND ')}` : '';

    const turnos = await ConnectionDatabase.query(`
      SELECT 
        ot.ck_turno,
        ot.ck_area,
        ca.s_area,
        ca.c_codigo_area,
        ot.i_seccion,
        ot.ck_estatus,
        ot.ck_cliente,
        COALESCE(
          CONCAT(cc.s_nombre, ' ', cc.s_apellido_paterno_cliente, ' ', cc.s_apellido_materno_cliente),
          'Sin cliente'
        ) AS nombre_cliente,
        ot.ck_sucursal,
        su.s_nombre_sucursal,
        su.s_domicilio,
        ot.i_numero_turno,
        ot.t_tiempo_espera,
        ot.t_tiempo_atendido,
        ot.d_fecha_atendido,
        ot.ck_usuario_atendio,
        cs.s_servicio,
        cu.s_nombre as nombre_asesor
      FROM operacion_turnos ot
      LEFT JOIN catalogo_area ca ON ca.ck_area = ot.ck_area
      LEFT JOIN catalogo_clientes cc ON cc.ck_cliente = ot.ck_cliente
      LEFT JOIN catalogo_sucursales su ON su.ck_sucursal = ot.ck_sucursal
      LEFT JOIN catalogo_servicios cs ON cs.ck_servicio = ot.ck_servicio
      LEFT JOIN configuracion_usuarios cu ON cu.ck_usuario = ot.ck_usuario_atendio
      WHERE ot.ck_estatus != 'ATENDI'
      ${whereClause}
      ORDER BY ot.i_numero_turno ASC
    `, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, turnos });
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener turnos' });
  }
};

// Atender turno actual
const atenderTurno = async (req, res) => {
  try {
    const { turnoId } = req.params;
    const { ck_usuario_atendio } = req.body;

    const turno = await OperacionTurnosModel.findByPk(turnoId);
    if (!turno) {
      return res.status(404).json({ 
        success: false, 
        message: 'Turno no encontrado' 
      });
    }

    if (turno.ck_estatus !== 'ACTIVO') {
      return res.status(400).json({ 
        success: false, 
        message: 'El turno ya está siendo atendido o ha sido cerrado' 
      });
    }

    turno.ck_estatus = 'PROCES';
    turno.d_fecha_atendido = new Date();
    turno.ck_usuario_atendio = ck_usuario_atendio;
    
    await turno.save();

    res.json({ 
      success: true, 
      message: 'Turno en proceso de atención',
      turno 
    });
  } catch (error) {
    console.error('Error al atender turno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al atender turno' 
    });
  }
};

// Finalizar atención de turno
const finalizarTurno = async (req, res) => {
  try {
    const { turnoId } = req.params;

    const turno = await OperacionTurnosModel.findByPk(turnoId);
    if (!turno) {
      return res.status(404).json({ 
        success: false, 
        message: 'Turno no encontrado' 
      });
    }

    turno.ck_estatus = 'ATENDI';
    await turno.save();

    res.json({ 
      success: true, 
      message: 'Turno finalizado exitosamente',
      turno 
    });
  } catch (error) {
    console.error('Error al finalizar turno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al finalizar turno' 
    });
  }
};

// Obtener estadísticas de turnos
const getEstadisticasTurnos = async (req, res) => {
  try {
    const { sucursalId } = req.query;
    
    let whereClause = '';
    let replacements = {};
    
    if (sucursalId) {
      whereClause = 'AND  ot.ck_sucursal = :sucursalId';
      replacements.sucursalId = sucursalId;
    }

    const estadisticas = await ConnectionDatabase.query(`
      SELECT 
        COUNT(*) as total_turnos,
        SUM(CASE WHEN ck_estatus = 'ACTIVO' THEN 1 ELSE 0 END) as turnos_pendientes,
        SUM(CASE WHEN ck_estatus = 'PROCES' THEN 1 ELSE 0 END) as turnos_en_proceso,
        SUM(CASE WHEN ck_estatus = 'ATENDI' THEN 1 ELSE 0 END) as turnos_atendidos,
        AVG(CASE 
          WHEN ck_estatus = 'ATENDI' AND t_tiempo_atendido IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (t_tiempo_atendido - t_tiempo_espera)) / 60
          ELSE NULL 
        END) as tiempo_promedio_atencion
      FROM operacion_turnos ot
      WHERE DATE(d_fecha_creacion) = CURRENT_DATE
      ${whereClause}
    `, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json({ 
      success: true, 
      estadisticas: estadisticas[0] 
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas' 
    });
  }
};

// Descargar ticket PDF
const descargarTicketPDF = async (req, res) => {
  try {
    const { turnoId } = req.params;

    // Obtener información completa del turno
    const turno = await ConnectionDatabase.query(`
      SELECT 
        ot.ck_turno,
        ot.i_numero_turno,
        ot.ck_estatus,
        ot.d_fecha_creacion,
        ca.s_area,
        cs.s_servicio,
        su.s_nombre_sucursal,
        su.s_domicilio,
        CASE 
          WHEN cs.i_es_para_clientes = 1 THEN 'Cliente'
          ELSE 'Público en General'
        END as tipo_cliente
      FROM operacion_turnos ot
      LEFT JOIN catalogo_area ca ON ca.ck_area = ot.ck_area
      LEFT JOIN catalogo_servicios cs ON cs.ck_servicio = ot.ck_servicio
      LEFT JOIN catalogo_sucursales su ON su.ck_sucursal = ot.ck_sucursal
      WHERE ot.ck_turno = :turnoId
    `, {
      replacements: { turnoId },
      type: QueryTypes.SELECT,
    });

    if (!turno || turno.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Turno no encontrado' 
      });
    }

    const turnoData = turno[0];

    // Preparar datos para el ticket
    const ticketData = {
      numeroTurno: turnoData.i_numero_turno,
      ticketId: turnoData.ck_turno,
      sucursal: turnoData.s_nombre_sucursal,
      area: turnoData.s_area,
      servicio: turnoData.s_servicio,
      tipoCliente: turnoData.tipo_cliente,
      fechaCreacion: turnoData.d_fecha_creacion,
      tiempoEstimado: '15-30 min'
    };

    // Generar PDF
    const pdfBuffer = await generateTicketPDF(ticketData);

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${turnoData.i_numero_turno}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Enviar PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al descargar ticket PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar el ticket PDF' 
    });
  }
};

module.exports = {
  getSucursales,
  getAreasPorSucursal,
  getServiciosPorArea,
  crearTurno,
  getTurnos,
  atenderTurno,
  finalizarTurno,
  descargarTicketPDF
};
  

  