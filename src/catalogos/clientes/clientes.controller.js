const CatalogoClientesModel = require('../../models/clientes.model');
const { Op } = require('sequelize');

// Obtener todos los clientes con filtros y paginación
const getAllClientes = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            ck_estatus = '', 
            s_tipo_contrato = '' 
        } = req.query;

        const offset = (page - 1) * limit;

        // Construir condiciones de búsqueda
        let whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                { c_codigo_cliente: { [Op.like]: `%${search}%` } },
                { s_nombre: { [Op.like]: `%${search}%` } },
                { s_apellido_paterno_cliente: { [Op.like]: `%${search}%` } },
                { s_apellido_materno_cliente: { [Op.like]: `%${search}%` } },
                { s_domicilio: { [Op.like]: `%${search}%` } },
                { s_tipo_contrato: { [Op.like]: `%${search}%` } }
            ];
        }

        if (ck_estatus) {
            whereCondition.ck_estatus = ck_estatus;
        }

        if (s_tipo_contrato) {
            whereCondition.s_tipo_contrato = s_tipo_contrato;
        }

        const { count, rows } = await CatalogoClientesModel.findAndCountAll({
            where: whereCondition,
            attributes: [
                'ck_cliente',
                'c_codigo_cliente',
                's_nombre',
                's_apellido_paterno_cliente',
                's_apellido_materno_cliente',
                's_tipo_contrato',
                's_domicilio',
                's_descripcion_cliente',
                'i_cliente_premium',
                'ck_estatus',
                'c_codigo_contrato'
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['c_codigo_cliente', 'ASC']]
        });

        // Mapear los datos para el frontend
        const clientesMapeados = rows.map(cliente => ({
            ck_cliente: cliente.ck_cliente,
            c_codigo_cliente: cliente.c_codigo_cliente,
            s_nombre: cliente.s_nombre,
            s_apellido_paterno: cliente.s_apellido_paterno_cliente,
            s_apellido_materno: cliente.s_apellido_materno_cliente,
            s_tipo_contrato: cliente.s_tipo_contrato,
            s_domicilio: cliente.s_domicilio,
            s_description_cliente: cliente.s_descripcion_cliente,
            l_cliente_premium: cliente.i_cliente_premium === 1,
            ck_estatus: cliente.ck_estatus,
            c_codigo_contrato: cliente.c_codigo_contrato
        }));

        res.status(200).json({
            success: true,
            data: {
                clientes: clientesMapeados,
                pagination: {
                    total: count,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    hasNext: page < Math.ceil(count / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener cliente por ID
const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = await CatalogoClientesModel.findOne({
            where: { ck_cliente: id },
            attributes: [
                'ck_cliente',
                'c_codigo_cliente',
                's_nombre',
                's_apellido_paterno_cliente',
                's_apellido_materno_cliente',
                's_tipo_contrato',
                's_domicilio',
                's_descripcion_cliente',
                'i_cliente_premium',
                'ck_estatus',
                'c_codigo_contrato'
            ]
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Mapear los datos para el frontend
        const clienteMapeado = {
            ck_cliente: cliente.ck_cliente,
            c_codigo_cliente: cliente.c_codigo_cliente,
            s_nombre: cliente.s_nombre,
            s_apellido_paterno: cliente.s_apellido_paterno_cliente,
            s_apellido_materno: cliente.s_apellido_materno_cliente,
            s_tipo_contrato: cliente.s_tipo_contrato,
            s_domicilio: cliente.s_domicilio,
            s_description_cliente: cliente.s_descripcion_cliente,
            l_cliente_premium: cliente.i_cliente_premium === 1,
            ck_estatus: cliente.ck_estatus,
            c_codigo_contrato: cliente.c_codigo_contrato
        };

        res.status(200).json({
            success: true,
            data: clienteMapeado
        });

    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Crear nuevo cliente
const createCliente = async (req, res) => {
    try {
        const {
            c_codigo_cliente,
            s_nombre,
            s_apellido_paterno,
            s_apellido_materno,
            s_tipo_contrato,
            s_domicilio,
            s_description_cliente,
            l_cliente_premium,
            c_codigo_contrato
        } = req.body;

        // Validar campos requeridos
        if (!c_codigo_cliente || !s_nombre || !s_tipo_contrato) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: código, nombre y tipo de contrato son obligatorios'
            });
        }

        // Verificar si el código de cliente ya existe
        const existingCliente = await CatalogoClientesModel.findOne({
            where: { c_codigo_cliente }
        });

        if (existingCliente) {
            return res.status(400).json({
                success: false,
                message: 'El código de cliente ya está registrado'
            });
        }

        const newCliente = await CatalogoClientesModel.create({
            c_codigo_cliente,
            s_nombre,
            s_apellido_paterno_cliente: s_apellido_paterno,
            s_apellido_materno_cliente: s_apellido_materno,
            s_tipo_contrato,
            s_domicilio,
            s_descripcion_cliente: s_description_cliente,
            i_cliente_premium: l_cliente_premium ? 1 : 0,
            c_codigo_contrato,
            ck_estatus: 'ACTIVO'
        });

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: {
                ck_cliente: newCliente.ck_cliente,
                c_codigo_cliente: newCliente.c_codigo_cliente,
                s_nombre: newCliente.s_nombre
            }
        });

    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar cliente
const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            c_codigo_cliente,
            s_nombre,
            s_apellido_paterno,
            s_apellido_materno,
            s_tipo_contrato,
            s_domicilio,
            s_description_cliente,
            l_cliente_premium,
            c_codigo_contrato,
            ck_estatus
        } = req.body;

        const cliente = await CatalogoClientesModel.findOne({
            where: { ck_cliente: id }
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Verificar si el nuevo código de cliente ya existe (excluyendo el actual)
        if (c_codigo_cliente && c_codigo_cliente !== cliente.c_codigo_cliente) {
            const existingCliente = await CatalogoClientesModel.findOne({
                where: { 
                    c_codigo_cliente,
                    ck_cliente: { [Op.ne]: id }
                }
            });

            if (existingCliente) {
                return res.status(400).json({
                    success: false,
                    message: 'El código de cliente ya está registrado por otro cliente'
                });
            }
        }

        const updateData = {
            c_codigo_cliente: c_codigo_cliente || cliente.c_codigo_cliente,
            s_nombre: s_nombre || cliente.s_nombre,
            s_apellido_paterno_cliente: s_apellido_paterno || cliente.s_apellido_paterno_cliente,
            s_apellido_materno_cliente: s_apellido_materno || cliente.s_apellido_materno_cliente,
            s_tipo_contrato: s_tipo_contrato || cliente.s_tipo_contrato,
            s_domicilio: s_domicilio || cliente.s_domicilio,
            s_descripcion_cliente: s_description_cliente || cliente.s_descripcion_cliente,
            i_cliente_premium: l_cliente_premium !== undefined ? (l_cliente_premium ? 1 : 0) : cliente.i_cliente_premium,
            c_codigo_contrato: c_codigo_contrato || cliente.c_codigo_contrato,
            ck_estatus: ck_estatus || cliente.ck_estatus
        };

        await CatalogoClientesModel.update(updateData, {
            where: { ck_cliente: id }
        });

        res.status(200).json({
            success: true,
            message: 'Cliente actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar cliente (soft delete)
const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = await CatalogoClientesModel.findOne({
            where: { ck_cliente: id }
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Soft delete - cambiar estatus a INACTIVO
        await CatalogoClientesModel.update(
            { ck_estatus: 'INACTIVO' },
            { where: { ck_cliente: id } }
        );

        res.status(200).json({
            success: true,
            message: 'Cliente inactivado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener estadísticas de clientes
const getClientesStats = async (req, res) => {
    try {
        const totalClientes = await CatalogoClientesModel.count();
        const clientesActivos = await CatalogoClientesModel.count({
            where: { ck_estatus: 'ACTIVO' }
        });
        const clientesInactivos = await CatalogoClientesModel.count({
            where: { ck_estatus: 'INACTIVO' }
        });
        const clientesPremium = await CatalogoClientesModel.count({
            where: { i_cliente_premium: 1 }
        });

        // Obtener estadísticas por tipo de contrato
        const tiposContratoStats = await CatalogoClientesModel.findAll({
            attributes: [
                's_tipo_contrato',
                [CatalogoClientesModel.sequelize.fn('COUNT', CatalogoClientesModel.sequelize.col('ck_cliente')), 'count']
            ],
            where: { 
                s_tipo_contrato: { [Op.ne]: null },
                ck_estatus: 'ACTIVO'
            },
            group: ['s_tipo_contrato'],
            order: [[CatalogoClientesModel.sequelize.fn('COUNT', CatalogoClientesModel.sequelize.col('ck_cliente')), 'DESC']]
        });

        const porTipoContrato = {};
        tiposContratoStats.forEach(stat => {
            porTipoContrato[stat.s_tipo_contrato] = parseInt(stat.get('count'));
        });

        res.status(200).json({
            success: true,
            data: {
                totalClientes,
                clientesActivos,
                clientesInactivos,
                clientesPremium,
                porTipoContrato
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

// Obtener tipos de contrato únicos
const getTiposContrato = async (req, res) => {
    try {
        const tiposContrato = await CatalogoClientesModel.findAll({
            attributes: ['s_tipo_contrato'],
            where: {
                s_tipo_contrato: { [Op.ne]: null }
            },
            group: ['s_tipo_contrato'],
            order: [['s_tipo_contrato', 'ASC']]
        });

        const tiposMapeados = tiposContrato.map(tipo => ({
            s_tipo_contrato: tipo.s_tipo_contrato
        }));

        res.status(200).json({
            success: true,
            data: tiposMapeados
        });

    } catch (error) {
        console.error('Error al obtener tipos de contrato:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente,
    getClientesStats,
    getTiposContrato
};