const fs = require('fs').promises;
const mysql = require('mysql2/promise');
const path = require('path');

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function consultarDados(query, params = []) {
    const [results,] = await pool.query(query, params);
    return results;
}

async function gerarConteudoProdutos(produtos) {
    let conteudo = '';
    for (const produto of produtos) {
        const aliquota = await consultarDados('SELECT ipi FROM tec_ipi WHERE ncm_codigo = ?', [produto.ncm]);
        const pisPasep = await consultarDados('SELECT * FROM tec_pisdeb WHERE ncm = ? AND pisDebito IS NOT NULL', [produto.ncm]);
        const cofins = await consultarDados('SELECT * FROM tec_pisdeb WHERE ncm = ? AND cofinsDebito IS NOT NULL', [produto.ncm]);
        const icmsSt = await consultarDados('SELECT DISTINCT ufDestinatario, cst, aliquotaEfetiva, aliquotaInterestadualMI FROM st_ncm JOIN tec_stcst ON ufDestinatario = uf AND ncmid = ncm WHERE ncmid = ?', [produto.ncm]);

        conteudo += `P|${produto.codigo}|${produto.nmproduto}|${produto.unidade}\n`;
        if (aliquota.length > 0) {
            conteudo += `H|0|${aliquota[0].ipi}|${produto.cstipi}|${produto.ipient}\n`;
        }

        pisPasep.forEach(p => {
            conteudo += `I|S|1|P|${p.ncm}|${p.pisDebito}|4|4\n`;
        });

        cofins.forEach(c => {
            conteudo += `I|S|1|C|${c.ncm}|${c.cofinsDebito}|4|4\n`;
        });

        icmsSt.forEach(i => {
            conteudo += `I|S|1|${i.ufDestinatario}|${i.cst}|${i.aliquotaEfetiva || i.aliquotaInterestadualMI}|4|4\n`;
        });
    }
    return conteudo;
}

async function exportarDadosParaTXT() {
    try {
        const filePath = path.join(__dirname, 'intTecwin.txt');
        const produtos = await consultarDados('SELECT codigo, nmproduto, unidade, ncm, cstipi, ipient FROM tec_produto');

        const conteudo = await gerarConteudoProdutos(produtos);
        await fs.writeFile(filePath, conteudo);

        console.log(`Arquivo ${filePath} gerado com sucesso.`);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
    }
}

exportarDadosParaTXT();
