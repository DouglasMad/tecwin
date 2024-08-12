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
    connectionLimit: 10, // Limite de conexões simultâneas
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

// Função para executar uma query com uma conexão
const queryWithConnection = async (connection, query, params) => {
    const queryAsync = promisify(connection.query).bind(connection);
    return queryAsync(query, params);
};

// Função para inserir produtos em lote
const inserirProdutosEmLote = async (produtos) => {
    let connection;
    try {
        connection = await getConnectionFromPool();

        const placeholders = produtos.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const insertQuery = `INSERT INTO tec_stcst (codigo, ncm, nmproduto, unidade, cst, uf) VALUES ${placeholders}`;
        const insertValues = produtos.flatMap(produto => [
            produto.codigo || '',
            produto.ncm ? produto.ncm.replace(/\./g, '') : '',
            produto.nomeProduto || '',
            produto.unidadeMedida || '',
            produto.cst || '',
            produto.uf || ''
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

// Função principal para importar os dados
const importst = async () => {
    try {
        console.log('Iniciando leitura do arquivo...');

        const data = await fs.readFile('C:\\Users\\felli\\OneDrive\\Documentos\\tecwin docs\\tecwinst.txt', 'utf8');
        const linhas = data.split('\n');

        console.log(`Total de ${linhas.length} linhas encontradas no arquivo.`);

        const batchSize = 1000; // Tamanho do lote
        let batch = [];

        for (const linha of linhas) {
            const [codigo, ncm, nomeProduto, unidadeMedida, cst, uf] = linha.split('|');
            if (codigo && ncm && nomeProduto && unidadeMedida && cst && uf) {
                batch.push({ codigo, ncm, nomeProduto, unidadeMedida, cst, uf });

                if (batch.length === batchSize) {
                    await inserirProdutosEmLote(batch); // Insere lote no banco de dados
                    batch = []; // Reseta o lote
                }
            } else {
                console.log(`Linha incompleta ignorada: ${linha}`);
            }
        }

        // Insere os itens restantes que não completaram um lote
        if (batch.length > 0) {
            await inserirProdutosEmLote(batch);
        }

        console.log('Importação finalizada.');
    } catch (err) {
        console.error('Erro durante a execução:', err);
    }
};

importst(); // Adicionado para executar a função diretamente

module.exports = {
    importst
}
