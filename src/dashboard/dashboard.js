// routes/dashboard.js

const express = require("express");
const router = express.Router();




const router = express.Router();

// Clientes del día
router.get("/clientes/hoy", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM clientes WHERE DATE(fecha_registro) = CURDATE()"
    );
    res.json({ success: true, data: { total: rows[0].total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Turnos del día
router.get("/turnos/hoy", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM turnos WHERE DATE(fecha_creacion) = CURDATE()"
    );
    res.json({ success: true, data: { total: rows[0].total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
