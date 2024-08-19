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

function updateAliq() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            return;
        }

        // Seleciona todos os registros da tabela st_ncm
        connection.query('SELECT id, ufDestinatario, aliquotaEfetiva FROM st_ncm', (error, results, fields) => {
            if (error) {
                console.error('Erro ao buscar registros:', error);
                return;
            }

            // Verifica se resultados foram encontrados
            if (results.length === 0) {
                console.log('Nenhum registro encontrado.');
                return;
            }

            results.forEach(record => {
                // Verifica se ufDestinatario é 'RJ'
                if (record.ufDestinatario === 'RJ') {
                    // Atualiza ajustarAliquota com aliquotaEfetiva e adiciona a coluna aliquotaInterestadualMI
                    const updateQuery = "UPDATE st_ncm SET aliquotadestino = aliquotainterna, aliquotaInterestadualMI = aliquotainterna WHERE ufdestinatario = 'RJ'";

                    connection.query(updateQuery, (updateError, updateResults) => {
                        if (updateError) {
                            console.error('Erro ao atualizar registro:', updateError);
                            return;
                        }
                        console.log(`Registro ID: ${record.id} atualizado.`);
                    });
                }
            });

            connection.release();
        });
    });
}

// Chama a função para realizar a atualização
updateAliq();

module.exports = {
    updateAliq
};
