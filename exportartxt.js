const fs = require('fs');
const mysql = require('mysql');
const path = require('path')

// Criação do pool de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 0,
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

//Função para gerar um log para o txt
async function gerarLog(arquivoTxt, tamanhoTxt, callback) {
const currentDate = new Date();
const formattedDate = currentDate.toLocaleString();
const directoryPath = 'C:/bkp/exportacoes/'

const logContent = `Último arquivo ${arquivoTxt} gerado com sucesso. \nTamanho do arquivo: ${tamanhoTxt} kb.\n Data e hora: ${formattedDate}`;

const logFileName = path.join(directoryPath, "log.txt");

fs.writeFile(logFileName, logContent, (writeError) => {
    if(!writeError){
        callback(null, `Arquivo de Log ${logFileName} gerado com sucesso.`);
    }
    else{
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

//Função para consulta aliquota por NCM
async function consultarAliquitaPorNcm(connection, ncm) {
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
async function consultarIcmsStPorNcm(connection, ncm) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT DISTINCT ufDestinatario, cst, aliquotaEfetiva, aliquotaInterestadualMI FROM st_ncm JOIN tec_stcst ON ufDestinatario = uf AND ncmid = ncm WHERE ncmid =  ? AND aliquotaInterestadualMI IS NOT NULL', [ncm], (icmsQueryError, icmsRows) => {
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
    const directoryPath = 'C:/bkp/exportacoes/'
    const fileName = path.join(directoryPath, `intTecwin.txt`);
    let fileContent = '';

    try {
        connection = await getConnectionFromPool(); 

        const produtos = await consultarProdutos(connection);

        for (const produto of produtos) {
            const pisPasep = await consultarPisPasepPorNcm(connection, produto.ncm);
            const cofins = await consultarCofinsPorNcm(connection, produto.ncm);
            const icmsSt = await consultarIcmsStPorNcm(connection, produto.ncm);
            const aliquota = await consultarAliquitaPorNcm(connection, produto.ncm);

            // Verifica se há dados correspondentes nas consultas de PIS/PASEP, COFINS e ICMS/ST
// Verifica se há dados correspondentes nas consultas de PIS/PASEP, COFINS e ICMS/ST
if (icmsSt.length > 0 && aliquota.length > 0 && (pisPasep.length > 0 || cofins.length > 0)) {
    // Adiciona as linhas P e H apenas se houver dados correspondentes nas consultas
    fileContent += `P|${produto.codigo}|${produto.nmproduto}|${produto.unidade}\n`;

    pisPasep.forEach(row => {
        const { cst, pisDebito } = row;
        fileContent += `S|1|P|S|${cst ? cst : ''}|${pisDebito}\n`;
    });

    cofins.forEach(row => {
        const { cst, cofinsDebito } = row;
        fileContent += `S|1|C|S|${cst ? cst : ''}|${cofinsDebito}\n`;
    });

    const cstIpiCleaned = produto.cstipi.toString().replace(/[\r\n]+/g, '');
    const {ipi} = aliquota[0];
    fileContent += `H|0|${ipi}|${cstIpiCleaned}|${produto.ipiEnt}\n`; 

    icmsSt.forEach(row => {
        const { ufDestinatario, cst, aliquotaEfetiva, aliquotaInterestadualMI } = row;
        fileContent += `I|S|1|${ufDestinatario}|${cst}|${aliquotaEfetiva}|${aliquotaInterestadualMI}\n`;
    });
} else if (icmsSt.length > 0 && aliquota.length > 0) {
    // Adiciona as linhas P e H apenas se houver dados correspondentes nas consultas
    fileContent += `P|${produto.codigo}|${produto.nmproduto}|${produto.unidade}\n`;

    const cstIpiCleaned = produto.cstipi.toString().replace(/[\r\n]+/g, '');
    const {ipi} = aliquota[0];
    fileContent += `H|0|${ipi}|${cstIpiCleaned}|${produto.ipient}\n`; 
    //  fileContent += `H|1|${ipi.trim()}|${produto.cstipi.trim()}|${produto.ipiEnt.trim()}\n`;

    icmsSt.forEach(row => {
        const { ufDestinatario, cst, aliquotaEfetiva, aliquotaInterestadualMI } = row;
        fileContent += `I|S|1|${ufDestinatario}|${cst}|${aliquotaEfetiva}|${aliquotaInterestadualMI}\n`;
    });
}
        }
        console.log('Gerando txt')

            //GERA TXT NO ARQUIVO DO PROJETO
            fs.writeFile(fileName, fileContent, (writeError) => {
            if (!writeError) {
                gerarLog(fileName, fileContent.length,(logError, logSucessMessage) => {
                    if(logError){
                        console.error('Erro ao gerar arquivo log', logError);
                    } else {
                        console.log(logSucessMessage);
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
            connection.release(); // Liberamos a conexão de volta para o pool
        }
    }
}


// exportarDadosParaTXTSync((error, successMessage) => {
//     if (error) {
//         console.error('Erro ao exportar dados para o arquivo TXT:', error);
//     } else {
//         console.log("Executando gerador de txt", successMessage);
//     }
// });

module.exports = {
    exportarDadosParaTXTSync
};