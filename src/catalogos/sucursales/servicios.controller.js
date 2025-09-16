const { CatalogoServiciosModel } = require("../../models");

const getServicios = async(req, res) => {

    // enviar data
    const response = await CatalogoServiciosModel.findAll();
    return res.json({servicios: response,  message: "getServicios ok" });

}


module.exports = { getServicios };