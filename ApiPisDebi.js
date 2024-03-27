const axios = require('axios');
const mysql = require('mysql');

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
    connectionLimit: 10, // Limite máximo de conexões
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
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

// Função para processar todos os NCMs
async function processarTodosNCMs() {
    let connection;
    try {
        connection = await getConnectionFromPool(); // Obtemos a conexão do pool
        console.log('Iniciando o processamento de todos os NCMs...');

        // Consultar a tabela tec_produto para obter todos os NCMs
        connection.query('SELECT ncm FROM tec_produto', async (err, results) => {
            if (err) {
                console.error('Erro ao consultar a tabela tec_produto:', err);
                return;
            }

            for (let i = 0; i < results.length; i++) {
                try {
                    await processarNCM(connection, results[i].ncm);
                } catch (error) {
                    console.error(`Erro ao processar o NCM: ${results[i].ncm}`);
                    // console.error(`Erro ao processar o NCM: ${results[i].ncm}`, error);
                    // Continua para o próximo NCM mesmo que encontre um erro
                }
            }

            console.log('Processamento de todos os NCMs concluído.');
        });
    } catch (error) {
        console.error("Erro durante a execução:", error);
    } finally {
        if (connection) {
            console.log('terminado')
            connection.release(); // Liberamos a conexão de volta para o pool
        }
    }
}

// Função para processar um NCM específico
async function processarNCM(connection, ncm) {
    const chave = 'TFACS-Q4LVT-XYYNF-ZNW59';
    const cliente = '02119874';
    const url = `https://ics.multieditoras.com.br/ics/pis?chave=${chave}&cliente=${cliente}&ncm=${ncm}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const resultadoFiltrado = data.pis.filter(regra => regra.nomeRegra === "Alíquota Básica - Não Cumulativo vendendo para não cumulativo");

        if (resultadoFiltrado.length > 0) {
            const regra = resultadoFiltrado[0];
            // Verificar se já existe um registro com o mesmo idMercadoria
            const sqlVerificacao = 'SELECT * FROM tec_Pisdeb WHERE idMercadoria = ?';
            pool.query(sqlVerificacao, [regra.idMercadoria], (err, result) => {
                if (err) {
                    console.error('Erro ao verificar o idMercadoria na tabela tec_Pisdeb:', err);
                    return;
                }

                if (result.length === 0) {
                    // Inserção dos dados no banco de dados
                    const sqlInsercao = 'INSERT INTO tec_Pisdeb (dataInicio, idMercadoria, ncm, mercadoria, unidade, naturezaOperacao, mercadoRem, regiaoRem, regimeApuracaoRem, regimeTributarioRem, ramoAtividadeRem, segmentoRem, mercadoDest, regiaoDest, regimeApuracaoDest, regimeTributarioDest, ramoAtividadeDest, segmentoDest, pisDebito, cofinsDebito, cst) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    const valuesInsercao = [
                        regra.dataInicio,
                        regra.idMercadoria,
                        regra.ncm,
                        regra.mercadoria,
                        regra.unidade,
                        regra.naturezaOperacao,
                        regra.mercadoRem,
                        regra.regiaoRem,
                        regra.regimeApuracaoRem,
                        regra.regimeTributarioRem,
                        regra.ramoAtividadeRem,
                        regra.segmentoRem,
                        regra.mercadoDest,
                        regra.regiaoDest,
                        regra.regimeApuracaoDest,
                        regra.regimeTributarioDest,
                        regra.ramoAtividadeDest,
                        regra.segmentoDest,
                        regra.pisDebito.replace(',', '.'),
                        regra.cofinsDebito.replace(',', '.'),
                        regra.cst.length > 0 ? regra.cst[0] : null // Armazena apenas o primeiro valor do array cst
                    ];

                    pool.query(sqlInsercao, valuesInsercao, (err, result) => {
                        if (err) {
                            console.error('Erro ao inserir dados na tabela tec_Pisdeb:', err);
                            return;
                        }
                        console.log('Dados inseridos na tabela tec_Pisdeb com sucesso. ID:', result.insertId);
                    });
                } else {
                    console.log('Registro com idMercadoria', regra.idMercadoria, 'já existe. Nenhuma ação foi realizada.');
                }
            });
        } else {
            console.log('Nenhuma regra encontrada para o NCM:', ncm);
        }
    } catch (error) {
        throw error; // Lança o erro para ser capturado pelo try/catch do loop
    }
}

// //Executar manualmente
//processarTodosNCMs()

// Exporta a função processarTodosNCMs() para uso em outros arquivos
module.exports = {
    processarTodosNCMs
};
