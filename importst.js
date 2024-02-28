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
                console.log("Conectado ao banco de dados com sucesso!");
                resolve(db);
            }
        });
    });
};

const inserirProduto = (db, codigo, ncm, nomeProduto, unidadeMedida, cst, uf) => {
    return new Promise((resolve, reject) => {
        const ncmSemPontos = ncm.replace(/\./g, ''); // Continua removendo os pontos do NCM

        const sql = 'INSERT INTO tec_stcst (codigo, ncm, nmproduto, unidade, cst, uf) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [codigo, ncmSemPontos, nomeProduto, unidadeMedida, cst, uf], (err) => {
            if (err) {
                console.error(`Erro ao inserir o produto com código ${codigo}:`, err);
                reject(err);
            } else {
                console.log(`Produto com código ${codigo} inserido com sucesso.`);
                resolve();
            }
        });
    });
};

const importst = async () => {
    try {
        const db = await connectDB();

        console.log('Iniciando leitura do arquivo...');

        const data = await fs.readFile('C:/WKRadar/BI/Registros/tecwinst.txt', 'utf8');
        const linhas = data.split('\n');

        console.log(`Total de ${linhas.length} linhas encontradas no arquivo.`);

        for (const linha of linhas) {
            const [codigo, ncm, nomeProduto, unidadeMedida, cst, uf] = linha.split('|');
            if (codigo && ncm && nomeProduto && unidadeMedida && cst && uf) { // Verifica se todos os campos estão presentes
                console.log(`Processando: ${linha}`);
                await inserirProduto(db, codigo, ncm, nomeProduto, unidadeMedida, cst, uf);
            } else {
                console.log(`Linha incompleta ignorada: ${linha}`);
            }
        }

        console.log('Importação finalizada.');

        db.end();
    } catch (err) {
        console.error('Erro durante a execução:', err);
    }
};

// importst(); // Adicionado para executar a função diretamente

module.exports = {
    importst
}