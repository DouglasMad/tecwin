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
        connection.query('SELECT ufDestinatario, cst, cstipi, unidade, ipient, ipi, ncm, aliquotaDestino, aliquotaInterestadualMI, CodigoProduto, NomeProduto, pisDebito, cofinsDebito, cstpis, aliquotaFCP, aliquotaEfetiva FROM unica ORDER BY CodigoProduto', (queryError, rows) => {
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
    const formattedDate = currentDate.toISOString().slice(0, 10);
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
            if(cstIpiCleaned == '01' || cstIpiCleaned == '51' && primeiroItem.ipient != null){
                productLines += `H|0|0|${cstIpiCleaned}|${primeiroItem.ipient}\n`;
            } else if(primeiroItem.ipient != null) {
                productLines += `H|0|${primeiroItem.ipi}|${cstIpiCleaned}|${primeiroItem.ipient}\n`;
            }

            // Processar múltiplas linhas I para cada UF relacionada ao produto
            grupo.forEach(item => {
                if (item.ufDestinatario === 'RJ' && (item.cst === '100'  || item.cst === '000') && (item.aliquotaInterestadualMI != null && item.aliquotaFCP != null && item.aliquotaInterestadual != null)) {
                    productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|0|${item.aliquotaInterestadualMI}|${item.aliquotaFCP}|${item.aliquotaEfetiva}\n`;
                } else if (item.ufDestinatario === 'RJ' && (item.cst === '110' || item.cst === '010')  && (item.aliquotaInterestadualMI != null && item.aliquotaFCP != null && item.aliquotaInterestadual != null)) {
                    productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|20|20|2|22\n`;
                } else if (item.cst === '100' || item.cst === '000'  && (item.aliquotaInterestadualMI != null && item.aliquotaFCP != null && item.aliquotaInterestadual != null)){
                    productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|0|${item.aliquotaInterestadualMI}|0|0\n`;
                } else if (primeiroItem.CodigoProduto.startsWith('07.')  && (item.aliquotaInterestadualMI != null && item.aliquotaFCP != null && item.aliquotaInterestadual != null)) {
                    productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                } else if (primeiroItem.CodigoProduto.startsWith('04.')  && (item.aliquotaInterestadualMI != null && item.aliquotaFCP != null && item.aliquotaInterestadual != null)) {
                    productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|${item.aliquotaEfetiva}|${item.aliquotaInterestadual}|0|0\n`;
                }else if( item.aliquotaInterestadualMI != null && item.aliquotaFCP != null && item.aliquotaInterestadual != null) {
                    productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                }
            });

            fileContent += productLines;
        });

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

module.exports = {
    exportarDadosParaTXTSync
}
