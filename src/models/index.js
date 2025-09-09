// Importar modelos
const ManiobrasModel = require('./maniobras.model');
const ProductosManiobraModel = require('./productos_maniobra.model');
const ClientesProductosManiobraModel = require('./clientes_productos_maniobra.model');
const ClientesModel = require('./clientes.model');
const ProductosModel = require('./productos.model');
const BuquesModel = require('./buques.model');
const UnidadesMedidaModel = require('./unidades_medida.model');
const UsuariosModel = require('./usuarios.model');
const CapturaCamionesModel = require('./captura_camiones.model');
// const LinksReportesCompartidosModel = require('./links_reportes_compartidos.model');
const ReportesCompartidosModel = require('./reportes_compartidos.model');
const { ConnectionDatabase } = require('../../config/connectDatabase');

// Definir relaciones
// * PATIO RE 

// Relaciones de Maniobras
ManiobrasModel.belongsTo(BuquesModel, { foreignKey: 'uk_buque', as: 'buque' });
BuquesModel.hasMany(ManiobrasModel, { foreignKey: 'uk_buque', as: 'maniobras' });

// Relaciones de ProductosManiobra
ProductosManiobraModel.belongsTo(ManiobrasModel, { foreignKey: 'uk_maniobra', as: 'maniobra' });
ManiobrasModel.hasMany(ProductosManiobraModel, { foreignKey: 'uk_maniobra', as: 'productos_maniobra' });

ProductosManiobraModel.belongsTo(ProductosModel, { foreignKey: 'uk_producto', as: 'producto' });
ProductosModel.hasMany(ProductosManiobraModel, { foreignKey: 'uk_producto', as: 'productos_maniobra' });

ProductosManiobraModel.belongsTo(UnidadesMedidaModel, { foreignKey: 'uk_unidad_medida', as: 'unidad_medida' });
UnidadesMedidaModel.hasMany(ProductosManiobraModel, { foreignKey: 'uk_unidad_medida', as: 'productos_maniobra' });

ProductosManiobraModel.hasMany(ClientesProductosManiobraModel, { foreignKey: 'uk_producto_maniobra', as: 'clientes_productos_maniobra' });
ClientesProductosManiobraModel.belongsTo(ProductosManiobraModel, { foreignKey: 'uk_producto_maniobra', as: 'producto_maniobra' });

// Relaciones de ClientesProductosManiobra
ClientesProductosManiobraModel.belongsTo(ClientesModel, { foreignKey: 'uk_cliente', as: 'cliente' });
ClientesModel.hasMany(ClientesProductosManiobraModel, { foreignKey: 'uk_cliente', as: 'clientes_productos_maniobra' });

// Relaciones de CapturaCamiones
CapturaCamionesModel.belongsTo(ClientesModel, { foreignKey: 'uk_cliente' });
ClientesModel.hasMany(CapturaCamionesModel, { foreignKey: 'uk_cliente' });

CapturaCamionesModel.belongsTo(ProductosModel, { foreignKey: 'uk_producto' });
ProductosModel.hasMany(CapturaCamionesModel, { foreignKey: 'uk_producto' });

CapturaCamionesModel.belongsTo(ManiobrasModel, { foreignKey: 'uk_maniobra' });
ManiobrasModel.hasMany(CapturaCamionesModel, { foreignKey: 'uk_maniobra', as: 'capturas_camiones' });

// Relaciones entre Usuarios y Clientes
UsuariosModel.belongsTo(ClientesModel, { foreignKey: 'uk_cliente', as: 'cliente' });
ClientesModel.hasMany(UsuariosModel, { foreignKey: 'uk_cliente', as: 'usuarios' });

// Función para sincronizar modelos (comentada para evitar errores)
const syncModels = async () => {
    try {
        await ConnectionDatabase.sync({ alter: true });
    } catch (error) {
    }
};

// Exportar modelos con asociaciones
module.exports = {
    ManiobrasModel,
    ProductosManiobraModel,
    ClientesProductosManiobraModel,
    ClientesModel,
    ProductosModel,
    BuquesModel,
    UnidadesMedidaModel,
    UsuariosModel,
    CapturaCamionesModel,
    // LinksReportesCompartidosModel,
    ReportesCompartidosModel,
    syncModels
}; 