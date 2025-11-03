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
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #70A18E 0%, #547A6B 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #547A6B;
            margin-top: 0;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, #8ECAB2 0%, #70A18E 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 25px 0;
            text-align: center;
        }
        .button:hover {
            opacity: 0.9;
        }
        .info-box {
            background-color: #B7F2DA;
            border-left: 4px solid #70A18E;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 5px 0;
            font-size: 14px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .legal-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
        }
        .legal-section h3 {
            color: #547A6B;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .legal-section p {
            font-size: 13px;
            color: #3A554B;
            text-align: justify;
            margin-bottom: 15px;
        }
        .legal-section ul {
            font-size: 13px;
            color: #3A554B;
            margin-left: 20px;
        }
        .legal-section li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a Nuestro Sistema!</h1>
        </div>
        
        <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>Gracias por registrarte en nuestro sistema de gestión. Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de correo electrónico.</p>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                    ✓ Verificar correo electrónico
                </a>
            </div>
            
            <div class="info-box">
                <p><strong>⏱ Este enlace expira en 24 horas</strong></p>
                <p>Si no solicitaste esta verificación, puedes ignorar este correo de manera segura.</p>
            </div>
            
            <!-- Sección Legal -->
            <div class="legal-section">
                <h3>◆ Aviso de Privacidad</h3>
                <p>
                    En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, 
                    te informamos que los datos personales que nos proporciones serán utilizados exclusivamente para:
                </p>
                <ul>
                    <li>▸ Gestión y administración de tu cuenta de usuario</li>
                    <li>▸ Comunicación relacionada con los servicios del sistema</li>
                    <li>▸ Mejora continua de nuestros servicios</li>
                    <li>▸ Cumplimiento de obligaciones legales y regulatorias</li>
                </ul>
                
                <h3>◆ Términos y Condiciones de Uso</h3>
                <p>
                    Al verificar tu correo electrónico y activar tu cuenta, aceptas los siguientes términos:
                </p>
                <ul>
                    <li><strong>▸ Responsabilidad:</strong> Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta.</li>
                    <li><strong>▸ Uso apropiado:</strong> Te comprometes a usar el sistema de manera responsable y conforme a las políticas establecidas.</li>
                    <li><strong>▸ Datos personales:</strong> Los datos proporcionados deben ser verídicos y actualizados. Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales.</li>
                    <li><strong>▸ Seguridad:</strong> Implementamos medidas de seguridad para proteger tus datos, pero también requieres mantener buenas prácticas de seguridad.</li>
                    <li><strong>▸ Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos, notificándote con anticipación.</li>
                </ul>

                <h3>◆ Protección de Datos</h3>
                <p>
                    Tus datos están protegidos mediante:
                </p>
                <ul>
                    <li>▸ Cifrado de contraseñas mediante algoritmos seguros</li>
                    <li>▸ Protocolos de seguridad en la transmisión de datos</li>
                    <li>▸ Acceso restringido a información sensible</li>
                    <li>▸ Auditorías periódicas de seguridad</li>
                </ul>
                
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Para más información sobre nuestras políticas de privacidad o si tienes alguna pregunta, 
                    contáctanos a través de nuestros canales oficiales de soporte.
                </p>
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
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar-email?token=${verificationToken}`;

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

