// src/dashboard/dashboard.controller.js
const { ConnectionDatabase } = require('../../config/connectDatabase');
const { QueryTypes } = require('sequelize');

// Clientes del día
exports.getClientesDelDia = async (req, res) => {
  try {
    const rows = await ConnectionDatabase.query(
       `
      SELECT COUNT(*) as total
      FROM operacion_turnos
      WHERE d_fecha_creacion >= CURRENT_DATE
        AND d_fecha_creacion < CURRENT_DATE + INTERVAL '1 day'
        AND ck_estatus = 'ATENDI'
      `,
      { type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: { total: rows[0]?.total || 0 } });

  } catch (err) {
    console.error('Error en getClientesDelDia:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Turnos del día
exports.getTurnosDelDia = async (req, res) => {
  try {
    const rows = await ConnectionDatabase.query(
      `
      SELECT COUNT(*) AS total
      FROM operacion_turnos
      WHERE DATE(d_fecha_creacion) = CURRENT_DATE
      `,
      { type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: { total: rows[0]?.total || 0 } });
  } catch (err) {
    console.error('Error en getTurnosDelDia:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// Servicios mensuales
exports.getServiciosMensuales = async (req, res) => {
  try {
    const rows = await ConnectionDatabase.query(
     `SELECT cs.s_servicio, COUNT(*) AS total
       FROM operacion_turnos ot
       JOIN catalogo_servicios cs ON cs.ck_servicio = ot.ck_servicio
       WHERE EXTRACT(MONTH FROM ot.d_fecha_creacion) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM ot.d_fecha_creacion) = EXTRACT(YEAR FROM CURRENT_DATE)
       GROUP BY cs.s_servicio
       ORDER BY total DESC
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );
   // Transformar a la estructura que espera frontend
    const labels = rows.map(row => row.s_servicio);
    const data = rows.map(row => row.total);

    res.json({
      success: true,
      data: {
        labels,
        series: [
          {
            name: "Servicios solicitados",
            data,
          },
        ],
      },
    });
  } catch (err) {
    console.error('Error en getServiciosMensuales:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};




// Turnos mensuales por sucursal
exports.getEstadisticasTurnosMensuales = async (req, res) => {
  const { ck_sucursal } = req.query;

  try {
    const rows = await ConnectionDatabase.query(
      `
      SELECT 
        TO_CHAR(d_fecha_creacion, 'Month') AS mes,
        EXTRACT(MONTH FROM d_fecha_creacion) AS numero_mes,
        COUNT(*) AS total_turnos
      FROM operacion_turnos
      WHERE ck_estatus = 'ATENDI'
        AND EXTRACT(YEAR FROM d_fecha_creacion) = EXTRACT(YEAR FROM CURRENT_DATE)
        ${ck_sucursal ? "AND ck_sucursal = :ck_sucursal" : ""}
      GROUP BY numero_mes, mes
      ORDER BY numero_mes
      `,
      {
        replacements: ck_sucursal ? { ck_sucursal } : {},
        type: QueryTypes.SELECT,
      }
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error en getEstadisticasTurnosMensuales:", err);
    res.status(500).json({ success: false, message: err.message });
  }


};


// Turnos del día agrupados por área
exports.getTurnosPorAreaHoy = async (req, res) => {
  try {
    const rows = await ConnectionDatabase.query(
      `
      SELECT 
        ca.s_area AS area,
        COUNT(ot.ck_turno) AS total_turnos
      FROM catalogo_area ca
      LEFT JOIN operacion_turnos ot 
        ON ca.ck_area = ot.ck_area 
        AND DATE(ot.d_fecha_creacion) = CURRENT_DATE
      GROUP BY ca.s_area
      ORDER BY ca.s_area ASC
      `,
      { type: QueryTypes.SELECT }
    );

    const labels = rows.map(r => r.area);
    const data = rows.map(r => parseInt(r.total_turnos, 10));

    res.json({
      success: true,
      data: {
        labels,
        series: [
          {
            name: "Turnos Emitidos Hoy",
            data,
          },
        ],
      },
    });
  } catch (err) {
    console.error("Error en getTurnosPorAreaHoy:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

