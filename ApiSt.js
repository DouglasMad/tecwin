const axios = require('axios');
const mysql = require('mysql');

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
    connectionLimit: 10, // Limite máximo de conexões
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
});

// Função para obter uma conexão do pool
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

// Função para verificar se um NCM já foi processado
async function ncmProcessed(connection, ncm) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM st_ncm WHERE ncmid = ?';
        connection.query(query, [ncm], (err, result) => {
            if (err) {
                console.error("Erro ao verificar NCM processado:", err);
                reject(err);
            } else {
                resolve(result.length > 0);
            }
        });
    });
}

// Função para salvar dados no banco de dados
async function saveDataToDatabase(connection, stData, ncm) {
    for (const item of stData) {
        const values = [
            item.ufRemetente,
            item.ufDestinatario,
            item.aliquotaDestino,
            item.aliquotaEfetiva,
            item.aliquotaInterestadual,
            item.aliquotaInterestadualMI,
            item.mvaOriginal,
            item.mvaAjustadaMI,
            item.mvaAjustada,
            item.cest, // Supondo que cest não é um array
            ncm,
            item.link,
            item.aliquotaFCP,
            item.aliquotaInterna 
        ];

        const query = 'INSERT INTO st_ncm (ufRemetente, ufDestinatario, aliquotaDestino, aliquotaEfetiva, aliquotaInterestadual, aliquotaInterestadualMI, mvaOriginal, mvaAjustadaMI, mvaAjustada, cest, ncmid, link, aliquotaFCP,aliquotaInterna) VALUES ?';
        await new Promise((resolve, reject) => {
            connection.query(query, [[values]], (err, result) => {
                if (err) {
                    console.error('Erro ao salvar dados no banco:', err);
                    reject(err);
                } else {
                    console.log('Dados inseridos com sucesso:', item.link);
                    resolve(result);
                }
            });
        });
    }
}


// Função para recuperar todos os NCMs da tabela tec_produto, sem repetição
async function getAllNcms(connection) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT DISTINCT ncm FROM tec_produto';
        connection.query(query, (err, result) => {
            if (err) {
                console.error("Erro ao buscar NCMs:", err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// Função principal para realizar a operação
async function apist() {
    let connection;
    try {
        connection = await getConnectionFromPool(); // Obtemos a conexão do pool

        const ncms = await getAllNcms(connection);
        console.log(`Total de NCMs únicos encontrados: ${ncms.length}`);
        if (ncms.length === 0) {
            console.log("Nenhum NCM para processar.");
            return;
        }
        for (const row of ncms) {
            const ncm = row.ncm;
            const processed = await ncmProcessed(connection, ncm);

            if (!processed) {
                const uf_saida = "RJ";
                const chave = "TFACS-Q4LVT-XYYNF-ZNW59";
                const cliente = "02119874";
                const formato = "json";

                try {
                    const response = await axios.get(`https://ics.multieditoras.com.br/ics/st/${ncm}/${uf_saida}?chave=${chave}&cliente=${cliente}&formato=${formato}`);
                    const stData = response.data.st;
                    await saveDataToDatabase(connection, stData, ncm);
                } catch (error) {
                    console.error('Erro ao fazer a chamada NCM:', ncm, error.message);
                }
            } else {
                console.log(`NCM já processado: ${ncm}`);
            }
        }
    } catch (error) {
        console.error("Erro durante a execução:", error);
    } finally {
        if (connection) {
            console.log('terminado')
            connection.release(); // Liberamos a conexão de volta para o pool
        }
    }
}

//   apist();
module.exports = {
    apist
};
