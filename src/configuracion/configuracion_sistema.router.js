const express = require('express');
const router = express.Router();
const controller = require('./configuracion_sistema.controller');

router.get('/', controller.getConfiguracion);
router.put('/', controller.updateConfiguracion);

module.exports = router;