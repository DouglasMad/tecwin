const mysql = require('mysql');

// Criação do pool de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
function Cstpr() {
   
    let query = `
        UPDATE unica
        SET cst = 110
        WHERE ufdestinatario = 'PR' OR ufdestinatario = 'MG' OR ufdestinatario = 'ES' AND
              ncm LIKE '7318%'
    `;
    pool.query(query, (error, results) => {
        if (error) {
            return console.error('Erro ao atualizar os dados:', error.message);
        }
        console.log(`${results.affectedRows} linhas foram atualizadas.`);
    });
}

Cstpr();

module.exports = {
    Cstpr
}