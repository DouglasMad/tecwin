const fs = require('fs');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
});

connection.connect((connectError) => {
    if (connectError) {
        console.error('Erro ao conectar ao banco de dados:', connectError);
        return;
    }
});

// Função para consultar os produtos
async function consultarProdutos(connection) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT codigo, nmproduto, unidade, ncm, cstipi FROM tec_produto', (queryError, rows) => {
            if (queryError) {
                reject(queryError);
                return;
            }
            resolve(rows);
        });
    });
}

// Função principal para exportar dados para o arquivo TXT
async function exportarDadosParaTXTSync(callback) {
    const fileName = `tecwinncm.txt`;

    let fileContent = '';

    try {
        const produtos = await consultarProdutos(connection);
        
        for (const produto of produtos) {
            fileContent += `${produto.codigo}|${produto.ncm}|${produto.nmproduto}|${produto.unidade}|${produto.cstipi}\n`;
        }

        //GERA TXT NO ARQUIVO DO PROJETO
        fs.writeFile(fileName, fileContent, (writeError) => {
            if (!writeError) {
                callback(null, `Arquivo ${fileName} gerado com sucesso.`);
            } else {
                callback(writeError);
            }
        });
    } catch (error) {
        callback(error);
    }
}


exportarDadosParaTXTSync((error, successMessage) => {
    if (error) {
        console.error('Erro ao exportar dados para o arquivo TXT:', error);
    } else {
        console.log(successMessage);
    }
});