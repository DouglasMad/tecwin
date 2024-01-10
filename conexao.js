const {lerArquivo, connectDB, reiniciarBancoAsync, atualizarStatus, obterStatus} = require('./importncm');
const {apist} = require('./ApiSt');
const {buscarNCMs} = require('./ApiPis');
const fs = require('fs')



async function execConect() {
    try {
        const db = await connectDB();


            // Função para atualizar o status no arquivo HTML
            function atualizarStatusHTML(apiId, novoStatus) {
                const filePath = 'C:/Users/Felipe Silva/Desktop/code/tecwin/d10/tecwin/index.html'; // Substitua pelo caminho correto do seu arquivo HTML
            
                fs.readFile(filePath, 'utf8', (err, data) => {
                  if (err) {
                    console.error('Erro ao ler o arquivo HTML:', err);
                    return;
                  }
              
                  const novoConteudo = data.replace(
                    new RegExp(`id="status-${apiId}-api">Status: .*?</div>`),
                    `id="status-${apiId}-api">Status: ${novoStatus}</div>`
                  );
                
                  fs.writeFile(filePath, novoConteudo, 'utf8', (err) => {
                    if (err) {
                      console.error('Erro ao escrever no arquivo HTML:', err);
                    } else {
                      console.log(`Status da API ${apiId} atualizado para: ${novoStatus}`);
                    }
                  });
                });
              }


        // Verificar e executar a primeira API
        const statusImportNCM = await obterStatus(db, 'Primeira API');
        if (statusImportNCM !== 'concluido') {
            atualizarStatusHTML('primeira', 'Em andamento');
            await reiniciarBancoAsync(db);
            await atualizarStatus(db, 'Primeira API', 'em_andamento');
            const resultNcm = await lerArquivo();
            console.log('Resultado ImportNCM: ', resultNcm);
            await atualizarStatus(db, 'Primeira API', 'concluido');

            atualizarStatusHTML('primeira', 'Concluido');
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