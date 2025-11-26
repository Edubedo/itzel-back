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
  try {
    console.log(`[VERIFY CODE] ========== INICIO VERIFICACIÓN ==========`);
    console.log(`[VERIFY CODE] Body completo recibido:`, JSON.stringify(req.body, null, 2));
    console.log(`[VERIFY CODE] Headers:`, req.headers);
    
    const { email, code, newPassword } = req.body;
    
    // Validar que todos los campos requeridos estén presentes
    if (!email || !code || !newPassword) {
      console.log(`[VERIFY CODE] ❌ Faltan campos requeridos`);
      console.log(`[VERIFY CODE] - email: ${email ? '✓' : '✗'}`);
      console.log(`[VERIFY CODE] - code: ${code ? '✓' : '✗'}`);
      console.log(`[VERIFY CODE] - newPassword: ${newPassword ? '✓' : '✗'}`);
      return res.status(400).json({ 
        message: "Faltan campos requeridos. Por favor proporciona email, código y nueva contraseña." 
      });
    }
    
    console.log(`[VERIFY CODE] Email: ${email}`);
    console.log(`[VERIFY CODE] Código recibido: "${code}" (tipo: ${typeof code})`);
    console.log(`[VERIFY CODE] Nueva contraseña: ${newPassword ? '***' : 'no proporcionada'}`);
    
    // Usar consulta raw para obtener los datos directamente de la BD sin interpretación de Sequelize
    const { ConnectionDatabase } = require('../../config/connectDatabase');
    const { QueryTypes } = require('sequelize');
    
    const rawUser = await ConnectionDatabase.query(
      `SELECT reset_code, reset_code_expires, ck_usuario, s_password 
       FROM configuracion_usuarios 
       WHERE s_correo_electronico = :email`,
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );

    if (!rawUser || rawUser.length === 0) {
      console.log(`[VERIFY CODE] ❌ Usuario no encontrado en BD: ${email}`);
      return res.status(400).json({ message: "Correo electrónico no encontrado. Por favor verifica el correo." });
    }

    const userData = rawUser[0];
    console.log(`[VERIFY CODE] Datos RAW de BD:`);
    console.log(`[VERIFY CODE] - reset_code: "${userData.reset_code}" (tipo BD: ${typeof userData.reset_code})`);
    console.log(`[VERIFY CODE] - reset_code_expires: "${userData.reset_code_expires}" (tipo BD: ${typeof userData.reset_code_expires})`);

    if (!userData.reset_code || !userData.reset_code_expires) {
      console.log(`[VERIFY CODE] No hay código de reset guardado en BD`);
      return res.status(400).json({ message: "Solicitud inválida. Por favor solicita un nuevo código." });
    }
    
    // También obtener el usuario con Sequelize para poder actualizarlo después
    const usuario = await ConfiguracionUsuariosModel.findOne({
      where: { s_correo_electronico: email }
    });

    if (!usuario) {
      console.log(`[VERIFY CODE] Usuario no encontrado con Sequelize: ${email}`);
      return res.status(400).json({ message: "Solicitud inválida" });
    }

    // Verificar el código usando los datos RAW de la BD
    // Normalizar ambos códigos como strings, eliminando espacios y ceros a la izquierda
    let storedCode = userData.reset_code;
    if (storedCode === null || storedCode === undefined) {
      console.log(`[VERIFY CODE] ERROR: reset_code es null o undefined en BD`);
      return res.status(400).json({ message: "Solicitud inválida. Por favor solicita un nuevo código." });
    }
    
    // Convertir a string y normalizar
    storedCode = String(storedCode).trim().replace(/^0+/, ''); // Eliminar ceros a la izquierda
    const receivedCode = String(code || '').trim().replace(/^0+/, ''); // Eliminar ceros a la izquierda
    
    console.log(`[VERIFY CODE] Comparando códigos:`);
    console.log(`[VERIFY CODE] - Código en BD (normalizado): "${storedCode}"`);
    console.log(`[VERIFY CODE] - Código recibido (normalizado): "${receivedCode}"`);
    
    if (storedCode !== receivedCode) {
      console.log(`[VERIFY CODE] ❌ Código incorrecto`);
      console.log(`[VERIFY CODE] - Esperado: "${storedCode}"`);
      console.log(`[VERIFY CODE] - Recibido: "${receivedCode}"`);
      return res.status(400).json({ message: "Código inválido" });
    }
    
    console.log(`[VERIFY CODE] ✅ Código correcto`);

    // Verificar expiración usando los datos RAW de la BD
    const now = Date.now(); // Timestamp en milisegundos UTC
    let expiresTimestamp;
    
    // Convertir la fecha de la BD a timestamp
    const expiresDate = userData.reset_code_expires;
    if (!expiresDate) {
      console.log(`[VERIFY CODE] ERROR: reset_code_expires es null o undefined en BD`);
      return res.status(400).json({ message: "Error al validar el código. Por favor solicita un nuevo código." });
    }
    
    // Manejar diferentes formatos que puede devolver MySQL
    if (expiresDate instanceof Date) {
      expiresTimestamp = expiresDate.getTime();
    } else if (typeof expiresDate === 'string') {
      // MySQL puede devolver la fecha como string en formato 'YYYY-MM-DD HH:mm:ss'
      expiresTimestamp = new Date(expiresDate).getTime();
      // Verificar que la fecha es válida
      if (isNaN(expiresTimestamp)) {
        console.log(`[VERIFY CODE] ERROR: No se pudo parsear la fecha: "${expiresDate}"`);
        return res.status(400).json({ message: "Error al validar el código. Por favor solicita un nuevo código." });
      }
    } else {
      console.log(`[VERIFY CODE] ERROR: Formato de fecha inválido: ${typeof expiresDate}, valor: ${expiresDate}`);
      return res.status(400).json({ message: "Error al validar el código. Por favor solicita un nuevo código." });
    }
    
    const timeDifference = expiresTimestamp - now;
    const secondsRemaining = Math.floor(timeDifference / 1000);
    const minutesRemaining = Math.floor(secondsRemaining / 60);
    
    console.log(`[VERIFY CODE] Verificación de expiración:`);
    console.log(`[VERIFY CODE] - Timestamp actual: ${now} (${new Date(now).toISOString()})`);
    console.log(`[VERIFY CODE] - Timestamp expiración: ${expiresTimestamp} (${new Date(expiresTimestamp).toISOString()})`);
    console.log(`[VERIFY CODE] - Diferencia: ${timeDifference}ms (${secondsRemaining}s / ${minutesRemaining}min)`);
    
    // Agregar un margen de tolerancia de 30 segundos para evitar problemas de sincronización
    // entre el servidor y la base de datos (extender el tiempo de expiración)
    const tolerance = 30000; // 30 segundos en milisegundos
    const expiresWithTolerance = expiresTimestamp + tolerance;
    
    if (now > expiresWithTolerance) {
      console.log(`[VERIFY CODE] ❌ Código expirado`);
      console.log(`[VERIFY CODE] - Ahora: ${new Date(now).toISOString()}`);
      console.log(`[VERIFY CODE] - Expira: ${new Date(expiresTimestamp).toISOString()}`);
      console.log(`[VERIFY CODE] - Diferencia: ${timeDifference}ms (${secondsRemaining}s)`);
      return res.status(400).json({ message: "Código expirado. Por favor solicita un nuevo código." });
    }
    
    console.log(`[VERIFY CODE] ✅ Código válido y no expirado`);
    console.log(`[VERIFY CODE] Cambiando contraseña...`);

    // Cambia la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await usuario.update({
      s_password: hashedPassword,
      reset_code: null,
      reset_code_expires: null
    });

    console.log(`[VERIFY CODE] ✅ Contraseña cambiada exitosamente para: ${email}`);
    console.log(`[VERIFY CODE] ========== FIN VERIFICACIÓN EXITOSA ==========`);
    return res.status(200).json({ message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.error('[VERIFY CODE] ❌ ERROR EN VERIFICACIÓN:', error);
    console.error('[VERIFY CODE] Stack trace:', error.stack);
    console.log(`[VERIFY CODE] ========== FIN VERIFICACIÓN CON ERROR ==========`);
    
    // Si el error ya tiene un status code, usarlo; si no, usar 500
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ 
      message: error.message || "Error al cambiar la contraseña", 
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};