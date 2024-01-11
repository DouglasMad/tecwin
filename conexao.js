const {lerArquivo, connectDB, reiniciarBancoAsync, atualizarStatus, obterStatus} = require('./importncm');
const {apist} = require('./ApiSt');
const {buscarNCMs} = require('./ApiPis');
const fs = require('fs')



async function execConect() {
    try {
        const db = await connectDB();


            // Função para atualizar o status no arquivo HTML
            async function atualizarStatusHTML(apiId, novoStatus) {
              const filePath = 'C:/Users/Felipe Silva/Desktop/code/tecwin/d10/tecwin/index.html';
            
              return new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf8', (err, data) => {
                  if (err) {
                    console.error('Erro ao ler o arquivo HTML:', err);
                    reject(err);
                    return;
                  }
            
                  const novoConteudo = data.replace(
                    new RegExp(`id="status-${apiId}-api">Status: .*?</div>`),
                    `id="status-${apiId}-api">Status: ${novoStatus}</div>`
                  );
            
                  fs.writeFile(filePath, novoConteudo, 'utf8', (err) => {
                    if (err) {
                      console.error('Erro ao escrever no arquivo HTML:', err);
                      reject(err);
                    } else {
                      console.log(`Status da API ${apiId} atualizado para: ${novoStatus}`);
                      resolve();
                    }
                  });
                });
              });
            }

            // Função para atualizar o status no arquivo HTML
            async function atualizarConsole(apiId, novoStatus) {
              const filePath = 'C:/Users/Felipe Silva/Desktop/code/tecwin/d10/tecwin/index.html';
            
              return new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf8', (err, data) => {
                  if (err) {
                    console.error('Erro ao ler o arquivo HTML:', err);
                    reject(err);
                    return;
                  }
            
                  const novoConteudo = data.replace(
                    new RegExp(`id="console-${apiId}-api">Status: Aguardando termino de execução.*?</div>`),
                    `id="console-${apiId}-api">Aplicação executada com sucesso</div>`
                  );
            
                  fs.writeFile(filePath, novoConteudo, 'utf8', (err) => {
                    if (err) {
                      console.error('Erro ao escrever no arquivo HTML:', err);
                      reject(err);
                    } else {
                      resolve();
                    }
                  });
                });
              });
            }

            
            // Configurar status inicial no HTML
            await atualizarStatusHTML('primeira', 'Aguardando execução');
            await atualizarStatusHTML('segunda', 'Aguardando execução');
            await atualizarStatusHTML('terceira', 'Aguardando execução');
            await atualizarConsole('terceira', 'Aguardando termino de execução');


            async function reiniciarAplicacao() {
              // Configurar status inicial no HTML
              await atualizarStatusHTML('primeira', 'Aguardando execução');
              await atualizarStatusHTML('segunda', 'Aguardando execução');
              await atualizarStatusHTML('terceira', 'Aguardando execução');
              await atualizarConsole('terceira', 'Aguardando término de execução');
            }


        // Verificar e executar a primeira API
        const statusImportNCM = await obterStatus(db, 'Primeira API');
        if (statusImportNCM !== 'concluido') {
            await reiniciarAplicacao()
            await reiniciarBancoAsync(db);
            await atualizarStatusHTML('primeira', 'Em andamento');
            await atualizarStatus(db, 'Primeira API', 'em_andamento');
            const resultNcm = await lerArquivo();
            console.log('Resultado ImportNCM: ', resultNcm);
            await atualizarStatus(db, 'Primeira API', 'concluido');
            await atualizarStatusHTML('primeira', 'Concluido');
        }

        // Verificar e executar a segunda API
        const statusApiSt = await obterStatus(db, 'Segunda API');
        if (statusApiSt !== 'concluido') {
            await atualizarStatusHTML('segunda', 'Em andamento');
            await atualizarStatus(db, 'Segunda API', 'em_andamento');
            const resultSt = await apist(); // Certifique-se de que apist() esteja definido
            console.log('Resultado ApiSt: ', resultSt);
            await atualizarStatus(db, 'Segunda API', 'concluido');
            await atualizarStatusHTML('segunda', 'Concluido');
        }

        // Verificar e executar a terceira API
        const statusApiPis = await obterStatus(db, 'Terceira API');
        if (statusApiPis !== 'concluido') {
            await atualizarStatusHTML('terceira', 'Em andamento');
            await atualizarStatus(db, 'Terceira API', 'em_andamento');
            const resultPis = await buscarNCMs(); // Certifique-se de que buscarNCMs() esteja definido
            console.log('Resultado ApiPis:', resultPis);
            await atualizarStatus(db, 'Terceira API', 'concluido');
            await atualizarStatusHTML('terceira', 'Concluido');
          }

          if (statusImportNCM === 'concluido' && statusApiPis === 'concluido' && statusApiSt === 'concluido') {
            await atualizarStatusHTML('terceira', 'Aguardando execução \n Execução concluída com sucesso, agende o próximo horário');
            await atualizarConsole('terceira', 'Aplicação executada com sucesso');
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