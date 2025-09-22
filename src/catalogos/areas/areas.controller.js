const CatalogoAreasModel = require('../../models/areas.model');
const { Op } = require("sequelize");
const { Sucursal } = require('../../models/sucursales.model');
CatalogoAreasModel.belongsTo(Sucursal, { foreignKey: 'ck_sucursal' });


// Obtener todas las áreas con filtros y paginación
const getAllAreas = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 10,
            search = '',
            ck_estatus = '',
            ck_sucursal = ''
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        // Construir condiciones de búsqueda
        let whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                { s_area: { [Op.like]: `%${search}%` } },
                { c_codigo_area: { [Op.like]: `%${search}%` } },
                { s_descripcion_area: { [Op.like]: `%${search}%` } }
            ];
        }

        if (ck_estatus) {
            whereCondition.ck_estatus = ck_estatus;
        }

        if (ck_sucursal) {
            whereCondition.ck_sucursal = ck_sucursal;
        }

        const { count, rows } = await CatalogoAreasModel.findAndCountAll({
            where: whereCondition,
            attributes: [
                'ck_area',
                'c_codigo_area',
                's_area',
                's_descripcion_area',
                'ck_estatus',
                'ck_sucursal'
            ],
            include: [{
                model: Sucursal,
                attributes: ['s_nombre_sucursal']
            }],
            limit: parseInt(limit),
            offset: offset,
            order: [['s_area', 'ASC']]
        });

        // Mapear sucursales para mostrar nombres
        const areasWithSucursalNames = rows.map(area => {
            const areaData = area.toJSON();
            areaData.sucursal_nombre = areaData.Sucursal ? areaData.Sucursal.s_nombre_sucursal : areaData.ck_sucursal;
            return areaData;
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        const response = {
            success: true,
            data: {
                areas: areasWithSucursalNames,
                pagination: {
                    total: count,
                    currentPage: parseInt(page),
                    totalPages: totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error al obtener áreas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener área por ID
const getAreaById = async (req, res) => {
    try {
        const { id } = req.params;

        const area = await CatalogoAreasModel.findOne({
            where: { ck_area: id },
            attributes: [
                'ck_area',
                'c_codigo_area',
                's_area',
                's_descripcion_area',
                'ck_estatus',
                'ck_sucursal'
            ]
        });

        if (!area) {
            return res.status(404).json({
                success: false,
                message: 'Área no encontrada'
            });
        }

        // Agregar nombre de sucursal
        const areaData = area.toJSON();
        const sucursalNames = {
            'suc-001': 'Secured Control',
            'suc-002': 'Secured Norte',
        };
        areaData.sucursal_nombre = sucursalNames[area.ck_sucursal] || area.ck_sucursal;

        res.status(200).json({
            success: true,
            data: areaData
        });

    } catch (error) {
        console.error('Error al obtener área:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Crear nueva área
const createArea = async (req, res) => {
    try {
        const {
            c_codigo_area,
            s_area,
            s_descripcion_area,
            ck_sucursal,
            ck_estatus = 'ACTIVO'
        } = req.body;

        // Validar campos requeridos
        if (!c_codigo_area || !s_area || !s_descripcion_area || !ck_sucursal) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: código, nombre, descripción y sucursal son obligatorios'
            });
        }

        // Validar longitud del código
        if (c_codigo_area.length > 6) {
            return res.status(400).json({
                success: false,
                message: 'El código no puede tener más de 6 caracteres'
            });
        }

        // Verificar si el código de área ya existe
        const existingArea = await CatalogoAreasModel.findOne({
            where: { c_codigo_area }
        });

        if (existingArea) {
            return res.status(400).json({
                success: false,
                message: 'El código de área ya está registrado'
            });
        }

        // Generar ID único basado en timestamp (similar al patrón de usuarios)
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        const ck_area = `area-${timestamp}-${randomSuffix}`;

        const newArea = await CatalogoAreasModel.create({
            ck_area,
            c_codigo_area: c_codigo_area.toUpperCase(),
            s_area,
            s_descripcion_area,
            ck_sucursal,
            ck_estatus
        });

        res.status(201).json({
            success: true,
            message: 'Área creada exitosamente',
            data: {
                ck_area: newArea.ck_area,
                c_codigo_area: newArea.c_codigo_area,
                s_area: newArea.s_area
            }
        });

    } catch (error) {
        console.error('Error al crear área:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar área
const updateArea = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            c_codigo_area,
            s_area,
            s_descripcion_area,
            ck_sucursal,
            ck_estatus
        } = req.body;

        const area = await CatalogoAreasModel.findOne({
            where: { ck_area: id }
        });

        if (!area) {
            return res.status(404).json({
                success: false,
                message: 'Área no encontrada'
            });
        }

        // Verificar si el nuevo código ya existe (solo si se está cambiando)
        if (c_codigo_area && c_codigo_area !== area.c_codigo_area) {
            const existingArea = await CatalogoAreasModel.findOne({
                where: {
                    c_codigo_area,
                    ck_area: { [Op.ne]: id }
                }
            });

            if (existingArea) {
                return res.status(400).json({
                    success: false,
                    message: 'El código de área ya está registrado'
                });
            }
        }

        // Preparar datos de actualización
        let updateData = {};
        if (c_codigo_area !== undefined) updateData.c_codigo_area = c_codigo_area;
        if (s_area !== undefined) updateData.s_area = s_area;
        if (s_descripcion_area !== undefined) updateData.s_descripcion_area = s_descripcion_area;
        if (ck_sucursal !== undefined) updateData.ck_sucursal = ck_sucursal;
        if (ck_estatus !== undefined) updateData.ck_estatus = ck_estatus;

        await CatalogoAreasModel.update(updateData, {
            where: { ck_area: id }
        });

        res.status(200).json({
            success: true,
            message: 'Área actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar área:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar área (soft delete)
const deleteArea = async (req, res) => {
    try {
        const { id } = req.params;

        const area = await CatalogoAreasModel.findOne({
            where: { ck_area: id }
        });

        if (!area) {
            return res.status(404).json({
                success: false,
                message: 'Área no encontrada'
            });
        }

        // Soft delete - cambiar estatus a INACTI
        await CatalogoAreasModel.update(
            { ck_estatus: 'INACTI' },
            { where: { ck_area: id } }
        );

        res.status(200).json({
            success: true,
            message: 'Área eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar área:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener estadísticas de áreas
const getAreasStats = async (req, res) => {
    try {
        const totalAreas = await CatalogoAreasModel.count();
        const areasActivas = await CatalogoAreasModel.count({
            where: { ck_estatus: 'ACTIVO' }
        });
        const areasInactivas = await CatalogoAreasModel.count({
            where: { ck_estatus: 'INACTI' }
        });

        // Contar por sucursal
        const areasPorSucursal = await CatalogoAreasModel.findAll({
            attributes: [
                'ck_sucursal',
                [CatalogoAreasModel.sequelize.fn('COUNT', CatalogoAreasModel.sequelize.col('ck_area')), 'count']
            ],
            where: { ck_estatus: 'ACTIVO' },
            group: ['ck_sucursal'],
            raw: true
        });

        // Obtener nombres reales de sucursales
        const sucursales = await Sucursal.findAll({
            attributes: ['ck_sucursal', 's_nombre_sucursal'],
            raw: true
        });

        // Formatear estadísticas por sucursal
        const porSucursal = {};
        areasPorSucursal.forEach(item => {
            const sucursal = sucursales.find(s => s.ck_sucursal === item.ck_sucursal);
            const nombreSucursal = sucursal ? sucursal.s_nombre_sucursal : item.ck_sucursal;
            porSucursal[nombreSucursal] = parseInt(item.count);
        });

        res.status(200).json({
            success: true,
            data: {
                total: totalAreas,
                activas: areasActivas,
                inactivas: areasInactivas,
                porSucursal
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};



const getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.findAll({
            where: { ck_estatus: 'ACTIVO' },
            attributes: ['ck_sucursal', 's_nombre_sucursal'],
            order: [['s_nombre_sucursal', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: sucursales
        });
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    getAllAreas,
    getAreaById,
    createArea,
    updateArea,
    deleteArea,
    getAreasStats,
    getSucursales
};