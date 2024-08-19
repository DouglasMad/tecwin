const mysql = require('mysql2');

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

function updateIpi() {
    // Conjunto de queries para diferentes condições
    const queries = [
        `UPDATE unica SET ipi = '3.25' WHERE ncm = '84099190' AND CodigoProduto LIKE '07.%'`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '86079900' AND CodigoProduto LIKE '04.%'`,
        `UPDATE unica SET ipi = '7.8' WHERE ncm = '84825010' AND CodigoProduto LIKE '07.%'`,
        `UPDATE unica SET ipi = '6.5' WHERE ncm = '73182900' AND CodigoProduto LIKE '04.%'`,
        `UPDATE unica SET ipi = '6.5' WHERE ncm = '73182200' and CodigoProduto LIKE '07.%'`,
        `UPDATE unica SET cstipi = '50' WHERE ncm = '73182200'`,
        `UPDATE unica SET ipient = '00' WHERE ncm = '73182200'`,
        `UPDATE unica SET cstipi = '50' WHERE ncm = '73182900'`,
        `UPDATE unica SET ipient = '00' WHERE ncm = '73182900'`,
        `UPDATE unica SET cstipi = '51' WHERE ncm = '86079900' and CodigoProduto LIKE '04.%'`,
        `UPDATE unica SET ipi = '3.25' WHERE ncm = '74198090'`,
        `UPDATE unica SET ipient = '01' WHERE ncm = '86079900' and CodigoProduto LIKE '04.%'`
    ];

    queries.forEach((query) => {
        pool.query(query, (error, results) => {
            if (error) {
                return console.error('Erro ao atualizar os dados:', error.message);
            }
            console.log(`${results.affectedRows} linhas foram atualizadas para a query: ${query}`);
        });
    });
}

updateIpi();

module.exports = {
    updateIpi
}
