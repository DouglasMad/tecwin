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
                reject(err);
            } else {
                console.log("Conectado ao banco de dados!");
                resolve(db);
            }
        });
    });
};


//Função para atualizar
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


//Função para Obter
async function obterStatus(db, etapa) {
    return new Promise((resolve, reject) => {
        const query = `SELECT status FROM execucao_status WHERE etapa = '${etapa}'`;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                // Verifica se há resultados antes de acessar a propriedade 'status'
                const status = results.length > 0 ? results[0].status : null;
                resolve(status);
            }
        });
    });
}



//Função para reiniciar tabela tec_produtos ao iniciar aplicação
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

//Função para inserir produto no tec_produto
const inserirProduto = (db, codigo, ncm) => {
    return new Promise((resolve, reject) => {
        // Certifique-se de que o NCM está definido e remova os pontos
        const ncmSemPontos = ncm ? ncm.replace(/\./g, '') : '';

        db.query('SELECT * FROM tec_produto WHERE codigo = ?', [codigo], (err, result) => {
            if (err) {
                reject(err);
            }

            if (result.length === 0) {
                const sql = 'INSERT INTO tec_produto (codigo, ncm) VALUES (?, ?)';
                db.query(sql, [codigo, ncmSemPontos], (err) => {
                    if (err) {
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

        const data = await fs.readFile('C:/Users/Fellipe Silva/OneDrive/Área de Trabalho/code/tecwinncm.txt', 'utf8');
        const linhas = data.split('\n');

        for (let linha of linhas) {
            const [codigo, ncm] = linha.split('|');
            await inserirProduto(db, codigo, ncm);
        }

        // Fechar a conexão com o banco de dados após a conclusão
        db.end();
    } catch (err) {
        console.error(err);
    }
};


module.exports = { 
    lerArquivo,
    connectDB,
    reiniciarBancoAsync,
    atualizarStatus,
    obterStatus,
    
};