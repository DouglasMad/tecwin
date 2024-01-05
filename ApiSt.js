const axios = require('axios');
const mysql = require('mysql');
const fs = require('fs');
const xml2js = require('xml2js');

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
});

// Função para verificar se um NCM já foi processado
async function ncmProcessed(ncm) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM st_ncm WHERE ncmid = ?';
        db.query(query, [ncm], (err, result) => {
            if (err) reject(err);
            resolve(result.length > 0);
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
                if (err) reject(err);
                resolve(result);
            });
        });
        console.log('Dados inseridos com sucesso:', item.link);
    }
}

// Função para recuperar todos os NCMs da tabela tec_produto
async function getAllNcms() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT ncm FROM tec_produto';
        db.query(query, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}

// Função principal para realizar a operação
async function apist() {
    const ncms = await getAllNcms();
    for (const row of ncms) {
        const ncm = row.ncm;
        const processed = await ncmProcessed(ncm);

        if (!processed) {
            const uf_saida = "RJ"; // Substitua pela UF desejada
            const chave = "TFACS-Q4LVT-XYYNF-ZNW59"; // Substitua pela sua chave
            const cliente = "02119874"; // Substitua pelo seu cliente
            const formato = "json";

            try {
                const response = await axios.get(`https://ics.multieditoras.com.br/ics/st/${ncm}/${uf_saida}?chave=${chave}&cliente=${cliente}&formato=${formato}`);
                const stData = response.data.st;
                await saveDataToDatabase(stData, ncm);
            } catch (error) {
                console.error('Erro ao fazer a chamada API:', error);
            }
        } else {
            console.log(`NCM já processado: ${ncm}`);
        }
    }
}


module.exports = {apist}