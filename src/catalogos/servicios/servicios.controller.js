const { CatalogoServiciosModel, AreasModel } = require("../../models");
const { Op } = require("sequelize");



/**
 * Obtener todos los servicios con paginación, filtros y búsqueda
 */
const getServicios = async (req, res) => {
  try {
    const getServicios = await CatalogoServiciosModel.findAll({
      where: {
        "ck_estatus": "ACTIVO"
      },
      include: [
        {
          model: AreasModel,
          as: "area",
          attributes: ["s_area"]
        }
      ]
    });

    // Mapear para agregar area_nombre directo en la respuesta
    const serviciosConArea = getServicios.map(servicio => {
      const data = servicio.toJSON();
      return {
        ...data,
        area_nombre: data.area ? data.area.s_area : ""
      };
    });

    return res.json({ getServicios: serviciosConArea, message: "getServicios ok" });
  } catch (error) {
    console.error("Error en getServicios:", error);
    return res.status(500).json({ error: "Error al obtener los servicios" });
  }
};

const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await CatalogoServiciosModel.findByPk(id);

    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    // Limpiar espacios en blanco del campo ck_estatus
    const servicioData = servicio.toJSON();
    if (servicioData.ck_estatus) {
      servicioData.ck_estatus = servicioData.ck_estatus.trim();
    }

    return res.json({ data: servicioData });
  } catch (error) {
    console.error("Error en getServicioById:", error);
    return res.status(500).json({ error: "Error al obtener el servicio" });
  }
};

const createServicio = async (req, res) => {
  try {
    let { s_servicio, s_descripcion_servicio, ck_area, ck_estatus, c_codigo_servicio } = req.body;

    if (!s_servicio || !ck_area || !ck_estatus || !c_codigo_servicio) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Normalizar estatus
    if (ck_estatus === "INACTIVO") ck_estatus = "INACTI";

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

const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    let { s_servicio, s_descripcion_servicio, ck_area, ck_estatus, c_codigo_servicio } = req.body;

    // Normalizar estatus
    if (ck_estatus === "INACTIVO") ck_estatus = "INACTI";

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

const getServiciosStats = async (req, res) => {
  try {
    const total = await CatalogoServiciosModel.count();
    const activos = await CatalogoServiciosModel.count({ where: { ck_estatus: "ACTIVO" } });
    const inactivos = await CatalogoServiciosModel.count({ where: { ck_estatus: "INACTI" } });

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
