import express from "express";
import cors from "cors";
import notificacionesRoutes from "../operaciones/turnos/notificaciones.router";

const app = express();
app.use(cors());
app.use(express.json());

// Registrar la ruta
app.use("/api/notificaciones", notificacionesRoutes);

export default app;
