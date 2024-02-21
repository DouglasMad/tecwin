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
        return console.error('Erro ao conectar ao banco de dados:', err);
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Consultar a tabela tec_produto para obter o NCM
    db.query('SELECT ncm FROM tec_produto LIMIT 1', async (err, result) => {
        if (err) {
            return console.error('Erro ao consultar a tabela tec_produto:', err);
        }
        if (result.length > 0) {
            const ncm = result[0].ncm;
            await fazerRequisicaoAPI(ncm); // Chamar a função para fazer a requisição API com o NCM obtido
        } else {
            console.log('Nenhum NCM encontrado na tabela tec_produto.');
        }
    });
});

async function fazerRequisicaoAPI(ncm) {
    const chave = 'TFACS-Q4LVT-XYYNF-ZNW59';
    const cliente = '02119874';
    const formato = 'json';

    const url = `https://ics.multieditoras.com.br/ics/pis?chave=${chave}&cliente=${cliente}&ncm=${ncm}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const resultadoFiltrado = data.pis.filter(regra => regra.nomeRegra === "Alíquota Básica - Não Cumulativo vendendo para não cumulativo");

        if (resultadoFiltrado.length > 0) {
            const regra = resultadoFiltrado[0]; // Assumindo que queremos inserir apenas o primeiro resultado encontrado
            // Verificar se já existe um registro com o mesmo idMercadoria
            const sqlVerificacao = 'SELECT * FROM tec_Pisdeb WHERE idMercadoria = ?';
            db.query(sqlVerificacao, [regra.idMercadoria], (err, result) => {
                if (err) {
                    return console.error('Erro ao verificar o idMercadoria na tabela tec_Pisdeb:', err);
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

                    db.query(sqlInsercao, valuesInsercao, (err, result) => {
                        if (err) {
                            return console.error('Erro ao inserir dados na tabela tec_Pisdeb:', err);
                        }
                        console.log('Dados inseridos na tabela tec_Pisdeb com sucesso. ID:', result.insertId);
                    });
                } else {
                    console.log('Registro com idMercadoria', regra.idMercadoria, 'já existe. Nenhuma ação foi realizada.');
                }
            });
        } else {
            console.log('Nenhuma regra corresponde ao critério de filtro.');
        }
    } catch (error) {
        console.error('Erro ao fazer a chamada API:', error);
    }
}
