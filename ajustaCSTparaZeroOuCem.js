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

function ajustaCSTparaZeroOuCem() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            return;
        }

        // Seleciona todos os registros da tabela st_ncm
        connection.query("SELECT * FROM unica WHERE cst = '000' OR cst = '100';", (error, results, fields) => {
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
                    // SE FOR IGUAL A 100 ou 000 ATUALIZAR aliquotaDestino null
                    const updateQuery = "UPDATE unica SET aliquotaDestino = ' ' WHERE cst = '000' OR cst = '100';"
                    connection.query(updateQuery, [record.aliquotaDestino, record.id], (updateError, updateResults) => {
                    if (updateError) {
                        console.error('Erro ao atualizar registro:', updateError);
                        return;
                    }
                    console.log(`Registro ID: ${record.aliquotaDestino} atualizado com ajustarAliquota: ${record.aliquotaDestino}`);
                });
            });
        });

        connection.end();
    });
}

// Chama a função para realizar a atualização
ajustaCSTparaZeroOuCem();

module.exports = {
    ajustaCSTparaZeroOuCem
}
