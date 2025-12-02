const { getConnection } = require("../config/db");
const { clienteModel } = require("../models/clienteModel");
const { entregaModel } = require("../models/entregaModel");



const entregaController = {

    /**
     * Controlador que lista todas as entregas do banco de dados.
     * 
     * @async
     * @function listarEntregas
     * @param {objetct} req - Objeto da requisição (recebido da entrega HTTP)
     * @param {object} res - Objeto da resposta (enviado a entrega HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON com a lista de entregas.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao buscar as entregas.
     */

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
            throw error;
        }
    }
}

module.exports = { entregaController }