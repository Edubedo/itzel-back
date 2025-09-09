// Importar modelos
const ManiobrasModel = require('./areas.model');
const AreasModel = require('./areas.model');
const { ConnectionDatabase } = require('../../config/connectDatabase');


const syncModels = async () => {
    try {
        await ConnectionDatabase.sync({ alter: true });
    } catch (error) {
    }
};

// Exportar modelos con asociaciones
module.exports = {
    AreasModel,
    syncModels
}; 