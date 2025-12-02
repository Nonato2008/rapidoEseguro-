const { sql, getConnection } = require("../config/db");

const clienteModel = {

    /**
     * Busca todos os clientes e seus respectivos itens no banco de dados.
     * 
     * @async
     * @function buscarTodos
     * 
     * @returns {Promise<Array>}Retorna uma lista com todos os clientes.
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    buscarTodos: async () => {
        try {

            const pool/* cria um conjunto de conexões */ = await getConnection(); //cria conexão com o BD

            let sql = 'SELECT * FROM Clientes';

            const result = await pool.request().query(sql);

            return result.recordset;

        } catch (error) {
            console.error('Erro ao buscar clientes:', error)
            throw error; // Passa o erro para o controller tratar 
        }
    },

    /**
     * Busca por um cliente em específico e seus respectivos itens
     * 
     * @async
     * @function buscarUm
     * 
     * @returns {Promise<Array>}Retorna o cliente procurado na requisição
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    buscarUm: async (idCliente) =>{
        try {
            const pool/* cria um conjunto de conexões */ = await getConnection();//cria conexão com o BD

            const querySQL = `SELECT * FROM  Clientes WHERE idCliente = @idCliente`;

            const result = await pool
                .request()
                .input ('idCliente', sql.UniqueIdentifier, idCliente)
                .query(querySQL);

            return result.recordset;
        } catch (error) {
            console.error (`Erro ao bucar o cliente`, error)
            throw error;// PASSA O ERRO PARA O CONTROLLER TRATAR
        }
    },

    /**
     * Adiciona um cliente e suas informações
     * 
     * @async
     * @function inserirCliente
     * 
     * @param {string} nomeCliente 
     * @param {string} cpfCliente 
     * @param {string} emailCliente 
     * @param {string} telefoneCliente 
     * @param {string} enderecoCliente 
     * 
     * @returns Retorna uma mensagem de sucesso na operação
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    inserirCliente: async (nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente) =>{

        try {
            
            const pool = await getConnection();

            let querySQL = 'INSERT INTO CLIENTES (nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente) VALUES (@nomeCliente, @cpfCliente, @emailCliente, @telefoneCliente, @enderecoCliente) '

            await pool.request()
                .input('nomeCliente', sql.VarChar(100) , nomeCliente)
                .input('cpfCliente', sql.Char(11) ,cpfCliente)
                .input('emailCliente', sql.VarChar(50), emailCliente)
                .input('telefoneCliente', sql.VarChar(14), telefoneCliente)
                .input('enderecoCliente', sql.VarChar(300), enderecoCliente)
                .query(querySQL)

        } catch (error) {
            
            consolw.error('Erro ao inserir Cliente!', error);
            throw error; // passa o erro para o controller trarar

        }

    },

    /**
     * Verifica se o cpf já esta inserido no sistema
     * 
     * @async
     * @function verificarCPF
     * 
     * @param {string} cpfCliente 
     * @returns Retorna uma mensagem de que o cpf informado já existe
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    verificarCPF: async (cpfCliente) => {
        try {
            const pool = await getConnection();

            const querySQL = 'SELECT * FROM CLIENTES WHERE cpfCliente = @cpfCliente';

            const result = await pool.request()
                .input('cpfCliente',  sql.Char(11), cpfCliente)
                .query(querySQL);

            return result.recordset;
        } catch (error) {
            console.error('Erro ao verificar CPF', error);
            throw error;
        }
    },


    /**
     * Verifica se o telefone já esta inserido no sistema
     * 
     * @async
     * @function verificarTelefone
     * 
     * @param {string} telefoneCliente 
     * @returns Retorna uma mensagem de que o telefone informado já existe
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    verificarTelefone: async (telefoneCliente) => {
        try {
            const pool = await getConnection();

            const querySQL = 'SELECT * FROM Clientes WHERE telefoneCliente = @telefoneCliente;';

            const result = await pool.request()
            .input ('telefoneCliente', sql.VarChar(14), telefoneCliente)
            .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error('Erro ao verificar o Telefone', error);
            throw error;
        }
    },

    /**
     * Verifica se o email já esta inserido no sistema
     * 
     * @async
     * @function verificarEmail
     * 
     * @param {string} emailCliente
     * 
     * @returns Retorna uma mensagem de que o email informado já existe
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    verificarEmail: async (emailCliente) => {
        try {
            const pool = await getConnection();

            const querySQL = 'SELECT * FROM Clientes WHERE emailCliente = @emailCliente;';

            const result = await pool.request()
            .input ('emailCliente', sql.VarChar(50), emailCliente)
            .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error('Erro ao verificar o Telefone', error);
            throw error;
        }
    },

    /**
     * Deleta um cliente existente
     * 
     * @async
     * @function deletarCliente
     * 
     * @param {number} idCliente 
     * 
     * @returns Retorna uma mensagem de que a exclusão foi sucedida com sucesso
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    deletarCliente: async (idCliente) => {

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {

            let querySQL = `
                DELETE FROM CLIENTES
                WHERE idCliente = @idCliente
            `

            await transaction.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .query(querySQL);

            querySQL = `
                DELETE FROM CLIENTES
                WHERE idCliente = @idCliente
            `

            await transaction.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .query(querySQL);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback()// DESFAZ TUDO CASO DÊ ERRO
            console.error("Erro ao deletar cliente:", error);
            throw error;
        }
    },

    /**
     * Atualiza um cliente existente
     * 
     * @async
     * @function atualizarCliente
     * 
     * @param {number} idCliente 
     * @param {string} nomeCliente
     * @param {string} cpfCliente
     * @param {string} emailCliente
     * @param {string} telefoneCliente
     * @param {string} enderecoCliente
     * 
     * @returns Retorna uma mensagem de que a exclusão foi sucedida com sucesso
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */

    atualizarCliente: async (idCliente, nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente) => {
        try {

            const pool = await getConnection();

            let querySQL = `
                UPDATE Clientes
                SET nomeCliente = @nomeCliente,
                    cpfCliente = @cpfCliente,
                    emailCliente = @emailCliente,
                    telefoneCliente = @telefoneCliente,
                    enderecoCliente = @enderecoCliente
                WHERE idCliente = @idCliente
            `
            const campos = [];

            campos.push("nomeCliente = @nomeCliente");
            campos.push("cpfCliente = @cpfCliente");
            campos.push("emailCliente = @emailCliente");
            campos.push("telefoneCliente = @telefoneCliente")
            campos.push("enderecoCliente = @enderecoCliente")

            if (campos.length === 0) {
                console.log("Nenhum campo para atualizar.");
                return;
            }

            querySQL = `
                UPDATE Clientes
                SET ${campos.join(", ")}
                WHERE idCliente = @idCliente
                `;

            await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)    
                .input('nomeCliente', sql.VarChar(100), nomeCliente)    
                .input('cpfCliente', sql.Char(11), cpfCliente)
                .input('emailCliente', sql.VarChar(50), emailCliente)
                .input('telefoneCliente', sql.VarChar(14), telefoneCliente)
                .input('enderecoCliente', sql.VarChar(300), enderecoCliente)
                .query(querySQL);
            
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            throw error;
        }
    }

}

module.exports = { clienteModel }