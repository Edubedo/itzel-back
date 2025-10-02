// routes/configuracionRoutes.js
const express = require('express');
const router = express.Router();
const { getConfiguracion, updateConfiguracion } = require('./configuracion_sistema.controller');

router.get('/configuracion', getConfiguracion);
router.put('/configuracion', updateConfiguracion);

module.exports = router;