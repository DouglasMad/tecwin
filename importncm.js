const fs = require('fs').promises;
const mysql = require('mysql2');
const { promisify } = require('util');

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

// Função para executar uma query com uma conexão do pool
const queryWithConnection = (connection, sql, values) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                console.error('Erro ao executar query:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

async function atualizarStatus(db, etapa, status) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO execucao_status (etapa, status) VALUES ('${etapa}', '${status}')
                    ON DUPLICATE KEY UPDATE status = VALUES(status)`;
        db.query(query, [etapa, status], (err) => {
            if(err) {
                reject(err);
            } else{
                resolve();
            }
        });
    });
};

async function obterStatus(db, etapa) {
    return new Promise((resolve, reject) => {
        const query = `SELECT status FROM execucao_status WHERE etapa = '${etapa}'`;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                const status = results.length > 0 ? results[0].status : null;
                resolve(status);
            }
        });
    });
}

async function reiniciarBancoAsync(db) {
    return new Promise((resolve, reject) => {
        const sql = 'TRUNCATE TABLE tec_produto;';
        db.query(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('tec_produto reiniciado!');
                resolve();
            }
        });
    });
}
async function reiniciarst(db) {
    return new Promise((resolve, reject) => {
        const sql = 'TRUNCATE TABLE tec_stcst;';
        db.query(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('tec_stcst reiniciado com sucesso!');
                resolve();
            }
        });
    });
}


async function reiniciarTabelas(db, tabelas) {
    try {
        for (const tabela of tabelas) {
            await reiniciarTabela(db, tabela);
        }
        console.log('Tabelas reiniciadas com sucesso!');
    } catch (error) {
        console.error('Erro ao reiniciar tabelas:', error);
    }
}

async function reiniciarTabela(db, tabela) {
    return new Promise((resolve, reject) => {
        const sql = `TRUNCATE TABLE ${tabela};`;
        db.query(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`${tabela} reiniciada com sucesso!`);
                resolve();
            }
        });
    });
}

async function reiniciareStatus(db) {
    return new Promise((resolve, reject) => {
        const sql = 'Truncate table db_ncm.execucao_status;';
        db.query(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('tec_stcst reiniciado com sucesso!');
                resolve();
            }
        });
    });
}
const tabelasParaReinicar = ['dadosncm', 'dadosst', 'st_ncm', 'tec_ipi', 'tec_pisdeb','tec_produto', 'tec_stcst', 'unica']



// Função para inserir produtos em lote
const inserirProdutosEmLote = async (produtos) => {
    let connection;
    try {
        connection = await getConnectionFromPool();

        const placeholders = produtos.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const insertQuery = `INSERT INTO tec_produto (codigo, ncm, nmproduto, unidade, cstipi) VALUES ${placeholders}`;
        const insertValues = produtos.flatMap(produto => [
            produto.codigo || '',
            produto.ncm ? produto.ncm.replace(/\./g, '') : '',
            produto.nomeProduto || '',
            produto.unidadeMedida || '',
            produto.cstipi || ''
        ]);

        await queryWithConnection(connection, insertQuery, insertValues);
        console.log(`Lote de ${produtos.length} produtos inserido com sucesso!`);
    } catch (err) {
        console.error('Erro ao inserir o lote de produtos:', err);
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão de volta para o pool
        }
    }
};

// Função para ler o arquivo e inserir os produtos no banco de dados
const lerArquivo = async () => {
    try {
        console.log('Lendo arquivo...');
        const data = await fs.readFile('\\Srvad\\netlogon\\db_BI\\Tecwin\\tecwinncm.txt', 'utf8');
        const linhas = data.split('\n');
        console.log(`Encontradas ${linhas.length} linhas no arquivo.`);

        const batchSize = 1000; // Tamanho do lote
        let batch = [];

        for (let linha of linhas) {
            const [codigo, ncm, nomeProduto, unidadeMedida, cstipi] = linha.split('|');
            if (codigo && nomeProduto) { // Verifica se os campos essenciais estão presentes
                batch.push({ codigo, ncm, nomeProduto, unidadeMedida, cstipi });

                if (batch.length === batchSize) {
                    await inserirProdutosEmLote(batch); // Insere lote no banco de dados
                    batch = []; // Reseta o lote
                }
            } else {
                console.warn(`Linha ignorada devido a campos faltando: ${linha}`);
            }
        }

        // Insere os itens restantes que não completaram um lote
        if (batch.length > 0) {
            await inserirProdutosEmLote(batch);
        }

        console.log('Finalizado.');
    } catch (err) {
        console.error('Erro durante a execução:', err);
    }
};

 // lerArquivo() // Adicionado para executar a função diretamente

module.exports = {
    lerArquivo,
    reiniciarBancoAsync,
    reiniciarst,
    reiniciareStatus,
    atualizarStatus,
    obterStatus,
    reiniciarTabelas,
};
