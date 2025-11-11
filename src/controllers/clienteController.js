const { getConnection } = require("../config/db");
const { clienteModel } = require("../models/clienteModel")

const clienteController = {

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

        }

    },

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

        }
    },

    deletarCliente: async (req, res) => {
        try {
            const { idCliente } = req.params;

            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do cliente inválido" });
            }

            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(400).json({ erro: "Cliente não encontrado!" });
            }

            await clienteModel.deletarCliente(idCliente);

            res.status(200).json({ mensagem: "Cliente deletado com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao deletar cliente!" });
        }
    },

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
        }
    }
}

module.exports = { clienteController };