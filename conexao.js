const { lerArquivo, connectDB, reiniciarBancoAsync, reiniciareStatus, reiniciarst, atualizarStatus, obterStatus, reiniciarTabelas } = require('./importncm');
const { importst } = require('./importst');
const { exportarDadosParaTXTSync } = require('./exportartxt');
const { apist } = require('./ApiSt');
const { main } = require('./ApiPis');
const { updateIpiEntBasedOnCstIpi } = require('./ajustaipi')
const { processarTodosNCMs } = require('./ApiPisDebi');
const {updateAjustarAliquotaBasedOnUfDestinatario} = require('./ajustast')
const cron = require('node-cron');
const mysql = require('mysql2');
const fs = require('fs');
const { processaNCMs } = require('./atualiza');
const { atualizaNcmFinal } = require('./atualizancm');
const { atualizarDadosST } = require('./dadosst');
const { ajustaFormatoDecimal } = require('./ajustacst');
const { updateAliq } = require('./ajustaAliq');
const { updateCST } = require('./updatecst');
const { ajustaCSTparaZeroOuCem } = require('./ajustaCSTparaZeroOuCem');
const { atualizarUnica } = require('./updateUnica');
const { Cstpr } = require('./cstpr');
const {updateRobel} = require('./updateRobel');
const { updateCst84 } = require('./updateCst8412');
const { updateCstipiBasedOnAliquotaDestino, updateCstipiBasedOnIpi } = require('./ajustarcstipiUnica');
const { updateIpi } = require('./updateIPi');

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

async function atualizarStatusHTML(apiId, novoStatus) {
  const filePath = 'C:/Users/Administrador.PLASSER/Desktop/tecwin/index.html';

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

async function atualizarConsoleHTML(apiId, novoStatus) {
  const filePath = 'C:/Users/Administrador.PLASSER/Desktop/tecwin/index.html';

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
  await atualizarStatusHTML('primeira', 'Aguardando execução');
  await atualizarStatusHTML('segunda', 'Aguardando execução');
  await atualizarStatusHTML('terceira', 'Aguardando execução');
  await atualizarConsoleHTML('terceira', 'Aguardando iniciar execução');
}

async function execConect() {
  try {
    const connection = await getConnectionFromPool();
    const tabelasParaReinicar = ['dadosncm', 'dadosst', 'st_ncm', 'tec_ipi', 'tec_pisdeb','tec_produto', 'tec_stcst', 'unica'];

    await reiniciarBancoAsync(connection);
    await reiniciarst(connection);
    await reiniciarTabelas(connection, tabelasParaReinicar);
    await reiniciareStatus(connection);

    await reiniciarAplicacao();

    await verificarEExecutarPrimeiraAPI(connection);
    await verificarEExecutarSegundaAPI(connection);
    await verificarEExecutarTerceiraAPI(connection);
    await verificarEExecutarGeradorDeTxt(connection);
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

    try {
      await lerArquivo();
      console.log("ImportNcm concluido");
      await importst();
      console.log("ImportSt concluido.");
      await updateIpiEntBasedOnCstIpi();
      console.log("UpdateIpiEntBasedOnCstIpi concluido.");
    } catch (err) {
      console.error("Erro durante a execução: ", err);
    }

    await atualizarStatus(connection, 'Primeira API', 'concluido');
    await atualizarStatusHTML('primeira', 'Concluido');
  }
}

async function verificarEExecutarSegundaAPI(connection) {
  const statusApiSt = await obterStatus(connection, 'Segunda API');
  if (statusApiSt !== 'concluido') {
    await atualizarStatusHTML('segunda', 'Em andamento');
    await atualizarStatus(connection, 'Segunda API', 'em_andamento');

    try {
      await apist();
      console.log("apiSt concluido.");
      await main();
      console.log("main (API Pis) concluido.");
      // await processarTodosNCMs();
      // console.log("processarTodosNCMs concluido.");
      await atualizaNcmFinal();
      console.log("atualizaNcmFinal concluido.");
      await atualizarDadosST();
      console.log("atualizarDadosST concluido.");
      await updateAjustarAliquotaBasedOnUfDestinatario();
      console.log("updateAjustarAliquotaBasedOnUfDestinatario concluido.");
      await updateAliq();
      console.log("updateAliq concluido.");
    } catch (err) {
      console.error("Erro durante a execução: ", err);
    }

    await atualizarStatus(connection, 'Segunda API', 'concluido');
    await atualizarStatusHTML('segunda', 'Concluido');
  }
}

async function verificarEExecutarTerceiraAPI(connection) {
  const statusApiPis = await obterStatus(connection, 'Terceira API');
  if (statusApiPis !== 'concluido') {
    await atualizarStatusHTML('terceira', 'Em andamento');
    await atualizarStatus(connection, 'Terceira API', 'em_andamento');

    try {
      await processaNCMs();
      console.log("processaNCMs concluido.");
      // await updateCST();
      // console.log("updateCST concluido.");
      await ajustaFormatoDecimal();
      console.log("ajustaFormatoDecimal concluido.");
      // await atualizarUnica();
      // console.log('Ajuste da aliquota realizado')
      // await ajustaCSTparaZeroOuCem();
      // console.log("Ajuste CST para Zero ou Cem concluido");
      // await Cstpr();
      // console.log("cstPr executada com sucesso.")
      // await updateRobel();
      // console.log("Robel executada com sucesso.")
      // await updateCst84();
      // console.log("updateCst84 executada com sucesso.")
      // await updateCstipiBasedOnIpi();
      // console.log("ajustarcstipiUnica executada com sucesso")
      await updateIpi();
      console.log("updateIpi executada com sucesso")
    } catch (err) {
      console.error("Erro durante a execução: ", err);
    }

    await atualizarStatus(connection, 'Terceira API', 'concluido');
    await atualizarStatusHTML('terceira', 'Concluido');
    await atualizarConsoleHTML('terceira', 'Aplicação executada com sucesso');

    try {

      console.log("Dados exportados para TXT com sucesso.");
    } catch (err) {
      console.error("Erro ao exportar dados para o arquivo TXT:", err);
    }
  }
}
async function verificarEExecutarGeradorDeTxt(connection) {
try {
  await exportarDadosParaTXTSync((error, successMessage) => {
    if (error) {
        console.error('Erro ao exportar dados para o arquivo TXT:', error);
    } else {
        console.log("Executando gerador de txt", successMessage);
    }
});
} catch (error) {
 console.error('Erro:', error) 
}
}

module.exports = {
  execConect,
  atualizarConsoleHTML,
  atualizarStatusHTML,
  reiniciarAplicacao,
};