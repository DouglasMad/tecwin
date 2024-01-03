const fs = require('fs');
const mysql = require('mysql');

// Conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
});

db.connect(err => {
    if (err) throw err;
    console.log("Conectado ao banco de dados!");
});

// Função para inserir os dados no banco
function inserirProduto(codigo, ncm) {
    // Certifique-se de que o NCM está definido e remova os pontos
    const ncmSemPontos = ncm ? ncm.replace(/\./g, '') : '';

    db.query('SELECT * FROM tec_produto WHERE codigo = ?', [codigo], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            const sql = 'INSERT INTO tec_produto (codigo, ncm) VALUES (?, ?)';
            db.query(sql, [codigo, ncmSemPontos], (err) => {
                if (err) throw err;
                console.log(`Produto com código ${codigo} inserido com sucesso!`);
            });
        } else {
            console.log(`Produto com código ${codigo} já existe no banco de dados.`);
        }
    });
}

// Leitura do arquivo txt
fs.readFile('E:\\WkRadar\\BI\\Registros\\tecwinncm.txt', 'utf8', (err, data) => {
    if (err) throw err;
    const linhas = data.split('\n');
    for (let linha of linhas) {
        const [codigo, ncm] = linha.split('|');
        inserirProduto(codigo, ncm);
    }
});
