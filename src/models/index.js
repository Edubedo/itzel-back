// Importar modelos
const AreasModel = require('./areas.model');
const { ConnectionDatabase } = require('../../config/connectDatabase');
const CatalogoClientesModel = require('./clientes.model');
const ConfiguracionSistemaModel = require('./configuracion_sistema.model');
const ConfiguracionUsuariosModel = require('./configuracion_usuarios.model');
const CatalogoEstadosModel = require('./estados.model');
const CatalogoEstatusModel = require('./estatus.model');
const HistorialUsuariosModel = require('./historial_usuarios_cambios.model');
const CatalogoMunicipiosModel = require('./municipios.model');
const OperacionCitasModel = require('./operacion_citas.model');
const OperacionReportesModel = require('./operacion_reportes.model');
const OperacionTurnosModel = require('./operacion_turnos.model');
const RelacionAsesoresSucursalesModel = require('./relacion_asesores_sucursales.model');
const RelacionEjecutivosSucursalesModel = require('./relacion_ejecutivos_sucursales.model');
const CatalogoServiciosModel = require('./servicios.model');
const CatalogoSucursalesModel = require('./sucursales.model');
const CatalogoUsuariosModel = require('./tipos_usuarios.model');

CatalogoServiciosModel.belongsTo(AreasModel, { foreignKey: 'ck_area', as: 'area' });



const syncModels = async () => {
    try {
        await ConnectionDatabase.sync({ alter: true });
    } catch (error) {
    }
};

// Exportar modelos con asociaciones
module.exports = {
    AreasModel,
    CatalogoClientesModel,
    ConfiguracionSistemaModel,
    ConfiguracionUsuariosModel,
    CatalogoEstadosModel,
    CatalogoEstatusModel,
    HistorialUsuariosModel,
    CatalogoMunicipiosModel,
    OperacionCitasModel,
    OperacionReportesModel,
    OperacionTurnosModel,
    RelacionAsesoresSucursalesModel,
    RelacionEjecutivosSucursalesModel,
    CatalogoServiciosModel,
    CatalogoSucursalesModel,
    CatalogoUsuariosModel,
    syncModels
}; 