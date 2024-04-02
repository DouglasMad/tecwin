const {
    lerArquivo, connectDB, reiniciarBancoAsync, reiniciareStatus, reiniciarst, atualizarStatus,
    obterStatus, reiniciarTabelas, importst, exportarDadosParaTXTSync, apist, main,
    updateIpiEntBasedOnCstIpi, processarTodosNCMs, updateAjustarAliquotaBasedOnUfDestinatario,
    processaNCMs, atualizaNcmFinal, atualizarDadosST, ajustaFormatoDecimal, updateAliq, updateCST
  } = require('./importncm');
  
  const mysql = require('mysql');
  const fs = require('fs');
  
  const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
  });
  
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
    const filePath = 'C:/tecwin/sistematec/Tecwin/index.html';
  
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
    const filePath = 'C:/tecwin/sistematec/Tecwin/index.html';
  
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
        await processarTodosNCMs();
        console.log("processarTodosNCMs concluido.");
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
        await updateCST();
        console.log("updateCST concluido.");
        await ajustaFormatoDecimal();
        console.log("ajustaFormatoDecimal concluido.");
      } catch (err) {
        console.error("Erro durante a execução: ", err);
      }
  
      await atualizarStatus(connection, 'Terceira API', 'concluido');
      await atualizarStatusHTML('terceira', 'Concluido');
      await atualizarConsoleHTML('terceira', 'Aplicação executada com sucesso');
  
      try {
        await exportarDadosParaTXTSync();
        console.log("Dados exportados para TXT com sucesso.");
      } catch (err) {
        console.error("Erro ao exportar dados para o arquivo TXT:", err);
      }
    }
  }
  
  module.exports = {
    execConect,
    atualizarConsoleHTML,
    atualizarStatusHTML,
    reiniciarAplicacao,
  };