const fs = require('fs');
const mysql = require('mysql');

function exportarDadosParaTXTSync(callback) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'db_ncm'
    });

    connection.connect((connectError) => {
        if (connectError) {
            callback(connectError);
            return;
        }

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 10); // Formata a data como YYYY-MM-DD
        const fileName = `backup${formattedDate}.txt`;

        let fileContent = '';

        // Primeira linha
        connection.query('SELECT codigo, nmproduto, unidade FROM tec_produto', (queryError, rows) => {
            if (queryError) {
                connection.end();
                callback(queryError);
                return;
            }

            fileContent += rows.map(row => {
                const codigo = row.codigo;
                const nomeProduto = row.nmproduto;
                const unidadeMedida = row.unidade;
                return `P|${codigo}|${nomeProduto}|${unidadeMedida}`;
            }).join('\n');

            // Consulta para PIS/PASEP
            connection.query('SELECT * FROM tec_ipi WHERE pis_pasep IS NOT NULL', (pisQueryError, pisRows) => {
                if (pisQueryError) {
                    connection.end();
                    callback(pisQueryError);
                    return;
                }

                pisRows.forEach(row => {
                    const tipoLinha = 'S';
                    const filial = 0;
                    const tipoTributo = 'P'; // Representando PIS/PASEP
                    const tipoOperacao = 'S'; // Saída
                    const cest = row.cest ? row.cest : ''; // Verifica se o CEST está definido
                    const aliquota = row.pis_pasep; // Obtém a alíquota do PIS/PASEP

                    fileContent += `\n${tipoLinha}|${filial}|${tipoTributo}|${tipoOperacao}|${cest}|${aliquota}`;
                });

                // Consulta para COFINS
                connection.query('SELECT * FROM tec_ipi WHERE cofins IS NOT NULL', (cofinsQueryError, cofinsRows) => {
                    if (cofinsQueryError) {
                        connection.end();
                        callback(cofinsQueryError);
                        return;
                    }

                    cofinsRows.forEach(row => {
                        const tipoLinha = 'S';
                        const filial = 0;
                        const tipoTributo = 'C'; // Representando COFINS
                        const tipoOperacao = 'S'; // Saída
                        const cest = row.cest ? row.cest : ''; // Verifica se o CEST está definido
                        const aliquota = row.cofins; // Obtém a alíquota do COFINS

                        fileContent += `\n${tipoLinha}|${filial}|${tipoTributo}|${tipoOperacao}|${cest}|${aliquota}`;
                    });
                
                    // Consulta para IPI
                    connection.query('SELECT * FROM tec_ipi WHERE ipi IS NOT NULL', (ipiQueryError, ipiRows) => {
                        if (ipiQueryError) {
                            connection.end();
                            callback(ipiQueryError);
                            return;
                        }
                        ipiRows.forEach(row => {
                            const tipoLinha = 'H'; // Representando IPI
                            const filial = 0;
                            const cest = row.cest ? row.cest : ''; // Verifica se o CEST está definido
                            const aliquota = row.ipi; // Obtém a alíquota do IPI
                            fileContent += `\n${tipoLinha}|${filial}|${cest}|${aliquota}`;
                        });

                        // Consulta para ICMS/ST
                        connection.query('SELECT * FROM st_ncm', (icmsQueryError, icmsRows) => {
                            if (icmsQueryError) {
                                connection.end();
                                callback(icmsQueryError);
                                return;
                            }
                        
                            // Para cada produto
                            rows.forEach(row => {
                                // Filtrar os registros de ICMS/ST relacionados à UF do produto
                                const ufProduto = row.uf; // UF do produto
                                const icmsRowsRelated = icmsRows.filter(icmsRow => icmsRow.ufRemetente === ufProduto);
                                
                                // Verificar se há registros relacionados ao produto
                                if (icmsRowsRelated.length > 0) {
                                    icmsRowsRelated.forEach(icmsRow => {
                                        const tipoLinha = 'I'; // Representando ICMS/ST
                                        const tipoOperacao = 'S'; // Saída
                                        const filial = 0;
                                        const uf = icmsRow.ufRemetente;
                                        const mva = icmsRow.mvaOriginal;
                                        const aliquota = icmsRow.aliquotaEfetiva;
                        
                                        fileContent += `\n${tipoLinha}|${tipoOperacao}|${filial}|${uf}|${mva}|${aliquota}`;
                                    });
                                } else {
                                    // Se não houver registros relacionados, adicionar uma linha vazia para indicar isso
                                    const tipoLinha = 'I'; // Representando ICMS/ST
                                    const tipoOperacao = 'S'; // Saída
                                    const filial = 0;
                                    const mva = ''; // MVA não definido
                                    const aliquota = ''; // Alíquota não definida
                        
                                    fileContent += `\n${tipoLinha}|${tipoOperacao}|${filial}|${ufProduto}|${mva}|${aliquota}`;
                                }
                            });

                            // Escrever no arquivo
                            fs.writeFile(fileName, fileContent, (writeError) => {
                                connection.end();
                                if (!writeError) {
                                    callback(null, `Arquivo ${fileName} gerado com sucesso.`);
                                } else {
                                    callback(writeError);
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

exportarDadosParaTXTSync((error, successMessage) => {
    if (error) {
        console.error('Erro ao exportar dados para o arquivo TXT:', error);
    } else {
        console.log(successMessage);
    }
});
