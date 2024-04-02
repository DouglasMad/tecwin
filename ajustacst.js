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

// Função para ajustar o formato decimal na coluna ipi
function ajustaFormatoDecimal() {
    const queryAjusteDecimal = "UPDATE unica SET ipi = REPLACE(ipi, ',', '.') WHERE ipi LIKE '%,%';";

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão do pool: ', err);
            return;
        }

        connection.query(queryAjusteDecimal, (error, results) => {
            if (error) {
                console.error('Erro ao ajustar o formato decimal: ', error);
                connection.release();
                return;
            }
            console.log('Formato decimal ajustado com sucesso. Registros atualizados: ', results.affectedRows);
            connection.release();
            
            // Após ajustar os formatos decimais, continua com as atualizações originais
            ajustaCstIpi();
        });
    });
}

// Função para atualizar a coluna ipi na tabela chama_unica
function ajustaCstIpi() {
    // Define as queries SQL para atualização
    const updateQueries = [
        'UPDATE unica SET ipi = 0 WHERE cstipi = 51',
        'UPDATE unica SET ipi = 6.5 WHERE cstipi = 50 AND ipi = 0'
    ];

    // Obtém uma conexão do pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão do pool: ', err);
            return;
        }

        // Executa a primeira query de atualização
        connection.query(updateQueries[0], (error, results) => {
            if (error) {
                console.error('Erro ao executar a primeira query de atualização: ', error);
                connection.release();
                return;
            }
            console.log('Primeira atualização realizada com sucesso. Registros atualizados: ', results.affectedRows);

            // Executa a segunda query de atualização
            connection.query(updateQueries[1], (error, results) => {
                // Libera a conexão de volta ao pool
                connection.release();

                if (error) {
                    console.error('Erro ao executar a segunda query de atualização: ', error);
                    return;
                }

                console.log('Segunda atualização realizada com sucesso. Registros atualizados: ', results.affectedRows);
            });
        });
    });
}

// Modifica a chamada original para ajustar os valores decimais primeiro
// ajustaFormatoDecimal();

module.exports = {
    ajustaFormatoDecimal
}