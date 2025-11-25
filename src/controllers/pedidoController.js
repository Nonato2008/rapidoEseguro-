const { pedidoModel } = require("../models/pedidoModel")
const { clienteModel } = require("../models/clienteModel")

const pedidoController = {

    listarPedidos: async (req, res) => {

        try {

            const { idPedido } = req.query;

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
            
        }

    },

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

 

            if(idCliente == undefined || dataPedido == undefined || tipoEntregaPedido == undefined || distanciaPedido == undefined || pesoPedido == undefined || valorBaseKmPedido == undefined || valorBaseKgPedido == undefined){
                return res.status(400).json({erro: "Campos obrigatórios não preenchidos"})
            }

            if ( isNaN(distanciaPedido) || isNaN(pesoPedido) || isNaN(valorBaseKmPedido) || isNaN(valorBaseKgPedido)  ) {
                return res.status(400).json({erro: "Campos preenchidos incorretamente"})
            }

            if(idCliente.length != 36 ){
                return res.status(400).json({erro: "Id do Cliente inválido"})
            }
            
            const data = new Date(dataPedido);
            if(isNaN(data.getTime())){
                return res.status(400).json({erro: "Data do pedido inválida"})
            }
            
            const cliente = await clienteModel.buscarUm(idCliente); 

            if(!cliente || cliente.length != 1){
                return res.status(404).json({erro: "Cliente não encontrado"})
            }  

        
            let valorDistanciaEntrega = distanciaPedido * valorBaseKmPedido

            let valorPesoEntrega = pesoPedido * valorBaseKgPedido

            let  valorFinalEntrega = valorPesoEntrega + valorDistanciaEntrega

            let  acrescimoEntrega = 0

            let taxaExtraEntrega = 15

            let descontoEntrega = 0 

           

            
            if(tipoEntregaPedido == "urgente".toLowerCase()){
               acrescimoEntrega = (valorFinalEntrega * 0.2)

                valorFinalEntrega = valorFinalEntrega + acrescimoEntrega
                
                if(pesoPedido > 50){
                 valorFinalEntrega = valorFinalEntrega + taxaExtraEntrega
            }

                if(valorFinalEntrega > 500){
                descontoEntrega = (valorFinalEntrega * 0.1)

                valorFinalEntrega = valorFinalEntrega  - descontoEntrega
            }
            } 

            if(valorFinalEntrega > 500){
                descontoEntrega = (valorFinalEntrega * 0.1)

                valorFinalEntrega = descontoEntrega
            }

            if(pesoPedido > 50){
                taxaExtraEntrega = valorFinalEntrega + 15
            }

            

            if (statusEntrega !== "calculado".toLowerCase() && statusEntrega !== "em transito".toLowerCase() && statusEntrega !== "entregue".toLowerCase() && statusEntrega != "cancelado".toLowerCase() && statusEntrega == undefined) {
                return res.status(404).json({erro: "Status Inválido"})
            }


            await pedidoModel.inserirPedidos( idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido, valorDistanciaEntrega, valorPesoEntrega, valorFinalEntrega, acrescimoEntrega, descontoEntrega, taxaExtraEntrega, statusEntrega);

            res.status(201).json({ message: "Pedido e Entrega cadastrado com sucesso!"});
        }catch (error) {
            console.error("Erro ao cadastrar pedido:", error)
            res.status(500).json({message: "Erro interno no servidor ao cadastrar pedido!"});
        }

    },

   atualizarPedido: async (req, res) => {
        try {
            const {idPedido} = req.params;
            const {idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido} = req.body;

            if(idPedido.length != 36){
                return res.status(400).json({errp: "id do pedido inválido!"})
            }

            const pedido = await pedidoModel.buscarUm(idPedido);

            if(!pedido || pedido.length !== 1){
                return res.status(404).json({errp: "Pedido não encontrado!`"})
            }

            if(idCliente){
                if (idCliente.length != 36) {
                    return res.status(400).json({erro: "id do cliente inválido!"})
                }

                const cliente = await clienteModel.buscarUm(idCliente);

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

            await pedidoModel.atualizarPedido(idPedido, idClienteAtualizado, dataPedidoAtualizado, tipoEntregaPedidoAtualizado, distanciaPedidoAtualizado, pesoPedidoAtualizado, valorBaseKmPedidoAtualizado, valorBaseKgPedidoAtualizado);

            res.status(200).json({message: "Pedido atualizado com sucesso!"});

        } catch (error) {
            console.error("Erro ao atualizar pedido:", error)
            res.status(500).json({message: "Erro interno no servidor ao atualizar pedido!"});
        }
   },

   deletarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;

            if (!idPedido || idPedido.length !== 36) {
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido);
    
            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado!" });
            }

            await pedidoModel.deletarPedido(idPedido);
    
            return res.status(200).json({ mensagem: "Pedido e entrega deletados com sucesso!" });
    
        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            return res.status(500).json({ erro: "Erro interno no servidor ao deletar pedido!" });
        }
    }
}

module.exports = { pedidoController };