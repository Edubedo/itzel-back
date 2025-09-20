const express = require('express');
const router = express.Router();
const { 
  getAllSucursales,
  getSucursalById,
  createSucursal,
  updateSucursal,
  deleteSucursal
} = require('./sucursales.controller');

// Obtener todas las sucursales
router.get('/', getAllSucursales);

// Obtener sucursal por ID
router.get('/:id', getSucursalById);

// Crear nueva sucursal
router.post('/', createSucursal);

// Actualizar sucursal
router.put('/:id', updateSucursal);

// Eliminar sucursal
router.delete('/:id', deleteSucursal);

module.exports = router;
