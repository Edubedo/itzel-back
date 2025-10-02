const express = require('express');
const router = express.Router();

const Area = require('../src/models/areas.model');
const Usuario = require('../src/models/configuracion_usuarios.model');
const Cliente = require('../src/models/clientes.model');
const Sucursal = require('../src/models/sucursales.model').Sucursal;
const Servicio = require('../src/models/servicios.model');

router.get('/busqueda-general', async (req, res) => {
  const query = (req.query.query || '').toLowerCase();

  // Áreas: busca por nombre y código
  const areas = await Area.findAll({
    where: {
      [require('sequelize').Op.or]: [
        { s_area: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { c_codigo_area: { [require('sequelize').Op.iLike]: `%${query}%` } }
      ]
    }
  });

  // Usuarios: busca por nombre y correo
  const usuarios = await Usuario.findAll({
    where: {
      [require('sequelize').Op.or]: [
        { s_nombre: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { s_correo_electronico: { [require('sequelize').Op.iLike]: `%${query}%` } }
      ]
    }
  });

  // Clientes: busca por nombre y código
  const clientes = await Cliente.findAll({
    where: {
      [require('sequelize').Op.or]: [
        { s_nombre: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { c_codigo_cliente: { [require('sequelize').Op.iLike]: `%${query}%` } }
      ]
    }
  });

  // Sucursales: busca por nombre y domicilio
  const sucursales = await Sucursal.findAll({
    where: {
      [require('sequelize').Op.or]: [
        { s_nombre_sucursal: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { s_domicilio: { [require('sequelize').Op.iLike]: `%${query}%` } }
      ]
    }
  });

  // Servicios: busca por nombre y código
  const servicios = await Servicio.findAll({
    where: {
      [require('sequelize').Op.or]: [
        { s_servicio: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { c_codigo_servicio: { [require('sequelize').Op.iLike]: `%${query}%` } }
      ]
    }
  });

  // Formatea resultados
  const resultados = [
    ...areas.map(a => ({ tipo: 'area', nombre: a.s_area, codigo: a.c_codigo_area, id: a.ck_area })),
    ...usuarios.map(u => ({ tipo: 'usuario', nombre: u.s_nombre, correo: u.s_correo_electronico, id: u.ck_usuario })),
    ...clientes.map(c => ({ tipo: 'cliente', nombre: c.s_nombre, codigo: c.c_codigo_cliente, id: c.ck_cliente })),
    ...sucursales.map(s => ({ tipo: 'sucursal', nombre: s.s_nombre_sucursal, domicilio: s.s_domicilio, id: s.ck_sucursal })),
    ...servicios.map(sv => ({ tipo: 'servicio', nombre: sv.s_servicio, codigo: sv.c_codigo_servicio, id: sv.ck_servicio })),
  ];

  res.json({ resultados });
});

module.exports = router;