const fs = require('fs').promises;
const mysql = require('mysql');

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


const reiniciarBanco = (db) => {
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
};


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
        await reiniciarBanco(db);

        const data = await fs.readFile('C://Users//Felipe Silva//Desktop//code//tecwin//tecwinncm.txt', 'utf8');
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

module.exports = { lerArquivo };