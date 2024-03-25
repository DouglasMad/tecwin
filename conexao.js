const { lerArquivo, connectDB, reiniciarBancoAsync, reiniciareStatus, reiniciarst, atualizarStatus, obterStatus } = require('./importncm');
const { importst } = require('./importst');
const { exportarDadosParaTXTSync } = require('./exportartxt');
const { apist } = require('./ApiSt');
const { main } = require('./ApiPis');
const { updateIpiEntBasedOnCstIpi } = require('./ajustaipi')
const { processarTodosNCMs } = require('./ApiPisDebi');
const {updateAjustarAliquotaBasedOnUfDestinatario} = require('./ajustast')
const cron = require('node-cron');
const mysql = require('mysql');
const fs = require('fs');

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
  connectionLimit: 10, // Limite máximo de conexões
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'db_ncm'
});

// Função para obter uma conexão do pool
const getConnectionFromPool = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Erro ao obter conexão do pool:', err);
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

// Função para atualizar o status no arquivo HTML
async function atualizarStatusHTML(apiId, novoStatus) {
  const filePath = 'C:/bkp/tecwin/index.html';

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
  const filePath = 'C:/bkp/tecwin/index.html';

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
    const connection = await getConnectionFromPool(); // Obtemos a conexão do pool

    // Reinicia os bancos de dados st, tec_produto
    await reiniciarBancoAsync(connection);
    await reiniciarst(connection);
    await reiniciareStatus(connection);

    // Reinicia os status html da aplicação
    await reiniciarAplicacao();

    // Verificar e executar a primeira API
    await verificarEExecutarPrimeiraAPI(connection);

    // Verificar e executar a segunda API
    await verificarEExecutarSegundaAPI(connection);

    // Verificar e executar a terceira API
    await verificarEExecutarTerceiraAPI(connection);

    await exportarDadosParaTXTSync((error, successMessage) => {
      if (error) {
          console.error('Erro ao exportar dados para o arquivo TXT:', error);
      } else {
          console.log("Executando gerador de txt", successMessage);
      }
  });

    // Reinicia os status html da aplicação
    await reiniciarAplicacao();
  } catch (error) {
    console.error(error);
  }
}

async function verificarEExecutarPrimeiraAPI(connection) {
  const statusImportNCM = await obterStatus(connection, 'Primeira API');
  if (statusImportNCM !== 'concluido') {
    await atualizarStatusHTML('primeira', 'Em andamento');
    await atualizarStatus(connection, 'Primeira API', 'em_andamento');
    await atualizarConsoleHTML('terceira', 'Aguardando terminar execução');
    await lerArquivo().then(() => {
      console.log("ImportNcm concluido");
    }).catch(err => {
      console.error("Erro durante a execução: ImportNcm");
    });
    updateIpiEntBasedOnCstIpi()
    await importst().then(() => {
      console.log("ImportCst concluido.");
    }).catch(err => {
      console.error("Erro durante a execução: ImportCst");
    });
    await atualizarStatus(connection, 'Primeira API', 'concluido');
    await atualizarStatusHTML('primeira', 'Concluido');
  }
}

async function verificarEExecutarSegundaAPI(connection) {
  const statusApiSt = await obterStatus(connection, 'Segunda API');
  if (statusApiSt !== 'concluido') {
    await atualizarStatusHTML('segunda', 'Em andamento');
    await atualizarStatus(connection, 'Segunda API', 'em_andamento');
    await apist().then(() => {
      console.log("Processamento concluído.");
    }).catch(err => {
      console.error("Erro durante a execução:");
    });
    

    await atualizarStatus(connection, 'Segunda API', 'concluido');
    await atualizarStatusHTML('segunda', 'Concluido');
  }
}

async function verificarEExecutarTerceiraAPI(connection) {
  const statusApiPis = await obterStatus(connection, 'Terceira API');
  if (statusApiPis !== 'concluido') {
    await atualizarStatusHTML('terceira', 'Em andamento');
    await atualizarStatus(connection, 'Terceira API', 'em_andamento');

    await main().then(() => {
      console.log("Processamento concluído. apiPis");
    }).catch(err => {
      console.error("Erro durante a execução: apiPis");
    });
    updateAjustarAliquotaBasedOnUfDestinatario()
    await processarTodosNCMs()

    await atualizarStatus(connection, 'Terceira API', 'concluido');
    await atualizarStatusHTML('terceira', 'Concluido');
    await atualizarConsoleHTML('terceira', 'Aplicação executada com sucesso');
  }
}

module.exports = {
  execConect: execConect,
  atualizarConsoleHTML,
  atualizarStatusHTML,
  reiniciarAplicacao,
};
