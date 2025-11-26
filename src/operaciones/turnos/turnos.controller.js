const { Sequelize, QueryTypes } = require("sequelize");
const OperacionTurnosModel = require("../../models/operacion_turnos.model");
const CatalogoAreasModel = require("../../models/areas.model");
const CatalogoServiciosModel = require("../../models/servicios.model");
const { Sucursal } = require("../../models/sucursales.model");
const { ConnectionDatabase } = require("../../../config/connectDatabase");
const crypto = require('crypto');
const { generateTicketPDF } = require("../../utils/pdfGenerator");
const RelacionEjecutivosSucursalesModel = require("../../models/relacion_ejecutivos_sucursales.model");
const RelacionAsesoresSucursalesModel = require("../../models/relacion_asesores_sucursales.model");
const ConfiguracionSistemaModel = require("../../models/configuracion_sistema.model");

// Helper function para obtener fecha y hora actual desde la base de datos (respeta timezone configurado)
const getDatabaseDateTime = async () => {
  try {
    // Usar CURRENT_TIMESTAMP AT TIME ZONE para PostgreSQL
    // Esto garantiza que siempre obtengamos la hora en la zona horaria configurada
    const result = await ConnectionDatabase.query(
      "SELECT CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City' as current_time",
      { type: QueryTypes.SELECT }
    );
    return new Date(result[0].current_time);
  } catch (error) {
    console.error('Error obteniendo fecha de BD:', error);
    // Fallback: usar NOW() simple que respeta la configuración de Sequelize
    try {
      const result = await ConnectionDatabase.query(
        'SELECT NOW() as current_time',
        { type: QueryTypes.SELECT }
      );
      return new Date(result[0].current_time);
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      // Último recurso: calcular manualmente
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const mexicoTime = new Date(utcTime - (6 * 60 * 60 * 1000)); // GMT-6
      return mexicoTime;
    }
  }
};

// Helper function para formatear hora en formato HH:MM:SS desde Date
const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Endpoint de prueba para verificar timezone (NO afecta turnos reales)
const testTimezone = async (req, res) => {
  try {
    const dbTime = await getDatabaseDateTime();
    const jsTime = new Date();
    
    res.json({
      success: true,
      message: 'Prueba de zona horaria',
      database_time: dbTime,
      database_time_formatted: formatTime(dbTime),
      javascript_time: jsTime,
      javascript_time_formatted: formatTime(jsTime),
      timezone_config: '-06:00 (Mexico)',
      note: 'database_time debería mostrar hora de México (GMT-6)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

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

// Obtener areas por sucursal (filtrando por tipo de cliente si es necesario)
const getAreasPorSucursal = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const { esCliente } = req.query; // 1 para clientes, 0 para no clientes
    console.log('Obteniendo áreas para sucursal:', sucursalId, 'esCliente:', esCliente);
    
    try {
      // 1) Traer todas las áreas activas de la sucursal
      const areas = await CatalogoAreasModel.findAll({
        where: { 
          ck_sucursal: sucursalId,
          ck_estatus: 'ACTIVO'
        },
        order: [['s_area', 'ASC']]
      });

      // Si no se especifica tipo de cliente, devolver todas las áreas activas
      if (areas.length === 0) {
        return res.json({ success: true, areas: [] });
      }

      if (esCliente === undefined) {
        console.log('Áreas encontradas (sin filtrar por tipo de cliente):', areas.length);
        return res.json({ success: true, areas });
      }

      // 2) Filtrar áreas por existencia de al menos un servicio activo que coincida con i_es_para_clientes
      const areaIds = areas.map(a => a.ck_area);

      let whereServicios = {
        ck_area: areaIds,
        ck_estatus: 'ACTIVO'
      };

      // Normalizar esCliente a 0/1
      const esClienteNum = parseInt(esCliente) || 0;
      whereServicios.i_es_para_clientes = esClienteNum;

      const servicios = await CatalogoServiciosModel.findAll({
        where: whereServicios,
        attributes: ['ck_area'],
      });

      const areaIdsConServicios = new Set(servicios.map(s => s.ck_area));
      const areasFiltradas = areas.filter(a => areaIdsConServicios.has(a.ck_area));

      console.log('Áreas encontradas después de filtrar por tipo cliente:', areasFiltradas.length);
      res.json({ success: true, areas: areasFiltradas });
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

// Obtener áreas por usuario autenticado y sucursal
// Ejecutivo: solo áreas donde tiene relación
// Asesor: todas las áreas de su sucursal asignada
// Administrador: todas las áreas de la sucursal seleccionada
const getAreasPorUsuario = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const { sucursalId } = req.params;
    if (!sucursalId) {
      return res.status(400).json({ success: false, message: 'Sucursal requerida' });
    }

    const tipoUsuario = user.tipo_usuario;

    let areas = [];

    if (tipoUsuario === 1) {
      // Administrador: todas las áreas de la sucursal
      areas = await CatalogoAreasModel.findAll({
        where: { 
          ck_sucursal: sucursalId,
          ck_estatus: 'ACTIVO'
        },
        order: [['s_area', 'ASC']]
      });
    } else if (tipoUsuario === 2) {
      // Ejecutivo: solo áreas donde tiene relación
      const relaciones = await RelacionEjecutivosSucursalesModel.findAll({
        where: { 
          ck_usuario: user.uk_usuario,
          ck_sucursal: sucursalId,
          ck_estatus: 'ACTIVO'
        },
        attributes: ['ck_area']
      });

      const areaIds = [...new Set(relaciones.map(r => r.ck_area).filter(Boolean))];
      
      if (areaIds.length > 0) {
        areas = await CatalogoAreasModel.findAll({
          where: { 
            ck_area: areaIds,
            ck_estatus: 'ACTIVO'
          },
          order: [['s_area', 'ASC']]
        });
      }
    } else if (tipoUsuario === 4) {
      // Asesor: todas las áreas de la sucursal asignada
      const relacion = await RelacionAsesoresSucursalesModel.findOne({
        where: { 
          ck_usuario: user.uk_usuario,
          ck_sucursal: sucursalId,
          ck_estatus: 'ACTIVO'
        }
      });

      if (relacion) {
        areas = await CatalogoAreasModel.findAll({
          where: { 
            ck_sucursal: sucursalId,
            ck_estatus: 'ACTIVO'
          },
          order: [['s_area', 'ASC']]
        });
      }
    }

    // Obtener contadores de turnos pendientes por área
    const areasConContadores = await Promise.all(
      areas.map(async (area) => {
        const contador = await ConnectionDatabase.query(`
          SELECT COUNT(*) as pendientes
          FROM operacion_turnos
          WHERE ck_area = :areaId
            AND ck_sucursal = :sucursalId
            AND ck_estatus = 'ACTIVO'
            AND (ck_usuario_atendiendo IS NULL OR ck_usuario_atendiendo = :userId)
            AND DATE(d_fecha_creacion) = CURRENT_DATE
        `, {
          replacements: { 
            areaId: area.ck_area,
            sucursalId: sucursalId,
            userId: user.uk_usuario
          },
          type: QueryTypes.SELECT,
        });

        return {
          ...area.toJSON(),
          turnos_pendientes: parseInt(contador[0]?.pendientes || 0)
        };
      })
    );

    res.json({ success: true, areas: areasConContadores });
  } catch (error) {
    console.error('Error al obtener áreas por usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener áreas' });
  }
};

// Sucursales accesibles por usuario autenticado y rol
// Admin: todas; Ejecutivo: sucursales de RelacionEjecutivosSucursales; Asesor: de RelacionAsesoresSucursales
const getSucursalesPorUsuario = async (req, res) => {
  try {
    const user = req.user; // viene del auth middleware
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const tipoUsuario = user.tipo_usuario; // 1 admin, 2 ejecutivo, 4 asesor, etc.

    if (tipoUsuario === 1) {
      // Administrador: todas
      const sucursales = await Sucursal.findAll({
        where: { ck_estatus: 'ACTIVO' },
        order: [['s_nombre_sucursal', 'ASC']]
      });
      return res.json({ success: true, sucursales });
    }

    let sucursalIds = [];
    if (tipoUsuario === 2) {
      // Ejecutivo
      const relaciones = await RelacionEjecutivosSucursalesModel.findAll({
        where: { ck_usuario: user.uk_usuario, ck_estatus: 'ACTIVO' },
        attributes: ['ck_sucursal']
      });
      sucursalIds = [...new Set(relaciones.map(r => r.ck_sucursal).filter(Boolean))];
    } else if (tipoUsuario === 4) {
      // Asesor
      const relaciones = await RelacionAsesoresSucursalesModel.findAll({
        where: { ck_usuario: user.uk_usuario, ck_estatus: 'ACTIVO' },
        attributes: ['ck_sucursal']
      });
      sucursalIds = [...new Set(relaciones.map(r => r.ck_sucursal).filter(Boolean))];
    } else {
      // Otros roles: sin acceso específico
      return res.json({ success: true, sucursales: [] });
    }

    if (sucursalIds.length === 0) {
      return res.json({ success: true, sucursales: [] });
    }

    const sucursales = await Sucursal.findAll({
      where: { ck_sucursal: sucursalIds, ck_estatus: 'ACTIVO' },
      order: [['s_nombre_sucursal', 'ASC']]
    });

    return res.json({ success: true, sucursales });
  } catch (error) {
    console.error('Error al obtener sucursales por usuario:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener sucursales por usuario' });
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
        AND DATE(d_fecha_creacion) = CURRENT_DATE
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
    // Obtener fecha y hora actual desde la base de datos (respeta timezone)
    const currentTime = await getDatabaseDateTime();
    console.log('🕐 Hora actual del sistema:', currentTime);
    console.log('🕐 Hora formateada:', formatTime(currentTime));
    
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
      t_tiempo_espera: formatTime(currentTime),
      d_fecha_creacion: currentTime
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

// Obtener todos los turnos con filtros basados en permisos de usuario
const getTurnos = async (req, res) => {
  try {
    const user = req.user;
    let whereConditions = [];
    const { sucursalId, areaId, estatus, dashboard } = req.query;
    const esDashboard = dashboard === 'true';
    
    // Normalizar areaId - si está vacío o undefined, tratarlo como null
    const areaIdNormalizado = areaId && areaId.trim() !== '' ? areaId.trim() : null;
    console.log('🔍 [getTurnos] areaId recibido:', areaId, 'normalizado:', areaIdNormalizado);
    console.log('🔍 [getTurnos] sucursalId:', sucursalId, 'tipoUsuario:', user?.tipo_usuario, 'dashboard:', esDashboard);
    
    let replacements = {};
    let areasPermitidas = [];

    // Filtrar por áreas según tipo de usuario
    // Si es dashboard, mostrar todos los turnos de la sucursal sin filtrar por áreas
    if (user && !esDashboard) {
      const tipoUsuario = user.tipo_usuario;

      if (tipoUsuario === 1) {
        // Administrador: puede ver todas las áreas
        if (sucursalId) {
          const todasAreas = await CatalogoAreasModel.findAll({
            where: { 
              ck_sucursal: sucursalId,
              ck_estatus: 'ACTIVO'
            },
            attributes: ['ck_area']
          });
          areasPermitidas = todasAreas.map(a => a.ck_area);
        }
      } else if (tipoUsuario === 2) {
        // Ejecutivo: solo áreas donde tiene relación
        if (sucursalId) {
          const relaciones = await RelacionEjecutivosSucursalesModel.findAll({
            where: { 
              ck_usuario: user.uk_usuario,
              ck_sucursal: sucursalId,
              ck_estatus: 'ACTIVO'
            },
            attributes: ['ck_area']
          });
          areasPermitidas = [...new Set(relaciones.map(r => r.ck_area).filter(Boolean))];
        }
      } else if (tipoUsuario === 4) {
        // Asesor: todas las áreas de su sucursal
        if (sucursalId) {
          const relacion = await RelacionAsesoresSucursalesModel.findOne({
            where: { 
              ck_usuario: user.uk_usuario,
              ck_sucursal: sucursalId,
              ck_estatus: 'ACTIVO'
            }
          });
          if (relacion) {
            const todasAreas = await CatalogoAreasModel.findAll({
              where: { 
                ck_sucursal: sucursalId,
                ck_estatus: 'ACTIVO'
              },
              attributes: ['ck_area']
            });
            areasPermitidas = todasAreas.map(a => a.ck_area);
          }
        }
      }

      // Si hay áreas permitidas, filtrar por ellas
      console.log('📋 [getTurnos] areasPermitidas:', areasPermitidas.length, 'áreas');
      if (areasPermitidas.length > 0) {
        if (areaIdNormalizado && areasPermitidas.includes(areaIdNormalizado)) {
          // Si se especifica un areaId y está permitida, usar solo esa
          console.log('✅ [getTurnos] Aplicando filtro por área específica:', areaIdNormalizado);
          whereConditions.push('ot.ck_area = :areaId');
          replacements.areaId = areaIdNormalizado;
        } else if (!areaIdNormalizado) {
          // Si no se especifica areaId, usar todas las permitidas
          console.log('📋 [getTurnos] Mostrando todas las áreas permitidas:', areasPermitidas.length);
          // Crear placeholders dinámicos para el IN clause
          const areaPlaceholders = areasPermitidas.map((_, index) => `:area${index}`).join(', ');
          whereConditions.push(`ot.ck_area IN (${areaPlaceholders})`);
          areasPermitidas.forEach((areaId, index) => {
            replacements[`area${index}`] = areaId;
          });
        } else {
          // Si se especifica un areaId pero no está permitida, devolver vacío
          console.log('❌ [getTurnos] Área no permitida:', areaIdNormalizado);
          return res.json({ success: true, turnos: [] });
        }
      } else if (tipoUsuario !== 1) {
        // Si no hay áreas permitidas y no es admin, devolver vacío
        console.log('⚠️ [getTurnos] No hay áreas permitidas para usuario no admin');
        return res.json({ success: true, turnos: [] });
      } else {
        console.log('⚠️ [getTurnos] Admin sin áreas permitidas - no se aplicará filtro de área');
      }
    } else if (esDashboard) {
      // Para dashboard, si se especifica un areaId, filtrar por esa área
      // Si no, mostrar todas las áreas de la sucursal
      if (areaIdNormalizado && sucursalId) {
        console.log('📊 [getTurnos] Dashboard: Filtrando por área específica:', areaIdNormalizado);
        whereConditions.push('ot.ck_area = :areaId');
        replacements.areaId = areaIdNormalizado;
      } else {
        console.log('📊 [getTurnos] Dashboard: Mostrando todas las áreas de la sucursal');
      }
    }

    if (sucursalId) {
      whereConditions.push('ot.ck_sucursal = :sucursalId');
      replacements.sucursalId = sucursalId;
    }

    if (estatus) {
      whereConditions.push('ot.ck_estatus = :estatus');
      replacements.estatus = estatus;
    }

    // Filtrar turnos: mostrar solo los que NO están asignados a otros usuarios
    // O los que están asignados al usuario actual
    // EXCEPTO si es una petición del dashboard, donde mostramos TODOS los turnos
    if (user && !esDashboard) {
      whereConditions.push(`(ot.ck_usuario_atendiendo IS NULL OR ot.ck_usuario_atendiendo = :userIdActual)`);
      replacements.userIdActual = user.uk_usuario;
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
        ot.ck_usuario_atendiendo,
        cs.s_servicio,
        cu.s_nombre as nombre_asesor,
        cu_atendiendo.s_nombre as nombre_usuario_atendiendo
      FROM operacion_turnos ot
      LEFT JOIN catalogo_area ca ON ca.ck_area = ot.ck_area
      LEFT JOIN catalogo_clientes cc ON cc.ck_cliente = ot.ck_cliente
      LEFT JOIN catalogo_sucursales su ON su.ck_sucursal = ot.ck_sucursal
      LEFT JOIN catalogo_servicios cs ON cs.ck_servicio = ot.ck_servicio
      LEFT JOIN configuracion_usuarios cu ON cu.ck_usuario = ot.ck_usuario_atendio
      LEFT JOIN configuracion_usuarios cu_atendiendo ON cu_atendiendo.ck_usuario = ot.ck_usuario_atendiendo
      WHERE ot.ck_estatus != 'ATENDI'
        AND DATE(ot.d_fecha_creacion) = CURRENT_DATE
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
    const user = req.user;
    const { ck_usuario_atendio } = req.body;

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado' 
      });
    }

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

    // Verificar que el turno no esté asignado a otro usuario
    if (turno.ck_usuario_atendiendo && turno.ck_usuario_atendiendo !== user.uk_usuario) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este turno ya está siendo atendido por otro empleado' 
      });
    }

    // Obtener fecha y hora actual desde la base de datos (respeta timezone)
    const currentTime = await getDatabaseDateTime();
    
    turno.ck_estatus = 'PROCES';
    turno.d_fecha_atendido = currentTime;
    turno.ck_usuario_atendio = ck_usuario_atendio || user.uk_usuario;
    turno.ck_usuario_atendiendo = user.uk_usuario; // Asignar al usuario que está atendiendo
    
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
    const user = req.user;

    const turno = await OperacionTurnosModel.findByPk(turnoId);
    if (!turno) {
      return res.status(404).json({ 
        success: false, 
        message: 'Turno no encontrado' 
      });
    }

    // Verificar que el usuario que finaliza sea el que está atendiendo
    if (user && turno.ck_usuario_atendiendo && turno.ck_usuario_atendiendo !== user.uk_usuario) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene permiso para finalizar este turno' 
      });
    }

    // Obtener fecha y hora actual desde la base de datos (respeta timezone)
    const currentTime = await getDatabaseDateTime();
    
    // Calcular tiempo de atención
    if (turno.d_fecha_atendido) {
      const tiempoInicio = new Date(turno.d_fecha_atendido);
      const tiempoFin = new Date(currentTime);
      const diffMs = tiempoFin - tiempoInicio;
      const horas = Math.floor(diffMs / 3600000);
      const minutos = Math.floor((diffMs % 3600000) / 60000);
      const segundos = Math.floor((diffMs % 60000) / 1000);
      turno.t_tiempo_atendido = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }

    turno.ck_estatus = 'ATENDI';
    turno.ck_usuario_atendiendo = null; // Limpiar el campo cuando se finaliza
    
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
        SUM(CASE WHEN ck_estatus = 'CANCEL' THEN 1 ELSE 0 END) as turnos_cancelados,
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

    // Obtener configuración del sistema para el logo
    let logoUrl = null;
    try {
      const configuracion = await ConfiguracionSistemaModel.findOne();
      if (configuracion && configuracion.s_logo_light) {
        logoUrl = configuracion.s_logo_light;
      }
    } catch (error) {
      console.error('Error al obtener configuración para el logo:', error);
      // Continuar sin logo si hay error
    }

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
    const pdfBuffer = await generateTicketPDF(ticketData, logoUrl);

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

// Obtener notificaciones
const notificaciones = async (req, res) => {
  try {
    const { sucursalId } = req.query;

    const turnos = await ConnectionDatabase.query(
      `
      SELECT 
        ot.ck_turno AS id,
        ot.i_numero_turno AS numero_turno,
        cs.s_servicio AS servicio,
        ca.s_area AS area,
        ot.d_fecha_creacion AS fecha,
        ot.ck_sucursal,
        su.s_nombre_sucursal AS sucursal
      FROM operacion_turnos ot
      LEFT JOIN catalogo_area ca ON ca.ck_area = ot.ck_area
      LEFT JOIN catalogo_servicios cs ON cs.ck_servicio = ot.ck_servicio
      LEFT JOIN catalogo_sucursales su ON su.ck_sucursal = ot.ck_sucursal
      WHERE ot.ck_estatus = 'ACTIVO'
        ${sucursalId ? "AND ot.ck_sucursal = :sucursalId" : ""}
      ORDER BY ot.d_fecha_creacion DESC
      `,
      {
        type: QueryTypes.SELECT,
        replacements: sucursalId ? { sucursalId } : {},
      }
    );

    const formatted = turnos.map(t => ({
      id: t.id,
      numero_turno: t.numero_turno,        // ahora trae número correcto
      s_servicio: t.servicio,
      s_area: t.area,
      mensaje: `Turno ${t.numero_turno} en ${t.servicio} (${t.area})`,
      fecha: t.fecha,                       // sin toISOString(), formatear en front
      ck_sucursal: t.ck_sucursal,
      s_nombre_sucursal: t.sucursal,
    }));

    res.status(200).json({
      ok: true,
      notificaciones: formatted,
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ ok: false, mensaje: "Error al obtener las notificaciones" });
  }
};



const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Marcando notificación como leída:", id);
    res.status(200).json({ ok: true, mensaje: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({ ok: false, mensaje: "Error al marcar la notificación" });
  }
};

const cancelarTurno = async (req, res) => {
  try {
    const { id } = req.params; 

    // 1. Buscamos el turno
    const turno = await OperacionTurnosModel.findByPk(id);

    // 2. Verificamos si existe
    if (!turno) {
      console.error(`Intento de cancelar turno no encontrado. ID: ${id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Turno no encontrado.' 
      });
    }

    //  Actualizamos el estado
    turno.ck_estatus = 'CANCEL';
    
    //  Guardamos el cambio en la BD
    await turno.save();

    // Respondemos con éxito
    console.log(`Turno ${id} cancelado exitosamente.`);
    res.status(200).json({ 
      success: true, 
      message: 'Turno cancelado correctamente.' 
    });

  } catch (error) {
    // Si algo falla (ej. .save())
    console.error('Error al guardar la cancelación del turno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al cancelar turno.' 
    });
  }
};
// Obtener contador de turnos pendientes por área
const getTurnosPorArea = async (req, res) => {
  try {
    const user = req.user;
    const { sucursalId } = req.params;

    if (!user || !sucursalId) {
      return res.status(400).json({ success: false, message: 'Usuario y sucursal requeridos' });
    }

    const tipoUsuario = user.tipo_usuario;
    let areasIds = [];

    if (tipoUsuario === 1) {
      // Admin: todas las áreas
      const areas = await CatalogoAreasModel.findAll({
        where: { ck_sucursal: sucursalId, ck_estatus: 'ACTIVO' },
        attributes: ['ck_area']
      });
      areasIds = areas.map(a => a.ck_area);
    } else if (tipoUsuario === 2) {
      // Ejecutivo: solo sus áreas
      const relaciones = await RelacionEjecutivosSucursalesModel.findAll({
        where: { 
          ck_usuario: user.uk_usuario,
          ck_sucursal: sucursalId,
          ck_estatus: 'ACTIVO'
        },
        attributes: ['ck_area']
      });
      areasIds = [...new Set(relaciones.map(r => r.ck_area).filter(Boolean))];
    } else if (tipoUsuario === 4) {
      // Asesor: todas las áreas de su sucursal
      const relacion = await RelacionAsesoresSucursalesModel.findOne({
        where: { 
          ck_usuario: user.uk_usuario,
          ck_sucursal: sucursalId,
          ck_estatus: 'ACTIVO'
        }
      });
      if (relacion) {
        const areas = await CatalogoAreasModel.findAll({
          where: { ck_sucursal: sucursalId, ck_estatus: 'ACTIVO' },
          attributes: ['ck_area']
        });
        areasIds = areas.map(a => a.ck_area);
      }
    }

    if (areasIds.length === 0) {
      return res.json({ success: true, contadores: [] });
    }

    const contadores = await ConnectionDatabase.query(`
      SELECT 
        ca.ck_area,
        ca.s_area,
        COUNT(CASE WHEN ot.ck_estatus = 'ACTIVO' AND (ot.ck_usuario_atendiendo IS NULL OR ot.ck_usuario_atendiendo = :userId) THEN 1 END) as pendientes,
        COUNT(CASE WHEN ot.ck_estatus = 'PROCES' AND ot.ck_usuario_atendiendo = :userId THEN 1 END) as en_atencion
      FROM catalogo_area ca
      LEFT JOIN operacion_turnos ot ON ot.ck_area = ca.ck_area
        AND ot.ck_sucursal = :sucursalId
        AND DATE(ot.d_fecha_creacion) = CURRENT_DATE
      WHERE ca.ck_area IN (:areasIds)
        AND ca.ck_estatus = 'ACTIVO'
      GROUP BY ca.ck_area, ca.s_area
      ORDER BY ca.s_area ASC
    `, {
      replacements: { 
        areasIds: areasIds,
        sucursalId: sucursalId,
        userId: user.uk_usuario
      },
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, contadores });
  } catch (error) {
    console.error('Error al obtener contadores por área:', error);
    res.status(500).json({ success: false, message: 'Error al obtener contadores' });
  }
};

// Obtener resumen semanal de turnos del ejecutivo autenticado
const getTurnosSemanalesEjecutivo = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.tipo_usuario !== 2) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const ejecutivoId = user.uk_usuario;

    // Consulta semanal: cuenta atendidos y cancelados por día
    const resultados = await ConnectionDatabase.query(`
      SELECT 
        DAYNAME(d_fecha_creacion) AS dia,
        SUM(CASE WHEN ck_estatus = 'ATENDI' THEN 1 ELSE 0 END) AS atendidos,
        SUM(CASE WHEN ck_estatus = 'CANCEL' THEN 1 ELSE 0 END) AS cancelados
      FROM operacion_turnos
      WHERE ck_usuario_atendio = :ejecutivoId
        AND YEARWEEK(d_fecha_creacion, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY dia
      ORDER BY FIELD(dia, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday');
    `, {
      replacements: { ejecutivoId },
      type: QueryTypes.SELECT,
    });

    // Traducción de los días al español
    const diasTraducidos = {
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
      Thursday: "Jueves",
      Friday: "Viernes",
      Saturday: "Sábado",
      Sunday: "Domingo",
    };

    const datos = resultados.map(r => ({
      dia: diasTraducidos[r.dia] || r.dia,
      atendidos: parseInt(r.atendidos || 0),
      cancelados: parseInt(r.cancelados || 0),
    }));

    res.json({ success: true, datos });
  } catch (error) {
    console.error("Error al obtener turnos semanales del ejecutivo:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos" });
  }
};


module.exports = {
  getSucursales,
  getSucursalesPorUsuario,
  getAreasPorSucursal,
  getAreasPorUsuario,
  getServiciosPorArea,
  crearTurno,
  getTurnos,
  atenderTurno,
  finalizarTurno,
  getEstadisticasTurnos,
  descargarTicketPDF,
  notificaciones,
  marcarLeida,
  cancelarTurno,
  getTurnosPorArea,
  getTurnosSemanalesEjecutivo
};
  
