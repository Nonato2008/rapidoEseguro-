const { sql, getConnection } = require("../config/db")

const pedidoModel = {

    buscarTodos: async () => {

        try {

            const pool = await getConnection();

            const querySQL = `
            SELECT 
                PD.idPedido,
                CL.idCliente,
                PD.dataPedido,
                PD.tipoEntregaPedido,
                PD.distanciaPedido,
                PD.pesoPedido,
                PD.valorBaseKmPedido,
                PD.valorBaseKgPedido
            FROM PEDIDOS PD
                INNER JOIN Clientes CL
                ON CL.idCliente = PD.idCliente
            `;

            const result = await pool.request()
                .query(querySQL);

            return result.recordset;


        } catch (error) {

            console.error("Erro ao buscar pedidos", error);
            throw error;

        }

    },

    buscarUm: async (idPedido) => {
        try {

            const pool = await getConnection();

            const querySQL = "SELECT * FROM PEDIDOS WHERE idPedido = @idPedido";

            const result = await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar pedidos", error);
            throw error;
        }
    },

    inserirPedidos: async (idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido, valorDistanciaEntrega, valorPesoEntrega, valorFinalEntrega, acrescimoEntrega, descontoEntrega, taxaExtraEntrega, statusEntrega) => {

        const pool = await getConnection();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {

            let querySQL = `
            INSERT INTO Pedidos (idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido)
            OUTPUT INSERTED.idPedido
            VALUES (@idCliente, @dataPedido, @tipoEntregaPedido, @distanciaPedido, @pesoPedido, @valorBaseKmPedido, @valorBaseKgPedido)
            `
            
            const result = await transaction.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.Date, dataPedido)
                .input("tipoEntregaPedido", sql.VarChar(7), tipoEntregaPedido)
                .input("distanciaPedido", sql.Int, distanciaPedido)
                .input("pesoPedido", sql.Int, pesoPedido)
                .input("valorBaseKmPedido", sql.Decimal(10, 2), valorBaseKmPedido)
                .input("valorBaseKgPedido", sql.Decimal(10, 2), valorBaseKgPedido)
                .query(querySQL);

            
            const idPedido = result.recordset[0].idPedido;
                querySQL = `
            INSERT INTO ENTREGAS(
                idPedido,
                valorDistanciaEntrega,
                valorPesoEntrega,
                valorFinalEntrega,
                acrescimoEntrega,
                descontoEntrega,
                taxaExtraEntrega,
                statusEntrega
                )
            VALUES(
                @idPedido,
                @valorDistanciaEntrega,
                @valorPesoEntrega,
                @valorFinalEntrega,
                @acrescimoEntrega,
                @descontoEntrega,
                @taxaExtraEntrega,
                @statusEntrega
            )
            `


            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("valorDistanciaEntrega", sql.Decimal(10, 2), valorDistanciaEntrega)
                .input("valorPesoEntrega", sql.Decimal(10, 2), valorPesoEntrega)
                .input("valorFinalEntrega", sql.Decimal(10, 2), valorFinalEntrega)
                .input("acrescimoEntrega", sql.Decimal(10, 2), acrescimoEntrega)
                .input("descontoEntrega", sql.Decimal(10, 2), descontoEntrega)
                .input("taxaExtraEntrega", sql.Decimal(10, 2), taxaExtraEntrega)
                .input("statusEntrega", sql.VarChar(12), statusEntrega)
                .query(querySQL)




            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao inserir pedido", error)
            throw error;
        }
    },

    atualizarPedido: async (idPedido, idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido) => {

        try {
            const pool = await getConnection();

            const querySQL = `
            UPDATE PEDIDOS
            SET idCliente = @idCliente,
                dataPedido = @dataPedido,
                tipoEntregaPedido = @tipoEntregaPedido, 
                distanciaPedido = @distanciaPedido,
                pesoPedido = @pesoPedido,
                valorBaseKmPedido = @valorBaseKmPedido,
                valorBaseKgPedido = @valorBaseKgPedido
            WHERE idPedido = @idPedido
            `

            await pool.request()

                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.Date, dataPedido)
                .input("tipoEntregaPedido", sql.VarChar(7), tipoEntregaPedido)
                .input("distanciaPedido", sql.Int, distanciaPedido)
                .input("pesoPedido", sql.Int, pesoPedido)
                .input("valorBaseKmPedido", sql.Decimal(10, 2), valorBaseKmPedido)
                .input("valorBaseKgPedido", sql.Decimal(10, 2), valorBaseKgPedido)
                .query(querySQL)

        } catch (error) {
            console.error("Erro ao inserir pedido", error)
            throw error;
        }

    },

    deletarPedido: async (idPedido) => {

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {

            let querySQL = `
                DELETE FROM PEDIDOS
                WHERE idPedido = @idPedido
            `

            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao deletar Pedido:", error);
            throw error;
        }
    }
}



module.exports = { pedidoModel }