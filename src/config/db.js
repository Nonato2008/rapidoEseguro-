const sql = require("mssql");

const config = {
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    server: process.env.SERVER_DB,
    database: process.env.DATABASE_DB,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

async function getConnection(){
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (error) {
        console.error('erro na conexão do sql server: ', error);
    }
}


module.exports = {sql, getConnection};