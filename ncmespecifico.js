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
function CstPA() {
   
    // 07. = 110 04. = 010
    let query = `
    UPDATE unica
    SET cst = CASE 
                WHEN CodigoProduto LIKE '07.%' THEN '110'
                WHEN CodigoProduto LIKE '04.%' THEN '010'
                ELSE cst
              END
    WHERE ufdestinatario = 'PA' AND ncm LIKE '73181500'
`;
    pool.query(query, (error, results) => {
        if (error) {
            return console.error('Erro ao atualizar os dados:', error.message);
        }
        console.log(`${results.affectedRows} linhas foram atualizadas.`);
    });
}

CstPA();

module.exports = {
    CstPA
}