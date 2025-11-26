const ConfiguracionUsuariosModel = require('../../models/configuracion_usuarios.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const SALT_ROUNDS = 10;

// Configura nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Correo Gmail
    pass: process.env.GMAIL_PASS  // Contraseña de aplicación
  }
});

// 1. Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await ConfiguracionUsuariosModel.findOne({
      where: { s_correo_electronico: email }
    });

    if (!usuario) {
      return res.status(404).json({ message: "Correo no registrado" });
    }

    // Genera un código de 6 dígitos y fecha de expiración (15 min)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    // Guarda el código y expiración en el usuario
    await usuario.update({
      reset_code: code,
      reset_code_expires: expires
    });

    // Envía el correo
    await transporter.sendMail({
      from: `"ITZEL" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      text: `Tu código de recuperación es: ${code}\nEste código expira en 15 minutos.`
    });

    return res.status(200).json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error);
    return res.status(500).json({ message: "Error al enviar el código" });
  }
};

// 2. Verificar código y cambiar contraseña
exports.verifyCode = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const usuario = await ConfiguracionUsuariosModel.findOne({
      where: { s_correo_electronico: email }
    });

    if (!usuario) {
      return res.status(400).json({ message: "Solicitud inválida" });
    }

    if (!usuario.reset_code || !usuario.reset_code_expires) {
      return res.status(400).json({ message: "Solicitud inválida. Por favor solicita un nuevo código." });
    }

    // Verificar el código
    if (usuario.reset_code !== code) {
      return res.status(400).json({ message: "Código inválido" });
    }

    // Verificar expiración
    const now = new Date();
    if (now > usuario.reset_code_expires) {
      return res.status(400).json({ message: "Código expirado. Por favor solicita un nuevo código." });
    }

    // Cambia la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await usuario.update({
      s_password: hashedPassword,
      reset_code: null,
      reset_code_expires: null
    });

    return res.status(200).json({ message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.error('[VERIFY CODE] Error:', error);
    return res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
};