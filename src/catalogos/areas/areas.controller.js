const CatalogoAreasModel = require("../../models/areas.model");

const getAreas = async(req, res) => {

    // enviar dsata
    const response = await CatalogoAreasModel.findAll();
    
    console.log("response: ", response)
    return res.json({areas: response,  message: "getAreas ok" });

}


module.exports = { getAreas };