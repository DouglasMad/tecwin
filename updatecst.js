const mysql = require('mysql');
const util = require('util');

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify para poder usar async/await
const query = util.promisify(pool.query).bind(pool);

async function updateCST() {
    console.log('Iniciando a atualização de CST...');

    try {
        // Atualiza registros que começam com '07.'
        await updateCSTForPrefix('07.', '010', '110');
        await updateCSTForPrefix('07.', '000', '100');
        await updateCSTForPrefix('07.', '041', '100');
        await updateCSTForPrefix('07.', '090', '100');
        await updateCSTForPrefix('07.', '500', '100');  
        await updateCSTForPrefix('07.', '210', '110');
        await updateCSTForPrefix('07.', '200', '100');    

        // Atualiza registros que começam com '02.'
        await updateCSTForPrefix('02.', '110', '010');
        await updateCSTForPrefix('02.', '100', '000');

        // Atualiza registros que começam com '04.'
        await updateCSTForPrefix('04.', '110', '010');
        await updateCSTForPrefix('04.', '100', '000');
        await updateCSTForPrefix('04.', '090', '000');
        await updateCSTForPrefix('04.', '041', '000');
        await updateCSTForPrefix('04.', '210', '110');
        await updateCSTForPrefix('04.', '200', '100');  

        // Atualiza registros que começam com '08'
        await updateCSTForPrefix('08.', '010', '110');
        await updateCSTForPrefix('08.', '000', '100');
        await updateCSTForPrefix('08.', '041', '100');
        await updateCSTForPrefix('08.', '090', '100');
        await updateCSTForPrefix('08.', '500', '100'); 

        // Atualiza registros que começam com '11'
        await updateCSTForPrefix('11.', '010', '110');
        await updateCSTForPrefix('11.', '000', '100');
        await updateCSTForPrefix('11.', '041', '100');
        await updateCSTForPrefix('11.', '090', '100');
        await updateCSTForPrefix('11.', '500', '100'); 


    } catch (error) {
        console.error('Erro ao atualizar CST dos produtos na tabela unica:', error);
    }

    console.log('Atualização de CST concluída.');
}

async function updateCSTForPrefix(prefix, originalCST, newCST) {
    let result = await query(`UPDATE unica SET cst = ? WHERE CodigoProduto LIKE ? AND cst = ?`, [newCST, `${prefix}%`, originalCST]);
    if (result.affectedRows > 0) {
        console.log(`${result.affectedRows} produtos com prefixo ${prefix} e CST ${originalCST} atualizados para CST ${newCST}.`);
    } else {
        console.log(`Nenhum produto com prefixo ${prefix} e CST ${originalCST} precisou ser atualizado.`);
    }
}

// Executa a função de atualização
updateCST();

module.exports = {
    updateCST
}