const { getConnection } = require("../config/db");
const { clienteModel } = require("../models/clienteModel");
const {pedidoModel} = require("../models/pedidoModel");
const {entregaModel} = require("../models/entregaModel");

const clienteController = {

    /**
     * Controlador que cria novos clientes
     * 
     * @async
     * @function criarCliente
     * @param {object} req Objeto da requisição (recebido do cliente HTTP)
     * @param {object} res Objeto da resposta (enviado ao cliente HTTP)
     
     * @returns {Promise<void>} Retorna uma resposta JSON de que o cliente foi inserido com sucesso.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao criar os clientes.
     * 
     */

    criarCliente: async (req, res) => {

        try {

            const { nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente } = req.body

            if (nomeCliente == undefined || cpfCliente == undefined || emailCliente == undefined || telefoneCliente == undefined || enderecoCliente == undefined) {
                return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos!' });
            }

            const result = await clienteModel.verificarCPF(cpfCliente);

            if (result.length > 0) {
                return res.status(409).json({ message: "CPF Existente" });
            }

            if (cpfCliente.length < 11 || cpfCliente.length > 11) {
                return res.status(409).json({ message: "CPF Inválido" });
            }

            if (!emailCliente.includes("@")) {
                return res.status(409).json({ message: "Email deve ter @" });
            }

            if (!isNaN(nomeCliente)) {
                return res.status(409).json({ message: "Insira um nome válido" });
            }

            const resultTelf = await clienteModel.verificarTelefone(telefoneCliente);

            if (resultTelf.length > 0) {
                return res.status(409).json({ erro: "Número já existente!" });
            }

            const resultEmail = await clienteModel.verificarEmail(emailCliente);

            if (resultEmail.length > 0) {
                return res.status(409).json({ erro: "Email já existente!" });
            }


            await clienteModel.inserirCliente(nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente);

            res.status(201).json({ message: 'Sua conta foi cadastrada com sucesso!' });

        } catch (error) {

            console.error('Erro ao cadastrar cliente:', error);
            res.status(500).json({ erro: 'Erro no servidor ao cadastrar cliente!' });
            throw error;


        }

    },

    /**
     * Controlador que lista todos os clientes do banco de dados.
     * 
     * @async
     * @function listarClientes
     * @param {objetct} req - Objeto da requisição (recebido do cliente HTTP)
     * @param {object} res - Objeto da resposta (enviado ao cliente HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON com a lista de clientes.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao buscar os clientes.
     */

    listarClientes: async (req, res) => {
        try {
            const { idCliente } = req.query;

            if (idCliente) {
                if (idCliente.length != 36) {
                    return res.status(400).json({ erro: "id do cliente inválido" });
                }

                const cliente = await clienteModel.buscarUm(idCliente);

                return res.status(200).json(cliente)
            }

            const clientes = await clienteModel.buscarTodos();

            res.status(200).json(clientes)
        } catch (error) {
            console.error("Erro ao listar clientes", error);
            res.status(500).json({ message: 'Erro ao buscar clientes' });
            throw error;

        }
    },

    /**
     * Controlador que deleta clientes
     * 
     * @async
     * @function deletarCliente
     * @param {object} req Objeto da requisição (recebido do cliente HTTP)
     * @param {object} res Objeto da resposta (enviado ao cliente HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON de que o cliente foi deletado com sucesso.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao deletar o cliente.
     * 
     */

    deletarCliente: async (req, res) => {
        try {
            const { idCliente, idPedido, idEntrega } = req.params;

            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do cliente inválido" });
            }

            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(400).json({ erro: "Cliente não encontrado!" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido)
            const entrega = await entregaModel.buscarUm(idEntrega)

            if(pedido.length > 0 || entrega.length > 0){
                return res.status(409).json({message: "Entrega e pedido associado ao seu id, os delete para prosseguir com a ação!"});
            }

            await clienteModel.deletarCliente(idCliente);

            res.status(200).json({ mensagem: "Cliente deletado com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao deletar cliente!" });
            throw error;
        }
    },

    /**
     * Controlador que atualiza clientes
     * 
     * @async
     * @function atualizarCliente
     * @param {object} req Objeto da requisição (recebido do cliente HTTP)
     * @param {object} res Objeto da resposta (enviado ao cliente HTTP)
     * @returns {Promise<void>} Retorna uma resposta JSON de que o cliente foi atualizado com sucesso.
     * @throws Mostra no console e retorna erro 500 se ocorrer falha ao atualizar o cliente.
     * 
     */

    atualizarCliente: async (req, res) => {
        try {
            const { idCliente } = req.params;
            const { nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente } = req.body;

            if (idCliente.length != 36) {
                return res.status(400).json({ erro: 'id do cliente invalido' })
            }

            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length != 1) {
                return res.status(404).json({ erro: 'Cliente não encontrado!' })
            }

            const clienteAtual = cliente[0];

            const nomeClienteAtualizado = nomeCliente ?? clienteAtual.nomeCliente;
            const cpfClienteAtualizado = cpfCliente ?? clienteAtual.cpfCliente;
            const emailClienteAtualizado = emailCliente ?? clienteAtual.emailCliente;
            const telefoneClienteAtualizado = telefoneCliente ?? clienteAtual.telefoneCliente;
            const enderecoClienteAtualizado = enderecoCliente ?? clienteAtual.enderecoCliente;

            const resultCpf = await clienteModel.verificarCPF(cpfClienteAtualizado);

            if (resultCpf.length > 0 && resultCpf[0].idCliente !== idCliente) {
                return res.status(409).json({ erro: "CPF já existente!" });
            }

            const resultTelf = await clienteModel.verificarTelefone(telefoneClienteAtualizado);

            if (resultTelf.length > 0 && resultTelf[0].idCliente !== idCliente) {
                return res.status(409).json({ erro: "Número já existente!" });
            }

            await clienteModel.atualizarCliente(idCliente, nomeClienteAtualizado, cpfClienteAtualizado, emailClienteAtualizado, telefoneClienteAtualizado, enderecoClienteAtualizado);

            res.status(200).json({ mensagem: "Cliente atualizado com sucesso!"});

        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao atualizar cliente!" });
            throw error;
            
        }
    }
}

module.exports = { clienteController };