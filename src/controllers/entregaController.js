const { getConnection } = require("../config/db");
const { clienteModel } = require("../models/clienteModel");
const { entregaModel } = require("../models/entregaModel");

const entregaController = {

    listarEntregas: async (req, res) => {
        try {
            const { idEntrega } = req.query;

            if (idEntrega) {
                if (idEntrega.length != 36) {
                    return res.status(400).json({ erro: "id da entrega inválida" })
                }
                const entrega = await entregaModel.buscarUm(idEntrega)

                return res.status(200).json(entrega)
            }

            const entregas = await entregaModel.buscarTodos();


            res.status(200).json(entregas)

        } catch (error) {
            console.error("Erro ao listar entregas:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao listar entregas!" });
        }
    },

    inserirEntrega: async (req, res) => {
        try {
            const {} = req.body

            
        } catch (error) {
            
        }
    }

}

module.exports = { entregaController }