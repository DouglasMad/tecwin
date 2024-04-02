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
    const formattedDate = currentDate.toLocaleString();
    const directoryPath = 'C:/Users/Administrador.PLASSER/Documents/exportartecwin/teste/';

    const logContent = `Último arquivo ${arquivoTxt} gerado com sucesso. \nTamanho do arquivo: ${tamanhoTxt} kb.\n Data e hora: ${formattedDate}`;

    const logFileName = path.join(directoryPath, "log.txt");

    fs.writeFile(logFileName, logContent, (writeError) => {
        if (!writeError) {
            callback(null, `Arquivo de Log ${logFileName} gerado com sucesso.`);
        } else {
            callback(writeError);
        }
    });
};

// Função para consultar os produtos
async function consultarProdutos(connection) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT codigo, nmproduto, unidade, ncm, cstipi, ipient FROM tec_produto', (queryError, rows) => {
            if (queryError) {
                reject(queryError);
                return;
            }
            resolve(rows);
        });
    });
}

// Função para consulta aliquota por NCM
async function consultarAliquotaPorNcm(connection, ncm) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT ipi FROM tec_ipi WHERE ncm_codigo = ? LIMIT 1', [ncm], (queryError, rows) => {
            if (queryError) {
                reject(queryError);
                return;
            }
            resolve(rows);
        });
    });
}

// Função para consultar PIS/PASEP por NCM
async function consultarPisPasepPorNcm(connection, ncm) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM tec_pisdeb WHERE ncm = ? AND pisDebito IS NOT NULL', [ncm], (pisQueryError, pisRows) => {
            if (pisQueryError) {
                reject(pisQueryError);
                return;
            }
            resolve(pisRows);
        });
    });
}

// Função para consultar COFINS por NCM
async function consultarCofinsPorNcm(connection, ncm) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM tec_pisdeb WHERE ncm = ? AND cofinsDebito IS NOT NULL', [ncm], (cofinsQueryError, cofinsRows) => {
            if (cofinsQueryError) {
                reject(cofinsQueryError);
                return;
            }
            resolve(cofinsRows);
        });
    });
}

// Função para consultar ICMS/ST por NCM
async function consultarIcmsStPorNcm(connection, codigoProduto) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT DISTINCT u.ufDestinatario, u.cst, u.aliquotaDestino, u.aliquotaFCP, u.aliquotaInterestadualMI FROM unica u JOIN tec_produto p ON p.codigo = u.codigoProduto WHERE p.codigo = ?', [codigoProduto], (icmsQueryError, icmsRows) => {
            if (icmsQueryError) {
                reject(icmsQueryError);
                return;
            }
            resolve(icmsRows);
        });
    });
}

// Função principal para exportar dados para o arquivo TXT
async function exportarDadosParaTXTSync(callback) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10); // Formata a data como YYYY-MM-DD
    const directoryPath = 'C:/Users/Administrador.PLASSER/Documents/exportartecwin/teste/';
    const fileName = path.join(directoryPath, `intTecwin_${formattedDate}.txt`);
    let fileContent = '';

    let connection;

    try {
        connection = await getConnectionFromPool();

        const produtos = await consultarProdutos(connection);

        for (const produto of produtos) {
            const pisPasep = await consultarPisPasepPorNcm(connection, produto.ncm);
            const cofins = await consultarCofinsPorNcm(connection, produto.ncm);
            const icmsSt = await consultarIcmsStPorNcm(connection, produto.codigo);
            const aliquota = await consultarAliquotaPorNcm(connection, produto.ncm);

            fileContent += `P|${produto.codigo}|${produto.nmproduto}|${produto.unidade}\n`;

            pisPasep.forEach(row => {
                fileContent += `S|1|P|S|${row.cst ? row.cst : ''}|${row.pisDebito}\n`;
            });

            cofins.forEach(row => {
                fileContent += `S|1|C|S|${row.cst ? row.cst : ''}|${row.cofinsDebito}\n`;
            });

            if (aliquota.length > 0) {
                const cstIpiCleaned = produto.cstipi.toString().replace(/[\r\n]+/g, '');
                fileContent += `H|0|${aliquota[0].ipi}|${cstIpiCleaned}|${produto.ipient}\n`;
            }

            icmsSt.forEach(row => {
                const aliquotaFCPInclusao = row.ufDestinatario === 'RJ' ? `|${row.aliquotaFCP}` : '';
                fileContent += `I|S|1|${row.ufDestinatario}|${row.cst}|${row.aliquotaDestino}|${row.aliquotaInterestadualMI}${aliquotaFCPInclusao}\n`;
            });
        }

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
};
