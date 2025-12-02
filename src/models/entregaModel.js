const { UniqueIdentifier } = require("mssql");
const { sql, getConnection } = require("../config/db")

const entregaModel = {

    /**
     * Busca por todas as entregas cadastradas no banco de dados.
     * 
     * @async
     * @function buscarTodos
     * 
     * @returns {Promise<Array>}Retorna todas as entregas existentes
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    buscarTodos: async () => {
        try {
            const pool /*CRIA CONEXÃO COM O BANCO DE DADOS*/  = await getConnection();

            const querySQL = `
            SELECT 
                ET.idEntrega,
                PD.idPedido,
                PD.tipoEntregaPedido,
                ET.valorDistanciaEntrega,
                ET.valorPesoEntrega,
                ET.descontoEntrega,
                ET.acrescimoEntrega,
                ET.taxaExtraEntrega,
                ET.valorFinalEntrega,
                ET.statusEntrega
            FROM ENTREGAS ET
            INNER JOIN PEDIDOS PD
            ON PD.idPedido = ET.idPedido`;

            const result = await pool.request().query(querySQL);


            return result.recordset;
        } catch (error) {

            console.error("Erro ao buscar pedidos", error);
            throw error;// PASSA O ERRO PARA O CONTROLLER TRATAR
        }
    },

    /**
     * Busca por uma entrega em específico e seus respectivos itens
     * 
     * @async
     * @function buscarUm
     * @param {idEntrega}
     * @returns {Promise<Array>}Retorna a entrega procurada na requisição
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */


    buscarUm: async (idEntrega) => {
        try {

            const pool = await getConnection();

            const querySQL = `
            SELECT 
                ET.idEntrega,
                PD.idPedido,
                PD.tipoEntregaPedido,
                ET.valorDistanciaEntrega,
                ET.valorPesoEntrega,
                ET.descontoEntrega,
                ET.acrescimoEntrega,
                ET.taxaExtraEntrega,
                ET.valorFinalEntrega,
                ET.statusEntrega
            FROM ENTREGAS ET
            INNER JOIN PEDIDOS PD
            ON PD.idPedido = ET.idPedido
            WHERE ET.idEntrega = @idEntrega;`;

            const result = await pool.request()
                .input("idEntrega", UniqueIdentifier, idEntrega)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar pedidos", error);
            throw error;
        }
    }
}

module.exports = { entregaModel }