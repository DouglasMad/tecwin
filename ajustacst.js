// Inclui o pacote mysql para conectar ao banco de dados
const mysql = require('mysql');

// Cria um pool de conexões com as configurações do banco de dados
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

// Função para atualizar a coluna ipi na tabela chama_unica
function ajustaCstIpi() {
    // Define a query SQL para atualizar a coluna ipi para 0 onde cstipi é 51
    const updateQuery = 'UPDATE unica SET ipi = 0 WHERE cstipi = 51';

    // Obtém uma conexão do pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão do pool: ', err);
            return;
        }

        // Executa a query de atualização
        connection.query(updateQuery, (error, results, fields) => {
            // Libera a conexão de volta ao pool
            connection.release();

            // Verifica se ocorreu algum erro durante a execução da query
            if (error) {
                console.error('Erro ao executar a query de atualização: ', error);
                return;
            }

            // Exibe o resultado da operação
            console.log('Registros atualizados com sucesso: ', results.affectedRows);
        });
    });
}

// Chama a função para ajustar os valores de ipi
// ajustaCstIpi();

module.exports = {
    ajustaCstIpi
}
