const axios = require('axios');
const mysql = require('mysql');

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
});

// Função para verificar se um NCM já foi processado
async function ncmProcessed(ncm) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM st_ncm WHERE ncmid = ?';
        db.query(query, [ncm], (err, result) => {
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
async function saveDataToDatabase(stData, ncm) {
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
            item.link
        ];

        const query = 'INSERT INTO st_ncm (ufRemetente, ufDestinatario, aliquotaDestino, aliquotaEfetiva, aliquotaInterestadual, aliquotaInterestadualMI, mvaOriginal, mvaAjustadaMI, mvaAjustada, cest, ncmid, link) VALUES ?';
        await new Promise((resolve, reject) => {
            db.query(query, [[values]], (err, result) => {
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
async function getAllNcms() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT DISTINCT ncm FROM tec_produto';
        db.query(query, (err, result) => {
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
    const ncms = await getAllNcms();
    console.log(`Total de NCMs únicos encontrados: ${ncms.length}`);
    if(ncms.length === 0) {
        console.log("Nenhum NCM para processar.");
        return;
    }
    for (const row of ncms) {
        const ncm = row.ncm;
        const processed = await ncmProcessed(ncm);

        if (!processed) {
            const uf_saida = "RJ";
            const chave = "TFACS-Q4LVT-XYYNF-ZNW59";
            const cliente = "02119874";
            const formato = "json";

            try {
                const response = await axios.get(`https://ics.multieditoras.com.br/ics/st/${ncm}/${uf_saida}?chave=${chave}&cliente=${cliente}&formato=${formato}`);
                const stData = response.data.st;
                await saveDataToDatabase(stData, ncm);
            } catch (error) {
                console.error('Erro ao fazer a chamada NCM:', ncm, error.message);
            }
        } else {
            console.log(`NCM já processado: ${ncm}`);
        }
    }
}

// // Executa a função principal
// apist().then(() => {
//     console.log("Processamento concluído.");
//     db.end(); // Encerra a conexão com o banco de dados ao final do processamento
// }).catch(err => {
//     console.error("Erro durante a execução:", err);
//     db.end(); // Encerra a conexão com o banco de dados em caso de erro
// });
