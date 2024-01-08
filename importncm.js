const fs = require('fs').promises;
const mysql = require('mysql');

// Função para conectar ao banco de dados
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

// Função para reiniciar o banco de dados (TRUNCATE)
const reiniciarBanco = (db) => {
    return new Promise((resolve, reject) => {
        const sql = 'TRUNCATE TABLE tec_produto; ALTER TABLE tec_produto AUTO_INCREMENT = 1;';
        db.query(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Banco de dados reiniciado com sucesso!');
                resolve();
            }
        });
    });
};

// Função para inserir os dados no banco
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
                console.log(`Produto com código ${codigo} já existe no banco de dados.p`);
                resolve();
            }
        });
    });
};

// Função para ler o arquivo txt
const lerArquivo = async () => {
    try {
        await reiniciarBanco()
        const data = await fs.readFile('C://Users//Felipe Silva//Desktop//code//tecwin//tecwinncm.txt', 'utf8');
        const linhas = data.split('\n');
        const db = await connectDB();

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


module.exports = {lerArquivo}