const {lerArquivo, connectDB, reiniciarBancoAsync, atualizarStatus, obterStatus} = require('./importncm');
const {exportarDadosParaTXTSync} = require('./exportartxt')
const {apist} = require('./ApiSt');
const {buscarNCMs} = require('./ApiPis');
const mysql = require('mysql')
const fs = require('fs')



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


// function exportarDadosParaTXTSync(callback) {
//   const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123456',
//     database: 'db_ncm'
//   });

//   connection.connect((connectError) => {
//     if (connectError) {
//       callback(connectError);
//       return;
//     }

//     connection.query('SELECT * FROM tec_produto', (queryError, rows) => {
//       if (queryError) {
//         connection.end();
//         callback(queryError);
//         return;
//       }


//       const currentDate = new Date();
//       const formattedDate = currentDate.toISOString().slice(0, 10); // Formata a data como YYYY-MM-DD
    
//       const fileName = `backup${formattedDate}.txt`;
//       const fileContent = rows.map(row => Object.values(row).join(';')).join('\n');

//       fs.writeFile(fileName, fileContent, (writeError) => {
//         connection.end();
//         if (!writeError) {
//           callback(null, `Arquivo ${fileName} gerado com sucesso.`);
//         } else {
//           callback(writeError);
//         }
//       });
//     });
//   });
// }


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
        const statusImportNCM = await obterStatus(db, 'Primeira API');
        if (statusImportNCM !== 'concluido') {
            await reiniciarAplicacao()
            await atualizarStatusHTML('primeira', 'Em andamento');
            await atualizarStatus(db, 'Primeira API', 'em_andamento');
            await atualizarConsoleHTML('terceira', 'Aguardando terminar execução');
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
            await atualizarConsoleHTML('terceira', 'Aplicação executada com sucesso');
            exportarDadosParaTXTSync((error, successMessage) => {
              if (error) {
                console.error('Erro ao exportar dados para o arquivo TXT:', error);
              } else {
                console.log(successMessage);
              }
            });
          }



        // Fechar a conexão com o banco de dados
        db.end();
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    execConect: execConect,
    atualizarConsoleHTML,
    atualizarStatusHTML,
    reiniciarAplicacao,
}