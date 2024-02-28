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
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida.');
});

// Cache para NCMs já processados
const ncmProcessedCache = new Set();

async function ncmProcessed(ncm) {
    if (ncmProcessedCache.has(ncm)) {
        return true;
    }

    return new Promise((resolve, reject) => {
        const query = 'SELECT 1 FROM st_ncm WHERE ncmid = ? LIMIT 1';
        db.query(query, [ncm], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            const processed = result.length > 0;
            if (processed) {
                ncmProcessedCache.add(ncm);
            }
            resolve(processed);
        });
    });
}

async function saveDataToDatabase(stData, ncm) {
    if (!stData || stData.length === 0) {
        console.log('Nenhum dado para inserir no banco de dados.');
        return;
    }

    const values = stData.map(item => [
        item.ufRemetente,
        item.ufDestinatario,
        item.aliquotaDestino,
        item.aliquotaEfetiva,
        item.aliquotaInterestadual,
        item.aliquotaInterestadualMI,
        item.mvaOriginal,
        item.mvaAjustadaMI,
        item.mvaAjustada,
        item.cest,
        ncm,
        item.link
    ]);

    const query = 'INSERT INTO st_ncm (ufRemetente, ufDestinatario, aliquotaDestino, aliquotaEfetiva, aliquotaInterestadual, aliquotaInterestadualMI, mvaOriginal, mvaAjustadaMI, mvaAjustada, cest, ncmid, link) VALUES ?';

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Erro ao inserir dados:', err);
            return;
        }
        console.log(`Dados inseridos com sucesso para o NCM: ${ncm}`);
    });
}

async function getAllUniqueNcms() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT DISTINCT ncm FROM tec_produto';
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result.map(row => row.ncm));
        });
    });
}

async function apist() {
    const ncms = await getAllUniqueNcms();
    for (const ncm of ncms) {
        const processed = await ncmProcessed(ncm);
        if (!processed) {
            const uf_saida = "RJ";
            const chave = "TFACS-Q4LVT-XYYNF-ZNW59";
            const cliente = "02119874";
            const formato = "json";
            const url = `https://ics.multieditoras.com.br/ics/st/${ncm}/${uf_saida}?chave=${chave}&cliente=${cliente}&formato=${formato}`;

            try {
                const response = await axios.get(url);
                const stData = response.data.st;
                console.log('Dados recebidos da API para NCM:', ncm, stData);
                await saveDataToDatabase(stData, ncm);
            } catch (error) {
                console.error('Erro ao fazer a chamada API para o NCM:', ncm, error.message);
            }
        } else {
            console.log(`NCM já processado: ${ncm}`);
        }
    }
}

// Descomente a linha abaixo para executar o script diretamente.
// apist();

module.exports = { apist };
