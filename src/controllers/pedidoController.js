const { pedidoModel } = require("../models/pedidoModel")
const { clienteModel } = require("../models/clienteModel")

const pedidoController = {

    /**
     * Controlador que lista todos os pedidos do banco de dados.
     * 
     * @async
     * @function listarPedidos
     * @param {objetct} req - Objeto da requisição (recebido do pedido HTTP)
     * @param {object} res - Objeto da resposta (enviado ao pedido HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON com a lista de pedidos.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao buscar os pedidos.
     */

    listarPedidos: async (req, res) => {

        try {

            const { idPedido } = req.query;

            // VERIFICA A VALIDEZ DO ID DO PEDIDO
            if(idPedido){
                if ( idPedido.length != 36 ){
                    return res.status(400).json({ erro: "id do pedido inválido"})
                }
                const pedido = await pedidoModel.buscarUm(idPedido);

                res.status(200).json(pedido);
            }
            
            const pedidos = await pedidoModel.buscarTodos();

            res.status(200).json(pedidos)
                
        } catch (error) {

            console.error("Erro ao listar pedidos", error);
            res.status(500).json({message: 'Erro interno no servidor ao listar pedidos'});        
            throw error;// PASSA O ERRO PARA O CONTROLLER TRATAR
            
        }

    },

    /**
     * Controlador que cria novos pedidos e entregas
     * 
     * @async
     * @function criarPedido
     * @param {object} req Objeto da requisição (recebido do pedido HTTP, e entrega HTTP)
     * @param {object} res Objeto da resposta (enviado ao pedido HTTP, e entrega HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON de que o pedido e a entrega foi inserido com sucesso.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao criar o pedido e a respectiva entrega.
     */

    criarPedido: async (req, res) => {
        
        try{

            const { idCliente,
                dataPedido,
                tipoEntregaPedido,
                distanciaPedido,
                pesoPedido, 
                valorBaseKmPedido, 
                valorBaseKgPedido,
                statusEntrega
                 } = req.body

 

            // VERIFICA SE OS CAMPOS FORAM PREENCHIDOS
            if(idCliente == undefined || dataPedido == undefined || tipoEntregaPedido == undefined || distanciaPedido == undefined || pesoPedido == undefined || valorBaseKmPedido == undefined || valorBaseKgPedido == undefined){
                return res.status(400).json({erro: "Campos obrigatórios não preenchidos"})
            }

            //VERIFICA SE TEM LETRA NOS CAMPOS ABAIXO
            if ( isNaN(distanciaPedido) || isNaN(pesoPedido) || isNaN(valorBaseKmPedido) || isNaN(valorBaseKgPedido)  ) {
                return res.status(400).json({erro: "Campos preenchidos incorretamente"})
            }

            // VEFICA A VALIDEZ DO ID DO CLIENTE
            if(idCliente.length != 36 ){
                return res.status(400).json({erro: "Id do Cliente inválido"})
            }
            
            // VERIFICA A VALIDEZ DA DATA
            const data = new Date(dataPedido);
            if(isNaN(data.getTime())){
                return res.status(400).json({erro: "Data do pedido inválida"})
            }


            // BUSCA PELO CLIENTE E SE ELE EXISTE
            const cliente = await clienteModel.buscarUm(idCliente); 
            if(!cliente || cliente.length != 1){
                return res.status(404).json({erro: "Cliente não encontrado"})
            }  

            // CÁLCULOS DA ENTREGA
            let valorDistanciaEntrega = distanciaPedido * valorBaseKmPedido

            let valorPesoEntrega = pesoPedido * valorBaseKgPedido

            let  valorFinalEntrega = valorPesoEntrega + valorDistanciaEntrega

            let  acrescimoEntrega = 0

            let taxaExtraEntrega = 0

            let descontoEntrega = 0 

           

            // SE A ENTREGA FOR UREGENTE TEM UM ACRÉSCIMO DE 20%
            if(tipoEntregaPedido == "urgente".toLowerCase()){
               acrescimoEntrega = (valorFinalEntrega * 0.2)

                valorFinalEntrega = valorFinalEntrega + acrescimoEntrega
                
                // SE O PESO FOR MAIOR QUE 50 ADICIONASSE A TXA DE 15 
                if(pesoPedido > 50){
                taxaExtraEntrega = taxaExtraEntrega + 15    
                
                 valorFinalEntrega = valorFinalEntrega + taxaExtraEntrega
            }
                // se o valor final passar de 500 tem um desconto de 10%
                if(valorFinalEntrega > 500){
                descontoEntrega = (valorFinalEntrega * 0.1)

                valorFinalEntrega = valorFinalEntrega  - descontoEntrega
            }
            } 

            // se o valor final passar de 500 tem um desconto de 10%
            if(valorFinalEntrega > 500){
                descontoEntrega = (valorFinalEntrega * 0.1)

                valorFinalEntrega = descontoEntrega
            }

            // SE O PESO FOR MAIOR QUE 50 ADICIONASSE A TAXA DE 15 
            if(pesoPedido > 50){
                taxaExtraEntrega = taxaExtraEntrega + 15
                valorFinalEntrega = valorFinalEntrega + taxaExtraEntrega
            }

            

             if (statusEntrega.toLowerCase() !== "calculado" && statusEntrega.toLowerCase() !== "em transito" && statusEntrega.toLowerCase() !== "entregue" && statusEntrega.toLowerCase() != "cancelado" && statusEntrega == undefined) {
                return res.status(404).json({erro: "Status Inválido"})
            }


            await pedidoModel.inserirPedidos( idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido, valorDistanciaEntrega, valorPesoEntrega, valorFinalEntrega, acrescimoEntrega, descontoEntrega, taxaExtraEntrega, statusEntrega);

            res.status(201).json({ message: "Pedido e Entrega cadastrado com sucesso!"});
        }catch (error) {
            console.error("Erro ao cadastrar pedido:", error)
            res.status(500).json({message: "Erro interno no servidor ao cadastrar pedido!"});
            throw error;
        }

    },

    /**
     * Controlador que atualiza pedidos e entregas
     * 
     * @async
     * @function atualizarPedido
     * @param {object} req Objeto da requisição (recebido do pedido HTTP, e entrega HTTP)
     * @param {object} res Objeto da resposta (enviado ao pedido HTTP, e entrega HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON de que o pedido e a entrega foram atualizados com sucesso.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao criar o pedido e a respectiva entrega.
     */

   atualizarPedido: async (req, res) => {
        try {
            const {idPedido} = req.params;
            const {idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido, statusEntrega} = req.body;


            // VERIFICA A VALIDEZ DO ID 
            if(idPedido.length != 36){
                return res.status(400).json({errp: "id do pedido inválido!"})
            }

            //BUSCA PELO PEDIDO INFORMADO
            const pedido = await pedidoModel.buscarUm(idPedido);

            if(!pedido || pedido.length !== 1){
                return res.status(404).json({errp: "Pedido não encontrado!`"})
            }

            // BUSCA PELO ID E SUA VALIDEZ 
            if(idCliente){
                if (idCliente.length != 36) {
                    return res.status(400).json({erro: "id do cliente inválido!"})
                }

                const cliente = await clienteModel.buscarUm(idCliente);

                // PROCURA PELO CLIENTE
                if(!cliente || cliente.length !== 1){
                    return res.status(404).json({erro: "Cliente não encontrado!"})
                }
            }

            const pedidoAtual = pedido[0];

            const idClienteAtualizado  = idCliente ?? pedidoAtual.idCliente;
            const dataPedidoAtualizado =  dataPedido ?? pedidoAtual.dataPedido;
            const tipoEntregaPedidoAtualizado = tipoEntregaPedido ?? pedidoAtual.tipoEntregaPedido;
            const distanciaPedidoAtualizado = distanciaPedido ?? pedidoAtual.distanciaPedido;
            const pesoPedidoAtualizado = pesoPedido ?? pedidoAtual.pesoPedido;
            const valorBaseKmPedidoAtualizado = valorBaseKmPedido ?? pedidoAtual.valorBaseKmPedido;
            const valorBaseKgPedidoAtualizado = valorBaseKgPedido ?? pedidoAtual.valorBaseKgPedido;
            const statusEntregaAtualizado = statusEntrega ?? pedidoAtual.statusEntrega;

            //ATUALIZAR ENTREGA

            // CÁLCULO DA ENTREGA
            valorDistanciaEntrega = distanciaPedido * valorBaseKmPedido

            valorPesoEntrega = pesoPedido * valorBaseKgPedido

            valorFinalEntrega = valorPesoEntrega + valorDistanciaEntrega

            acrescimoEntrega = 0

            taxaExtraEntrega = 0

            descontoEntrega = 0 

           

            // SE A ENTREGA FOR UREGENTE TEM UM ACRÉSCIMO DE 20%
            if(tipoEntregaPedido == "urgente".toLowerCase()){
               acrescimoEntrega = (valorFinalEntrega * 0.2)

                valorFinalEntrega = valorFinalEntrega + acrescimoEntrega
                
                // SE O PESO FOR MAIOR QUE 50 ADICIONASSE A TXA DE 15
                if(pesoPedido > 50){
                taxaExtraEntrega = taxaExtraEntrega + 15    
                 valorFinalEntrega = valorFinalEntrega + taxaExtraEntrega
            }

            // se o valor final passar de 500 tem um desconto de 10%
                if(valorFinalEntrega > 500){
                descontoEntrega = (valorFinalEntrega * 0.1)

                valorFinalEntrega = valorFinalEntrega  - descontoEntrega
            }
            } 

            // se o valor final passar de 500 tem um desconto de 10%
            if(valorFinalEntrega > 500){
                descontoEntrega = (valorFinalEntrega * 0.1)

                valorFinalEntrega = descontoEntrega
            }

            // SE O PESO FOR MAIOR QUE 50 ADICIONASSE A TXA DE 15 
            if(pesoPedido > 50){

                taxaExtraEntrega = taxaExtraEntrega + 15
                valorFinalEntrega = valorFinalEntrega + taxaExtraEntrega
            }

            

            const idEntrega = pedidoAtual.idEntrega
            

            await pedidoModel.atualizarPedido(idPedido, idClienteAtualizado, dataPedidoAtualizado, tipoEntregaPedidoAtualizado, distanciaPedidoAtualizado, pesoPedidoAtualizado, valorBaseKmPedidoAtualizado, valorBaseKgPedidoAtualizado, valorDistanciaEntrega, valorPesoEntrega, descontoEntrega, acrescimoEntrega, taxaExtraEntrega, valorFinalEntrega, statusEntregaAtualizado);

            res.status(200).json({message: "Pedido e entrega atualizado com sucesso!"});

        } catch (error) {
            console.error("Erro ao atualizar pedido:", error)
            res.status(500).json({message: "Erro interno no servidor ao atualizar pedido e entrega!"});
            throw error;
        }
   },

   /**
     * Controlador que deleta pedidos e entregas
     * 
     * @async
     * @function deletarPedido
     * @param {object} req Objeto da requisição (recebido do pedido HTTP, e entrega HTTP)
     * @param {object} res Objeto da resposta (enviado ao pedido HTTP, e entrega HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON de que o pedido e a entrega foram deletados com sucesso.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao criar o pedido e a respectiva entrega.
     */

   deletarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;

            // VERIFICA A VALIDEZ DO ID
            if (!idPedido || idPedido.length !== 36) {
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }

            // BUSCA PELO ID 
            const pedido = await pedidoModel.buscarUm(idPedido);
            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado!" });
            }

            await pedidoModel.deletarPedido(idPedido);
    
            return res.status(200).json({ mensagem: "Pedido e entrega deletados com sucesso!" });
    
        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            return res.status(500).json({ erro: "Erro interno no servidor ao deletar pedido!" });
            throw error;// PASSA O ERRO PARA O CONTROLLER TRATAR
        }
    }
}

module.exports = { pedidoController };