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

            const { idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido } = req.body

 

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

            await pedidoModel.inserirPedidos( idCliente, dataPedido, tipoEntregaPedido, distanciaPedido, pesoPedido, valorBaseKmPedido, valorBaseKgPedido);

            res.status(201).json({ message: "Pedido cadastrado com sucesso!"});
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

            if (idPedido.length != 36) {
                return res.status(400).json({ erro: "id do pedido inválido" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(400).json({ erro: "Pedido não encontrado!" });
            }

            await pedidoModel.deletarPedido(idPedido);

            res.status(200).json({ mensagem: "pedido deletado com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao deletar pedido!" });
        }
    }
}

module.exports = { pedidoController };