const mysql = require('mysql2');
const util = require('util');
const cliProgress = require('cli-progress');

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0
});

// Promisify para uso de async/await com consultas ao banco de dados
const pool_query = util.promisify(pool.query).bind(pool);

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

        const placeholders = dados.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const insertQuery = `
            INSERT INTO unica (
                ufDestinatario, cst, cstipi, unidade, ipient, ipi, ncm,
                pisDebito, cofinsDebito, cstpis, CodigoProduto, NomeProduto
            )
            VALUES ${placeholders}
            ON DUPLICATE KEY UPDATE
                ufDestinatario = VALUES(ufDestinatario),
                cst = VALUES(cst),
                cstipi = VALUES(cstipi),
                unidade = VALUES(unidade),
                ipient = VALUES(ipient),
                ipi = VALUES(ipi),
                pisDebito = VALUES(pisDebito),
                cofinsDebito = VALUES(cofinsDebito),
                cstpis = VALUES(cstpis),
                CodigoProduto = VALUES(CodigoProduto),
                NomeProduto = VALUES(NomeProduto);
        `;

        const insertValues = dados.flatMap(dado => [
            dado.ufDestinatario, dado.cst, dado.cstipi, dado.unidade, dado.ipient, dado.ipi,
            dado.ncm, dado.pisDebito, dado.cofinsDebito, dado.cstpis, dado.CodigoProduto, dado.NomeProduto
        ]);

        await new Promise((resolve, reject) => {
            connection.query(insertQuery, insertValues, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`Lote de ${dados.length} registros inserido com sucesso!`);
    } catch (err) {
        console.error('Erro ao inserir o lote de dados:', err);
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão de volta para o pool
        }
    }
};

// Função para processar um NCM e retornar dados distintos para cada estado
const processaNCM = async (produto) => {
    // Busca todos os detalhes de produtos com o mesmo NCM na tabela unica, agrupando por ufDestinatario
    const detalhes = await pool_query(`
        SELECT 
            u.ufDestinatario,
            MIN(u.cst) AS cst, 
            MIN(u.cstipi) AS cstipi, 
            MIN(u.unidade) AS unidade, 
            MIN(u.ipient) AS ipient, 
            MIN(u.ipi) AS ipi, 
            u.ncm,
            MIN(u.pisDebito) AS pisDebito, 
            MIN(u.cofinsDebito) AS cofinsDebito, 
            MIN(u.cstpis) AS cstpis
        FROM unica u
        WHERE u.ncm = ?
        GROUP BY u.ufDestinatario, u.ncm
    `, [produto.ncm]);

    if (detalhes.length > 0) {
        // Cria uma lista de dados para inserção
        const dadosParaInserir = detalhes.map(detalhe => ({
            ufDestinatario: detalhe.ufDestinatario,
            cst: detalhe.cst,
            cstipi: detalhe.cstipi,
            unidade: detalhe.unidade,
            ipient: detalhe.ipient,
            ipi: detalhe.ipi,
            ncm: produto.ncm,
            pisDebito: detalhe.pisDebito,
            cofinsDebito: detalhe.cofinsDebito,
            cstpis: detalhe.cstpis,
            CodigoProduto: produto.codigo,
            NomeProduto: produto.nmproduto
        }));

        return dadosParaInserir;
    }

    return [];
};


// Função principal para preencher produtos sem detalhes
const preencherProdutosSemDetalhes = async () => {
    let connection;
    try {
        // Obtém uma conexão do pool
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                else resolve(conn);
            });
        });

        // Busca produtos na tec_produto que não estão na tabela unica
        const produtosSemDetalhes = await pool_query(`
            SELECT tp.codigo, tp.ncm, tp.nmproduto, tp.unidade
            FROM tec_produto tp
            LEFT JOIN unica u ON tp.codigo = u.CodigoProduto
            WHERE u.CodigoProduto IS NULL;
        `);

        const totalProdutos = produtosSemDetalhes.length;
        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

        // Inicia a barra de progresso
        progressBar.start(totalProdutos, 0);

        // Processa produtos em paralelo com um limite de concorrência
        const batchSize = 50;
        for (let i = 0; i < totalProdutos; i += batchSize) {
            const batch = produtosSemDetalhes.slice(i, i + batchSize);
            const promises = batch.map(processaNCM);
            const resultados = await Promise.all(promises);
            const dadosParaInserir = resultados.flat();
            if (dadosParaInserir.length > 0) {
                await inserirDadosEmLote(dadosParaInserir);
            }

            // Atualiza a barra de progresso
            progressBar.update(Math.min(i + batchSize, totalProdutos));
        }

        // Para a barra de progresso
        progressBar.stop();

        console.log('Produtos sem detalhes preenchidos com sucesso!');
    } catch (err) {
        console.error('Erro ao preencher produtos sem detalhes:', err);
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão de volta para o pool
        }
    }
};

preencherProdutosSemDetalhes().catch(err => {
    console.error('Erro ao preencher produtos sem detalhes:', err);
});

module.exports = {
    preencherProdutosSemDetalhes
};
