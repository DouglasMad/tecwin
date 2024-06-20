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
        connection.query('SELECT ufDestinatario, cst, cstipi, unidade, ipient, ipi, ncm, aliquotaDestino, aliquotaInterestadualMI, CodigoProduto, NomeProduto, pisDebito, cofinsDebito, cstpis, aliquotaFCP, aliquotaEfetiva, aliquotainterestadual FROM unica ORDER BY CodigoProduto', (queryError, rows) => {
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
            
            if(cstIpiCleaned == '01' || cstIpiCleaned == '51'){
                productLines += `H|0|0|${cstIpiCleaned}|${primeiroItem.ipient}\n`;
            }else{
                productLines += `H|0|${primeiroItem.ipi}|${cstIpiCleaned}|${primeiroItem.ipient}\n`;
            }

            grupo.forEach(item => {
                const fcpItem = item.aliquotaFCP != null ? item.aliquotaFCP : '';
                //Se prefixo for 07 usar aliquotainternaMI else aliquotaInterestadual
                if (primeiroItem.CodigoProduto.startsWith('04.') && item.ufDestinatario == "RJ"){
                    productLines += `I|E|1|${item.ufDestinatario}|000|0|20|2|22\n`;
                }
                else if (primeiroItem.CodigoProduto.startsWith('07.') && item.ufDestinatario == 'RJ'){
                    productLines += `I|E|1|${item.ufDestinatario}|100|0|20|2|22\n`;
                }
                });

                let adicionouES = false;
                let estadosAdicionados = new Set(); // Conjunto para rastrear os estados já adicionados
                
                // Processar múltiplas linhas I para cada UF relacionada ao produto
                grupo.forEach(item => {
                    const fcpItem = item.aliquotaFCP != null ? item.aliquotaFCP : '';
                    
                    // Verificar se o estado já foi adicionado
                    if (!estadosAdicionados.has(item.ufDestinatario)) {
                        // PARA ITENS 07(IMPORTADOS) O CORRETO é 100 ou 110
                        if ((item.ufDestinatario == 'PR' || item.ufDestinatario == 'ES') && item.ncm == '73269090' && primeiroItem.CodigoProduto.startsWith('07.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        }
                        //PARA ITENS 04(NACIONAIS) O CORRETO é 000 ou 010 
                        else if((item.ufDestinatario == 'PR' || item.ufDestinatario == 'ES' || item.ufDestinatario == 'AC') && item.ncm == '73269090' && primeiroItem.CodigoProduto.startsWith('04.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|7|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if((item.ufDestinatario == 'MA' || item.ufDestinatario == 'SP' || item.ufDestinatario == 'PA' || item.ufDestinatario == 'RS') && item.ncm == '73269090' && primeiroItem.CodigoProduto.startsWith('04.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if((item.ufDestinatario == 'ES') && item.ncm == '73209090' && primeiroItem.CodigoProduto.startsWith('11.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|100|0|0|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if((item.ufDestinatario == 'PR' || item.ufDestinatario == 'SP') && item.ncm == '84833090' && primeiroItem.CodigoProduto.startsWith('07.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if(item.ufDestinatario != 'CE' && item.ncm == '84833090' && primeiroItem.CodigoProduto.startsWith('04.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if((item.ufDestinatario == 'PA' || item.ufDestinatario == 'MA') && item.ncm == '84821090' && primeiroItem.CodigoProduto.startsWith('11.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if((item.ufDestinatario == 'PR' || item.ufDestinatario == 'SP' || item.ufDestinatario == 'PA' || item.ufDestinatario == 'BA') && item.ncm == '84819090' && primeiroItem.CodigoProduto.startsWith('04.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if((item.ufDestinatario == 'RS' || item.ufDestinatario == 'MG' || item.ufDestinatario == 'SP') && item.ncm == '84839000' && primeiroItem.CodigoProduto.startsWith('04.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if((item.ufDestinatario == 'PR') && item.ncm == '84679100' && primeiroItem.CodigoProduto.startsWith('11.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if (item.ufDestinatario == 'MA' && item.ncm == '84122900') {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if ((item.ufDestinatario == 'MG' || item.ufDestinatario == 'PR') && item.ncm == '84123110') {
                            productLines += `I|S|1|${item.ufDestinatario}|000|0|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        }
                        else if (item.ufDestinatario == 'ES' && item.ncm == '84636060') {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if ((item.ufDestinatario == 'MA') && item.ncm == '84213100' && primeiroItem.CodigoProduto.startsWith('11.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if ((item.ufDestinatario == 'ES') && item.ncm == '84314929' && primeiroItem.CodigoProduto.startsWith('11.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|100|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if ((item.ufDestinatario == 'MA' || item.ufDestinatario == 'ES') && item.ncm == '84212990' && primeiroItem.CodigoProduto.startsWith('07.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if ((item.ufDestinatario == 'MG') && item.ncm == '84212990' && primeiroItem.CodigoProduto.startsWith('07.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|100|0|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if (item.ncm == '84212990' && item.CodigoProduto == '07.990035' && !adicionouES) {
                            productLines += `I|S|1|ES|100|0|${item.aliquotaInterestadualMI}|0|0\n`;
                            adicionouES = true; // Definir como true para evitar adicionar ES novamente
                        }else if (primeiroItem.CodigoProduto.startsWith('04.') && item.aliquotainterestadual != null && !linhaAdicionada) {
                            productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|${item.aliquotaEfetiva}|${item.aliquotainterestadual}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.ufDestinatario == 'PR' && item.ncm == '84254910') {
                            productLines += `I|S|1|${item.ufDestinatario}|100|0|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                            //    Sit Trib  | aliquota icms/st      |          Aliquota           | FCP | aliq interna |
                        } else if ((item.ufDestinatario == 'PA' || item.ufDestinatario == 'BA') && item.ncm == '73182900'  && item.CodigoProduto.startsWith('04.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.ncm == '73182900'  && item.CodigoProduto == '04.6742') {
                            productLines += `I|S|1|SP|010|18|7|0|0\n`;
                        } else if ((item.ufDestinatario == 'ES') && item.ncm == '73182200') {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if ((item.ufDestinatario == 'ES' || item.ufDestinatario == 'MG' || item.ufDestinatario == 'PR') && item.ncm == '73182100'  && item.CodigoProduto.startsWith('07.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if ((item.ufDestinatario == 'PA' || item.ufDestinatario == 'PR') && item.ncm == '73181600') {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if ((item.ufDestinatario == 'MG' || item.ufDestinatario == 'PR') && item.ncm == '73181500' && primeiroItem.CodigoProduto.startsWith('07.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.ufDestinatario == 'SP' && item.ncm == '73181500' && primeiroItem.CodigoProduto.startsWith('04.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|010|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if ((item.ufDestinatario == 'ES' || item.ufDestinatario == 'PA') && item.ncm == '73181500' && primeiroItem.CodigoProduto.startsWith('07.')) {
                            productLines += `I|S|1|${item.ufDestinatario}|110|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        }else if (item.ufDestinatario != 'RJ' && (item.cst === '100' || item.cst === '000')) {
                            productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|0|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.ufDestinatario === 'RJ' && (item.cst === '100' || item.cst === '000')) {
                            productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|0|${item.aliquotaInterestadualMI}|${fcpItem}|${item.aliquotaEfetiva}\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.ufDestinatario == 'RJ' && (item.cst == '110')) {
                            productLines += `I|S|1|${item.ufDestinatario}|100|0|20|2|22\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.ufDestinatario == 'RJ' && (item.cst == '010')) {
                            productLines += `I|S|1|${item.ufDestinatario}|000|0|20|2|22\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.ufDestinatario == 'RJ' && (item.cst == '110' || item.cst == '010')) {
                            productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|20|20|2|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else if (item.cst === '110' || item.cst === '010') {
                            productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|0|0\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        } else {
                            productLines += `I|S|1|${item.ufDestinatario}|${item.cst}|${item.aliquotaEfetiva}|${item.aliquotaInterestadualMI}|${fcpItem}|${item.aliquotaEfetiva}\n`;
                            estadosAdicionados.add(item.ufDestinatario); // Adicionar estado ao conjunto
                        }
                    }
                
                    // Resetar a variável para a próxima iteração
                    linhaAdicionada = false;
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


module.exports = {
    exportarDadosParaTXTSync
}