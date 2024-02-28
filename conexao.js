const {lerArquivo, connectDB, reiniciarBancoAsync, atualizarStatus, obterStatus} = require('./importncm');
const {importst} = require('./importst')
const {exportarDadosParaTXTSync} = require('./exportartxt')
const {apist} = require('./ApiSt');
const {main} = require('./ApiPis');
const {processarTodosNCMs} = require('./ApiPisDebi');
const mysql = require('mysql');
const fs = require('fs');


// Função para atualizar o status no arquivo HTML
async function atualizarStatusHTML(apiId, novoStatus) {
  const filePath = 'C:/Users/Fellipe Silva/OneDrive/Área de Trabalho/code/tecwin/d10/tecwin/index.html';

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


// Função para atualizar o console no arquivo HTML
async function atualizarConsoleHTML(apiId, novoStatus) {
  const filePath = 'C:/Users/Fellipe Silva/OneDrive/Área de Trabalho/code/tecwin/d10/tecwin/index.html';

  return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
              console.error('Erro ao ler o arquivo HTML:', err);
              reject(err);
              return;
          }

          const novoConteudo = data.replace(
              new RegExp(`id="console-${apiId}-api">.*?</div>`),
              `id="console-${apiId}-api">${novoStatus}</div>`
          );

          fs.writeFile(filePath, novoConteudo, 'utf8', (err) => {
              if (err) {
                  console.error('Erro ao escrever no arquivo HTML:', err);
                  reject(err);
              } else {
                  console.log(`Console da API ${apiId} atualizado para: ${novoStatus}`);
                  resolve();
              }
          });
      });
  });
}

async function reiniciarAplicacao() {
  // Configurar status inicial no HTML
  await atualizarStatusHTML('primeira', 'Aguardando execução');
  await atualizarStatusHTML('segunda', 'Aguardando execução');
  await atualizarStatusHTML('terceira', 'Aguardando execução');
  await atualizarConsoleHTML('terceira', 'Aguardando iniciar execução');
}




async function execConect() {
  try {
      const db = await connectDB();

      // Verificar e executar a primeira API
      await verificarEExecutarPrimeiraAPI(db);

      // Verificar e executar a segunda API
      await verificarEExecutarSegundaAPI(db);

      // Verificar e executar a terceira API
      await verificarEExecutarTerceiraAPI(db);


      exportarDadosParaTXTSync((error, successMessage) => {
        if (error) {
            console.error('Erro ao exportar dados para o arquivo TXT:', error);
        } else {
            console.log("Executando gerador de txt", successMessage);
        }
    });


  } catch (error) {
      console.error(error);
  }
}

async function verificarEExecutarPrimeiraAPI(db) {
  const statusImportNCM = await obterStatus(db, 'Primeira API');
  if (statusImportNCM !== 'concluido') {
      await reiniciarAplicacao()
      await atualizarStatusHTML('primeira', 'Em andamento');
      await atualizarStatus(db, 'Primeira API', 'em_andamento');
      await atualizarConsoleHTML('terceira', 'Aguardando terminar execução');
      const resultNcm = await lerArquivo();
      const resultSt = await importst();
      console.log('Resultado ImportNCM: ', resultNcm);
      await atualizarStatus(db, 'Primeira API', 'concluido');
      await atualizarStatusHTML('primeira', 'Concluido');
  }
}

async function verificarEExecutarSegundaAPI(db) {
  const statusApiSt = await obterStatus(db, 'Segunda API');
  if (statusApiSt !== 'concluido') {
      await atualizarStatusHTML('segunda', 'Em andamento');
      await atualizarStatus(db, 'Segunda API', 'em_andamento');
      const resultSt = await apist().then(() => {
        console.log("Processamento concluído.");
        db.end(); // Encerra a conexão com o banco de dados ao final do processamento
    }).catch(err => {
        console.error("Erro durante a execução:");
        db.end(); // Encerra a conexão com o banco de dados em caso de erro
    }); // Certifique-se de que apist() esteja definido
      console.log('Resultado ApiSt: ', resultSt);
      await atualizarStatus(db, 'Segunda API', 'concluido');
      await atualizarStatusHTML('segunda', 'Concluido');
  }
}

async function verificarEExecutarTerceiraAPI(db) {
  const statusApiPis = await obterStatus(db, 'Terceira API');
  if (statusApiPis !== 'concluido') {
      await atualizarStatusHTML('terceira', 'Em andamento');
      await atualizarStatus(db, 'Terceira API', 'em_andamento');
      const resultPis = await main(); 
      console.log('Resultado ApiPis:', resultPis);
      const resultPisDeb = await processarTodosNCMs();
      console.log('Resultado ApiPis:', resultPisDeb);
      await atualizarStatus(db, 'Terceira API', 'concluido');
      await atualizarStatusHTML('terceira', 'Concluido');
      await atualizarConsoleHTML('terceira', 'Aplicação executada com sucesso');
  }
}


module.exports = {
    execConect: execConect,
    atualizarConsoleHTML,
    atualizarStatusHTML,
    reiniciarAplicacao,
}