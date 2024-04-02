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

function updateIpiEntBasedOnCstIpi() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            return;
        }

        // Seleciona todos os produtos
        connection.query('SELECT id, cstipi FROM tec_produto', (error, results, fields) => {
            if (error) {
                console.error('Erro ao buscar produtos:', error);
                return;
            }

            // Verifica se resultados foram encontrados
            if (results.length === 0) {
                console.log('Nenhum produto encontrado.');
                return;
            }

            results.forEach(product => {
                let ipientValue;
                const cstipiNumber = parseInt(product.cstipi); // Garantindo que cstipi seja tratado como número
                switch (cstipiNumber) {
                    case 50:
                        ipientValue = '00';
                        break;
                    case 51:
                        ipientValue = '01';
                        break;
                    case 52:
                        ipientValue = '02';
                        break;
                    case 53:
                        ipientValue = '03';
                        break;
                    case 54:
                        ipientValue = '04';
                        break;
                    case 55:
                        ipientValue = '05';
                        break;
                    case 99:
                        ipientValue = '49';
                        break;
                    default:
                        console.log(`CSTIPI ${product.cstipi} não mapeado para atualização. Verifique se os tipos de dados correspondem.`);
                        return; // Ignora e passa para o próximo produto
                }

                // Atualiza ipient para o produto atual
                const updateQuery = 'UPDATE tec_produto SET ipient = ? WHERE id = ?';
                connection.query(updateQuery, [ipientValue, product.id], (updateError, updateResults) => {
                    if (updateError) {
                        console.error('Erro ao atualizar produto:', updateError);
                        return;
                    }
                    console.log(`Produto ID: ${product.id} atualizado com ipient: ${ipientValue}`);
                });
            });
        });

        connection.release();
    });
}

updateIpiEntBasedOnCstIpi();

module.exports = {
    updateIpiEntBasedOnCstIpi
};