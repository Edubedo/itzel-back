const bcrypt = require("bcrypt");
const { ConnectionDatabase } = require('../config/connectDatabase');

// Función para generar UUID sin dependencia externa
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const SALT_ROUNDS = 10;

const createTestUsers = async () => {
    try {
        await ConnectionDatabase.authenticate();
        console.log('✅ Conectado a la base de datos');

        // Hash de contraseñas (temporalmente sin hash para pruebas)
        const adminPassword = 'admin123';
        const ejecutivoPassword = 'ejecutivo123';
        const clientePassword = 'cliente123';

        // Insertar usuarios de prueba
        const testUsers = [
            {
                ck_usuario: generateUUID(),
                ck_estatus: 'ACTIVO',
                s_nombre: 'Administrador',
                s_apellido_paterno: 'Sistema',
                s_apellido_materno: 'ITZEL',
                s_correo_electronico: 'admin@itzel.com',
                s_password: adminPassword,
                i_tipo_usuario: '1', // Administrador
                s_rfc: 'ADMIN000000000',
                s_curp: 'ADMIN000000000',
                s_domicilio: 'Oficina Central',
                ck_sistema: generateUUID()
            },
            {
                ck_usuario: generateUUID(),
                ck_estatus: 'ACTIVO',
                s_nombre: 'Ejecutivo',
                s_apellido_paterno: 'De',
                s_apellido_materno: 'Prueba',
                s_correo_electronico: 'ejecutivo@itzel.com',
                s_password: ejecutivoPassword,
                i_tipo_usuario: '2', // Ejecutivo
                s_rfc: 'EJEC000000000',
                s_curp: 'EJEC000000000',
                s_domicilio: 'Sucursal Principal',
                ck_sistema: generateUUID()
            },
            {
                ck_usuario: generateUUID(),
                ck_estatus: 'ACTIVO',
                s_nombre: 'Asesor',
                s_apellido_paterno: 'De',
                s_apellido_materno: 'Prueba',
                s_correo_electronico: 'cliente@itzel.com',
                s_password: clientePassword,
                i_tipo_usuario: '3', // Asesor
                s_rfc: 'CLIE000000000',
                s_curp: 'CLIE000000000',
                s_domicilio: 'Domicilio del Asesor',
                ck_sistema: generateUUID()
            }
        ];

        for (const user of testUsers) {
            try {
                // Primero verificar si el usuario ya existe
                const existingUser = await ConnectionDatabase.query(
                    'SELECT ck_usuario FROM configuracion_usuarios WHERE s_correo_electronico = ?',
                    {
                        replacements: [user.s_correo_electronico],
                        type: ConnectionDatabase.QueryTypes.SELECT
                    }
                );

                if (existingUser.length > 0) {
                    // Actualizar usuario existente
                    await ConnectionDatabase.query(
                        'UPDATE configuracion_usuarios SET s_password = ? WHERE s_correo_electronico = ?',
                        {
                            replacements: [user.s_password, user.s_correo_electronico],
                            type: ConnectionDatabase.QueryTypes.UPDATE
                        }
                    );
                    console.log(`✅ Usuario ${user.s_nombre} actualizado`);
                } else {
                    // Crear nuevo usuario
                    await ConnectionDatabase.query(`
                        INSERT INTO configuracion_usuarios (
                            ck_usuario, ck_estatus, s_nombre, s_apellido_paterno, s_apellido_materno,
                            s_correo_electronico, s_password, i_tipo_usuario, s_rfc, s_curp, s_domicilio, ck_sistema
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, {
                        replacements: [
                            user.ck_usuario,
                            user.ck_estatus,
                            user.s_nombre,
                            user.s_apellido_paterno,
                            user.s_apellido_materno,
                            user.s_correo_electronico,
                            user.s_password,
                            user.i_tipo_usuario,
                            user.s_rfc,
                            user.s_curp,
                            user.s_domicilio,
                            user.ck_sistema
                        ],
                        type: ConnectionDatabase.QueryTypes.INSERT
                    });
                    console.log(`✅ Usuario ${user.s_nombre} creado`);
                }
            } catch (error) {
                console.error(`❌ Error con usuario ${user.s_nombre}:`, error.message);
            }
        }

        console.log('\n🎉 Usuarios de prueba creados exitosamente:');
        console.log('👨‍💼 Administrador: admin@itzel.com / admin123');
        console.log('👨‍💻 Ejecutivo: ejecutivo@itzel.com / ejecutivo123');
        console.log('👤 Asesor: cliente@itzel.com / cliente123');

    } catch (error) {
        console.error('❌ Error creando usuarios:', error);
    } finally {
        await ConnectionDatabase.close();
        process.exit(0);
    }
};

createTestUsers(); 