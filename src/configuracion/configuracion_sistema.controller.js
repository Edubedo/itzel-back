// configuracion_sistema.controller.js
const ConfiguracionSistemaModel = require('../models/configuracion_sistema.model');

// Obtener la configuración (GET)
exports.getConfiguracion = async (req, res) => {
  try {
    console.log('=== GET /api/configuracion_sistema/configuracion ===');
    
    // Buscar cualquier configuración (asumiendo que solo hay una)
    let config = await ConfiguracionSistemaModel.findOne();
    
    if (!config) {
      console.log('Creando configuración por defecto...');
      // Crear configuración por defecto si no existe
      config = await ConfiguracionSistemaModel.create({
        ck_estatus: "ACTIVO",
        s_nombre_empresa: "CFE",
        s_nombre_sistema: "Sistema de Turnos",
        s_logo_light: null,
        s_logo_dark: null
      });
    }
    
    console.log('Configuración encontrada/creada:', config.toJSON());
    res.json(config);
    
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ 
      message: 'Error al obtener configuración.', 
      error: error.message 
    });
  }
};

// Actualizar la configuración (PUT)
exports.updateConfiguracion = async (req, res) => {
  try {
    console.log('=== PUT /api/configuracion_sistema/configuracion ===');
    console.log('Body recibido:', {
      ...req.body,
      s_logo_light: req.body.s_logo_light ? `Base64 (${req.body.s_logo_light.length} chars)` : 'null',
      s_logo_dark: req.body.s_logo_dark ? `Base64 (${req.body.s_logo_dark.length} chars)` : 'null'
    });
    
    const { 
      ck_sistema, // Este es el UUID
      ck_estatus, 
      s_nombre_empresa, 
      s_nombre_sistema,
      s_logo_light,
      s_logo_dark 
    } = req.body;
    
    // Validar campos requeridos
    if (!ck_sistema) {
      return res.status(400).json({ 
        message: 'Falta el campo requerido: ck_sistema (UUID)' 
      });
    }

    // Preparar datos para actualizar
    const updateData = {
      ck_estatus: ck_estatus || 'ACTIVO',
      s_nombre_empresa: s_nombre_empresa || 'CFE',
      s_nombre_sistema: s_nombre_sistema || 'Sistema de Turnos'
    };

    // Manejar logos
    if (s_logo_light !== undefined) {
      updateData.s_logo_light = s_logo_light || null;
    }

    if (s_logo_dark !== undefined) {
      updateData.s_logo_dark = s_logo_dark || null;
    }

    console.log('Actualizando configuración con UUID:', ck_sistema);
    console.log('Datos a actualizar:', updateData);

    // Buscar y actualizar por UUID
    const [rowsUpdated] = await ConfiguracionSistemaModel.update(updateData, {
      where: { ck_sistema }
    });

    console.log('Filas actualizadas:', rowsUpdated);

    if (rowsUpdated === 0) {
      return res.status(404).json({ 
        message: `No se encontró configuración con UUID: ${ck_sistema}` 
      });
    }

    // Obtener la configuración actualizada
    const updatedConfig = await ConfiguracionSistemaModel.findOne({
      where: { ck_sistema }
    });
    
    console.log('Configuración actualizada exitosamente');
    res.json(updatedConfig);
    
  } catch (error) {
    console.error('=== ERROR EN UPDATE ===');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error interno del servidor al actualizar configuración.', 
      error: error.message
    });
  }
};