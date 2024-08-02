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

function updateCstipiBasedOnIpi() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            return;
        }

        // Atualiza a coluna cstipi onde aliquotaDestino não é '0'
        const updateQuery = "UPDATE unica SET cstipi = '50' WHERE ipi != '0';";
        connection.query(updateQuery, (updateError, updateResults) => {
            if (updateError) {
                console.error('Erro ao atualizar cstipi:', updateError);
            } else {
                console.log(`Coluna cstipi atualizada com sucesso. Registros afetados: ${updateResults.affectedRows}`);
            }

            // Libera a conexão
            connection.release();
        });
    });
}

// Chama a função para realizar a atualização
updateCstipiBasedOnIpi();

module.exports = {
    updateCstipiBasedOnIpi
};
