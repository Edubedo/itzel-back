const { Sucursal } = require('../../models/sucursales.model');
const RelacionEjecutivosSucursalesModel = require('../../models/relacion_ejecutivos_sucursales.model');
const RelacionAsesoresSucursalesModel = require('../../models/relacion_asesores_sucursales.model');
const CatalogoEstadosModel = require('../../models/estados.model');
const CatalogoMunicipiosModel = require('../../models/municipios.model');

// Obtener todos los estados
const getAllEstados = async (req, res) => {
  try {
    const estados = await CatalogoEstadosModel.findAll({
      where: { ck_estatus: 'ACTIVO' },
      order: [['s_estado', 'ASC']]
    });
    
    res.json({ 
      success: true, 
      estados 
    });
  } catch (error) {
    console.error('Error al obtener estados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estados' 
    });
  }
};

// Obtener municipios por estado
const getMunicipiosByEstado = async (req, res) => {
  try {
    const { estadoId } = req.params;
    const municipios = await CatalogoMunicipiosModel.findAll({
      where: { 
        ck_estado: estadoId,
        ck_estatus: 'ACTIVO' 
      },
      order: [['s_municipio', 'ASC']]
    });
    
    res.json({ 
      success: true, 
      municipios 
    });
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener municipios' 
    });
  }
};

// Obtener todas las sucursales con sus relaciones
const getAllSucursales = async (req, res) => {
  console.log('Obteniendo todas las sucursales');
  try {
    const sucursales = await Sucursal.findAll({
      where: { ck_estatus: 'ACTIVO' },
      order: [['s_nombre_sucursal', 'ASC']],
      include: [
        {
          model: CatalogoMunicipiosModel,
          as: 'municipio',
          include: [
            {
              model: CatalogoEstadosModel,
              as: 'estado'
            }
          ]
        }
      ]
    });

    // Para cada sucursal, obtener ejecutivos y asesores asignados
    const sucursalesConRelaciones = await Promise.all(
      sucursales.map(async (sucursal) => {
        const ejecutivos = await RelacionEjecutivosSucursalesModel.findAll({
          where: { 
            ck_sucursal: sucursal.ck_sucursal,
            ck_estatus: 'ACTIVO'
          }
        });

        const asesores = await RelacionAsesoresSucursalesModel.findAll({
          where: { 
            ck_sucursal: sucursal.ck_sucursal,
            ck_estatus: 'ACTIVO'
          }
        });

        return {
          ...sucursal.toJSON(),
          ejecutivos: ejecutivos.length,
          asesores: asesores.length
        };
      })
    );

    console.log('Sucursales obtenidas:', sucursalesConRelaciones);
    
    res.json({ 
      success: true, 
      sucursales: sucursalesConRelaciones
    });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales'
    });
  }
};

// Obtener sucursal por ID
const getSucursalById = async (req, res) => {
  try {
    const { id } = req.params;
    const sucursal = await Sucursal.findByPk(id, {
      include: [
        {
          model: CatalogoMunicipiosModel,
          as: 'municipio',
          include: [
            {
              model: CatalogoEstadosModel,
              as: 'estado'
            }
          ]
        }
      ]
    });
    
    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    // Limpiar espacios en blanco del campo ck_estatus
    const sucursalData = sucursal.toJSON();
    if (sucursalData.ck_estatus) {
      sucursalData.ck_estatus = sucursalData.ck_estatus.trim();
    }

    res.json({
      success: true,
      sucursal: sucursalData
    });
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la sucursal'
    });
  }
};

// Crear nueva sucursal con relaciones
const createSucursal = async (req, res) => {
  try {
    const {
      s_nombre_sucursal,
      s_domicilio,
      ck_municipio,
      s_telefono,
      s_codigo_postal,
      ejecutivos = [],
      asesores = []
    } = req.body;

    if (!s_nombre_sucursal) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la sucursal es requerido'
      });
    }

    if (!ck_municipio) {
      return res.status(400).json({ 
        success: false, 
        message: 'El municipio es requerido' 
      });
    }

    const nuevaSucursal = await Sucursal.create({
      s_nombre_sucursal,
      s_domicilio,
      ck_municipio,
      s_telefono,
      s_codigo_postal,
      ck_estatus: 'ACTIVO'
    });

    // Crear relaciones con ejecutivos
    if (ejecutivos && ejecutivos.length > 0) {
      const relacionesEjecutivos = ejecutivos.map(ejecutivo => ({
        ck_usuario: ejecutivo.ck_usuario,
        ck_sucursal: nuevaSucursal.ck_sucursal,
        ck_area: ejecutivo.ck_area || null,
        ck_servicio: ejecutivo.ck_servicio || null,
        ck_estatus: 'ACTIVO'
      }));

      await RelacionEjecutivosSucursalesModel.bulkCreate(relacionesEjecutivos);
    }

    // Crear relaciones con asesores
    if (asesores && asesores.length > 0) {
      const relacionesAsesores = asesores.map(asesor => ({
        ck_usuario: asesor.ck_usuario,
        ck_sucursal: nuevaSucursal.ck_sucursal,
        ck_estatus: 'ACTIVO'
      }));

      await RelacionAsesoresSucursalesModel.bulkCreate(relacionesAsesores);
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Sucursal creada exitosamente',
      sucursal: nuevaSucursal
    });
  } catch (error) {
    console.error('Error al crear sucursal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear la sucursal',
      error: error.message
    });
  }
};

// Actualizar sucursal
const updateSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      s_nombre_sucursal,
      s_domicilio,
      ck_municipio,
      s_telefono,
      s_codigo_postal,
      ejecutivos = [],
      asesores = []
    } = req.body;

    const sucursal = await Sucursal.findByPk(id);

    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    // Actualizar datos de la sucursal
    await sucursal.update({
      s_nombre_sucursal,
      s_domicilio,
      ck_municipio,
      s_telefono,
      s_codigo_postal
    });

    // Actualizar relaciones con ejecutivos
    // Primero eliminar las relaciones existentes
    await RelacionEjecutivosSucursalesModel.update(
      { ck_estatus: 'INACTIVO' },
      { where: { ck_sucursal: id } }
    );

    // Crear nuevas relaciones
    if (ejecutivos && ejecutivos.length > 0) {
      const relacionesEjecutivos = ejecutivos.map(ejecutivo => ({
        ck_usuario: ejecutivo.ck_usuario,
        ck_sucursal: id,
        ck_area: ejecutivo.ck_area || null,
        ck_servicio: ejecutivo.ck_servicio || null,
        ck_estatus: 'ACTIVO'
      }));

      await RelacionEjecutivosSucursalesModel.bulkCreate(relacionesEjecutivos);
    }

    // Actualizar relaciones con asesores
    await RelacionAsesoresSucursalesModel.update(
      { ck_estatus: 'INACTIVO' },
      { where: { ck_sucursal: id } }
    );

    if (asesores && asesores.length > 0) {
      const relacionesAsesores = asesores.map(asesor => ({
        ck_usuario: asesor.ck_usuario,
        ck_sucursal: id,
        ck_estatus: 'ACTIVO'
      }));

      await RelacionAsesoresSucursalesModel.bulkCreate(relacionesAsesores);
    }

    res.json({ 
      success: true,
      message: 'Sucursal actualizada exitosamente',
      sucursal
    });
  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la sucursal'
    });
  }
};

// Eliminar sucursal (cambiar estatus)
const deleteSucursal = async (req, res) => {
  try {
    const { id } = req.params;

    const sucursal = await Sucursal.findByPk(id);

    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    // Cambiar estatus de la sucursal
    await sucursal.update({ ck_estatus: 'INACTIVO' });

    // Cambiar estatus de las relaciones
    await RelacionEjecutivosSucursalesModel.update(
      { ck_estatus: 'INACTIVO' },
      { where: { ck_sucursal: id } }
    );

    await RelacionAsesoresSucursalesModel.update(
      { ck_estatus: 'INACTIVO' },
      { where: { ck_sucursal: id } }
    );

    res.json({ 
      success: true,
      message: 'Sucursal eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la sucursal'
    });
  }
};

module.exports = {
  getAllEstados,
  getMunicipiosByEstado,
  getAllSucursales,
  getSucursalById,
  createSucursal,
  updateSucursal,
  deleteSucursal
};