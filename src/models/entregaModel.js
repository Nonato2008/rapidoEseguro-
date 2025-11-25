const { sql, getConnection } = require("../config/db")

const entregaModel = {

    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            const querySQL = `
            SELECT *
            FROM ENTREGAS
            `;

            const result = await pool.request().query(sql);
               

            return result.recordset;
        } catch (error) {

            cosnole.error("Erro ao buscar pedidos", error);
            throw error;
        }
    },
    buscarUm: async (idEntrega) => {
        try {

            const pool = await getConnection();

            const querySQL = "SELECT * FROM ENTREGAS WHERE idEnrega = @idEntrega";

            const result = await pool.request()
                .input("idEntrega".sql.UniqueIdentifier, idEntrega)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Errao buscar pedidos", error);
            throw error;
        }
    },

    inserirEntrega: async (idPedido, valorDistanciaEntrega, valorPesoEntrega, descontoEntrega, acrescimoEntrega, taxaEntrega, valorFinalEntrega, statusEntrega) =>{

        const pool = await getConnection();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {

            let querySQL = `
            INSERT INTO ENTREGAS(idPedido, valorDistanciaEntrega, valorPesoEntrega, descontoEntrega, acrescimoEntrega, taxaExtraEntrega, valorFinalEntrega, statusEntrega)
            OUTPUT INSERTED.idEntrega
            VALUES(@acrescimoEntrega, @taxaEntrega, @valorFinalEntrega, @statusEntrega)
            `

            const result = await transaction.request()
            .input("idPedido", sql.UniqueIdentifier, idPedido)
            .input("valorDistanciaEntrega", sql.Decimal(10,2), valorDistanciaEntrega)
            .input("valorPesoEntrega", sql.Decimal(10,2), valorPesoEntrega)
            .input("descontoEntrega", sql.Decimal(10,2), descontoEntrega)
            .input("acrescimoEntrega", sql.Decimal(10,2), acrescimoEntrega)
            .input("taxaExtraEntrega", sql.Decimal(10,2), taxaEntrega)
            .input("valorFinalEntrega", sql.Decimal(10,2), valorFinalEntrega)
            .input("statusEntrega", sql.VarChar(12), statusEntrega)
            .query(querySQL)

            await transaction.commit(); 
            
        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao inserir pedido", error)
            throw error;
        }
    }

}

module.exports = {entregaModel}