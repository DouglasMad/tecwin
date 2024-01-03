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
    main();
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
    const jaProcessado = await ncmJaProcessado(dados.ncm.codigo);
    if (jaProcessado) {
        console.log(`NCM já processado: ${dados.ncm.codigo}`);
        return;
    }

    const query = `INSERT INTO tec_ipi (
        ncm_codigo, ncm_sequencial, unidade_medida_codigo, unidade_medida_descricao, 
        ii, ii_normal, tipo_ii, ipi, ipi_normal, tipo_ipi, 
        pis_pasep, cofins, tipo_icms, gatt, mercosul, existe_st, necessidade_li
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const valores = [
        dados.ncm.codigo,
        dados.ncm.sequencial,
        dados.ncm.unidadeMedida.codigo,
        dados.ncm.unidadeMedida.descricao,
        dados.ii,
        dados.iiNormal,
        dados.tipoII,
        dados.ipi,
        dados.ipiNormal,
        dados.tipoIPI,
        dados.pisPasep,
        dados.cofins,
        dados.tipoICMS,
        dados.gatt,
        dados.mercosul,
        dados.existeST,
        dados.necessidadeLI
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

async function fazerRequisicaoAPI(ncm) {
    const chave = 'TFACS-Q4LVT-XYYNF-ZNW59';
    const cliente = '02119874';
    const formato = 'json';

    const url = `https://ics.multieditoras.com.br/ics/tec/${ncm}?chave=${chave}&cliente=${cliente}&formato=${formato}`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.tec && Array.isArray(data.tec)) {
            const item = data.tec.find(element => element.ncm && element.ncm.codigo === ncm);
            if (item) {
                console.log('Item Encontrado:', item);
                await inserirNoBanco(item);
            } else {
                console.log('Item com o NCM especificado não encontrado.');
            }
        }
    } catch (error) {
        console.error('Erro ao fazer a chamada API:', error);
    
    }
}

async function main() {
    await buscarNCMs();
}
