const { generateTicketPDF } = require('./src/utils/pdfGenerator');
const fs = require('fs');
const path = require('path');

const testData = {
  numeroTurno: 'A001',
  ticketId: 'test-123-456-789',
  sucursal: 'Manzanillo Centro',
  area: 'Atención al Cliente',
  servicio: 'Consulta General',
  tipoCliente: 'Cliente',
  fechaCreacion: new Date(),
  tiempoEstimado: '15-30 min'
};

console.log('🧪 Probando generación de PDF...');

generateTicketPDF(testData)
  .then((pdfBuffer) => {
    console.log('✅ PDF generado exitosamente');
    console.log(`📄 Tamaño del archivo: ${pdfBuffer.length} bytes`);
    
    // Guardar archivo de prueba
    const outputPath = path.join(__dirname, 'ticket-prueba.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`💾 Archivo guardado en: ${outputPath}`);
    
    console.log('🎉 ¡Prueba exitosa!');
  })
  .catch((error) => {
    console.error('❌ Error en la prueba:', error);
  }); 