const mysql = require('mysql2');

// Configuração da conexão com o banco de dados
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
async function atualizarUnica(){
// SQL para atualizar a coluna aliqotadestino na tabela unica
const updateSql = `
UPDATE unica u 
INNER JOIN st_ncm s ON u.ncm = s.ncmid AND u.ufdestinatario = s.ufdestinatario
SET u.aliquotadestino = s.aliquotadestino
WHERE u.ncm = s.ncmid AND u.ufdestinatario = s.ufdestinatario;
`;
// Executa a consulta SQL para atualizar a tabela
pool.query(updateSql, (error, results) => {
    if (error) {
        return console.error('Erro ao atualizar a tabela: ', error.message);
    }
    console.log('Tabela atualizada com sucesso:', results);
    
    // Encerra o pool de conexões, liberando o terminal
    pool.end(() => {
        console.log('Pool de conexões fechado');
    });
});
}

 // atualizarUnica()

module.exports = {
    atualizarUnica
}