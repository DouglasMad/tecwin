const fs = require('fs');
const mysql = require('mysql');
const path = require('path');

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

// Função para gerar um log para o txt
async function gerarLog(arquivoTxt, tamanhoTxt, callback) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const directoryPath = 'C:/tecwin/exportacoes';

    if (!fs.existsSync(directoryPath)){
        fs.mkdirSync(directoryPath);
    }

    const logContent = `Último arquivo ${arquivoTxt} gerado com sucesso. \nTamanho do arquivo: ${tamanhoTxt} kb.\nData e hora: ${formattedDate}`;
    const logFileName = path.join(directoryPath, "log.txt");

    fs.writeFile(logFileName, logContent, (writeError) => {
        if (!writeError) {
            callback(null, `Arquivo de Log ${logFileName} gerado com sucesso.`);
        } else {
            callback(writeError);
        }
    });
};

// Função para consultar informações na tabela unica
async function consultarInformacoesUnica(connection) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT ufDestinatario, cst, cstipi, unidade, ipient, ipi, ncm, aliquotaDestino, aliquotaInterestadualMI, CodigoProduto, NomeProduto, pisDebito, cofinsDebito, cstpis, aliquotaFCP FROM unica ORDER BY CodigoProduto', (queryError, rows) => {
            if (queryError) {
                reject(queryError);
            } else {
                resolve(rows);
            }
        });
    });
}

// Função principal para exportar dados para o arquivo TXT
async function exportarDadosParaTXTSync(callback) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10); // Formata a data como YYYY-MM-DD
    const directoryPath = 'C:/tecwin/exportacoes';

    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }

    const fileName = path.join(directoryPath, `dadosUnica_${formattedDate}.txt`);
    let fileContent = '';

    let connection;

    try {
        connection = await getConnectionFromPool();
        const dadosUnica = await consultarInformacoesUnica(connection);

        // Agrupar dados por CodigoProduto para processar linhas I associadas
        const produtosAgrupados = dadosUnica.reduce((acc, item) => {
            (acc[item.CodigoProduto] = acc[item.CodigoProduto] || []).push(item);
            return acc;
        }, {});

        Object.values(produtosAgrupados).forEach(grupo => {
            // Assumimos que todas as entradas em um grupo compartilham os mesmos dados de produto
            const primeiroItem = grupo[0];
            let productLines = `P|${primeiroItem.CodigoProduto}|${primeiroItem.NomeProduto}|${primeiroItem.unidade}\n`;

            // Linhas S para PIS e COFINS, e linha H para IPI
            if (primeiroItem.pisDebito != null) {
                productLines += `S|1|P|S|${primeiroItem.cstpis}|${primeiroItem.pisDebito}\n`;
            }
            if (primeiroItem.cofinsDebito != null) {
                productLines += `S|1|C|S|${primeiroItem.cstpis}|${primeiroItem.cofinsDebito}\n`;
            }
            const cstIpiCleaned = primeiroItem.cstipi.toString().replace(/[\r\n]+/g, '');
            productLines += `H|0|${primeiroItem.ipi}|${cstIpiCleaned}|${primeiroItem.ipient}\n`;

            // Processar múltiplas linhas I para cada UF relacionada ao produto
            grupo.forEach(item => {
                const fcpItem = item.aliquotaFCP != null ? item.aliquotaFCP : '';
                productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|${item.aliquotaDestino}|${item.aliquotaInterestadualMI}|${fcpItem}\n`;
            });

            fileContent += productLines; // Adicionando as linhas processadas ao conteúdo do arquivo
        });

        // Escrevendo no arquivo TXT
        fs.writeFile(fileName, fileContent, (writeError) => {
            if (!writeError) {
                gerarLog(fileName, fileContent.length / 1024, (logError, logSuccessMessage) => {
                    if (logError) {
                        console.error('Erro ao gerar arquivo de log', logError);
                    } else {
                        console.log(logSuccessMessage);
                    }
                });
                callback(null, `Arquivo ${fileName} gerado com sucesso.`);
            } else {
                callback(writeError);
            }
        });
    } catch (error) {
        console.error('Erro durante a exportação dos dados:', error);
        callback(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

exportarDadosParaTXTSync((error, successMessage) => {
    if (error) {
        console.error('Erro ao exportar dados para o arquivo TXT:', error);
    } else {
        console.log("Executando gerador de txt", successMessage);
    }
});
