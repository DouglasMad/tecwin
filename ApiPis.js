const axios = require('axios');
const mysql = require('mysql');

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
});

// Conectar ao banco de dados
db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida.');
    // main();
});

async function ncmJaProcessado(ncm) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tec_ipi WHERE ncm_codigo = ?';
        db.query(query, [ncm], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result.length > 0);
        });
    });
}

async function inserirNoBanco(dados) {
    if (dados.length > 0 && dados[0].ncm && dados[0].ncm.codigo) {
        const dado = dados[0]; // Pega apenas o primeiro elemento do array
        const jaProcessado = await ncmJaProcessado(dado.ncm.codigo);
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

        try {
            await new Promise((resolve, reject) => {
                db.query(query, valores, (erro, result) => {
                    if (erro) reject(erro);
                    else resolve(result);
                });
            });
            console.log('Dados inseridos:', valores);
        } catch (erro) {
            console.error('Erro ao inserir dados:', erro);
        }
    } else {
        console.log('Nenhum dado válido para inserir');
    }
}

async function buscarNCMs() {
    const query = 'SELECT ncm FROM tec_produto';
    try {
        const resultados = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        for (const linha of resultados) {
            await fazerRequisicaoAPI(linha.ncm).catch(e => {
                console.error('Erro com o NCM:', linha.ncm, e);
            });
        }
    } catch (err) {
        console.error('Erro ao buscar NCMs:', err);
    }
}   

async function obterTodosNCMs() {
    const query = 'SELECT ncm FROM tec_produto';
    try {
        const resultados = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        return resultados.map(linha => linha.ncm);
    } catch (err) {
        console.error('Erro ao obter NCMs:', err);
        throw err;
    }
}

async function fazerRequisicaoAPI(ncm) {
    const chave = 'TFACS-Q4LVT-XYYNF-ZNW59'; // Substitua com sua chave API real
    const cliente = '02119874'; // Substitua com o ID do seu cliente
    const formato = 'json';
    const url = `https://ics.multieditoras.com.br/ics/tec/${ncm}?chave=${chave}&cliente=${cliente}&formato=${formato}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.tec && Array.isArray(data.tec)) {
            await inserirNoBanco(data.tec); // Passa todos os dados para inserirNoBanco
        }
    } catch (error) {
        // console.error('Erro ao fazer a chamada API para o NCM', ncm, ':', error); Estava assim mas o erro estava muito grande
        console.error('Erro ao fazer a chamada API para o NCM', ncm, ':');
    }
}

// async function main() {
//     await buscarNCMs();
// }

module.exports = { buscarNCMs };
