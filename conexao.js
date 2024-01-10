const {lerArquivo, connectDB, reiniciarBancoAsync, atualizarStatus, obterStatus} = require('./importncm');
const {apist} = require('./ApiSt');
const {buscarNCMs} = require('./ApiPis');
const mysql = ('mysql')



async function execConect() {
    try {
        const db = await connectDB();

        // Verificar e executar a primeira API
        const statusImportNCM = await obterStatus(db, 'Primeira API');
        if (statusImportNCM !== 'concluido') {
            await reiniciarBancoAsync(db);
            await atualizarStatus(db, 'Primeira API', 'em_andamento');
            const resultNcm = await lerArquivo();
            console.log('Resultado ImportNCM: ', resultNcm);
            await atualizarStatus(db, 'Primeira API', 'concluido');
        }

        // Verificar e executar a segunda API
        const statusApiSt = await obterStatus(db, 'Segunda API');
        if (statusApiSt !== 'concluido') {
            await atualizarStatus(db, 'Segunda API', 'em_andamento');
            const resultSt = await apist(); // Certifique-se de que apist() esteja definido
            console.log('Resultado ApiSt: ', resultSt);
            await atualizarStatus(db, 'Segunda API', 'concluido');
        }

        // Verificar e executar a terceira API
        const statusApiPis = await obterStatus(db, 'Terceira API');
        if (statusApiPis !== 'concluido') {
            await atualizarStatus(db, 'Terceira API', 'em_andamento');
            const resultPis = await buscarNCMs(); // Certifique-se de que buscarNCMs() esteja definido
            console.log('Resultado ApiPis:', resultPis);
            await atualizarStatus(db, 'Terceira API', 'concluido');
        }

        // Fechar a conexão com o banco de dados
        db.end();
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    execConect: execConect
}