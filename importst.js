const fs = require('fs').promises;
const mysql = require('mysql');

// Criando o pool de conexões
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

// Função para conectar ao banco de dados usando o pool
const connectDB = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Erro ao obter conexão do pool:', err);
                reject(err);
            } else {
                console.log('Conexão obtida do pool.');
                resolve(connection);
            }
        });
    });
};

// Função para inserir um produto no banco de dados
const inserirProduto = (connection, codigo, ncm, nomeProduto, unidadeMedida, cst, uf) => {
    return new Promise((resolve, reject) => {
        const ncmSemPontos = ncm.replace(/\./g, ''); // Remove os pontos do NCM

        const sql = 'INSERT INTO tec_stcst (codigo, ncm, nmproduto, unidade, cst, uf) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [codigo, ncmSemPontos, nomeProduto, unidadeMedida, cst, uf], (err) => {
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

// Função principal para importar os dados
const importst = async () => {
    let connection;

    try {
        connection = await connectDB(); // Obtém uma conexão do pool

        console.log('Iniciando leitura do arquivo...');

        const data = await fs.readFile('C:\\Users\\felli\\OneDrive\\Documentos\\tecwin docs\\tecwinst.txt', 'utf8');
        const linhas = data.split('\n');

        console.log(`Total de ${linhas.length} linhas encontradas no arquivo.`);

        for (const linha of linhas) {
            const [codigo, ncm, nomeProduto, unidadeMedida, cst, uf] = linha.split('|');
            if (codigo && ncm && nomeProduto && unidadeMedida && cst && uf) {
                console.log(`Processando: ${linha}`);
                await inserirProduto(connection, codigo, ncm, nomeProduto, unidadeMedida, cst, uf);
            } else {
                console.log(`Linha incompleta ignorada: ${linha}`);
            }
        }

        console.log('Importação finalizada.');
    } catch (err) {
        console.error('Erro durante a execução:', err);
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão de volta para o pool
            console.log('Conexão liberada.');
        }
    }
};

//  importst(); // Adicionado para executar a função diretamente

module.exports = {
    importst
}