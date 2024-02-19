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
        connection.query('SELECT codigo, nmproduto, unidade, ncm FROM tec_produto', (queryError, rows) => {
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
        connection.query('SELECT * FROM tec_ipi WHERE ncm_codigo = ? AND pis_pasep IS NOT NULL', [ncm], (pisQueryError, pisRows) => {
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
        connection.query('SELECT * FROM tec_ipi WHERE ncm_codigo = ? AND cofins IS NOT NULL', [ncm], (cofinsQueryError, cofinsRows) => {
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
        connection.query('SELECT ufDestinatario, mvaOriginal, aliquotaEfetiva FROM st_ncm WHERE ncmid = ?', [ncm], (icmsQueryError, icmsRows) => {
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
    const fileName = `backup${formattedDate}.txt`;

    let fileContent = '';

    try {
        const produtos = await consultarProdutos(connection);

        for (const produto of produtos) {
            const pisPasep = await consultarPisPasepPorNcm(connection, produto.ncm);
            const cofins = await consultarCofinsPorNcm(connection, produto.ncm);
            const icmsSt = await consultarIcmsStPorNcm(connection, produto.ncm);

            // Verifica se há dados correspondentes nas consultas de PIS/PASEP, COFINS e ICMS/ST
            if (pisPasep.length > 0 && cofins.length > 0 && icmsSt.length > 0) {
                // Adiciona as linhas P e H apenas se houver dados correspondentes nas consultas
                fileContent += `P|${produto.codigo}|${produto.nmproduto}|${produto.unidade}\n`;

                pisPasep.forEach(row => {
                    const { cest, pis_pasep } = row;
                    fileContent += `S|0|P|S|${cest ? cest : ''}|${pis_pasep}\n`;
                });

                cofins.forEach(row => {
                    const { cest, cofins } = row;
                    fileContent += `S|0|C|S|${cest ? cest : ''}|${cofins}\n`;
                });
                
                fileContent += `H|0|cest|${produto.ncm}\n`;

                icmsSt.forEach(row => {
                    const { ufDestinatario, mvaOriginal, aliquotaEfetiva } = row;
                    fileContent += `I|S|0|${ufDestinatario}|${mvaOriginal}|${aliquotaEfetiva}\n`;
                });
            }
        }

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
