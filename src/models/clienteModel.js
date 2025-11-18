const { sql, getConnection } = require("../config/db");

const clienteModel = {

    /**
     * Busca todos os clientes e seus respectivos itens no banco de dados.
     * 
     * @async
     * @function buscarTodos
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

    buscarUm: async (idCliente) =>{
        try {
            const pool = await getConnection();

            const querySQL = `SELECT * FROM  Clientes WHERE idCliente = @idCliente`;

            const result = await pool
                .request()
                .input ('idCliente', sql.UniqueIdentifier, idCliente)
                .query(querySQL);

            return result.recordset;
        } catch (error) {
            console.error (`Erro ao bucar o cliente`, error)
            throw error;
        }
    },

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
            await transaction.rollback();
            console.error("Erro ao deletar cliente:", error);
            throw error;
        }
    },

    atualizarCliente: async (idCliente, nomeCliente, cpfCliente, emailCliente, telefoneCliente, enderecoCliente) => {
        try {

            const pool = await getConnection();

            const querySQL = `
                UPDATE Clientes
                SET nomeCliente = @nomeCliente,
                    cpfCliente = @cpfCliente,
                    emailCliente = @emailCliente,
                    telefoneCliente = @telefoneCliente,
                    enderecoCliente = @enderecoCliente
                WHERE idCliente = @idCliente
            `

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