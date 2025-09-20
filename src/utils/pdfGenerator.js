const pdf = require('html-pdf-node');
const path = require('path');
const fs = require('fs');

const generateTicketHTML = (ticketData) => {
  const logoPath = path.join(__dirname, '../../public/images/logo.svg');
  const logoBase64 = fs.readFileSync(logoPath, 'base64');
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket - Turno ${ticketData.numeroTurno}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 20px;
            }
            
            .ticket {
                background: white;
                width: 350px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
                position: relative;
            }
            
            .ticket::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 5px;
                background: linear-gradient(90deg, #2563eb, #10b981, #f59e0b, #ef4444);
            }
            
            .header {
                background: linear-gradient(135deg, #2563eb, #1e40af);
                color: white;
                padding: 25px 20px 20px;
                text-align: center;
                position: relative;
            }
            
            .logo {
                width: 60px;
                height: 24px;
                margin: 0 auto 15px;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
            }
            
            .logo img {
                width: 100%;
                height: auto;
            }
            
            .header h1 {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .header .subtitle {
                font-size: 14px;
                opacity: 0.9;
                font-weight: 300;
            }
            
            .ticket-number {
                background: white;
                color: #2563eb;
                margin: 20px auto 0;
                padding: 15px 25px;
                border-radius: 50px;
                font-size: 36px;
                font-weight: bold;
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                letter-spacing: 2px;
            }
            
            .content {
                padding: 30px 25px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 15px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .info-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .info-label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
                display: flex;
                align-items: center;
            }
            
            .info-label::before {
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #2563eb;
                margin-right: 10px;
            }
            
            .info-value {
                font-size: 14px;
                color: #6b7280;
                text-align: right;
                max-width: 180px;
                word-wrap: break-word;
            }
            
            .status {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .footer {
                background: #f8fafc;
                padding: 20px 25px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 10px;
            }
            
            .footer-note {
                font-size: 11px;
                color: #9ca3af;
                font-style: italic;
            }
            
            .qr-section {
                margin: 15px 0;
                text-align: center;
            }
            
            .qr-placeholder {
                width: 60px;
                height: 60px;
                background: #e5e7eb;
                border-radius: 8px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #6b7280;
            }
            
            .decorative-line {
                height: 2px;
                background: linear-gradient(90deg, transparent, #2563eb, transparent);
                margin: 20px 0;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .ticket {
                    box-shadow: none;
                    width: 100%;
                    max-width: 350px;
                }
            }
        </style>
    </head>
    <body>
        <div class="ticket">
            <div class="header">
                <div class="logo">
                    <img src="data:image/svg+xml;base64,${logoBase64}" alt="Logo" />
                </div>
                <h1>TICKET DE TURNO</h1>
                <div class="subtitle">Sistema de Gestión de Turnos</div>
                <div class="ticket-number">${ticketData.numeroTurno}</div>
            </div>
            
            <div class="content">
                <div class="info-row">
                    <div class="info-label">Sucursal</div>
                    <div class="info-value">${ticketData.sucursal}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Área</div>
                    <div class="info-value">${ticketData.area}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Servicio</div>
                    <div class="info-value">${ticketData.servicio}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Tipo de Cliente</div>
                    <div class="info-value">${ticketData.tipoCliente}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Estado</div>
                    <div class="info-value">
                        <span class="status">En Espera</span>
                    </div>
                </div>
                
                <div class="decorative-line"></div>
                
                <div class="info-row">
                    <div class="info-label">Fecha y Hora</div>
                    <div class="info-value">${formatDate(ticketData.fechaCreacion)}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Ticket ID</div>
                    <div class="info-value">${ticketData.ticketId.slice(0, 8)}...</div>
                </div>
            </div>
            
            <div class="footer">
                <div class="qr-section">
                    <div class="qr-placeholder">QR</div>
                </div>
                <div class="footer-text">
                    Conserve este ticket hasta ser atendido
                </div>
                <div class="footer-note">
                    Tiempo estimado de espera: ${ticketData.tiempoEstimado || '15-30 min'}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateTicketPDF = async (ticketData) => {
  try {
    const html = generateTicketHTML(ticketData);
    
    const options = {
      format: 'A4',
      width: '380px',
      height: '600px',
      border: {
        top: '10px',
        right: '10px',
        bottom: '10px',
        left: '10px'
      },
      type: 'pdf',
      quality: '75',
      rendering: {
        timeout: 30000,
        delay: 500
      }
    };

    const file = { content: html };
    const pdfBuffer = await pdf.generatePdf(file, options);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el ticket PDF');
  }
};

module.exports = {
  generateTicketPDF,
  generateTicketHTML
}; 