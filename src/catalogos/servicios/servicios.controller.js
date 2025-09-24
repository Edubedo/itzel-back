const { CatalogoServiciosModel } = require("../../models");
const { Op } = require("sequelize");

/**
 * Obtener todos los servicios con paginación, filtros y búsqueda
 */
const getServicios = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", estatus, area } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.s_servicio = { [Op.like]: `%${search}%` };
    }
    if (estatus) where.ck_estatus = estatus;
    if (area) where.ck_area = area;

    const { rows, count } = await CatalogoServiciosModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.json({ items: rows, total: count, message: "getServicios ok" });
  } catch (error) {
    console.error("Error en getServicios:", error);
    return res.status(500).json({ error: "Error al obtener los servicios" });
  }
};

/**
 * Obtener un servicio por ID
 */
const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await CatalogoServiciosModel.findByPk(id);

    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    return res.json({ data: servicio });
  } catch (error) {
    console.error("Error en getServicioById:", error);
    return res.status(500).json({ error: "Error al obtener el servicio" });
  }
};

/**
 * Crear un nuevo servicio
 */
const createServicio = async (req, res) => {
  try {
    const { s_servicio, s_descripcion_servicio, ck_area, ck_estatus, c_codigo_servicio } = req.body;

    if (!s_servicio || !ck_area || !ck_estatus || !c_codigo_servicio) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const nuevoServicio = await CatalogoServiciosModel.create({
      s_servicio,
      s_descripcion_servicio,
      ck_area,
      ck_estatus,
      c_codigo_servicio,
    });

    return res.status(201).json({ data: nuevoServicio, message: "Servicio creado correctamente" });
  } catch (error) {
    console.error("Error en createServicio:", error);
    return res.status(500).json({ error: "Error al crear el servicio" });
  }
};

/**
 * Actualizar un servicio
 */
const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { s_servicio, s_descripcion_servicio, ck_area, ck_estatus, c_codigo_servicio } = req.body;

    const servicio = await CatalogoServiciosModel.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    await servicio.update({
      s_servicio,
      s_descripcion_servicio,
      ck_area,
      ck_estatus,
      c_codigo_servicio,
    });

    return res.json({ data: servicio, message: "Servicio actualizado correctamente" });
  } catch (error) {
    console.error("Error en updateServicio:", error);
    return res.status(500).json({ error: "Error al actualizar el servicio" });
  }
};

/**
 * Eliminar un servicio
 */
const deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const servicio = await CatalogoServiciosModel.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    await servicio.destroy();

    return res.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error en deleteServicio:", error);
    return res.status(500).json({ error: "Error al eliminar el servicio" });
  }
};

/**
 * Estadísticas de servicios (ejemplo: cantidad total, activos, inactivos)
 */
const getServiciosStats = async (req, res) => {
  try {
    const total = await CatalogoServiciosModel.count();
    const activos = await CatalogoServiciosModel.count({ where: { ck_estatus: "ACTIVO" } });
    const inactivos = await CatalogoServiciosModel.count({ where: { ck_estatus: "INACTIVO" } });

    return res.json({ total, activos, inactivos });
  } catch (error) {
    console.error("Error en getServiciosStats:", error);
    return res.status(500).json({ error: "Error al obtener estadísticas de servicios" });
  }
};

module.exports = {
  getServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
  getServiciosStats,
};
