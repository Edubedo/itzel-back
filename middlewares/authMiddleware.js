const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "SECRET";

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Adjuntar el usuario decodificado al request
        next();
    } catch (error) {
        console.log("error: ", error)
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

module.exports = authMiddleware;