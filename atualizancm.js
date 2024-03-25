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
    const selectUniqueNcmQuery = `SELECT DISTINCT ncm FROM tec_produto`;
    const connection = await getConnectionFromPool(); // Obtemos a conexão do pool

    connection.query(selectUniqueNcmQuery, (err, results) => {
        if (err) throw err;

        // Se não houver NCMs para inserir, encerra o script.
        if (results.length === 0) {
            console.log("Não há NCMs únicos para inserir.");
            return;
        }

        // Prepara a inserção evitando duplicatas.
        const insertQuery = `INSERT INTO dadosncm (ncm) VALUES ? ON DUPLICATE KEY UPDATE ncm=ncm`;

        // Extrai os NCMs para um formato adequado para a query.
        const valuesToInsert = results.map(row => [row.ncm]);

        connection.query(insertQuery, [valuesToInsert], (err, result) => {
            if (err) throw err;

            console.log(`${result.affectedRows} NCM(s) inserido(s) com sucesso na tabela dadosncm.`);
        });
    });

    connection.release(); // libera a conexão
}

// atualizaNcmFinal();
module.exports = {
  atualizaNcmFinal
}