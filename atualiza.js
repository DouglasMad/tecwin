const mysql = require('mysql');
const util = require('util');

// Configuração do pool de conexões
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

// Promisify para uso de async/await com consultas ao banco de dados
const pool_query = util.promisify(pool.query).bind(pool);

async function processaNCMs() {
    try {
        // Recupera todos os NCMs distintos da tabela dadosncm
        const ncmRows = await pool_query('SELECT DISTINCT codigoProduto FROM dadosncm');
        console.log(`Total de NCMs distintos encontrados: ${ncmRows.length}`);

        for (const ncmRow of ncmRows) {
            const selectQuery = `
                SELECT DISTINCT 
                    st_ncm.ufDestinatario, 
                    tec_stcst.cst, 
                    st_ncm.aliquotaEfetiva, 
                    st_ncm.aliquotaInterestadualMI,
                    tec_produto.ncm,
                    tec_produto.ipient,
                    tec_produto.unidade,
                    tec_produto.cstipi,
                    tec_ipi.ipi,
                    tec_pisdeb.pisDebito,
                    tec_pisdeb.cofinsDebito,
                    tec_pisdeb.cst as cstpis,
                    tec_produto.codigo AS codigoProduto,
                    tec_produto.nmproduto AS nomeProduto
                FROM 
                    st_ncm 
                LEFT JOIN 
                    tec_stcst ON st_ncm.ufDestinatario = tec_stcst.uf AND st_ncm.ncmid = tec_stcst.ncm 
                LEFT JOIN 
                    tec_produto ON tec_stcst.codigo = tec_produto.codigo 
                LEFT JOIN
                    tec_ipi ON tec_ipi.ncm_codigo = tec_produto.ncm
                    join
                    tec_pisdeb
                    on
                    tec_pisdeb.ncm= tec_produto.ncm
                WHERE 
                    tec_produto.codigo = ?;
            `;

            const results = await pool_query(selectQuery, [ncmRow.ncm]);

            for (const row of results) {
              
                const insertQuery = `
                    INSERT INTO unica (ufDestinatario, cst, cstipi, unidade, ipient, ipi, ncm, aliquotaEfetiva, aliquotaInterestadualMI, pisDebito,cofinsDebito,cstpis,CodigoProduto, NomeProduto)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    ufDestinatario = VALUES(ufDestinatario),
                    cst = VALUES(cst),
                    cstipi = VALUES(cstipi),
                    unidade = VALUES(unidade),
                    ipient = VALUES(ipient),
                    ipi = VALUES(ipi),
                    aliquotaEfetiva = VALUES(aliquotaEfetiva),
                    aliquotaInterestadualMI = VALUES(aliquotaInterestadualMI),
                    pisDebito = VALUES(pisDebito),
                    cofinsDebito = VALUES(cofinsDebito),
                    cstpis = VALUES(cstpis),
                    CodigoProduto = VALUES(CodigoProduto),
                    NomeProduto = VALUES(NomeProduto);
                `;
                await pool_query(insertQuery, [row.ufDestinatario, row.cst, row.cstipi, row.unidade, row.ipient, row.ipi, row.ncm, row.aliquotaEfetiva, row.aliquotaInterestadualMI,row.pisDebito,row.cofinsDebito,row.cstpis, row.codigoProduto, row.nomeProduto]);
            }
            console.log(`Processado NCM: ${ncmRow.ncm} com ${results.length} registros.`);
        }
    } catch (error) {
        console.error('Erro ao processar NCMs:', error);
    } finally {
        pool.end(); // Sempre fechar a conexão quando terminar
    }
}

// processaNCMs();

module.exports = {
    processaNCMs
}
