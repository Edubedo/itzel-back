const CatalogoUsuariosModel = require("../../models/tipos_usuarios.model");

const getUsuarios = async(req, res) => {

    // enviar dsata
    const response = await CatalogoUsuariosModel.findAll();
    
    console.log("response: ", response)
    return res.json({usuarios: response,  message: "getUsuarios ok" });

}


module.exports = { getUsuarios };