const fs = require('fs').promises;
const mysql = require('mysql');
const { promisify } = require('util');

const connectDB = () => {
    return new Promise((resolve, reject) => {
        const db = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'db_ncm'
        });

        db.connect(err => {
            if (err) {
                console.error('Erro ao conectar ao banco de dados:', err);
                reject(err);
            } else {
                console.log("Conectado ao banco de dados!");
                resolve(db);
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
                console.log('Banco de dados reiniciado com sucesso!');
                resolve();
            }
        });
    });
}

const inserirProduto = (db, codigo, ncm, nomeProduto, unidadeMedida, cstipi) => {
    return new Promise((resolve, reject) => {
        const ncmSemPontos = ncm ? ncm.replace(/\./g, '') : '';

        db.query('SELECT * FROM tec_produto WHERE codigo = ?', [codigo], (err, result) => {
            if (err) {
                console.error('Erro ao verificar a existência do produto:', err);
                reject(err);
            } else if (result.length === 0) {
                const sql = 'INSERT INTO tec_produto (codigo, ncm, nmproduto, unidade, cstipi) VALUES (?, ?, ?, ?, ?)';
                db.query(sql, [codigo, ncmSemPontos, nomeProduto, unidadeMedida, cstipi], (err) => {
                    if (err) {
                        console.error('Erro ao inserir o produto:', err);
                        reject(err);
                    } else {
                        console.log(`Produto com código ${codigo} inserido com sucesso!`);
                        resolve();
                    }
                });
            } else {
                console.log(`Produto com código ${codigo} já existe no banco de dados.`);
                resolve();
            }
        });
    });
};

const lerArquivo = async () => {
    try {
        const db = await connectDB();

        console.log('Lendo arquivo...');

        const data = await fs.readFile('C:/Users/Fellipe Silva/OneDrive/Área de Trabalho/code/tecwin/tecwinncm.txt', 'utf8');
        const linhas = data.split('\n');

        console.log(`Encontradas ${linhas.length} linhas no arquivo.`);

        for (let linha of linhas) {
            const [codigo, ncm, nomeProduto, unidadeMedida, cstipi] = linha.split('|');
            console.log(`Processando linha: ${linha}`);
            await inserirProduto(db, codigo, ncm, nomeProduto, unidadeMedida, cstipi);
        }

        console.log('Finalizado.');

        db.end();
    } catch (err) {
        console.error('Erro durante a execução:', err);
    }
};


module.exports = {
    lerArquivo,
    connectDB,
    reiniciarBancoAsync,
    atualizarStatus,
    obterStatus,
};
