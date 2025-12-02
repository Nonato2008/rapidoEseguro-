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


            // SISTEMA DE VERIFICAÇÃO DOS DADOS
            if (nomeCliente == undefined || cpfCliente == undefined || emailCliente == undefined || telefoneCliente == undefined || enderecoCliente == undefined) {
                return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos!' });
            }

            //CÓDIGO PARA VERIFICAR SE O CPF JÁ EXISTE
            const result = await clienteModel.verificarCPF(cpfCliente);
            if (result.length > 0) {
                return res.status(409).json({ message: "CPF Existente" });
            }

            // VERIFICAR SE O CPF INSERIDO É VÁLIDO OU NÃO
            if (cpfCliente.length < 11 || cpfCliente.length > 11) {
                return res.status(409).json({ message: "CPF Inválido" });
            }

            // VERIFICAR SE O EMAIL INFORMADO TEM @
            if (!emailCliente.includes("@")) {
                return res.status(409).json({ message: "Email deve ter @" });
            }

            // VERIFICAR SE HÁ NÚMERO NO NOME INFORMADO
            if (!isNaN(nomeCliente)) {
                return res.status(409).json({ message: "Insira um nome válido" });
            }
        

            // VERIFICAR SE O EMAIL INFORMADO JÁ ESTÁ INSERIDO
            const resultEmail = await clienteModel.verificarEmail(emailCliente);
            if (resultEmail.length > 0) {
                return res.status(409).json({ erro: "Email já existente!" });
            }

            await clienteModel.inserirCliente(nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente);

            //MENSAGEM DE SUCESSO \/
            res.status(201).json({ message: 'Sua conta foi cadastrada com sucesso!' });

        } catch (error) {

            //MENSAGEM DE ERRO 
            console.error('Erro ao cadastrar cliente:', error);
            res.status(500).json({ erro: 'Erro no servidor ao cadastrar cliente!' });
            throw error; // PASSA O ERRO PARA O CONTROLLER TRATAR E MOSTRA NO CONSOLE


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

            // VERIFICAR SE O ID EXISTE E SE ELE É VÁLIDO
            if (idCliente) {
                if (idCliente.length != 36) {
                    return res.status(400).json({ erro: "id do cliente inválido" });
                }

                const cliente = await clienteModel.buscarUm(idCliente);

                return res.status(200).json(cliente)
            }

            // LISTAR TODOS OS CLIENTES
            const clientes = await clienteModel.buscarTodos();

            res.status(200).json(clientes)
        } catch (error) {
            //MENSAGEM DE ERRO \/
            console.error("Erro ao listar clientes", error);
            res.status(500).json({ message: 'Erro ao buscar clientes' });
            throw error;// PASSA O ERRO PARA O CONTROLLER TRATAR

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

            //VERIFICA A VALIDEZ DO ID
            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do cliente inválido" });
            }

            //BUSCA PELO CLIENTE INFORMADO SE ELE EXISTE NO DB
            const cliente = await clienteModel.buscarUm(idCliente);
            if (!cliente || cliente.length !== 1) {
                return res.status(400).json({ erro: "Cliente não encontrado!" });
            }

            // VERIFICAÇÃO SE O ID TEM ALGUM PEDIDO E ENTREGA ASSOCIADO ANTES DE PERMITIR O DELETAR
            const pedido = await pedidoModel.buscarUmCliente(idCliente)


            if(pedido.length > 0){
                return res.status(409).json({message: "Entrega e pedido associado ao seu id, os delete para prosseguir com a ação!"});
            }

            await clienteModel.deletarCliente(idCliente);

            //MENSSAGEM DE SUCESSO \/
            res.status(200).json({ mensagem: "Cliente deletado com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao deletar cliente!" });
            throw error;// PASSA O ERRO PARA O CONTROLLER TRATAR
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

            // VERIFICAR A VALIDEZ DO ID
            if (idCliente.length != 36) {
                return res.status(400).json({ erro: 'id do cliente invalido' })
            }

            //BUSCA PELA EXISTÊNCIA DO ID DO CLIENTE
            const cliente = await clienteModel.buscarUm(idCliente)
            if (!cliente || cliente.length != 1) {
                return res.status(404).json({ erro: 'Cliente não encontrado!' })
            }


            const clienteAtual = cliente[0];

            const nomeClienteAtualizado = nomeCliente ?? clienteAtual.nomeCliente;
            const cpfClienteAtualizado = cpfCliente ?? clienteAtual.cpfCliente;
            const emailClienteAtualizado = emailCliente ?? clienteAtual.emailCliente;
            const telefoneClienteAtualizado = telefoneCliente ?? clienteAtual.telefoneCliente;
            const enderecoClienteAtualizado = enderecoCliente ?? clienteAtual.enderecoCliente;

            //VERIFICAR A VALIDEZ DA EXISÊNCIA DO CPF 
            const resultCpf = await clienteModel.verificarCPF(cpfClienteAtualizado);

            if (resultCpf.length > 0 && resultCpf[0].idCliente !== idCliente) {
                return res.status(409).json({ erro: "CPF já existente!" });
            }

            //VERIFICA SE O TELEFONE INFORMADO JÁ EXISTE 
            const resultTelf = await clienteModel.verificarTelefone(telefoneClienteAtualizado);

            if (resultTelf.length > 0 && resultTelf[0].idCliente !== idCliente) {
                return res.status(409).json({ erro: "Número já existente!" });
            }

            await clienteModel.atualizarCliente(idCliente, nomeClienteAtualizado, cpfClienteAtualizado, emailClienteAtualizado, telefoneClienteAtualizado, enderecoClienteAtualizado);

            //MENSSAGEM DE SUCESSO
            res.status(200).json({ mensagem: "Cliente atualizado com sucesso!"});

        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao atualizar cliente!" });
            throw error;// PASSA O ERRO PARA O CONTROLLER TRATAR
            
        }
    }
}

module.exports = { clienteController };