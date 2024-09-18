const mysql = require('mysql2');
const util = require('util');
const cliProgress = require("cli-progress")


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

// Promisify para habilitar async/await para consultas MySQL
const poolQuery = util.promisify(pool.query).bind(pool);

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

async function atualizarDadosST() {
    try {
        // Busca os NCMs da tabela tec_produto
        const ncmResultados = await poolQuery('SELECT DISTINCT ncm FROM tec_produto');

        progressBar.start(ncmResultados.length, 0);
        let processedCount = 0;
        
        for (const row of ncmResultados) {
            const ncm = row.ncm;

            processedCount ++;

            progressBar.update(processedCount);

            // Executa a consulta e insere os resultados na tabela dadosst
            const insertQuery = `
                INSERT INTO dadosst (ufDestinatario, cst, aliquotaDestino, aliquotaInterestadualMI, codigo, nmproduto)
                SELECT DISTINCT 
                    st_ncm.ufDestinatario, 
                    tec_stcst.cst, 
                    st_ncm.aliquotaDestino, 
                    st_ncm.aliquotaInterestadualMI,
                    tec_produto.codigo, 
                    tec_produto.nmproduto
                FROM 
                    st_ncm 
                JOIN 
                    tec_stcst ON st_ncm.ufDestinatario = tec_stcst.uf AND st_ncm.ncmid = tec_stcst.ncm 
                JOIN 
                    tec_produto ON tec_stcst.codigo = tec_produto.codigo
                WHERE 
                    st_ncm.ncmid = ?
            `;
            await poolQuery(insertQuery, [ncm]);
        }
        
        console.log('Dados inseridos com sucesso na tabela dadosst.');
    } catch (err) {
        console.error('Erro ao inserir dados na tabela dadosst:', err);
    } finally {
        pool.end();
    }
}

// Executa a função de atualização
atualizarDadosST();

module.exports = {
    atualizarDadosST
}