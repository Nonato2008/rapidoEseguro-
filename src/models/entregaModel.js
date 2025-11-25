const { sql, getConnection } = require("../config/db")

const entregaModel = {

    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            const querySQL = `
            SELECT *
            FROM ENTREGAS
            `;

            const result = await pool.request().query(querySQL);


            return result.recordset;
        } catch (error) {

            cosnole.error("Erro ao buscar pedidos", error);
            throw error;
        }
    },
    buscarUm: async (idEntrega) => {
        try {

            const pool = await getConnection();

            const querySQL = `
            SELECT 
                ET.idEntrega,
                pd.idPedido,
                ET.valorDistanciaEntrega,
                ET.valorPesoEntrega,
                ET.descontoEntrega,
                ET.acrescimoEntrega,
                ET.taxaExtraEntrega,
                ET.valorFinalEntrega,
                ET.statusEntrega
            FROM ENTREGAS ET
            INNER JOIN PEDIDOS PD
            ON PD.idPedido = pd.idPedido
            WHERE ET.idEntrega = @idEntrega;`;

            const result = await pool.request()
                .input("idEntrega".sql.UniqueIdentifier, idEntrega)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Errao buscar pedidos", error);
            throw error;
        }
    }
}

module.exports = { entregaModel }