const mysql = require('mysql');

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

const getConnectionFromPool = () => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Erro ao obter conexão do pool:', err);
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
};

async function atualizaNcmFinal() {
    const selectUniqueNcmQuery = `SELECT DISTINCT codigo FROM tec_produto`;
    const connection = await getConnectionFromPool(); // Obtemos a conexão do pool

    connection.query(selectUniqueNcmQuery, async (err, results) => {
        if (err) {
            throw err;
        }

        if (results.length === 0) {
            console.log("Não há Codigos únicos para inserir.");
            connection.release(); // Libera a conexão quando não há o que inserir.
            return;
        }

        const insertQuery = `INSERT INTO dadosncm (codigoProduto) VALUES ? ON DUPLICATE KEY UPDATE codigoProduto=VALUES(codigoProduto)`;

        // Ajuste no mapeamento para refletir a coluna correta
        const valuesToInsert = results.map(row => [row.codigo]);

        connection.query(insertQuery, [valuesToInsert], (err, result) => {
            if (err) {
                throw err;
            }

            console.log(`${result.affectedRows} Codigo(s) inserido(s) com sucesso na tabela dadosncm.`);
            connection.release(); // Libera a conexão após completar a inserção
        });
    });
}

// atualizaNcmFinal();

module.exports = {
  atualizaNcmFinal
}
