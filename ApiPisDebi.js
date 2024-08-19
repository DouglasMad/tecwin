const axios = require('axios');
const mysql = require('mysql2');

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
    connectionLimit: 10,
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
    let linhasInseridas = 0;
    let linhasNaoInseridas = 0;

    try {
        connection = await getConnectionFromPool();
        console.log('Iniciando o processamento de todos os NCMs...');

        // Consultar a tabela tec_produto para obter todos os NCMs
        const [results] = await connection.promise().query('SELECT ncm FROM tec_produto');

        for (let i = 0; i < results.length; i++) {
            try {
                const foiInserido = await processarNCM(connection, results[i].ncm);
                if (foiInserido) {
                    linhasInseridas++;
                } else {
                    linhasNaoInseridas++;
                }
            } catch (error) {
                // console.error(`Erro ao processar o NCM: ${results[i].ncm}`, error);
                linhasNaoInseridas++;
            }
        }

        console.log(`Processamento concluído. Linhas inseridas: ${linhasInseridas}, Linhas não inseridas: ${linhasNaoInseridas}`);
    } catch (error) {
        console.error("Erro durante a execução:", error);
    } finally {
        if (connection) {
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

        let resultadoFiltrado = data.pis.filter(regra => regra.nomeRegra === "Alíquota Básica - Não Cumulativo vendendo para não cumulativo");
        if (resultadoFiltrado.length === 0) {
            resultadoFiltrado = data.pis.filter(regra => regra.nomeRegra === "Monofásico - Autopeças - Importador de autopeças vendendo para fabricantes de veículos");
        }

        if (resultadoFiltrado.length > 0) {
            const regra = resultadoFiltrado[0];
            const [result] = await connection.promise().query('SELECT * FROM tec_Pisdeb WHERE idMercadoria = ?', [regra.idMercadoria]);

            if (result.length === 0) {
                const sqlInsercao = `
                    INSERT INTO tec_Pisdeb (
                        dataInicio, idMercadoria, ncm, mercadoria, unidade, 
                        naturezaOperacao, mercadoRem, regiaoRem, regimeApuracaoRem, 
                        regimeTributarioRem, ramoAtividadeRem, segmentoRem, mercadoDest, 
                        regiaoDest, regimeApuracaoDest, regimeTributarioDest, ramoAtividadeDest, 
                        segmentoDest, pisDebito, cofinsDebito, cst
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const valuesInsercao = [
                    regra.dataInicio, regra.idMercadoria, regra.ncm, regra.mercadoria, regra.unidade,
                    regra.naturezaOperacao, regra.mercadoRem, regra.regiaoRem, regra.regimeApuracaoRem,
                    regra.regimeTributarioRem, regra.ramoAtividadeRem, regra.segmentoRem, regra.mercadoDest,
                    regra.regiaoDest, regra.regimeApuracaoDest, regra.regimeTributarioDest, regra.ramoAtividadeDest,
                    regra.segmentoDest, regra.pisDebito.replace(',', '.'), regra.cofinsDebito.replace(',', '.'),
                    regra.cst.length > 0 ? regra.cst[0] : null
                ];

                await connection.promise().query(sqlInsercao, valuesInsercao);
                return true;
            } else {
                return false; // Registro já existente, não foi inserido
            }
        } else {
            return false; // Nenhuma regra encontrada
        }
    } catch (error) {
        throw error;
    }
}

// Executar manualmente
processarTodosNCMs();

module.exports = {
    processarTodosNCMs
};
