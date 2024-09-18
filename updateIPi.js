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
        `UPDATE unica SET ipi = '0' WHERE ncm = '86079900' AND CodigoProduto LIKE '04.%'`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '86079900';`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '73089010';`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '72169900';`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '84123110';`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '72149910';`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '27101932';`,
        `UPDATE unica SET ipi = '0' WHERE ncm = '85444900';`,
        `UPDATE unica SET ipi = '0.65' WHERE ncm = '69072100';`,
        `UPDATE unica SET ipi = '3.25' WHERE ncm = '84099190' AND CodigoProduto LIKE '07.%'`,
        `UPDATE unica SET ipi = '3.25' WHERE ncm = '74198090'`,
        `UPDATE unica SET ipi = '3.25' WHERE ncm = '90159090';`,
        `UPDATE unica SET ipi = '3.25' WHERE ncm = '73079100';`,
        `UPDATE unica SET ipi = '3.25' WHERE ncm = '72283000';`,
        `UPDATE unica SET ipi = '5' WHERE ncm = '73269090'`,
        `UPDATE unica SET ipi = '5.20' WHERE ncm = '82034000';`,
        `UPDATE unica SET ipi = '5.20' WHERE ncm = '82032090';`,
        `UPDATE unica SET ipi = '6.50' WHERE ncm = '85332900';`,
        `UPDATE unica SET ipi = '6.50' WHERE ncm = '73182100';`,
        `UPDATE unica SET ipi = '6.50' WHERE ncm = '85332190';`,
        `UPDATE unica SET ipi = '6.5' WHERE ncm = '73182900' AND CodigoProduto LIKE '04.%'`,
        `UPDATE unica SET ipi = '6.5' WHERE ncm = '73182200' and CodigoProduto LIKE '07.%'`,
        `UPDATE unica SET ipi = '6.5' WHERE ncm = '73182400';`,
        `UPDATE unica SET ipi = '6.5' WHERE ncm = '73181500';`,
        `UPDATE unica SET ipi = '7.8' WHERE ncm = '84825010' AND CodigoProduto LIKE '07.%'`,
        `UPDATE unica SET ipi = '7.8' WHERE ncm = '84849000';`,
        `UPDATE unica SET ipi = '7.8' WHERE ncm = '84831050';`,
        `UPDATE unica SET ipi = '7.8' WHERE ncm = '84821090';`,
        `UPDATE unica SET ipi = '9.75' WHERE ncm = '85369090';`,
        `UPDATE unica SET ipi = '9.75' WHERE ncm = '85369010';`,
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

// updateIpi();
console.log("Terminado")

module.exports = {
    updateIpi
}
