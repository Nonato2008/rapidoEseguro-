const { sql, getConnection } = require("../config/db")

const pedidoModel = {

    /**
     * Busca por um pedido em específico e seus respectivos itens
     * 
     * @async
     * @function buscarTodos
     * 
     * @returns {Promise<Array>}Retorna todos os pedidos
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    buscarTodos: async () => {

        try {

            const pool = await getConnection(); //CRIA CONEXÃO COM BD

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
            throw error; // PASSA O ERRO PARA O CONTROLLER TRATAR

        }

    },

    /**
     * Busca por um cliente em específico e seus respectivos itens
     * 
     * @async
     * @function buscarUm
     * @param {number} idPedido
     * @returns {Promise<Array>}Retorna o pedido procurado na requisição
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

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

    /**
     * Adiciona um pedido e uma entrega, com suas informações
     * 
     * @async
     * @function inserirPedidos
     * 
     * @param {number} idCliente 
     * @param {string} dataPedido 
     * @param {string} tipoEntregaPedido 
     * @param {number} distanciaPedido 
     * @param {number} pesoPedido 
     * @param {number} valorBaseKmPedido
     * @param {number} valorBaseKgPedido
     * @param {number} idPedido
     * @param {number} valorDistanciaEntrega
     * @param {number} valorPesoEntrega
     * @param {number} valorFinalEntrega
     * @param {number} acrescimoEntrega
     * @param {number} descontoEntrega
     * @param {number} taxaExtraEntrega
     * @param {boolean} statusEntrega
     * 
     * @returns Retorna uma mensagem de sucesso na operação
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    inserirPedidos: async (idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido, valorDistanciaEntrega, valorPesoEntrega, valorFinalEntrega, acrescimoEntrega, descontoEntrega, taxaExtraEntrega, statusEntrega) => {

        const pool = await getConnection();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();//INICIA A TRANSAÇÃO

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




            await transaction.commit();// CONFIRMA A TRANSAÇÃO APÓS INSERÇÕES BEM SUCEDIDAS
        } catch (error) {
            await transaction.rollback(); // DESFAZ TUDO CASO DÊ ERRO
            console.error("Erro ao inserir pedidoe e entrega", error)
            throw error;
        }
    },

    /**
     * Atualiza um pedido e uma entrega existente
     * 
     * @async
     * @function atualizarPedido
     * 
     * @param {number} idCliente 
     * @param {string} dataPedido 
     * @param {string} tipoEntregaPedido 
     * @param {number} distanciaPedido 
     * @param {number} pesoPedido 
     * @param {number} valorBaseKmPedido
     * @param {number} valorBaseKgPedido
     * @param {number} idPedido
     * @param {number} valorDistanciaEntrega
     * @param {number} valorPesoEntrega
     * @param {number} valorFinalEntrega
     * @param {number} acrescimoEntrega
     * @param {number} descontoEntrega
     * @param {number} taxaExtraEntrega
     * @param {boolean} statusEntrega
     * 
     * @returns Retorna uma mensagem de que a atualização foi sucedida com sucesso
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    atualizarPedido: async (idPedido, idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido, valorDistanciaEntrega, valorPesoEntrega, descontoEntrega, acrescimoEntrega, taxaExtraEntrega, valorFinalEntrega, statusEntrega) => {

        try {
            const pool = await getConnection();

         
            const campos = [];

            campos.push("idCliente = @idCliente")
            campos.push("dataPedido = @dataPedido")
            campos.push("tipoEntregaPedido = @tipoEntregaPedido")
            campos.push("distanciaPedido = @distanciaPedido")
            campos.push("pesoPedido = @pesoPedido")
            campos.push("valorBaseKmPedido = @valorBaseKmPedido")
            campos.push("valorBaseKgPedido = @valorBaseKgPedido")

            if (campos.length === 0) {
                console.log("Nenhum campo para atualizar.");
                return;
            }

            let querySQL = `
                UPDATE Pedidos
                SET ${campos.join(", ")}
                WHERE idPedido = @idPedido
                `;

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

            
            const entregaCampos = [];

            entregaCampos.push("valorDistanciaEntrega = @valorDistanciaEntrega")
            entregaCampos.push("valorPesoEntrega = @valorPesoEntrega")
            entregaCampos.push("descontoEntrega = @descontoEntrega")
            entregaCampos.push("acrescimoEntrega = @acrescimoEntrega")
            entregaCampos.push("taxaExtraEntrega = @taxaExtraEntrega")
            entregaCampos.push("valorFinalEntrega = @valorFinalEntrega")
            entregaCampos.push("statusEntrega = @statusEntrega")

            if (entregaCampos.length === 0) {
                console.log("Nenhum campo para atualizar.");
                return;
            }

            querySQL = `
                UPDATE ENTREGAS
                SET ${entregaCampos.join(", ")}
                WHERE idPedido = @idPedido
                `;

            await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("valorDistanciaEntrega", sql.Decimal(10, 2), valorDistanciaEntrega)
                .input("valorPesoEntrega", sql.Decimal(10, 2), valorPesoEntrega)
                .input("descontoEntrega", sql.Decimal(10, 2), descontoEntrega)
                .input("acrescimoEntrega", sql.Decimal(10, 2), acrescimoEntrega)
                .input("taxaExtraEntrega", sql.Decimal(10, 2), taxaExtraEntrega)
                .input("valorFinalEntrega", sql.Decimal(10, 2), valorFinalEntrega)
                .input("statusEntrega", sql.VarChar(12), statusEntrega)
                .query(querySQL)

        } catch (error) {
            console.error("Erro ao atualizar pedido", error)
            throw error;
        }

    },

    /**
     * Deleta um pedido e uma entrega existente
     * 
     * @async
     * @function deletarPedido
     * 
     * @param {number} idPedido
     * 
     * @returns Retorna uma mensagem de que a exclusão foi sucedida com sucesso
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    deletarPedido: async (idPedido) => {

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {

            let querySQL = `
                SELECT idEntrega 
                FROM ENTREGAS 
                WHERE idPedido = @idPedido
            `;

            const resultadoEntrega = await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            const idEntrega = resultadoEntrega.recordset[0].idEntrega;

            querySQL = `
                DELETE FROM ENTREGAS
                WHERE idEntrega = @idEntrega
            `;

            await transaction.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega)
                .query(querySQL);

            querySQL = `
                DELETE FROM PEDIDOS
                WHERE idPedido = @idPedido
            `;

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