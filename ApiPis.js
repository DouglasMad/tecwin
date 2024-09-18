const axios = require('axios');
const mysql = require('mysql2');

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

// Cache para NCMs já processados
const ncmProcessados = new Set();

async function ncmJaProcessado(connection, ncm) {
    if (ncmProcessados.has(ncm)) {
        return true;
    }

    return new Promise((resolve, reject) => {
        const query = 'SELECT 1 FROM tec_ipi WHERE ncm_codigo = ? LIMIT 1';
        connection.query(query, [ncm], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            const jaProcessado = result.length > 0;
            if (jaProcessado) {
                ncmProcessados.add(ncm); // Adiciona ao cache
            }
            resolve(jaProcessado);
        });
    });
}

async function inserirNoBanco(connection, dados) {
    if (dados.length > 0 && dados[0].ncm && dados[0].ncm.codigo) {
        const dado = dados[0];
        const jaProcessado = await ncmJaProcessado(connection, dado.ncm.codigo);
        if (jaProcessado) {
            console.log(`NCM já processado: ${dado.ncm.codigo}`);
            return;
        }

        const query = `INSERT INTO tec_ipi (
            ncm_codigo, ncm_sequencial, unidade_medida_codigo, unidade_medida_descricao, 
            ii, ii_normal, tipo_ii, ipi, ipi_normal, tipo_ipi, 
            pis_pasep, cofins, tipo_icms, gatt, mercosul, existe_st, necessidade_li
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const valores = [
            dado.ncm.codigo,
            dado.ncm.sequencial,
            dado.ncm.unidadeMedida.codigo,
            dado.ncm.unidadeMedida.descricao,
            dado.ii,
            dado.iiNormal,
            dado.tipoII,
            dado.ipi,
            dado.ipiNormal,
            dado.tipoIPI,
            dado.pisPasep,
            dado.cofins,
            dado.tipoICMS,
            dado.gatt,
            dado.mercosul,
            dado.existeST,
            dado.necessidadeLI
        ];

        connection.query(query, valores, (erro, result) => {
            if (erro) {
                console.error('Erro ao inserir dados:', erro);
            } else {
                console.log('Dados inseridos com sucesso para o NCM:', dado.ncm.codigo);
            }
        });
    } else {
        console.log('Nenhum dado válido para inserir');
    }
}

async function buscarNCMsUnicos(connection) {
    const query = 'SELECT DISTINCT ncm FROM tec_produto';
    try {
        const resultados = await new Promise((resolve, reject) => {
            connection.query(query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        return resultados.map(linha => linha.ncm);
    } catch (err) {
        console.error('Erro ao buscar NCMs:', err);
        throw err;
    }
}

async function fazerRequisicaoAPI(connection, ncm) {
    const chave = 'TFACS-Q4LVT-XYYNF-ZNW59'; // Substitua com sua chave API real
    const cliente = '02119874'; // Substitua com o ID do seu cliente
    const formato = 'json';
    const url = `https://ics.multieditoras.com.br/ics/tec/${ncm}?chave=${chave}&cliente=${cliente}&formato=${formato}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.tec && Array.isArray(data.tec)) {
            await inserirNoBanco(connection, data.tec); // Passa todos os dados para inserirNoBanco
        }
    } catch (error) {
        console.error('Erro ao fazer a chamada API para o NCM', ncm, ':');
        // console.error('Erro ao fazer a chamada API para o NCM', ncm, ':', error);
    }
}

async function processarNCMsEmParalelo(connection, ncms, limiteParalelo = 10) {
    for (let i = 0; i < ncms.length; i += limiteParalelo) {
        const promessas = ncms.slice(i, i + limiteParalelo).map(ncm =>
            ncmJaProcessado(connection, ncm).then(jaProcessado => {
                if (!jaProcessado) {
                    return fazerRequisicaoAPI(connection, ncm).catch(e => {
                        console.error('Erro com o NCM:', ncm, e);
                    });
                }
            })
        );
        await Promise.all(promessas);
    }
}

async function main() {
    let connection;
    try {
        connection = await getConnectionFromPool(); // Obtemos a conexão do pool
        const ncmsUnicos = await buscarNCMsUnicos(connection);
        await processarNCMsEmParalelo(connection, ncmsUnicos);
    } catch (error) {
        console.error("Erro durante a execução:", error);
    } finally {
        if (connection) {
            console.log('terminado')
            connection.release(); // Liberamos a conexão de volta para o pool
        }
    }
}

// main().then(() => console.log('Processamento concluído.')).catch(err => console.error(err));



module.exports = {
    main
}