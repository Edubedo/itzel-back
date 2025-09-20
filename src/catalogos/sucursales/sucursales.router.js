const express = require('express');
const router = express.Router();
const { Sucursal } = require('../../models/sucursales.model');


// GET sucursal por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) return res.status(404).json({ message: 'Sucursal no encontrada' });
    res.json(sucursal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la sucursal' });
  }
});

// POST crear nueva sucursal
router.post('/', async (req, res) => {
  try {
    const { nombre, direccion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Falta nombre' });

    const nuevaSucursal = await Sucursal.create({ nombre, direccion });
    res.status(201).json(nuevaSucursal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la sucursal' });
  }
});

module.exports = router;
