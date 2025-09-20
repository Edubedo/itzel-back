const { exec } = require('child_process');

// Función para hacer requests
async function testAPI(method, url, data = null) {
    try {
        const fetch = require('node-fetch');
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log(`✅ ${method} ${url} - Status: ${response.status}`);
        console.log('   Response:', JSON.stringify(result, null, 2));
        console.log('');
        
        return result;
    } catch (error) {
        console.log(`❌ ${method} ${url} - Error: ${error.message}`);
        console.log('');
        return null;
    }
}

async function runTests() {
    console.log('🧪 Iniciando pruebas de API...\n');
    
    const baseUrl = 'http://localhost:3001/api';
    
    // Test 1: Verificar que el servidor responde
    await testAPI('GET', `${baseUrl}/test`);
    
    // Test 2: Probar login con credenciales de prueba
    await testAPI('POST', `${baseUrl}/auth/login`, {
        s_usuario: 'admin',
        s_contrasena: 'admin123'
    });
    
    // Test 3: Obtener sucursales
    await testAPI('GET', `${baseUrl}/operaciones/turnos/sucursales`);
    
    // Test 4: Obtener áreas
    await testAPI('GET', `${baseUrl}/operaciones/turnos/areas/249c36c6-ad6f-404f-b5ac-914c71d7c67b`);
    
    // Test 5: Obtener servicios
    await testAPI('GET', `${baseUrl}/operaciones/turnos/servicios/1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6?esCliente=1`);
    
    // Test 6: Crear turno
    await testAPI('POST', `${baseUrl}/operaciones/turnos/crear`, {
        ck_area: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        ck_sucursal: '249c36c6-ad6f-404f-b5ac-914c71d7c67b',
        ck_servicio: 's1a2b3c4-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        es_cliente: true
    });
    
    // Test 7: Obtener turnos
    await testAPI('GET', `${baseUrl}/operaciones/turnos/obtenerTurnos?sucursalId=249c36c6-ad6f-404f-b5ac-914c71d7c67b`);
    
    console.log('🎉 Pruebas completadas');
}

// Verificar si el servidor está corriendo
function checkServer() {
    return new Promise((resolve) => {
        exec('curl -s http://localhost:3001/api/test', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ El servidor no está corriendo en el puerto 3001');
                console.log('💡 Para iniciar el servidor, ejecuta: npm run dev');
                resolve(false);
            } else {
                console.log('✅ Servidor detectado en puerto 3001\n');
                resolve(true);
            }
        });
    });
}

async function main() {
    const serverRunning = await checkServer();
    
    if (serverRunning) {
        await runTests();
    }
}

main(); 