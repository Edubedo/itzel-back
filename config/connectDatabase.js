const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

// Determinar ambiente
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocal = process.env.NODE_ENV === 'local' || !process.env.NODE_ENV;

// Configuración según ambiente
let HOST_DEV, NAME_DEV, USER_DEV, PASSWORD_DEV, PORT_DEV, DIALECT_DEV;
if (isProduction) {
    HOST_DEV = process.env.HOST_PROD;
    NAME_DEV = process.env.NAME_PROD;
    USER_DEV = process.env.USER_PROD;
    PASSWORD_DEV = process.env.PASSWORD_PROD;
    PORT_DEV = process.env.PORT_PROD;
    DIALECT_DEV = process.env.DIALECT_PROD;
} else if (isDevelopment) {
    HOST_DEV = process.env.HOST_DEV;
    NAME_DEV = process.env.NAME_DEV;
    USER_DEV = process.env.USER_DEV;
    PASSWORD_DEV = process.env.PASSWORD_DEV;
    PORT_DEV = process.env.PORT_DEV;
    DIALECT_DEV = process.env.DIALECT_DEV;
} else {
    // Configuración por defecto para ambiente local
    HOST_DEV = process.env.HOST_DEV || 'localhost';
    NAME_DEV = process.env.NAME_DEV || 'gespo';
    USER_DEV = process.env.USER_DEV || 'root';
    PASSWORD_DEV = process.env.PASSWORD_DEV || '';
    PORT_DEV = process.env.PORT_DEV || 3306;
    DIALECT_DEV = process.env.DIALECT_DEV || 'mysql';
}

const ConnectionDatabase = new Sequelize(NAME_DEV, USER_DEV, PASSWORD_DEV, {
    host: HOST_DEV,
    dialect: DIALECT_DEV,
    port: PORT_DEV,
    // quitar que se vean los queries
    logging: false,
    timezone: '-06:00', // ⬅️ zona horaria de Monterrey (México)
    dialectOptions: {
        timezone: 'local',
        dateStrings: true,
        typeCast: true
      },
});


const ConnectionDatabaseAuthenticated = async () => {
    try {
        await ConnectionDatabase.authenticate();
        const environment = process.env.NODE_ENV || 'local';
        console.log(`✅ Database connected successfully in ${environment.toUpperCase()} environment`);
        console.log(`🌐 Server running on port ${process.env.PORT}`);
    } catch (error) {
    }
}

module.exports = {
    ConnectionDatabase,
    ConnectionDatabaseAuthenticated

};