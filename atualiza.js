const mysql = require('mysql2');
const util = require('util');
const cliProgress = require("cli-progress")

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 10000, // Aumente o número de conexões simultâneas
    queueLimit: 0
});

// Promisify para uso de async/await com consultas ao banco de dados
const pool_query = util.promisify(pool.query).bind(pool);

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
// Função para inserir dados em lote
const inserirDadosEmLote = async (dados) => {
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                else resolve(conn);
            });
        });

        const placeholders = dados.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const insertQuery = `
            INSERT INTO unica (
                ufDestinatario, cst, cstipi, unidade, ipient, ipi, ncm,
                CodigoProduto, NomeProduto
            )
            VALUES ${placeholders}
            ON DUPLICATE KEY UPDATE
                ufDestinatario = COALESCE(VALUES(ufDestinatario), ufDestinatario),
                cst = COALESCE(VALUES(cst), cst),
                cstipi = COALESCE(VALUES(cstipi), cstipi),
                unidade = COALESCE(VALUES(unidade), unidade),
                ipient = COALESCE(VALUES(ipient), ipient),
                ipi = COALESCE(VALUES(ipi), ipi),
                ncm = COALESCE(VALUES(ncm), ncm),
                CodigoProduto = COALESCE(VALUES(CodigoProduto), CodigoProduto),
                NomeProduto = COALESCE(VALUES(NomeProduto), NomeProduto);
        `;

        const insertValues = dados.flatMap(dado => [
            dado.ufDestinatario || null, dado.cst || null, dado.cstipi || null, 
            dado.unidade || null, dado.ipient || null, dado.ipi || null,
            dado.ncm || null, dado.codigoProduto || null, dado.nomeProduto || null
        ]);

        await new Promise((resolve, reject) => {
            connection.query(insertQuery, insertValues, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

    } catch (err) {
        console.error('Erro ao inserir o lote de dados:', err);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// Função para processar um NCM
const processaNCM = async (codigoProduto) => {
    const selectQuery = `
        SELECT DISTINCT 
            tec_stcst.uf AS ufDestinatario,
            tec_stcst.cst, 
            tec_produto.ncm,
            tec_produto.ipient,
            tec_produto.unidade,
            tec_produto.cstipi,
            tec_ipi.ipi,
            tec_pisdeb.pisDebito,
            tec_pisdeb.cofinsDebito,
            tec_pisdeb.cst AS cstpis,
            tec_produto.codigo AS codigoProduto,
            tec_produto.nmproduto AS nomeProduto
        FROM 
            tec_stcst
        LEFT JOIN 
            tec_produto ON tec_stcst.codigo = tec_produto.codigo 
        LEFT JOIN
            tec_ipi ON tec_ipi.ncm_codigo = tec_produto.ncm
        LEFT JOIN
            tec_pisdeb ON tec_pisdeb.ncm = tec_produto.ncm
        WHERE 
            tec_produto.codigo = ?;
    `;

    const results = await pool_query(selectQuery, [codigoProduto]);

    if (results.length > 0) {
        await inserirDadosEmLote(results);
    }

    // console.log(`Processado NCM: ${codigoProduto} com ${results.length} registros.`);
};

// Função principal para processar todos os NCMs
const processaNCMs = async () => {
    try {
        // Recupera todos os NCMs distintos da tabela dadosncm
        const ncmRows = await pool_query('SELECT DISTINCT codigoProduto FROM dadosncm');
        console.log(`Total de NCMs distintos encontrados: ${ncmRows.length}`);

        const batchSize = 100; // Número de NCMs processados em paralelo
        const promises = [];

        progressBar.start(ncmRows.length, 0);
        let processedCount = 0;

        for (const ncmRow of ncmRows) {
            promises.push(processaNCM(ncmRow.codigoProduto));
            processedCount ++;

            progressBar.update(processedCount);
            // Processa os NCMs em paralelo
            if (promises.length >= batchSize) {
                await Promise.all(promises);
                promises.length = 0; // Limpa a lista de promessas
            }
        }

        // Aguarda a finalização das promessas restantes
        if (promises.length > 0) {
            await Promise.all(promises);
        }

        progressBar.stop();

        console.log('Processamento finalizado.');
    } catch (error) {
        console.error('Erro ao processar NCMs:', error);
    } finally {
        pool.end(); // Sempre fechar a conexão quando terminar
    }
};

// processaNCMs();

module.exports = {
    processaNCMs
};
