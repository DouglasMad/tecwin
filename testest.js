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
                console.error('Erro ao conectar ao banco de dados:', err);
                reject(err);
            } else {
                console.log("Conectado ao banco de dados!");
                resolve(db);
            }
        });
    });
};

//Função para reiniciar tabela tec_produtos ao iniciar aplicação
const reiniciarBancoAsync = (db) => {
    return new Promise((resolve, reject) => {
        const sql = 'TRUNCATE TABLE tec_produto;';
        db.query(sql, (err) => {
            if (err) {
                console.error('Erro ao reiniciar o banco de dados:', err);
                reject(err);
            } else {
                console.log('Banco de dados reiniciado com sucesso!');
                resolve();
            }
        });
    });
}

//Função para inserir produto no tec_produto
const inserirProduto = (db, codigo, ncm, nomeProduto, unidadeMedida) => {
    return new Promise((resolve, reject) => {
        // Certifique-se de que o NCM está definido e remova os pontos
        const ncmSemPontos = ncm ? ncm.replace(/\./g, '') : '';

        db.query('SELECT * FROM tec_produto WHERE codigo = ?', [codigo], (err, result) => {
            if (err) {
                console.error('Erro ao verificar a existência do produto:', err);
                reject(err);
            }

            if (result.length === 0) {
                const sql = 'INSERT INTO tec_produto (codigo, ncm, nmproduto, unidade) VALUES (?, ?, ?, ?)';
                db.query(sql, [codigo, ncmSemPontos, nomeProduto, unidadeMedida], (err) => {
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

        const data = await fs.readFile('E:/WkRadar/BI/Registros/tecwinncm.txt', 'utf8');
        const linhas = data.split('\n');

        console.log(`Encontradas ${linhas.length} linhas no arquivo.`);

        for (let linha of linhas) {
            const [codigo, ncm, nomeProduto, unidadeMedida] = linha.split('|');
            console.log(`Processando linha: ${linha}`);
            await inserirProduto(db, codigo, ncm, nomeProduto, unidadeMedida);
        }

        console.log('Finalizado.');

        // Fechar a conexão com o banco de dados após a conclusão
        db.end();
    } catch (err) {
        console.error('Erro durante a execução:', err);
    }
};

lerArquivo(); // Iniciar a execução do código
