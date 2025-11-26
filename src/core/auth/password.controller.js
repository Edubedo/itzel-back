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
    console.log(`[FORGOT PASSWORD] Solicitud recibida para: ${email}`);
    
    const usuario = await ConfiguracionUsuariosModel.findOne({
      where: { s_correo_electronico: email }
    });

    if (!usuario) {
      console.log(`[FORGOT PASSWORD] Usuario no encontrado: ${email}`);
      return res.status(404).json({ message: "Correo no registrado" });
    }

    // Genera un código de 6 dígitos y fecha de expiración (15 min)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Calcular fecha de expiración: 15 minutos desde ahora
    // Usar Date.now() para obtener timestamp en milisegundos UTC
    const expiresTimestamp = Date.now() + (15 * 60 * 1000);
    const expires = new Date(expiresTimestamp);
    
    console.log(`[FORGOT PASSWORD] Código generado: ${code}`);
    console.log(`[FORGOT PASSWORD] Timestamp expiración: ${expiresTimestamp}`);
    console.log(`[FORGOT PASSWORD] Fecha expiración (ISO): ${expires.toISOString()}`);

    // Guarda el código y expiración en el usuario
    await usuario.update({
      reset_code: code,
      reset_code_expires: expires
    });

    // Recargar el usuario para verificar que se guardó correctamente
    await usuario.reload();
    const savedExpires = usuario.reset_code_expires;
    const savedExpiresTimestamp = savedExpires instanceof Date 
      ? savedExpires.getTime() 
      : new Date(savedExpires).getTime();
    
    console.log(`[FORGOT PASSWORD] Código guardado en BD: ${usuario.reset_code}`);
    console.log(`[FORGOT PASSWORD] Expira guardado (ISO): ${savedExpires instanceof Date ? savedExpires.toISOString() : new Date(savedExpires).toISOString()}`);
    console.log(`[FORGOT PASSWORD] Timestamp guardado: ${savedExpiresTimestamp}`);
    console.log(`[FORGOT PASSWORD] Verificación: ${expiresTimestamp === savedExpiresTimestamp ? 'OK' : 'DIFERENCIA DETECTADA'}`);

    // Envía el correo
    await transporter.sendMail({
      from: `"ITZEL" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      text: `Tu código de recuperación es: ${code}\nEste código expira en 15 minutos.`
    });

    console.log(`[FORGOT PASSWORD] Correo enviado exitosamente a: ${email}`);
    return res.status(200).json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error);
    return res.status(500).json({ message: "Error al enviar el código", error: error.message });
  }
};

// 2. Verificar código y cambiar contraseña
exports.verifyCode = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    console.log(`[VERIFY CODE] Verificando código para: ${email}`);
    console.log(`[VERIFY CODE] Código recibido: ${code}`);
    
    const usuario = await ConfiguracionUsuariosModel.findOne({
      where: { s_correo_electronico: email }
    });

    if (!usuario) {
      console.log(`[VERIFY CODE] Usuario no encontrado: ${email}`);
      return res.status(400).json({ message: "Solicitud inválida" });
    }

    // Recargar el usuario para asegurar datos actualizados
    await usuario.reload();
    
    console.log(`[VERIFY CODE] Usuario encontrado. Reset code en BD: ${usuario.reset_code || 'null'}`);
    console.log(`[VERIFY CODE] Expira en BD: ${usuario.reset_code_expires || 'null'}`);
    console.log(`[VERIFY CODE] Fecha actual: ${new Date().toISOString()}`);

    if (!usuario.reset_code || !usuario.reset_code_expires) {
      console.log(`[VERIFY CODE] No hay código de reset guardado`);
      return res.status(400).json({ message: "Solicitud inválida. Por favor solicita un nuevo código." });
    }

    // Verificar el código primero - normalizar ambos códigos como strings
    // Manejar casos donde el código puede venir como número o string desde la BD
    let storedCode = usuario.reset_code;
    if (typeof storedCode === 'number') {
      storedCode = String(storedCode);
    } else {
      storedCode = String(storedCode || '').trim();
    }
    const receivedCode = String(code || '').trim();
    
    console.log(`[VERIFY CODE] Comparando códigos - Tipo almacenado: ${typeof usuario.reset_code}, Valor: "${storedCode}"`);
    console.log(`[VERIFY CODE] Código recibido: "${receivedCode}"`);
    
    if (storedCode !== receivedCode) {
      console.log(`[VERIFY CODE] Código incorrecto. Esperado: "${storedCode}" (tipo: ${typeof usuario.reset_code}), Recibido: "${receivedCode}" (tipo: ${typeof code})`);
      return res.status(400).json({ message: "Código inválido" });
    }

    // Verificar expiración usando timestamps en milisegundos para evitar problemas de zona horaria
    // Esto es crítico en producción donde la BD puede estar en diferente zona horaria
    const now = Date.now(); // Timestamp en milisegundos UTC
    let expiresTimestamp;
    
    // Manejar diferentes formatos de fecha que puede devolver la BD
    if (usuario.reset_code_expires instanceof Date) {
      expiresTimestamp = usuario.reset_code_expires.getTime();
    } else if (typeof usuario.reset_code_expires === 'string') {
      expiresTimestamp = new Date(usuario.reset_code_expires).getTime();
    } else {
      console.log(`[VERIFY CODE] Formato de fecha inválido: ${typeof usuario.reset_code_expires}`);
      return res.status(400).json({ message: "Error al validar el código. Por favor solicita un nuevo código." });
    }
    
    const timeDifference = expiresTimestamp - now;
    const secondsRemaining = Math.floor(timeDifference / 1000);
    
    console.log(`[VERIFY CODE] Timestamp actual: ${now} (${new Date(now).toISOString()})`);
    console.log(`[VERIFY CODE] Timestamp expiración: ${expiresTimestamp} (${new Date(expiresTimestamp).toISOString()})`);
    console.log(`[VERIFY CODE] Diferencia en ms: ${timeDifference}, Tiempo restante: ${secondsRemaining} segundos`);
    
    // Agregar un margen de tolerancia de 5 segundos para evitar problemas de sincronización
    // entre el servidor y la base de datos (extender el tiempo de expiración)
    const tolerance = 5000; // 5 segundos en milisegundos
    const expiresWithTolerance = expiresTimestamp + tolerance;
    
    if (now > expiresWithTolerance) {
      console.log(`[VERIFY CODE] Código expirado. Ahora: ${new Date(now).toISOString()}, Expira: ${new Date(expiresTimestamp).toISOString()}, Diferencia: ${timeDifference}ms`);
      return res.status(400).json({ message: "Código expirado. Por favor solicita un nuevo código." });
    }

    console.log(`[VERIFY CODE] Código válido, cambiando contraseña...`);

    // Cambia la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await usuario.update({
      s_password: hashedPassword,
      reset_code: null,
      reset_code_expires: null
    });

    console.log(`[VERIFY CODE] Contraseña cambiada exitosamente para: ${email}`);
    return res.status(200).json({ message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.error('[VERIFY CODE] Error:', error);
    return res.status(500).json({ message: "Error al cambiar la contraseña", error: error.message });
  }
};