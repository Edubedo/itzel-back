const { Sucursal } = require('../../models/sucursales.model');

// Obtener todas las sucursales
const getAllSucursales = async (req, res) => {
  console.log('Obteniendo todas las sucursales');
  try {
    const sucursales = await Sucursal.findAll({
      where: { ck_estatus: 'ACTIVO' },
      order: [['s_nombre_sucursal', 'ASC']]
    });
    console.log('Sucursales obtenidas:', sucursales);
    
    res.json({ 
      success: true, 
      sucursales 
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
    const sucursal = await Sucursal.findByPk(id);
    
    if (!sucursal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sucursal no encontrada' 
      });
    }
    
    res.json({ 
      success: true, 
      sucursal 
    });
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener la sucursal' 
    });
  }
};

// Crear nueva sucursal
const createSucursal = async (req, res) => {
  try {
    const { 
      s_nombre_sucursal, 
      s_domicilio, 
      ck_municipio,
      s_telefono,
      s_codigo_postal 
    } = req.body;
    
    if (!s_nombre_sucursal) {
      return res.status(400).json({ 
        success: false, 
        message: 'El nombre de la sucursal es requerido' 
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
    
    res.status(201).json({ 
      success: true,
      message: 'Sucursal creada exitosamente',
      sucursal: nuevaSucursal 
    });
  } catch (error) {
    console.error('Error al crear sucursal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear la sucursal' 
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
      s_codigo_postal 
    } = req.body;

    const sucursal = await Sucursal.findByPk(id);
    
    if (!sucursal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sucursal no encontrada' 
      });
    }

    await sucursal.update({
      s_nombre_sucursal,
      s_domicilio,
      ck_municipio,
      s_telefono,
      s_codigo_postal
    });

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

    await sucursal.update({ ck_estatus: 'INACTIVO' });

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
  getAllSucursales,
  getSucursalById,
  createSucursal,
  updateSucursal,
  deleteSucursal
};