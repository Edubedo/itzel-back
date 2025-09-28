const ConfiguracionSistemaModel = require('../models/configuracion_sistema.model');

// Obtener la configuración (GET)
exports.getConfiguracion = async (req, res) => {
  try {
    const config = await ConfiguracionSistemaModel.findOne();
    if (!config) return res.status(404).json({ message: 'No se encontró configuración.' });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración.', error });
  }
};

// Actualizar la configuración (PUT)
exports.updateConfiguracion = async (req, res) => {
  try {
    const config = await ConfiguracionSistemaModel.findOne();
    if (!config) return res.status(404).json({ message: 'No se encontró configuración.' });

    await config.update(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar configuración.', error });
  }
};