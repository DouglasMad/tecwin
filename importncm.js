const fs = require('fs').promises;
const mysql = require('mysql');
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



// Função para inserir um produto no banco de dados
const inserirProduto = async (codigo, ncm, nomeProduto, unidadeMedida, cstipi) => {
    let connection;
    try {
        connection = await getConnectionFromPool();
        const ncmSemPontos = ncm ? ncm.replace(/\./g, '') : '';

        const selectQuery = 'SELECT * FROM tec_produto WHERE codigo = ?';
        const selectResult = await queryWithConnection(connection, selectQuery, [codigo]);

        if (selectResult.length === 0) {
            const insertQuery = 'INSERT INTO tec_produto (codigo, ncm, nmproduto, unidade, cstipi) VALUES (?, ?, ?, ?, ?)';
            await queryWithConnection(connection, insertQuery, [codigo, ncmSemPontos, nomeProduto, unidadeMedida, cstipi]);
            console.log(`Produto com código ${codigo} inserido com sucesso!`);
        } else {
            console.log(`Produto com código ${codigo} já existe no banco de dados.`);
        }
    } catch (err) {
        console.error('Erro ao inserir o produto:', err);
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
        const data = await fs.readFile('C:\\Users\\felli\\OneDrive\\Documentos\\tecwin docs\\tecwinncm.txt', 'utf8');
        const linhas = data.split('\n');
        console.log(`Encontradas ${linhas.length} linhas no arquivo.`);

        for (let linha of linhas) {
            const [codigo, ncm, nomeProduto, unidadeMedida, cstipi] = linha.split('|');
            console.log(`Processando linha: ${linha}`);
            await inserirProduto(codigo, ncm, nomeProduto, unidadeMedida, cstipi);
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
