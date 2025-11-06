const nodemailer = require('nodemailer');

// Configuración del transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verificar la configuración del transporter
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error en la configuración del email:', error);
    } else {
        console.log('Servidor de email listo para enviar mensajes');
    }
});

/**
 * Genera el HTML del email de verificación
 */
const getVerificationEmailTemplate = (nombre, verificationUrl) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu cuenta</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #70A18E 0%, #547A6B 100%);
            color: white;
            padding: 45px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 45px 35px;
        }
        .content h2 {
            color: #1e293b;
            margin-top: 0;
            font-weight: 600;
            font-size: 24px;
        }
        .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #8ECAB2 0%, #70A18E 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 30px 0;
            text-align: center;
            font-size: 15px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(84, 122, 107, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(84, 122, 107, 0.4);
        }
        .info-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            border-left: 4px solid #70A18E;
        }
        .info-box p {
            margin: 8px 0;
            font-size: 14px;
            color: #166534;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #70A18E;
            text-decoration: none;
            font-weight: 500;
        }
        .legal-section {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 2px solid #f1f5f9;
        }
        .section-title {
            color: #1e293b;
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 600;
            position: relative;
            padding-left: 20px;
        }
        .section-title::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background: #70A18E;
            border-radius: 2px;
        }
        .legal-section p {
            font-size: 14px;
            color: #475569;
            text-align: justify;
            margin-bottom: 18px;
            line-height: 1.7;
        }
        .list-item {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 16px;
            padding: 12px 0;
            position: relative;
        }
        .list-item::before {
            content: "";
            width: 6px;
            height: 6px;
            background: #70A18E;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 8px;
        }
        .list-content {
            flex: 1;
            font-size: 14px;
            color: #475569;
            line-height: 1.6;
        }
        .list-content strong {
            color: #1e293b;
            font-weight: 600;
        }
        .featured-list .list-item {
            background: #f8fafc;
            padding: 14px 16px;
            border-radius: 8px;
            border-left: 3px solid #70A18E;
            margin-bottom: 12px;
        }
        .featured-list .list-item::before {
            display: none;
        }
        .arco-rights {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
        }
        .highlight-box {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .contact-info {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .contact-info strong {
            color: #92400e;
            font-weight: 600;
        }
        .rights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            margin: 20px 0;
        }
        .right-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            position: relative;
        }
        .right-item::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background: #70A18E;
            border-radius: 4px 0 0 4px;
        }
        .right-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
            font-size: 15px;
        }
        .right-description {
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
        }
        .security-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin: 20px 0;
        }
        .security-item {
            background: #f8fafc;
            padding: 16px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .security-item::before {
            content: "•";
            color: #70A18E;
            font-weight: bold;
            font-size: 18px;
            display: block;
            margin-bottom: 8px;
        }
        .legal-note {
            background: #f1f5f9;
            padding: 16px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 4px solid #70A18E;
        }
        .legal-note strong {
            color: #1e293b;
        }
        .terms-section {
            margin: 25px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡ITZEL te da la bienvenida!</h1>
        </div>
        
        <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>Gracias por registrarte en nuestro sistema de gestión. Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de correo electrónico.</p>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                    Verificar correo electrónico
                </a>
            </div>
            
            <div class="info-box">
                <p><strong>Este enlace expira en 24 horas</strong></p>
                <p>Si no solicitaste esta verificación, puedes ignorar este correo de manera segura.</p>
            </div>
            
            <!-- Sección Legal Mejorada -->
            <div class="legal-section">
                <h3 class="section-title">Aviso de Privacidad</h3>
                <p>
                    En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, 
                    te informamos que los datos personales que nos proporciones serán utilizados exclusivamente para:
                </p>
                
                <div class="featured-list">
                    <div class="list-item">
                        <div class="list-content">Gestión y administración de tu cuenta de usuario</div>
                    </div>
                    
                    <div class="list-item">
                        <div class="list-content">Comunicación relacionada con los servicios del sistema</div>
                    </div>
                    
                    <div class="list-item">
                        <div class="list-content">Mejora continua de nuestros servicios</div>
                    </div>
                    
                    <div class="list-item">
                        <div class="list-content">Cumplimiento de obligaciones legales y regulatorias</div>
                    </div>
                </div>

                <!-- Sección de Términos y Condiciones -->
                <div class="terms-section">
                    <h4 class="section-title">Términos y Condiciones de Uso</h4>
                    <p>
                        Al verificar tu correo electrónico y activar tu cuenta, aceptas los siguientes términos:
                    </p>
                    
                    <div class="featured-list">
                        <div class="list-item">
                            <div class="list-content">
                                <strong>Responsabilidad:</strong> Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta.
                            </div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-content">
                                <strong>Uso apropiado:</strong> Te comprometes a usar el sistema de manera responsable y conforme a las políticas establecidas.
                            </div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-content">
                                <strong>Datos personales:</strong> Los datos proporcionados deben ser verídicos y actualizados.
                            </div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-content">
                                <strong>Seguridad:</strong> Implementamos medidas de seguridad para proteger tus datos, pero también requieres mantener buenas prácticas de seguridad.
                            </div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-content">
                                <strong>Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos, notificándote con anticipación.
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de Derechos ARCO -->
                <div class="arco-rights">
                    <h4 class="section-title">Derechos ARCO</h4>
                    <p>
                        De acuerdo con la Ley Federal de Protección de Datos Personales, puedes ejercer tus derechos ARCO 
                        (Acceso, Rectificación, Cancelación y Oposición) sobre tu información personal.
                    </p>
                    
                    <div class="rights-grid">
                        <div class="right-item">
                            <div class="right-title">Acceso</div>
                            <div class="right-description">Conocer tu información personal en nuestros registros</div>
                        </div>
                        <div class="right-item">
                            <div class="right-title">Rectificación</div>
                            <div class="right-description">Actualizar o corregir datos inexactos</div>
                        </div>
                        <div class="right-item">
                            <div class="right-title">Cancelación</div>
                            <div class="right-description">Eliminar tu información cuando ya no sea necesaria</div>
                        </div>
                        <div class="right-item">
                            <div class="right-title">Oposición</div>
                            <div class="right-description">Oponerte a ciertos usos de tus datos</div>
                        </div>
                    </div>
                </div>

                <!-- Sección de Protección de Datos -->
                <div style="margin-top: 25px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
                    <h4 class="section-title">Protección de Datos</h4>
                    <p>
                        Tus datos están protegidos mediante:
                    </p>
                    <div class="security-grid">
                        <div class="security-item">Cifrado de contraseñas mediante algoritmos seguros</div>
                        <div class="security-item">Protocolos de seguridad en la transmisión de datos</div>
                        <div class="security-item">Acceso restringido a información sensible</div>
                        <div class="security-item">Auditorías periódicas de seguridad</div>
                    </div>
                </div>

                <!-- Información de Contacto -->
                <div class="contact-info">
                    <p><strong>Para ejercer tus derechos ARCO o consultas sobre privacidad:</strong></p>
                    <p style="font-size: 16px; margin: 10px 0;"><strong>${process.env.PRIVACY_EMAIL || 'https://www.sistemaitzel.site/'}</strong></p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Sistema de Gestión de Turnos</strong></p>
            <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
            <p style="margin-top: 15px;">
                © ${new Date().getFullYear()} Todos los derechos reservados
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Envía el email de verificación
 */
const sendVerificationEmail = async (email, nombre, verificationToken) => {
    try {
        const verificationUrl = `${process.env.FRONTEND_URL || 'https://sistemaitzel.site'}/verificar-email?token=${verificationToken}`;

        const mailOptions = {
            from: `"Sistema de Gestión" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '✓ Verifica tu correo electrónico - Completa tu registro',
            html: getVerificationEmailTemplate(nombre, verificationUrl)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email de verificación enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email de verificación:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    transporter
};

